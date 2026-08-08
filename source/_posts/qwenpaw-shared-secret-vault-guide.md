---
title: QwenPaw 共享密码库构建实战指南
date: 2026-08-08 12:00:00
tags:
  - QwenPaw
  - 安全
  - 密钥管理
  - 多智能体
categories:
  - 技术实践
---

# QwenPaw 共享密码库构建实战指南

> **平台**：QwenPaw（AgentScope 开源多智能体框架，https://qwenpaw.agentscope.io）
> **经验来源**：QwenPaw 真实多 agent 环境中完成的两轮全局密钥迁移与加固（2026-08）
> **适用读者**：使用 QwenPaw 管理多个 agent 工作区，希望统一管理 API Key / 密码 / Token，消除明文泄露风险的用户

---

## 一、为什么需要共享密码库

在使用 QwenPaw 管理多个 agent（如绘画、新闻聚合、NAS 运维、文档管理、图床上传等）时，会遇到典型的"密钥管理混乱"问题：

1. **密钥散落各处**：每个 agent 工作区有独立的 `.env`、`credentials.yaml`，脚本里硬编码密钥，记忆文件（MEMORY.md / 每日笔记）里也常有明文
2. **各自为政不共享**：同一个 GitHub Token 可能在 4 个 agent 的脚本里各存一份，改一处漏一处
3. **明文风险高**：`memory/*.md`、`MEMORY.md` 不加密，还会被整理进长期记忆；`.env` 每个 agent 独立不共享；日志、git remote URL、shell 配置里都可能泄露
4. **轮换困难**：想换一个 Token，得全盘搜索所有工作区

**目标**：建立一套"一处存储、全局共享、加密保护、脚本安全引用"的机制。

---

## 二、QwenPaw 平台的官方能力（先了解再动手）

QwenPaw 原生支持全局共享加密凭证，**无需自建机制**。核心是全局敏感数据目录：

```
~/.qwenpaw.secret/          # $QWENPAW_SECRET_DIR，目录权限 700
├── envs.json               # 工具环境变量库（API Key 等），值加密存储
├── .master_key             # 主密钥（64 字节），权限 600
├── providers/              # 模型提供商配置与 API Key
├── auth.json               # 认证信息
└── backups/                # 历史配置备份
```

### 2.1 加密存储机制

- `envs.json` 中每个值以 `ENC:` 前缀加密存储（Fernet 对称加密）
- 主密钥在 `~/.qwenpaw.secret/.master_key`（权限必须 600）
- **所有 agent 启动时自动注入 `os.environ`**，所有工具和子进程可读
- 这意味着一处写入，全部 agent 立即可用

### 2.2 管理命令

```bash
qwenpaw env set <KEY> <VALUE>    # 写入（加密）
qwenpaw env list                 # 查看（解密显示）
qwenpaw env delete <KEY>         # 删除
qwenpaw daemon restart           # 长驻进程刷新环境变量
qwenpaw reload-config            # 轻量刷新配置
```

### 2.3 两类密钥的存放位置

| 类型 | 存放位置 | 命令 |
|------|---------|------|
| 工具用密钥（API Key、服务器密码等） | `envs.json` | `qwenpaw env set` |
| 模型提供商密钥 | `providers/`（必须放 secret 目录下） | 控制台"设置→模型"或 `qwenpaw models` |

> ⚠️ 踩坑记录：`providers/` 必须放在 `~/.qwenpaw.secret/providers/`，而不是 `~/.qwenpaw/providers/`——放错位置不生效。

### 2.4 各 agent 独立配置的边界

