#!/usr/bin/env bash
# ============================================================
# Hexo + GitHub Pages 部署脚本 (通用版)
# 支持: 本地部署、CI 部署、Dry-run
# ============================================================

set -euo pipefail

# ===== 配置区 (请按需修改) =====
GITHUB_USER="malongan"
REPO_NAME="${GITHUB_USER}.github.io"
DEPLOY_BRANCH="gh-pages"
SOURCE_BRANCH="main"
BUILD_DIR="public"
COMMIT_MSG="🚀 Site updated: $(date '+%Y-%m-%d %H:%M:%S')"

# ===== 颜色定义 =====
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info()  { echo -e "${BLUE}[INFO]${NC} $*"; }
ok()    { echo -e "${GREEN}[OK]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
err()   { echo -e "${RED}[ERR]${NC} $*"; }

# ===== 帮助信息 =====
usage() {
  cat <<EOF
用法: ./deploy.sh [选项]

选项:
  --ci         CI 环境模式 (使用 GITHUB_TOKEN 认证)
  --dry-run    仅构建，不部署
  -h, --help   显示帮助

示例:
  ./deploy.sh              # 本地部署 (需配置 SSH Key 或 Token)
  ./deploy.sh --ci         # GitHub Actions 环境部署
  ./deploy.sh --dry-run    # 仅本地构建测试
EOF
  exit 0
}

# ===== 参数解析 =====
CI_MODE=false
DRY_RUN=false

for arg in "$@"; do
  case $arg in
    --ci) CI_MODE=true ;;
    --dry-run) DRY_RUN=true ;;
    -h|--help) usage ;;
    *) err "未知参数: $arg"; usage ;;
  esac
done

# ===== 前置检查 =====
check_env() {
  info "检查运行环境..."
  
  # Node.js
  if ! command -v node &>/dev/null; then
    err "未找到 Node.js，请安装 Node.js 18+"
    exit 1
  fi
  ok "Node.js: $(node --version)"
  
  # npm
  if ! command -v npm &>/dev/null; then
    err "未找到 npm"
    exit 1
  fi
  ok "npm: $(npm --version)"
  
  # Hexo
  if ! npx hexo version &>/dev/null; then
    warn "Hexo 未全局安装，将使用 npx 运行"
  else
    ok "Hexo: $(npx hexo version)"
  fi
  
  # Git
  if ! command -v git &>/dev/null; then
    err "未找到 Git"
    exit 1
  fi
  ok "Git: $(git --version | cut -d' ' -f3)"
}

# ===== 安装依赖 =====
install_deps() {
  info "安装依赖..."
  if [[ -f package-lock.json ]]; then
    npm ci
  else
    npm install
  fi
  ok "依赖安装完成"
}

# ===== 构建站点 =====
build_site() {
  info "清理旧构建..."
  npx hexo clean
  
  info "生成静态文件..."
  npx hexo generate
  
  if [[ ! -d "$BUILD_DIR" || -z "$(ls -A $BUILD_DIR)" ]]; then
    err "构建失败: $BUILD_DIR 目录为空"
    exit 1
  fi
  ok "构建完成: $(find $BUILD_DIR -type f | wc -l) 个文件"
}

# ===== 部署到 GitHub Pages =====
deploy_site() {
  if $DRY_RUN; then
    info "Dry-run 模式，跳过部署"
    return 0
  fi
  
  info "准备部署到 GitHub Pages..."
  
  # 确定远程仓库 URL
  local remote_url
  if $CI_MODE; then
    # CI 环境使用 GITHUB_TOKEN
    if [[ -z "${GITHUB_TOKEN:-}" ]]; then
      err "CI 模式下缺少 GITHUB_TOKEN"
      exit 1
    fi
    remote_url="https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_USER}/${REPO_NAME}.git"
  else
    # 本地环境：优先 SSH，回退 HTTPS + Token
    if git remote get-url origin &>/dev/null | grep -q '^git@'; then
      remote_url=$(git remote get-url origin)
      info "使用 SSH 远程地址: $remote_url"
    elif [[ -n "${GH_TOKEN:-}" ]]; then
      remote_url="https://x-access-token:${GH_TOKEN}@github.com/${GITHUB_USER}/${REPO_NAME}.git"
      info "使用 HTTPS + Token 认证"
    else
      err "本地部署需配置 SSH Key 或设置 GH_TOKEN 环境变量"
      exit 1
    fi
  fi
  
  # 创建临时部署目录
  local deploy_dir=".deploy_temp"
  rm -rf "$deploy_dir"
  mkdir -p "$deploy_dir"
  cd "$deploy_dir"
  
  # 初始化 Git 仓库
  git init -q
  git config user.name "github-actions[bot]"
  git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
  
  # 复制构建产物
  cp -r "../$BUILD_DIR"/* .
  
  # 添加 .nojekyll 防止 Jekyll 处理
  touch .nojekyll
  
  # 提交并推送
  git add -A
  git commit -q -m "$COMMIT_MSG"
  
  info "推送到 $DEPLOY_BRANCH 分支..."
  git push -f -q "$remote_url" HEAD:"$DEPLOY_BRANCH"
  
  cd ..
  rm -rf "$deploy_dir"
  ok "部署完成! 站点将在几分钟内更新: https://${GITHUB_USER}.github.io"
}

# ===== 主流程 =====
main() {
  info "=== Hexo 博客部署脚本 ==="
  info "模式: $($CI_MODE && echo 'CI' || echo '本地') | Dry-run: $DRY_RUN"
  
  check_env
  install_deps
  build_site
  deploy_site
  
  ok "=== 所有任务完成 ==="
}

main "$@"