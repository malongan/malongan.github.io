---
title: QwenPaw Skill软链共享方案
date: 2026-07-14 18:00:00
tags:
  - QwenPaw
  - 软链
  - 技能共享
categories:
  - QwenPaw
cover: /img/qwenpaw-symlink.jpg
---

QwenPaw Skill 软链共享方案
QwenPaw Skill 软链共享方案
版本：v1.0 | 日期：2026-06-25 | 状态：规划中
一、背景与现状
1.1 当前问题
QwenPaw 各 workspace 的 skill 目前以独立副本形式存在，存在以下问题：



问题


说明


磁盘浪费


同一份 SKILL.md 在每个 workspace 都存一份


修改不同步


更新 skill 内容需要在多个 workspace 逐个修改


安装繁琐


新装 skill 需要逐个 workspace 复制注册
1.2 当前 skill 存放位置
~/.qwenpaw/workspaces/<workspace>/skills/   # 各 workspace 独立副本
~/.qwenpaw/skill_pool/                      # 内置技能池（不直接下发）
~/.agents/skills/                           # 外部 CLI 安装位置（杂散）
1.3 相关路径



路径


用途


~/.qwenpaw/skill_pool/


单一数据源（共享技能存放处）


~/.qwenpaw/workspaces/<workspace>/skills/


各 workspace skill 扫描目录


~/.qwenpaw/workspaces/<workspace>/skill.json


各 workspace skill 注册清单


~/.agents/skills/


skills CLI 全局安装目录（需清理）
二、方案目标
以 ~/.qwenpaw/skill_pool/ 为单一数据源
各 workspace 通过软链共享 skill_pool 内容
新增共享 skill 一键完成
已有 skill 保持不动，不做迁移
GitHub 备份时 skill_pool 可直接发布
三、目录结构
~/.qwenpaw/
├── skill_pool/                          # ⭐ 单一数据源
│   ├── skill.json                       # Pool manifest（所有共享技能索引）
│   ├── agently-mail/
│   │   └── SKILL.md
│   ├── feishu-base/
│   │   └── SKILL.md
│   └── <其他共享技能>/
│
└── workspaces/
    ├── default/
    │   └── skills/
    │       ├── QA_source_index/         # 已有，保持原样（独立副本）
    │       ├── <已有技能>              # 已有，保持原样
    │       └── agently-mail -> skill_pool/agently-mail    # 软链
    │       └── feishu-base -> skill_pool/feishu-base      # 软链
    │
    ├── painter/
    │   └── skills/
    │       ├── <已有技能>              # 已有，保持原样
    │       └── agently-mail -> skill_pool/agently-mail    # 软链
    │
    └── <其他workspace>/
        └── skills/
            └── <对应软链>
四、核心规则
4.1 三类技能的处理方式



类别


判断方式


处理


已有技能


各 workspace/skills/ 有独立目录


保持原样，不迁移


共享技能


~/.qwenpaw/skill_pool/ 存在


软链到各 workspace


新装共享技能


用户明确要求「共享」「软链」「加 pool」


走共享流程
4.2 安装行为



用户意图


执行动作


「帮我装个 xxx skill」


正常独立安装到 workspace/skills/


「把 xxx 加为共享技能」


放入 pool → 软链 → 注册 → reload


「装到 pool」


同上，共享流程


无特殊说明


正常独立安装
触发原则：不主动共享，用户明确要求才执行共享流程。
五、工作流程
5.1 共享技能安装流程
用户：把 xxx 加为共享技能
       ↓
检查 ~/.qwenpaw/skill_pool/ 是否已有 xxx
  ├── 有 → 跳过第一步
  └── 没有 → 复制/移动到 skill_pool/
       ↓
对每个有 skills/ 目录的 workspace：
  ln -s ~/.qwenpaw/skill_pool/xxx ~/.qwenpaw/workspaces/<ws>/skills/xxx
       ↓
对每个 workspace 的 skill.json：
  追加/更新 xxx 注册条目
       ↓
qwenpaw daemon reload-config
       ↓
告知完成

5.2 修改共享技能内容
用户：更新 agently-mail skill
       ↓
直接修改 ~/.qwenpaw/skill_pool/agently-mail/SKILL.md
       ↓
无需其他操作，所有软链的 agent 立即感知（reload-config 后生效）

5.3 卸载共享技能
用户：把 xxx 从共享中移除
       ↓
对每个 workspace：
  删除 skills/xxx 软链
  从 skill.json 移除 xxx 注册
       ↓
