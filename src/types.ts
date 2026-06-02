export interface ClipboardItem {
  id: number;
  type: 'text' | 'image';
  content: string | null;
  image_path: string | null;
  content_hash: string;
  pinned: number;
  created_at: string;
}

export interface ClipboardApi {
  getItems: (limit?: number, offset?: number, search?: string) => Promise<ClipboardItem[]>;
  getItemCount: (search?: string) => Promise<number>;
  deleteItem: (id: number) => Promise<void>;
  togglePinItem: (id: number) => Promise<number>;
  copyItem: (id: number) => Promise<void>;
  getSetting: (key: string) => Promise<string | null>;
  setSetting: (key: string, value: string) => Promise<void>;
  onNewItem: (callback: () => void) => () => void;
}

declare global {
  interface Window {
    clipboardApi: ClipboardApi;
  }
}
