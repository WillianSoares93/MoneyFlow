const CACHE_NAME = 'moneyflow-cache-v3'; // Versão do cache atualizada para forçar a renovação
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
    self.skipWaiting(); // Garante que o novo SW ative assim que for instalado
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache aberto e assets armazenados');
                return cache.addAll(urlsToCache);
            })
    );
});

// Ativa o novo Service Worker e limpa caches antigos
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Deletando cache antigo:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Garante que o SW atual controle a página imediatamente
    );
});

// Intercepta as requisições de rede
self.addEventListener('fetch', event => {
    // Para requisições de navegação (abrir/recarregar a página)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => {
                // Se a rede falhar, serve o index.html do cache
                return caches.match('./index.html');
            })
        );
        return;
    }

    // Para outros assets (CSS, JS, imagens), usa a estratégia "cache-first"
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Retorna do cache se encontrar, senão busca na rede
                return response || fetch(event.request);
            })
    );
});

