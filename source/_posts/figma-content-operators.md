---
title: "Figma 内容操作技能：figma-content-operator 与 react-to-figma-make"
date: 2026-08-06 12:00:00
description: "两个 Figma 技能的安装与使用：网页复制到 Figma，以及 React 代码转 Figma Make"
slug: figma-content-operators
tags: [Figma, 技能安装, UI设计, React]
---

# Figma 内容操作技能：figma-content-operator 与 react-to-figma-make

## 技能安装地址

skills/figma-content-operator/
skills/react-to-figma-make/

两个技能均来自 lintendo/Axhub-Skills 开源技能库

## 一、两个技能的区别

...（完整内容如下）

## 二、figma-content-operator 使用说明

### 核心能力
- 检查、读取、创建、编辑、导出 Figma 内容
- 将网页复制到 Figma 画布
- 通过 Figwright MCP 操作 Figma 画布

### 使用方式

#### 方式 A：网页复制粘贴（无需 MCP）

1. 安装 Axhub 浏览器扩展（Chrome/Edge）
2. 打开目标网页，点击扩展图标
3. 点击"复制到 Figma"
4. 打开 Figma 桌面/App，在画板上 Cmd/Ctrl + V 粘贴

#### 方式 B：MCP 画布操作（需要 Figwright）

1. 在 Figma 中安装并运行 Drafito 或 Figwright 插件
2. 通过 MCP 连接后，可读取、编辑画布内容
3. 支持读取选区、节点树、元数据、截图等

### 注意事项
- MCP 操作前需先读取目标，再写入
- 创建、更新、删除视为修改操作，需严格限制范围
- 优先聚焦读取，避免直接调用 get_document

### 工具与 Figma 链接完整流程（MCP 连接）

> 本流程用于把 `figma-content-operator` 工具与你的 Figma 画布建立实时连接。
> 核心思路：**本地启动 Relay（中继）→ Figma 内运行插件 → 双向连通**。
> 整个连接依赖 `@figwright/mcp` 的插件中继，服务器启动 ≠ 插件已连通，必须以 `ping`/`profile` 结果为准。

#### 前置条件确认

| 条件 | 要求 | 检查命令 |
|------|------|---------|
| Node.js | 22.19+ | `node -v` |
| npx | 可用且在 PATH 中 | `npx -v` |
| Figma 插件 | Drafito 或 Figwright（选一） | 见下方插件安装 |

#### 第 0 步：运行环境体检

先运行 `doctor`，自动检查 Node/npx 版本与 MCP 依赖是否就绪；有缺失先解决，避免后续步骤反复失败。

```bash
npx figma-content-operator doctor
```

#### 第 1 步：启动 Relay 中继（保持运行，勿关闭）

在**独立终端**启动任务级 Relay，它是工具与 Figma 之间的 WebSocket 中继：

```bash
npx figma-content-operator relay
```

⚠️ Relay 必须保持运行到任务结束；不要在 Relay 启动前就让用户运行插件，否则会连不上。

#### 第 2 步：获取目标 Figma 文件 URL

在 Figma 桌面端或网页端打开目标设计文件，从地址栏复制 URL（需包含 `/design/<文件ID>/` 或 `/file/<文件ID>/`）：

```
https://www.figma.com/design/xxxxxxxxxxxx/项目名称
```

#### 第 3 步：生成插件启动链接

```bash
npx figma-content-operator launch-url "https://www.figma.com/design/xxxxxxxxxxxx/项目名称"
```

该命令会生成一个可点击的插件启动链接。

#### 第 4 步：在 Figma 中运行插件

1. 确认 Figma 中已打开第 2 步的目标文件
2. 点击启动链接，或手动进入 Plugins → 选择 **Drafito**（或 Figwright）
3. 在弹出的 **Run Drafito** 对话框确认运行
4. **等用户明确表示插件已运行**，再进入下一步（不要抢跑）

#### 第 5 步：验证双向连通（关键！）

依次运行，确认连接真正建立：

```bash
npx figma-content-operator ping
npx figma-content-operator profile
```

**成功标准**（缺一不可）：
- `ping` 返回 `hop: "e2e"` 且包含 `plugin` 对象（说明链路是端到端，而非仅服务器存活）
- `profile` 返回 `profile: "figwright-full"`（说明插件已加载完整工具注册表）

如果 `ping` 返回 `hop: "server-only"`，说明 Relay 与插件没连上，见下方故障排查。

