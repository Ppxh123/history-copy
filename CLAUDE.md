# CLAUDE.md — AI 助手指引

## 项目简介

这是一个 Windows 历史粘贴板软件，使用 Electron + React + TypeScript + Tailwind CSS + SQLite 构建。
目标用户是不懂代码的普通用户，需要在 Windows 11 上运行。

## 核心原则

- **安全第一**：每次只推进一个阶段，完成并验证后再进入下一阶段
- **增量开发**：每个功能先跑通，再优化，不过度设计
- **用户友好**：输出信息用中文，技术概念用通俗语言解释
- **文档同步**：每次完成阶段性工作后，更新 `dev-logs/` 下的日志文件

## 项目文档路径

| 文档 | 路径 | 说明 |
|------|------|------|
| 需求文档 | `docs/requirements.md` | 产品功能和非功能需求 |
| 技术架构 | `docs/tech-stack.md` | 技术选型、项目结构、进程架构 |
| 设计规范 | `docs/design-spec.md` | UI 配色、组件规格、字体、图标 |
| 执行步骤 | `docs/execution-steps.md` | 10 阶段分步开发计划，含验证标准 |
| 数据库设计 | `docs/database-schema.md` | 表结构、SQL 查询、图片存储规则 |
| 开发日志 | `dev-logs/YYYY-MM-DD.md` | 每日完成事项和待办事项 |

## 工作流程

1. **开始工作前**：阅读 `docs/execution-steps.md`，找到当前阶段
2. **执行开发**：按阶段逐步骤推进，每步完成后验证
3. **每日收尾**：在 `dev-logs/` 下创建或更新当日日志，记录完成和待办事项
4. **阶段完成**：更新 `docs/execution-steps.md` 中对应步骤的完成状态

## 重要约定

- 不要在没有用户确认的情况下跳到下一阶段
- 每个步骤达到验证标准后，明确告知用户并请求确认再继续
- 图片文件存储在 `%APPDATA%/clipboard-history/images/`，数据库在 `%APPDATA%/clipboard-history/history.db`
- 应用名称为「历史粘贴板」，包名使用 `clipboard-history`
- 所有代码注释和 UI 文字使用中文
- 用户是不懂代码的小白，解释问题时用通俗易懂的语言
