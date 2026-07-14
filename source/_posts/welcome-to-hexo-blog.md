---
title: 欢迎使用 Hexo + GitHub Pages 博客
date: 2024-01-01 12:00:00
tags:
  - Hexo
  - GitHub Pages
  - 博客搭建
categories:
  - 教程
cover: /img/welcome-cover.jpg
description: 这是一篇欢迎文章，介绍如何使用 Hexo + GitHub Pages 快速搭建个人技术博客
---

# 🎉 欢迎来到你的新博客！

这是你使用 **Hexo + Butterfly 主题 + GitHub Pages** 搭建的第一篇文章。

## 🚀 快速开始

### 1. 创建新文章
```bash
npm run new:post "文章标题"
# 或
npx hexo new post "文章标题"
```

### 2. 创建新页面
```bash
npm run new:page "页面名称"
# 或
npx hexo new page "页面名称"
```

### 3. 本地预览
```bash
npm run serve
# 访问 http://localhost:4000
```

### 4. 构建部署
```bash
# 本地部署
npm run deploy

# 或使用 GitHub Actions 自动部署（推送到 main 分支即可）
git push origin main
```

## 📝 Front-matter 说明

每篇文章顶部的配置项：

```yaml
---
title: 文章标题                    # 必填
date: 2024-01-01 12:00:00         # 必填，发布时间
updated: 2024-01-02 10:00:00      # 可选，更新时间
tags:                             # 可选，标签
  - 标签1
  - 标签2
categories:                       # 可选，分类
  - 分类1
  - 分类2
cover: /img/cover.jpg             # 可选，封面图
description: 文章摘要              # 可选，SEO 描述
keywords: 关键词1, 关键词2         # 可选，SEO 关键词
top_img: /img/top.jpg             # 可选，文章顶部大图
comments: true                    # 可选，是否开启评论
toc: true                         # 可选，是否显示目录
toc_number: true                  # 可选，目录编号
copyright: true                   # 可选，版权声明
mathjax: false                    # 可选，数学公式
katex: false                      # 可选，KaTeX 数学公式
---
```

## 🎨 Markdown 语法示例

### 代码块（支持高亮、行号、复制）
```javascript
// JavaScript 示例
function greet(name) {
  console.log(`Hello, ${name}!`);
}

greet('World'); // Hello, World!
```

```python
# Python 示例
def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

print(list(fibonacci(10)))
```

### 表格
| 功能 | 支持情况 | 备注 |
|------|----------|------|
| 代码高亮 | ✅ | highlight.js |
| 行号 | ✅ | 可配置 |
| 复制按钮 | ✅ | 右上角 |
| 折叠长代码 | ✅ | 超过 300px |

### 任务列表
- [x] 完成博客搭建
- [x] 配置主题
- [ ] 写第一篇技术文章
- [ ] 设置自定义域名
- [ ] 配置评论系统

### 引用块
> **学习笔记**
> 写作是最好的思考方式。通过输出倒逼输入，让知识真正内化。
> — 你的名字

### 数学公式
行内公式：$E = mc^2$

块级公式：
$$
\frac{\partial^2 u}{\partial t^2} = c^2 \nabla^2 u
$$

### 图片
![示例图片](/img/example.jpg)

## 📁 目录结构建议

```
source/
├── _posts/           # 文章
│   ├── 2024/
│   │   ├── 01-hello-hexo.md
│   │   └── 02-advanced-config.md
│   └── 2025/
├── _pages/           # 页面
│   ├── about/
│   ├── tags/
│   ├── categories/
│   └── friends/
├── _data/            # 数据文件
│   └── links.yml
└── img/              # 图片资源
    ├── avatar.png
    ├── cover/
    └── post/
```

## 🔧 进阶配置

### 自定义样式
编辑 `source/css/_custom.styl`：
```stylus
// 自定义字体大小
.post-content {
  font-size: 17px;
  line-height: 1.8;
}

// 自定义代码块样式
.highlight .line {
  padding: 0 12px;
}
```

### 自定义脚本
编辑 `source/js/_custom.js`：
```javascript
// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
  console.log('博客加载完成 🎉');
});
```

## 📚 推荐阅读

- [Hexo 官方文档](https://hexo.io/docs/)
- [Butterfly 主题文档](https://butterfly.js.org/)
- [GitHub Pages 文档](https://docs.github.com/en/pages)
- [Markdown 语法指南](https://www.markdownguide.org/)

---

> 💡 **提示**: 修改文章后记得执行 `npm run build` 预览效果，然后 `git push` 自动部署。

**祝你写作愉快！** ✍️🚀