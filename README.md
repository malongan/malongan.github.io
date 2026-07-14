# Hexo 博客项目

## 目录结构
```
hexo-blog/
├── _config.yml           # Hexo 主配置
├── _config.butterfly.yml # Butterfly 主题配置
├── package.json          # 依赖管理
├── deploy.sh             # 一键部署脚本 (本地/CI 通用)
├── .github/
│   └── workflows/
│       └── deploy.yml    # GitHub Actions 自动部署
├── source/               # 文章/页面源文件
│   ├── _posts/           # 博文
│   ├── _pages/           # 自定义页面
│   ├── _data/            # 数据文件
│   └── img/              # 图片资源
├── themes/butterfly/     # 主题文件 (npm 安装)
├── public/               # 构建产物 (gitignore)
├── .gitignore
└── README.md
```

## 快速开始

### 1. 环境准备
```bash
# 安装 Node.js 18+ (推荐用 nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 20 && nvm use 20

# 安装 Hexo CLI
npm install -g hexo-cli
```

### 2. 安装依赖
```bash
cd hexo-blog
npm install
```

### 3. 本地预览
```bash
npm run serve
# 访问 http://localhost:4000
```

### 4. 写新文章
```bash
npm run new:post "文章标题"
# 编辑 source/_posts/文章标题.md
```

### 5. 一键部署
```bash
# 本地部署 (需配置 GITHUB_TOKEN 或 SSH Key)
export GITHUB_TOKEN=ghp_xxxxxxxxxxxx
./deploy.sh

# 或使用 npm 脚本
npm run deploy
```

## GitHub Pages 自动部署

### 1. 创建仓库
在 GitHub 创建名为 `你的用户名.github.io` 的公开仓库

### 2. 推送代码
```bash
git init
git add .
git commit -m "初始化 Hexo 博客"
git branch -M main
git remote add origin https://github.com/你的用户名/你的用户名.github.io.git
git push -u origin main
```

### 3. 配置 GitHub Pages
- Settings → Pages → Build and deployment → Source: **GitHub Actions**
- Actions 会自动运行 `.github/workflows/deploy.yml`

### 4. 配置 Secrets (可选，用于自定义域名等)
- Settings → Secrets and variables → Actions → New repository secret
- `GITHUB_TOKEN` (自动提供，无需手动添加)
- `CNAME` (自定义域名时使用)

## 自定义域名

1. 仓库根目录创建 `CNAME` 文件：`echo "blog.example.com" > CNAME`
2. DNS 添加 CNAME 记录指向 `你的用户名.github.io`
3. Settings → Pages → Custom domain 填入域名，勾选 Enforce HTTPS

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run serve` | 本地预览 (热重载) |
| `npm run build` | 生成静态文件到 public/ |
| `npm run clean` | 清理缓存和构建产物 |
| `npm run new:post "标题"` | 新建文章 |
| `npm run new:page "页面名"` | 新建页面 |
| `npm run deploy` | 本地构建并部署 |
| `./deploy.sh --dry-run` | 仅构建不部署 |

## 配置文件说明

| 文件 | 用途 |
|------|------|
| `_config.yml` | 站点基础配置 (标题、URL、部署等) |
| `_config.butterfly.yml` | Butterfly 主题深度配置 |
| `package.json` | 依赖、脚本、Node 版本要求 |

## 主题定制

Butterfly 主题配置项丰富，常用修改：
- `_config.butterfly.yml` → `menu` 菜单、`widgets` 侧边栏、`footer` 底部
- `source/css/_custom.styl` 自定义样式
- `source/js/_custom.js` 自定义脚本

## 目录结构详解

```
source/
├── _posts/           # Markdown 文章 (Front-matter 必含 title/date)
├── _pages/           # 独立页面 (about.md, tags.md, categories.md)
├── _data/            # 数据文件 (links.yml, social.yml 等)
├── img/              # 文章图片、封面图
├── css/              # 自定义样式
├── js/               # 自定义脚本
└── favicon.ico       # 网站图标
```

## 维护建议

1. **文章管理**: 用 `source/_posts/` 目录按年份/分类组织
2. **图片优化**: 大图放图床或 CDN，小图放 `source/img/`
3. **SEO**: 每篇文章填 `description`、`keywords`、`cover`
4. **备份**: 定期备份 `source/` 和配置文件到私有仓库
5. **更新**: `npm update` 升级依赖，注意 Hexo 大版本迁移

## 故障排查

| 问题 | 解决方案 |
|------|----------|
| 部署后 404 | 检查 `_config.yml` 的 `url` 和 `root` |
| 样式丢失 | 检查 `url` 是否以 `https://` 开头 |
| Actions 失败 | 查看 Actions 日志，常见：Node 版本、依赖缓存 |
| 自定义域名不生效 | 等待 DNS 传播 (最长 48h)，检查 CNAME 记录 |

---

> 📖 完整文档见飞书文档：《Hexo + GitHub Pages 博客搭建全纪录》