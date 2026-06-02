# 技术选型与架构

## 技术栈

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 桌面框架 | Electron | ^33.x | 跨平台桌面应用框架 |
| 前端框架 | React | ^18.x | UI 组件化开发 |
| 类型系统 | TypeScript | ^5.x | 类型安全 |
| 构建工具 | Vite | ^6.x | 快速开发与构建 |
| CSS 框架 | Tailwind CSS | ^3.x | 原子化 CSS，快速构建 UI |
| 数据库 | sql.js | ^1.x | SQLite 的 JS/WASM 实现，无需编译 |
| 打包工具 | electron-builder | ^25.x | 打包为 Windows .exe |
| 开机自启 | electron-auto-launch | — | 注册 Windows 启动项 |

## 项目结构

```
clipboard-history/
├── package.json                  # 项目配置与依赖
├── vite.config.ts                # Vite 构建配置
├── tsconfig.json                 # TypeScript 配置
├── tsconfig.node.json            # 主进程 TS 配置
├── electron-builder.yml          # 打包配置
├── tailwind.config.js            # Tailwind 配置
├── postcss.config.js             # PostCSS 配置
├── CLAUDE.md                     # AI 助手指引
├── docs/                         # 项目文档
│   ├── requirements.md           # 需求文档
│   ├── tech-stack.md             # 本文件
│   ├── design-spec.md            # UI 设计规范
│   ├── execution-steps.md        # 执行步骤
│   └── database-schema.md        # 数据库设计
├── dev-logs/                     # 开发日志
│   └── YYYY-MM-DD.md
├── assets/
│   └── icon.png                  # 应用图标
├── electron/                     # Electron 主进程
│   ├── main.ts                   # 入口：窗口、托盘、IPC
│   ├── preload.ts                # IPC 桥接
│   ├── clipboard-monitor.ts      # 剪贴板监听
│   ├── database.ts               # 数据库操作
│   ├── tray.ts                   # 系统托盘
│   └── auto-start.ts             # 开机自启
└── src/                          # React 渲染进程
    ├── main.tsx                  # React 入口
    ├── App.tsx                   # 根组件
    ├── index.css                 # 全局样式 + Tailwind
    ├── types.ts                  # 类型定义
    ├── components/
    │   ├── TitleBar.tsx          # 自定义标题栏
    │   ├── SearchBar.tsx         # 搜索栏
    │   ├── HistoryCard.tsx       # 历史记录卡片
    │   ├── HistoryList.tsx       # 卡片列表容器
    │   └── SettingsPanel.tsx     # 设置面板
    └── hooks/
        └── useHistory.ts         # 历史数据管理
```

## 进程架构

```
┌─────────────────────────┐     IPC      ┌─────────────────────────┐
│     Main Process        │◄────────────►│    Renderer Process     │
│   (Electron 主进程)      │   preload     │   (React 渲染进程)      │
│                         │              │                         │
│ • 剪贴板监听             │              │ • UI 渲染               │
│ • SQLite 数据库          │              │ • 搜索筛选              │
│ • 系统托盘               │              │ • 用户交互              │
│ • 开机自启               │              │                         │
│ • 窗口管理               │              │                         │
└─────────────────────────┘              └─────────────────────────┘
```

## 数据存储路径

所有数据存储在 `%APPDATA%/clipboard-history/`：
- `history.db` — SQLite 数据库文件
- `images/` — 图片文件目录（以 `{hash}.png` 命名）
