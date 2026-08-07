// 自定义 JavaScript 文件
// 这里可以添加自定义的客户端逻辑

document.addEventListener('DOMContentLoaded', () => {
  console.log('🎉 博客加载完成！');
  
  // ===== 代码块复制按钮增强 =====
  enhanceCodeBlocks();
  
  // ===== 图片懒加载优化 =====
  optimizeImages();
  
  // ===== 目录高亮 =====
  highlightToc();
  
  // ===== 回到顶部按钮 =====
  initBackToTop();
  
  // ===== 页面加载动画 =====
  initPageLoader();
});

/**
 * 增强代码块：添加复制按钮、语言标签
 */
function enhanceCodeBlocks() {
  const codeBlocks = document.querySelectorAll('.highlight, pre[class*="language-"]');
  
  codeBlocks.forEach(block => {
    // 添加语言标签
    const lang = block.className.match(/language-(\w+)/)?.[1] || '';
    if (lang && !block.querySelector('.code-lang')) {
      const langTag = document.createElement('div');
      langTag.className = 'code-lang';
      langTag.textContent = lang.toUpperCase();
      block.style.position = 'relative';
      block.appendChild(langTag);
    }
    
    // 复制按钮
    if (!block.querySelector('.copy-btn')) {
      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-btn';
      copyBtn.innerHTML = '📋 复制';
      copyBtn.style.cssText = `
        position: absolute;
        top: 8px;
        right: 8px;
        padding: 4px 10px;
        background: rgba(0,0,0,0.1);
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        opacity: 0;
        transition: opacity 0.2s;
        z-index: 10;
      `;
      
      block.style.position = 'relative';
      block.appendChild(copyBtn);
      
      block.addEventListener('mouseenter', () => copyBtn.style.opacity = '1');
      block.addEventListener('mouseleave', () => copyBtn.style.opacity = '0');
      
      copyBtn.addEventListener('click', async () => {
        const code = block.querySelector('code')?.innerText || block.innerText;
        try {
          await navigator.clipboard.writeText(code);
          copyBtn.textContent = '✅ 已复制';
          setTimeout(() => copyBtn.textContent = '📋 复制', 2000);
        } catch (e) {
          copyBtn.textContent = '❌ 失败';
          setTimeout(() => copyBtn.textContent = '📋 复制', 2000);
        }
      });
    }
  });
}

/**
 * 图片懒加载优化
 */
function optimizeImages() {
  const images = document.querySelectorAll('.post-content img:not([loading])');
  
  if ('loading' in HTMLImageElement.prototype) {
    // 原生懒加载支持
    images.forEach(img => {
      img.loading = 'lazy';
    });
  } else {
    // 降级：IntersectionObserver
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        }
      });
    }, { rootMargin: '50px' });
    
    images.forEach(img => {
      if (img.src) {
        img.dataset.src = img.src;
        img.removeAttribute('src');
      }
      observer.observe(img);
    });
  }
}

/**
 * 目录高亮跟随
 */
function highlightToc() {
  const tocLinks = document.querySelectorAll('#toc a, .toc-link');
  if (tocLinks.length === 0) return;
  
  const headings = Array.from(document.querySelectorAll('.post-content h1, .post-content h2, .post-content h3'))
    .filter(h => h.id);
  
  if (headings.length === 0) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.id;
      const link = document.querySelector(`#toc a[href="#${id}"], .toc-link[href="#${id}"]`);
      if (link) {
        link.classList.toggle('active', entry.isIntersecting);
      }
    });
  }, { rootMargin: '-100px 0px -66%' });
  
  headings.forEach(h => observer.observe(h));
}

/**
 * 回到顶部按钮
 */
function initBackToTop() {
  const btn = document.createElement('button');
  btn.id = 'back-to-top';
  btn.innerHTML = '⬆️';
  btn.title = '回到顶部';
  btn.style.cssText = `
    position: fixed;
    bottom: 80px;
    right: 20px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--btn-bg, #42b983);
    color: white;
    border: none;
    cursor: pointer;
    font-size: 20px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(20px);
    transition: all 0.3s ease;
    z-index: 999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  
  document.body.appendChild(btn);
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btn.style.opacity = '1';
      btn.style.visibility = 'visible';
      btn.style.transform = 'translateY(0)';
    } else {
      btn.style.opacity = '0';
      btn.style.visibility = 'hidden';
      btn.style.transform = 'translateY(20px)';
    }
  });
  
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  
  btn.addEventListener('mouseenter', () => {
    btn.style.transform = 'translateY(0) scale(1.1)';
  });
  
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translateY(0) scale(1)';
  });
}

/**
 * 页面加载动画
 */
function initPageLoader() {
  // 移除加载指示器（如果有）
  const loader = document.querySelector('.page-loader, #loading');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 300);
  }
  
  // 触发入场动画
  document.body.classList.add('page-loaded');
}

// ===== 工具函数 =====

// 防抖
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// 节流
function throttle(fn, limit = 300) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 平滑滚动到元素
function scrollToElement(selector, offset = 80) {
  const el = document.querySelector(selector);
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

// 导出给全局使用（可选）
window.BlogUtils = { debounce, throttle, scrollToElement };