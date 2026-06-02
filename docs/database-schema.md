# 数据库设计

## 数据库文件

- 路径：`%APPDATA%/clipboard-history/history.db`
- 引擎：SQLite 3
- 访问库：sql.js（纯 JS/WASM 实现，无需编译，通过 `db.export()` 保存到文件）

## 表结构

### clipboard_items — 剪贴板记录

```sql
CREATE TABLE IF NOT EXISTS clipboard_items (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  type          TEXT    NOT NULL CHECK(type IN ('text', 'image')),
  content       TEXT,                       -- 文字内容（type='text' 时使用）
  image_path    TEXT,                       -- 图片文件路径（type='image' 时使用）
  content_hash  TEXT    NOT NULL UNIQUE,    -- MD5 哈希，用于去重
  pinned        INTEGER NOT NULL DEFAULT 0, -- 0=普通 1=置顶
  created_at    TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE INDEX IF NOT EXISTS idx_created_at ON clipboard_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pinned ON clipboard_items(pinned);
```

### settings — 设置键值对

```sql
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- 默认值
INSERT OR IGNORE INTO settings (key, value) VALUES ('retention_days', '3');
INSERT OR IGNORE INTO settings (key, value) VALUES ('max_items', '500');
INSERT OR IGNORE INTO settings (key, value) VALUES ('auto_start', '1');
```

## 常用查询

### 获取历史列表（置顶优先，时间降序）
```sql
SELECT * FROM clipboard_items
ORDER BY pinned DESC, created_at DESC
LIMIT ? OFFSET ?;
```

### 按哈希查重
```sql
SELECT id FROM clipboard_items WHERE content_hash = ?;
```

### 清理过期记录（排除置顶）
```sql
DELETE FROM clipboard_items
WHERE pinned = 0
  AND created_at < datetime('now', 'localtime', ?);
-- ? 为 '-N days'，如 '-3 days'
```

### 检查并清理超限记录（排除置顶，保留最新 N 条）
```sql
DELETE FROM clipboard_items
WHERE id NOT IN (
  SELECT id FROM clipboard_items
  WHERE pinned = 1
  UNION ALL
  SELECT id FROM clipboard_items
  WHERE pinned = 0
  ORDER BY created_at DESC
  LIMIT ?
);
-- ? 为 max_items，如 500
```

### 获取/更新设置
```sql
SELECT value FROM settings WHERE key = ?;
INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?);
```

## 图片文件存储

- 路径：`%APPDATA%/clipboard-history/images/{content_hash}.png`
- 命名规则：使用内容哈希作为文件名，天然去重
- 删除记录时同步删除对应图片文件
