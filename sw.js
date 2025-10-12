const CACHE_NAME = 'moneyflow-cache-v5'; // Versão do cache atualizada
const urlsToCache = [
    './',
    './index.html',
    './icon.png',
    'https://cdn.tailwindcss.com',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js'
];

// Instala o Service Worker e armazena os assets essenciais em cache
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Cache v5 aberto e assets armazenados.');
            return cache.addAll(urlsToCache);
        })
    );
});

// Ativa o novo Service Worker, limpa caches antigos e assume o controle
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(cache => cache !== CACHE_NAME)
                    .map(cache => {
                        console.log('Deletando cache antigo:', cache);
                        return caches.delete(cache);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

// Intercepta as requisições de rede
self.addEventListener('fetch', event => {
    // Estratégia: Network Falling Back to Cache (para a navegação principal)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => {
                // Se a rede falhar, serve o index.html principal do cache
                return caches.match('./index.html');
            })
        );
        return;
    }

    // Estratégia: Cache First (para todos os outros assets)
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            return cachedResponse || fetch(event.request);
        })
    );
});

