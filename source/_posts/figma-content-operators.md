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

### MCP 连接启动完整流程

#### 前提条件确认

| 条件 | 要求 |
|------|------|
| Node.js | 22.19+ |
| MCP 技能 | figma-content-operator |
| Figma 插件 | Drafito 或 Figwright（选一） |

#### 第 1 步：启动 Relay（保持运行）

npx figma-content-operator relay

#### 第 2 步：验证连接

npx figma-content-operator ping

#### 第 3 步：获取 Figma 文件 URL

在 Figma 桌面端或网页端打开目标文件，复制 URL，格式：

https://www.figma.com/design/xxxxxxxxxxxx/项目名称

#### 第 4 步：启动插件

npx figma-content-operator launch-url --file-url "你的Figma文件URL"

#### 第 5 步：在 Figma 中运行插件

1. 在 Figma 中打开对应文件
2. 点击左侧边栏 Plugins → Drafito 或 Figwright
3. 粘贴启动链接，运行插件
4. 插件加载完成后即可开始操作

#### 第 6 步：验证操作

npx figma-content-operator profile
npx figma-content-operator get_document

#### 连接成功后可执行的操作

- 读取 选中元素、节点树、样式、元数据
- 创建/编辑 画布元素
- 管理 样式、变量、组件
- 导出 设计资源

#### Figma 插件安装（如尚未安装）

方案 A：Drafito（推荐）
配合 Axhub 浏览器扩展使用，Drafito 已内置其中。

方案 B：Figwright
1. 下载：https://github.com/awdr74100/figwright/releases/latest
2. Figma Desktop → Plugins → Development → Import plugin from manifest…
3. 选择下载包中的 manifest.json

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