#### 第 6 步：开始操作画布

连接建立后即可读写画布。操作前先读取目标确认范围：

```bash
npx figma-content-operator get_selection
npx figma-content-operator get_node
```

> 安全建议：优先聚焦读取，避免直接调用 `get_document`；创建/编辑/删除属于修改操作，严格限制在用户指定范围。

#### 任务结束：停止 Relay

任务完成、取消或失败后，回到启动 Relay 的终端按 `Ctrl+C` 停止该进程。不要尝试替用户关闭 Figma 插件本身。

---

#### 常见故障排查

| 现象 | 原因 | 处理 |
|------|------|------|
| `ping` 返回 `server-only` | 插件与 Relay 未连通 | 确认 Relay 已就绪、插件已在 Figma 中运行、中继地址为 `ws://127.0.0.1:3055`，然后重新生成启动链接 |
| 连接时断时续 | `localhost` 解析为 IPv6 `::1`，而中继仅监听 IPv4 | 确认插件中继 URL 使用 `ws://127.0.0.1:3055`，不要用 `localhost` |
| 启动期间连接关闭 | npm registry 访问异常 / 代理配置 | 测试 `@figwright/mcp` 固定版本包的 npm 访问，检查 registry 或代理 |
| `doctor` 报 Node 版本过低 | Node < 22.19 | 升级 Node.js 到 22.19+ 并确保 bin 目录在 PATH |
| 写入后改错了文件 | 多文件/多插件会话 | 立即停止，运行 `ping` 和 `get_selection` 聚焦目标文件，验证后再纠正 |

---

#### Figma 插件安装（如尚未安装）

**方案 A：Drafito（推荐）**
配合 Axhub 浏览器扩展使用，Drafito 已内置其中，无需单独下载。

**方案 B：上游 Figwright 开发插件**
1. 下载：https://github.com/awdr74100/figwright/releases/latest
2. Figma Desktop → Menu → Plugins → Development → **Import plugin from manifest…**
3. 选择下载包中的 `manifest.json`
4. 之后从 Plugins → Development → Figwright 启动（无需 Community 版，只导入一次即可）

## 三、react-to-figma-make 使用说明

### 核心能力
将 React 项目转换为 Figma Make 可导入的 .fig 资产，保留设计系统和双入口架构。

### 完整工作流程

#### 第 1 步：分析源项目
识别框架类型（React / Next.js / V0 / AI Studio）、入口结构、样式方案、依赖分析、静态资源。

#### 第 2 步：创建 Figma Make 项目结构

项目/
├── index.tsx           # 主入口
├── src/App.tsx         # Figma 导出薄壳
├── src/main.tsx        # Vite 挂载层
├── src/components/     # 共享组件
├── src/styles/         # 全局样式
├── canvas.fig          # Figma 二进制设计数据
├── meta.json           # 项目元数据
└── images/             # 图片资源

#### 第 3 步：迁移源代码
- 收敛入口为两个薄入口 + 一套共享组件
- 移除框架特定代码（如 Next.js 的 "use client"、next/image）

#### 第 4 步：补齐元文件
- meta.json — 项目元数据
- ai_chat.json — AI 聊天历史
- package.json — Vite 依赖（不含 react/react-dom）
- vite.config.ts、tsconfig.json、index.html

#### 第 5 步：生成 canvas.fig

node scripts/canvas-fig-sync.mjs inspect --fig assets/empty-canvas.fig --manifest template.code-manifest.json
node scripts/canvas-fig-sync.mjs pack --fig canvas.fig --from 源码目录 --prune-missing --sanitize-for-export

#### 第 6 步：验证
- 结构验证：入口文件职责注释完整
- 元文件验证：meta.json、ai_chat.json 等存在
- 渲染验证：npm run dev 无报错

## 四、场景选择指南

| 我的情况 | 推荐技能 |
|:---------|:---------|
| 有一个做好的网页，想搬进 Figma | figma-content-operator |
| 有 React 代码，想生成 .fig 导入 | react-to-figma-make |
| 想在 Figma 上直接读取/编辑设计 | figma-content-operator + Figwright MCP |
| 想把设计稿转成 React 代码 | 需要其他工具配合 |

## 五、参考资源

- Axhub-Skills 仓库：https://github.com/lintendo/Axhub-Skills
- Figwright MCP：https://github.com/nickhsharp/figwright
- Figma Make 官方文档

*本文由 AI 助手整理，技能来自 Axhub 开源技能库*