可选：删除 ~/.qwenpaw/skill_pool/xxx/
       ↓
reload-config
六、脚本工具
6.1 skill-sync.sh
skill-sync.sh add <skill>     # 安装为共享技能
skill-sync.sh remove <skill>  # 从共享中移除
skill-sync.sh sync            # 同步：检查缺失软链/注册，补全或清理
skill-sync.sh list           # 列出当前共享技能
6.2 脚本安装位置
~/bin/skill-sync.sh（加入 PATH，任意位置可执行）
6.3 脚本待实现功能
add 子命令：pool 写入 → 软链 → 注册
remove 子命令：软链删除 → 注册移除 → 可选 pool 删除
sync 子命令：核对一致性
list 子命令：列出 pool 中共享技能
七、实施步骤



步骤


内容


状态


1


确认所有 workspace 列表及 skills/ 目录存在情况


待执行


2


清理 ~/.agents/skills/ 旧安装位置


待执行


3


把现有 pool 技能（agently-mail）软链到所有 workspace


待执行


4


验证各 agent 能正常加载共享 skill


待执行


5


编写 skill-sync.sh 脚本


待执行


6


GitHub 备份：skill_pool 仓库创建


待执行
八、GitHub 备份方案
8.1 备份策略
GitHub 仓库：qwenpaw-skill-pool
内容：~/.qwenpaw/skill_pool/ 完整内容
软链：不进入 GitHub（clone 后重新生成软链）
skill.json：进入 GitHub（注册清单）
8.2 操作方式
由 GitHub 助手（github-manager）创建仓库并管理。
九、已知限制与风险



风险


说明


应对


pool 路径移动


软链全断


pool 路径固定不动


skill.json 未注册


agent 看不到 skill


确保注册流程完整


workspace 无 skills/ 目录


软链无法创建


检查目录存在性


同名 skill 冲突


workspace 有同名已有技能


已有技能优先，不覆盖


GitHub 备份后重新 clone


软链失效


需要重新执行 skill-sync.sh sync
十、FAQ
Q：已有 skill 需要改成软链吗？
A：不需要。方案对已有 skill 无任何影响，保持独立副本不动。
Q：不同 workspace 可以有不同的共享 skill 吗？
A：可以。软链和注册都是按 workspace 独立控制的，可以选择性共享。
Q：pool 里的 skill 删除后会影响已有 workspace 吗？
A：会。软链指向的目标消失后，agent 无法加载该 skill。删除前需确保所有 workspace 已移除对应软链和注册。
Q：GitHub 备份的 skill_pool，clone 后直接能用吗？
A：不能直接用。软链在 clone 后需要重新创建，用 skill-sync.sh sync 即可自动重建所有软链和注册。
十一、实际操作指南（skill-sync.sh 使用说明）
共享技能管理脚本
脚本位置：~/.qwenpaw/skill_pool/skill-sync.sh
场景一：已有技能 → 共享
比如你有一个新 workspace 装了个不错的技能，想分享给所有 agent 用：
# 1. 用 add 命令
~/.qwenpaw/skill_pool/skill-sync.sh add <技能名>

# 示例：把 brand-guardian 加为共享
~/.qwenpaw/skill_pool/skill-sync.sh add brand-guardian
脚本会自动：
在所有 workspace 搜索技能目录
复制到 ~/.qwenpaw/skill_pool/{技能名}/
注册到 skill.json
在所有有 skills 目录的 workspace 创建软链
提示执行 reload-config
场景二：从外部路径添加
~/.qwenpaw/skill_pool/skill-sync.sh add my-skill /path/to/skill-dir
场景三：查看当前共享池
~/.qwenpaw/skill_pool/skill-sync.sh list
场景四：移除共享
~/.qwenpaw/skill_pool/skill-sync.sh remove brand-guardian
关键变化
之前（独立副本）
每个 workspace 各存一份  →  pool 一份，各 workspace 软链指向它
改一个要逐个改  →  改 pool 里的就行，所有 workspace 立即生效
新 workspace 得手动复制  →  用 add 一键分发

注意
已有技能不动。只有用户明确说"把这个加为共享"的新技能，才走共享流程。
⚠️ 原链搭建重要原则
在进行软链搭建时，必须遵循以下原则：
✅ 只做软链搭建 — 不要修改已有技能的内容或配置
✅ 技能后期再添加调整 — 软链搭建完成后，再根据需要对各技能进行内容完善和调整
❌ 禁止在搭建过程中修改已有技能 — 已有的 SKILL.md、配置文件等保持原样不动