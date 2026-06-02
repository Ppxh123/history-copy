import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// ---- Types ----

export interface ClipboardItem {
  id: number;
  type: 'text' | 'image';
  content: string | null;
  image_path: string | null;
  content_hash: string;
  pinned: number;
  created_at: string;
}

// ---- State ----

let db: SqlJsDatabase | null = null;
let dbPath: string;
let imagesDir: string;

// ---- Init ----

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function saveDb(): void {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

export async function initDatabase(): Promise<void> {
  const userData = app.getPath('userData');
  dbPath = path.join(userData, 'history.db');
  imagesDir = path.join(userData, 'images');

  ensureDir(userData);
  ensureDir(imagesDir);

  // Locate sql.js WASM file (works in both dev and production)
  const wasmPath = path.join(__dirname, 'sql-wasm.wasm');
  const SQL = await initSqlJs({
    locateFile: () => wasmPath,
  });

  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS clipboard_items (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      type          TEXT    NOT NULL CHECK(type IN ('text', 'image')),
      content       TEXT,
      image_path    TEXT,
      content_hash  TEXT    NOT NULL UNIQUE,
      pinned        INTEGER NOT NULL DEFAULT 0,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
    )
  `);
  db.run('CREATE INDEX IF NOT EXISTS idx_created_at ON clipboard_items(created_at DESC)');
  db.run('CREATE INDEX IF NOT EXISTS idx_pinned ON clipboard_items(pinned)');

  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);
  db.run("INSERT OR IGNORE INTO settings (key, value) VALUES ('retention_days', '3')");
  db.run("INSERT OR IGNORE INTO settings (key, value) VALUES ('max_items', '1314')");
  db.run("INSERT OR IGNORE INTO settings (key, value) VALUES ('auto_start', '1')");

  saveDb();
}

// ---- Helpers ----

export function hashContent(type: 'text' | 'image', data: string | Buffer): string {
  const hash = crypto.createHash('md5');
  if (type === 'text') {
    hash.update(data as string, 'utf8');
  } else {
    hash.update(data as Buffer);
  }
  return hash.digest('hex');
}

function rowToItem(columns: string[], row: any[]): ClipboardItem {
  const item: Record<string, any> = {};
  columns.forEach((col, i) => {
    item[col] = row[i];
  });
  return item as ClipboardItem;
}

function queryAll(sql: string, params: any[] = []): ClipboardItem[] {
  if (!db) throw new Error('Database not initialized');

  // For queries without params, use exec (simpler)
  if (params.length === 0) {
    const results = db.exec(sql);
    if (results.length === 0) return [];
    const { columns, values } = results[0];
    return values.map(row => rowToItem(columns, row));
  }

  // For parameterized queries, use prepare
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const items: ClipboardItem[] = [];
  while (stmt.step()) {
    const obj = stmt.getAsObject() as Record<string, any>;
    // Cast to ClipboardItem - all fields are present
    items.push(obj as unknown as ClipboardItem);
  }
  stmt.free();
  return items;
}

// ---- CRUD Operations ----

export function addTextItem(content: string): number | null {
  if (!db) throw new Error('Database not initialized');
  const hash = hashContent('text', content);

  // Check duplicate
  const exists = db.exec('SELECT id FROM clipboard_items WHERE content_hash = ?', [hash]);
  // Actually db.exec doesn't support params. Let me use prepare.
  const check = db.prepare('SELECT id FROM clipboard_items WHERE content_hash = ?');
  check.bind([hash]);
  let isDuplicate = false;
  if (check.step()) isDuplicate = true;
  check.free();

  if (isDuplicate) return null;

  db.run(
    'INSERT INTO clipboard_items (type, content, content_hash) VALUES (?, ?, ?)',
    ['text', content, hash]
  );
  saveDb();
  return (db.exec('SELECT last_insert_rowid()')[0].values[0][0] as number);
}

export function addImageItem(imageBuffer: Buffer): number | null {
  if (!db) throw new Error('Database not initialized');
  const hash = hashContent('image', imageBuffer);

  const check = db.prepare('SELECT id FROM clipboard_items WHERE content_hash = ?');
  check.bind([hash]);
  let isDuplicate = false;
  if (check.step()) isDuplicate = true;
  check.free();

  if (isDuplicate) return null;

  const imagePath = path.join(imagesDir, `${hash}.png`);
  fs.writeFileSync(imagePath, imageBuffer);

  db.run(
    'INSERT INTO clipboard_items (type, image_path, content_hash) VALUES (?, ?, ?)',
    ['image', imagePath, hash]
  );
  saveDb();
  return (db.exec('SELECT last_insert_rowid()')[0].values[0][0] as number);
}

export function getItems(limit: number = 50, offset: number = 0, search?: string): ClipboardItem[] {
  if (!db) throw new Error('Database not initialized');

  if (search && search.trim()) {
    const results = queryAll(
      `SELECT * FROM clipboard_items
       WHERE type = 'text' AND content LIKE ?
       ORDER BY pinned DESC, created_at DESC
       LIMIT ? OFFSET ?`,
      [`%${search.trim()}%`, limit, offset]
    );
    return results;
  }

  return queryAll(
    'SELECT * FROM clipboard_items ORDER BY pinned DESC, created_at DESC LIMIT ? OFFSET ?',
    [limit, offset]
  );
}

export function getItemById(id: number): ClipboardItem | null {
  const items = queryAll('SELECT * FROM clipboard_items WHERE id = ?', [id]);
  return items.length > 0 ? items[0] : null;
}

export function getItemCount(search?: string): number {
  if (!db) throw new Error('Database not initialized');

  const stmt = search
    ? db.prepare("SELECT COUNT(*) as cnt FROM clipboard_items WHERE type = 'text' AND content LIKE ?")
    : db.prepare('SELECT COUNT(*) as cnt FROM clipboard_items');

  if (search) stmt.bind([`%${search.trim()}%`]);

  let count = 0;
  if (stmt.step()) {
    count = (stmt.getAsObject() as any).cnt as number;
  }
  stmt.free();
  return count;
}

export function deleteItem(id: number): void {
  if (!db) throw new Error('Database not initialized');

  // Get item to clean up image file
  const items = queryAll('SELECT * FROM clipboard_items WHERE id = ?', [id]);
  if (items.length > 0 && items[0].image_path) {
    try {
      fs.unlinkSync(items[0].image_path);
    } catch { /* file already gone */ }
  }

  db.run('DELETE FROM clipboard_items WHERE id = ?', [id]);
  saveDb();
}

export function togglePinItem(id: number): number {
  if (!db) throw new Error('Database not initialized');

  // Get current pin status
  const items = queryAll('SELECT pinned FROM clipboard_items WHERE id = ?', [id]);
  if (items.length === 0) return 0;

  const newPinned = items[0].pinned ? 0 : 1;
  db.run('UPDATE clipboard_items SET pinned = ? WHERE id = ?', [newPinned, id]);
  saveDb();
  return newPinned;
}

// ---- Settings ----

export function getSetting(key: string): string | null {
  if (!db) throw new Error('Database not initialized');
  const stmt = db.prepare('SELECT value FROM settings WHERE key = ?');
  stmt.bind([key]);
  let value: string | null = null;
  if (stmt.step()) {
    value = (stmt.getAsObject() as any).value as string;
  }
  stmt.free();
  return value;
}

export function setSetting(key: string, value: string): void {
  if (!db) throw new Error('Database not initialized');
  db.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value]);
  saveDb();
}

// ---- Cleanup ----

export function cleanupExpired(): number {
  if (!db) return 0;
  const days = parseInt(getSetting('retention_days') || '3', 10);
  // 0 表示永久保留，不过期清理
  if (days === 0) return 0;
  const result = db.exec(
    `DELETE FROM clipboard_items
     WHERE pinned = 0
       AND created_at < datetime('now', 'localtime', '-${days} days')`
  );
  saveDb();
  return db.getRowsModified();
}

export function cleanupOverLimit(): number {
  if (!db) return 0;
  const maxItems = parseInt(getSetting('max_items') || '1314', 10);
  db.run(`
    DELETE FROM clipboard_items
    WHERE id NOT IN (
      SELECT id FROM clipboard_items WHERE pinned = 1
      UNION ALL
      SELECT id FROM (
        SELECT id FROM clipboard_items
        WHERE pinned = 0
        ORDER BY created_at DESC
        LIMIT ?
      )
    )
  `, [maxItems]);
  saveDb();
  return db.getRowsModified();
}

export function runCleanup(): number {
  const expired = cleanupExpired();
  const overLimit = cleanupOverLimit();
  return expired + overLimit;
}

// ---- Close ----

export function closeDatabase(): void {
  if (db) {
    saveDb();
    db.close();
    db = null;
  }
}
