const CACHE_NAME = 'moneyflow-cache-v4'; // Versão do cache atualizada para forçar a renovação
const urlsToCache = [
    './',
    './index.html',
    './icon.png',
    'https://cdn.tailwindcss.com',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js'
];

// Instala o Service Worker, pulando a espera e armazenando os assets essenciais em cache
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Cache aberto e assets armazenados na v4');
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

// Intercepta as requisições de rede com a estratégia "Cache First"
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Se o recurso estiver no cache, retorna ele
                if (cachedResponse) {
                    return cachedResponse;
                }
                // Se não estiver no cache, busca na rede
                return fetch(event.request);
            })
    );
});

