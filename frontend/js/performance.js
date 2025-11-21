// Performance optimization utilities

// Simple cache with expiration
class SimpleCache {
  constructor(ttl = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + this.ttl
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  clear() {
    this.cache.clear();
  }

  delete(key) {
    this.cache.delete(key);
  }
}

// Global cache instance
const apiCache = new SimpleCache();

// Enhanced fetch with caching
async function cachedFetch(url, options = {}) {
  const cacheKey = `${url}_${JSON.stringify(options)}`;
  
  // Only cache GET requests
  if (!options.method || options.method === 'GET') {
    const cached = apiCache.get(cacheKey);
    if (cached) {
      console.log('Cache hit:', url);
      return cached;
    }
  }
  
  const response = await fetch(url, options);
  const data = await response.json();
  
  // Cache successful GET requests
  if (response.ok && (!options.method || options.method === 'GET')) {
    apiCache.set(cacheKey, data);
  }
  
  return data;
}

// Invalidate cache on data changes
function invalidateCache(pattern) {
  if (pattern) {
    for (const key of apiCache.cache.keys()) {
      if (key.includes(pattern)) {
        apiCache.delete(key);
      }
    }
  } else {
    apiCache.clear();
  }
}

// Debounce function for search inputs
function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function for scroll events
function throttle(func, limit = 100) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Lazy load images
function lazyLoadImages() {
  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
}

// Preload critical resources
function preloadResource(url, type = 'fetch') {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  link.as = type;
  document.head.appendChild(link);
}

// Show loading indicator
function showLoading(element) {
  if (typeof element === 'string') {
    element = document.getElementById(element);
  }
  if (element) {
    element.innerHTML = '<div class="loading"></div>';
  }
}

// Show skeleton loader
function showSkeleton(element, count = 5) {
  if (typeof element === 'string') {
    element = document.getElementById(element);
  }
  if (element) {
    let skeletons = '';
    for (let i = 0; i < count; i++) {
      skeletons += `
        <div class="skeleton" style="height: 60px; margin-bottom: 10px;"></div>
      `;
    }
    element.innerHTML = skeletons;
  }
}

// Show toast notification
function showToast(message, type = 'success', duration = 3000) {
  // Remove existing toasts
  document.querySelectorAll('.toast').forEach(t => t.remove());
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = type === 'success' ? 'fa-check-circle' : 
               type === 'error' ? 'fa-exclamation-circle' : 
               'fa-info-circle';
  
  toast.innerHTML = `
    <i class="fas ${icon}"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.5s ease-out reverse';
    setTimeout(() => toast.remove(), 500);
  }, duration);
}

// Batch API calls
class BatchRequest {
  constructor(delay = 100) {
    this.queue = [];
    this.delay = delay;
    this.timeout = null;
  }

  add(url, options = {}) {
    return new Promise((resolve, reject) => {
      this.queue.push({ url, options, resolve, reject });
      this.scheduleFlush();
    });
  }

  scheduleFlush() {
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(() => this.flush(), this.delay);
  }

  async flush() {
    const requests = this.queue.splice(0);
    const promises = requests.map(({ url, options }) => 
      fetch(url, options).then(r => r.json())
    );

    try {
      const results = await Promise.all(promises);
      requests.forEach((req, i) => req.resolve(results[i]));
    } catch (error) {
      requests.forEach(req => req.reject(error));
    }
  }
}

// Virtual scrolling for large lists
class VirtualScroller {
  constructor(container, itemHeight, renderItem) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.renderItem = renderItem;
    this.items = [];
    this.visibleStart = 0;
    this.visibleEnd = 0;
    
    this.container.addEventListener('scroll', throttle(() => this.update(), 50));
  }

  setItems(items) {
    this.items = items;
    this.container.style.height = `${items.length * this.itemHeight}px`;
    this.update();
  }

  update() {
    const scrollTop = this.container.scrollTop;
    const containerHeight = this.container.clientHeight;
    
    this.visibleStart = Math.floor(scrollTop / this.itemHeight);
    this.visibleEnd = Math.ceil((scrollTop + containerHeight) / this.itemHeight);
    
    this.render();
  }

  render() {
    const fragment = document.createDocumentFragment();
    
    for (let i = this.visibleStart; i < this.visibleEnd && i < this.items.length; i++) {
      const item = this.renderItem(this.items[i], i);
      item.style.position = 'absolute';
      item.style.top = `${i * this.itemHeight}px`;
      fragment.appendChild(item);
    }
    
    this.container.innerHTML = '';
    this.container.appendChild(fragment);
  }
}

// Optimize animations with RAF
function optimizedAnimate(element, property, start, end, duration, callback) {
  const startTime = performance.now();
  
  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    const value = start + (end - start) * progress;
    element.style[property] = value;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else if (callback) {
      callback();
    }
  }
  
  requestAnimationFrame(animate);
}

// Reduce layout thrashing
class LayoutOptimizer {
  constructor() {
    this.readOperations = [];
    this.writeOperations = [];
    this.scheduled = false;
  }

  read(callback) {
    this.readOperations.push(callback);
    this.schedule();
  }

  write(callback) {
    this.writeOperations.push(callback);
    this.schedule();
  }

  schedule() {
    if (this.scheduled) return;
    this.scheduled = true;
    
    requestAnimationFrame(() => {
      // Execute all reads first
      this.readOperations.forEach(callback => callback());
      this.readOperations = [];
      
      // Then all writes
      this.writeOperations.forEach(callback => callback());
      this.writeOperations = [];
      
      this.scheduled = false;
    });
  }
}

const layoutOptimizer = new LayoutOptimizer();

// Compress and store data in localStorage
function compressAndStore(key, data) {
  try {
    const compressed = JSON.stringify(data);
    localStorage.setItem(key, compressed);
  } catch (e) {
    console.warn('Storage quota exceeded, clearing old data');
    // Clear old cache if storage is full
    for (let i = 0; i < localStorage.length; i++) {
      const storageKey = localStorage.key(i);
      if (storageKey && storageKey.startsWith('cache_')) {
        localStorage.removeItem(storageKey);
      }
    }
  }
}

// Retrieve and decompress from localStorage
function retrieveAndDecompress(key) {
  try {
    const compressed = localStorage.getItem(key);
    return compressed ? JSON.parse(compressed) : null;
  } catch (e) {
    console.error('Failed to retrieve data:', e);
    return null;
  }
}

// Preconnect to API
function preconnectAPI() {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = window.API_BASE_URL || 'http://localhost:3000';
  document.head.appendChild(link);
}

// Initialize performance optimizations
document.addEventListener('DOMContentLoaded', () => {
  // Preconnect to API
  preconnectAPI();
  
  // Initialize lazy loading
  lazyLoadImages();
  
  // Add will-change hints for animations
  const animatedElements = document.querySelectorAll('.btn, .card, .modal');
  animatedElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      el.style.willChange = 'transform, opacity';
    });
    el.addEventListener('mouseleave', () => {
      el.style.willChange = 'auto';
    });
  });
});

// Export utilities
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SimpleCache,
    cachedFetch,
    invalidateCache,
    debounce,
    throttle,
    lazyLoadImages,
    preloadResource,
    showLoading,
    showSkeleton,
    showToast,
    BatchRequest,
    VirtualScroller,
    optimizedAnimate,
    layoutOptimizer,
    compressAndStore,
    retrieveAndDecompress
  };
}
