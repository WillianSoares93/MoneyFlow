const CACHE_NAME = 'moneyflow-cache-v7'; // Versão do cache atualizada para forçar a renovação
const urlsToCache = [
    './',
    './index.html',
    './icon.png',
    'https://cdn.tailwindcss.com',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js',
    'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js'
];

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[SW v7] Cache aberto e assets armazenados.');
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(cache => cache !== CACHE_NAME)
                    .map(cache => {
                        console.log('[SW v7] Deletando cache antigo:', cache);
                        return caches.delete(cache);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    // Para requisições de navegação (abrir/atualizar a página)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            // 1. Tenta buscar na rede primeiro
            fetch(event.request)
                .then(response => {
                    // Se conseguir, clona a resposta para poder usar e guardar no cache
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                    return response;
                })
                .catch(() => {
                    // 2. Se a rede falhar, busca no cache
                    return caches.match(event.request).then(response => {
                        // Se encontrar no cache, retorna. Senão, pode-se retornar uma página offline genérica
                        return response || caches.match('./index.html');
                    });
                })
        );
        return;
    }

    // Para todos os outros assets (CSS, JS, imagens)
    event.respondWith(
        caches.match(event.request).then(response => {
            // Retorna do cache se encontrar
            if (response) {
                return response;
            }
            // Senão, busca na rede, armazena no cache e retorna
            return fetch(event.request).then(networkResponse => {
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, networkResponse.clone());
                });
                return networkResponse;
            });
        })
    );
});