- 每个 agent 工作区的 `.env`、`credentials.yaml` 是**独立、不共享**的
- **不要**把共享密钥放进去（会造成双份维护）
- **不要**把明文密码写进记忆文件（memory/*.md、MEMORY.md 不加密）

---

## 三、整体架构设计（三层模型）

```
┌─────────────────────────────────────────────────┐
│ 第一层：全局共享库（唯一事实来源）                     │
│   ~/.qwenpaw.secret/envs.json                    │
│   qwenpaw env set 写入 → 自动注入所有 agent        │
└─────────────────────────────────────────────────┘
                    ↓ 读取
┌─────────────────────────────────────────────────┐
│ 第二层：兜底文件（终端手动运行场景）                  │
│   ~/.config/<service>/<cred>   权限 600          │
│   脚本在环境变量缺失时读取                           │
└─────────────────────────────────────────────────┘
                    ↓ 引用
┌─────────────────────────────────────────────────┐
│ 第三层：脚本 / 配置 / 记忆                          │
│   Python: os.environ.get("KEY") or fallback      │
│   Shell:  ${KEY:-$(cat ~/.config/...)}           │
│   记忆:   ${KEY} 占位符引用（不写明文）              │
└─────────────────────────────────────────────────┘
```

**设计原则：**

1. **全局库是唯一事实来源**（Single Source of Truth）
2. **脚本不写明文**，优先读环境变量，缺失时读兜底文件
3. **记忆文件只写 `${KEY}` 占位符**，附 KEY 名说明用途
4. **兜底文件权限 600**，仅当前用户可读

---

## 四、脚本引用模式（三种语言示例）

### 4.1 Python（推荐模式）

```python
import os

# 环境变量优先，兜底文件次之
API_KEY = os.environ.get("MY_API_KEY") or open(os.path.expanduser("~/.config/myservice/api_key")).read().strip()
```

### 4.2 Shell

```bash
API_KEY="${MY_API_KEY:-$(cat ~/.config/myservice/api_key)}"
```

### 4.3 himalaya 邮件客户端（读取文件而非 echo 明文）

```toml
# 错误：明文写在配置里
backend.auth.cmd = "echo mysecretpassword"
# 正确：读 600 权限的兜底文件
backend.auth.cmd = "cat ~/.config/qq_smtp/password"
```

---

## 五、迁移实战步骤（五步法）

### 第 1 步：全面排查（先知道密钥在哪）

在 `~/.qwenpaw/workspaces/` 全目录扫描：

```bash
# 找所有 .env 和凭证文件
find ~/.qwenpaw/workspaces -maxdepth 3 \( -name ".env*" -o -name "credentials*.yaml" -o -name "*_creds*.json" \) -not -path '*/node_modules/*'

# 找脚本硬编码（key= 或 KEY = "值" 模式）
grep -rniE '(password|api[_-]?key|secret|token)\s*[=:]\s*["'"'"']?[A-Za-z0-9_\-\.]{8,}' ~/.qwenpaw/workspaces --include='*.py' --include='*.sh' --include='*.json' --include='*.yaml' --include='*.env'

# 找记忆文件里的明文
grep -rniE '(密码|password|api[_-]?key|token)' ~/.qwenpaw/workspaces/*/MEMORY.md ~/.qwenpaw/workspaces/*/memory/

# 找 git remote URL 内嵌 token（高危！）
find ~/.qwenpaw/workspaces -maxdepth 4 -name ".git" -type d | while read g; do
  git -C "$(dirname "$g")" remote get-url origin 2>/dev/null | grep -E '@github.com|gho_'
done
```

### 第 2 步：密钥入库

```bash
qwenpaw env set <KEY> <VALUE>
```

命名规范建议：
- API Key → `XXX_API_KEY`（如 `IMGBB_API_KEY`）
- 服务器密码 → `XXX_PASSWORD`（如 `FNOS_SSH_PASSWORD`）
- Token → `XXX_TOKEN`（如 `CLOUDFLARE_API_TOKEN`）
- 用途不同的同平台 Token → **分名管理**（如 `CLOUDFLARE_API_TOKEN` 管 DNS、`CLOUDFLARE_PAGES_TOKEN` 管 Pages 部署，先验证权限差异再决定去留）

### 第 3 步：建兜底文件（600 权限）

```bash
mkdir -p ~/.config/myservice
printf '%s' '<VALUE>' > ~/.config/myservice/api_key
chmod 600 ~/.config/myservice/api_key
```

### 第 4 步：改造脚本 / 配置 / 记忆

- 脚本：硬编码 → 环境变量 + 兜底文件（见第四节）
- 记忆文件：明文 → `${KEY}` 占位符
- 配置文件：明文 → 环境变量引用

### 第 5 步：验证

```bash
# 语法检查
python3 -m py_compile script.py
bash -n script.sh

# 双路径测试（环境变量优先）
KEY=test python3 -c "import os; print(os.environ.get('KEY'))"
# 兜底路径测试
python3 -c "import os; print(open(os.path.expanduser('~/.config/xxx/api_key')).read().strip())"

# 全盘复查无明文
grep -rlE '<旧密钥值>' ~/.qwenpaw/workspaces --include='*.py' --include='*.sh' --include='*.env' | grep -v node_modules
```

---

## 六、容易遗漏的高危位置（血泪清单）

以下位置**极易被遗漏**，务必纳入排查范围：

| 位置 | 风险 | 处理 |
|------|------|------|
| git remote URL（`git remote -v`） | Token 直接暴露在 `.git/config` | 改纯 HTTPS，依赖 credential helper |
| `~/.zshrc` / shell 配置 `export KEY=xxx` | 每个新进程可读，无加密 | 删除，改全局库注入 |
| 日志轮转文件（`*.log.1` 等） | 工具日志可能记录脚本源码/环境变量 | 旧日志 trash，注意新日志 |
| `~/.qwenpaw.secret/backups/` | 历史配置备份可能含明文 | 目录权限收紧 700 |
| 历史快照（sessions/backup/tool_results） | 会话 JSON 含工具参数 | 明文 → `${KEY}` 占位符（保文件不保明文） |
| 第三方工具目录（如 openclaw 等） | 独立体系可能存另一份密钥 | 按工具自身机制处理，注意版本差异 |
| `agent.json` 渠道配置 | 系统运行必需 | 先确认后端是否支持 env 引用，不支持则保留 + 权限 600 |
| `gh hosts.yml` 等 CLI 原生配置 | 工具原生格式 | 权限 600 即可，评估是否被使用 |

---

## 七、权限规范速查

| 文件/目录 | 权限 | 说明 |
|-----------|------|------|
| `~/.qwenpaw.secret/` | 700 | 全局密钥目录 |
| `~/.qwenpaw.secret/envs.json` | 600 | 加密库 |
| `~/.qwenpaw.secret/.master_key` | **600** | 主密钥（⚠️ 曾发现 644，其他用户可读=加密失效） |
| `~/.qwenpaw.secret/backups/` | 700 | 备份目录 |
| `~/.config/<service>/<cred>` | 600 | 兜底文件 |
| `agent.json` / `models.json` | 600 | 含渠道/模型密钥 |
| `.ssh/` 私钥 | 600 | SSH 密钥 |

---

## 八、安全最佳实践总结

1. **密钥只存一处**：全局 envs.json（唯一事实来源）
2. **脚本三不原则**：不写明文、不写死、不复制到各 agent
3. **记忆文件只写占位符**：`${KEY}` + 用途说明，杜绝明文
4. **权限常态化检查**：master_key 600、secret 目录 700、兜底文件 600
5. **暴露过的密钥要轮换**：做过明文迁移的 Token，建议在平台侧轮换一次（生成新值 → `qwenpaw env set` → 更新兜底文件）
6. **排除规则要明确**：设计清理任务时，明确哪些目录不清理（如 ip_library、embedding_cache、history.db、memory/ 等）
7. **变更前备份**：改 `.zshrc`、`config.toml` 等先备份（`cp file file.bak-日期`）

---

## 九、常见坑与对策

| 坑 | 现象 | 对策 |
|----|------|------|
| `.master_key` 权限 644 | 其他用户可读主密钥 | `chmod 600` |
| 脚本用 `os.environ["KEY"]` 强读 | 删 .zshrc 后终端运行报 KeyError | 改 `os.environ.get("KEY") or fallback` |
| 旧变量名残留 | 文档/脚本用旧名，新库用新名 | 迁移时同步更新所有引用文档 |
| 日志记录脚本源码 | 轮转日志含明文 | 及时清理旧日志；新脚本不写明文 |
| `providers/` 放错位置 | 模型配置不生效 | 放 `~/.qwenpaw.secret/providers/` |
| 同平台多 Token 不知去留 | 权限重叠困惑 | 实测 API 权限（如 CF 的 pages/zones 接口），功能不同则分名保留 |
| agent.json 的 secret 想迁移 | 后端不支持 env 引用 | 保留原样 + 权限 600，不强行迁移 |

---

## 十、收益与效果

完成这套机制后：

- ✅ 一处管理：全部密钥在 `qwenpaw env list` 一览
- ✅ 全局共享：新 agent 启动即可读取所有共享密钥
- ✅ 明文清零：脚本、记忆、配置、日志无明文
- ✅ 轮换可控：换 key 只需 `env set` + 更新兜底文件
- ✅ 权限规范：关键文件 600/700 常态化

---

*本文基于 QwenPaw 平台真实多 agent 环境的两轮密钥迁移实践整理，可复用于任何使用 QwenPaw 管理多个 agent 的场景。*
