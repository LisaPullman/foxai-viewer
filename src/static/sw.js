// FoxAI Service Worker
// 版本号
const CACHE_NAME = 'foxai-v1.0.0';
const STATIC_CACHE = 'foxai-static-v1.0.0';
const DYNAMIC_CACHE = 'foxai-dynamic-v1.0.0';

// 需要缓存的静态资源
const STATIC_ASSETS = [
    '/static/',
    '/static/index.html',
    '/static/css/style.css',
    '/static/js/main.js',
    '/static/manifest.json',
    '/static/icons/icon-192x192.png',
    '/static/icons/icon-512x512.png'
];

// 需要网络优先的资源
const NETWORK_FIRST = [
    '/static/js/',
    '/api/',
    'http://10.20200108.xyz'
];

// 安装事件
self.addEventListener('install', (event) => {
    console.log('🦊 FoxAI Service Worker 安装中...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('📦 缓存静态资源...');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('✅ 静态资源缓存完成');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ 静态资源缓存失败:', error);
            })
    );
});

// 激活事件
self.addEventListener('activate', (event) => {
    console.log('🦊 FoxAI Service Worker 激活中...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('🗑️ 删除旧缓存:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker 激活完成');
                return self.clients.claim();
            })
    );
});

// 拦截请求
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // 跳过非HTTP请求
    if (!request.url.startsWith('http')) {
        return;
    }
    
    // API请求 - 网络优先
    if (isNetworkFirst(request.url)) {
        event.respondWith(networkFirst(request));
        return;
    }
    
    // 静态资源 - 缓存优先
    if (isStaticAsset(request.url)) {
        event.respondWith(cacheFirst(request));
        return;
    }
    
    // 其他请求 - 网络优先，缓存备用
    event.respondWith(networkFirst(request));
});

// 判断是否为网络优先资源
function isNetworkFirst(url) {
    return NETWORK_FIRST.some(pattern => url.includes(pattern));
}

// 判断是否为静态资源
function isStaticAsset(url) {
    return STATIC_ASSETS.some(asset => url.includes(asset)) ||
           url.includes('.css') ||
           url.includes('.js') ||
           url.includes('.png') ||
           url.includes('.jpg') ||
           url.includes('.svg');
}

// 缓存优先策略
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('缓存优先策略失败:', error);
        return new Response('离线状态，资源不可用', { status: 503 });
    }
}

// 网络优先策略
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('网络请求失败，尝试缓存:', request.url);
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // 如果是页面请求，返回离线页面
        if (request.destination === 'document') {
            return caches.match('/static/index.html');
        }
        
        return new Response('网络错误，资源不可用', { status: 503 });
    }
}

// 后台同步
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        console.log('🔄 执行后台同步...');
        event.waitUntil(doBackgroundSync());
    }
});

// 执行后台同步
async function doBackgroundSync() {
    try {
        // 这里可以添加需要后台同步的逻辑
        // 比如发送离线时的消息、同步用户数据等
        console.log('✅ 后台同步完成');
    } catch (error) {
        console.error('❌ 后台同步失败:', error);
    }
}

// 推送通知
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body || 'FoxAI有新消息',
            icon: '/static/icons/icon-192x192.png',
            badge: '/static/icons/icon-72x72.png',
            tag: 'foxai-notification',
            renotify: true,
            requireInteraction: false,
            actions: [
                {
                    action: 'open',
                    title: '打开应用',
                    icon: '/static/icons/icon-72x72.png'
                },
                {
                    action: 'close',
                    title: '关闭',
                    icon: '/static/icons/icon-72x72.png'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title || 'FoxAI', options)
        );
    }
});

// 通知点击事件
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow('/static/index.html')
        );
    }
});

// 错误处理
self.addEventListener('error', (event) => {
    console.error('🦊 Service Worker 错误:', event.error);
});

// 未处理的Promise拒绝
self.addEventListener('unhandledrejection', (event) => {
    console.error('🦊 Service Worker 未处理的Promise拒绝:', event.reason);
});

console.log('🦊 FoxAI Service Worker 已加载');
