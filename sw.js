const CACHE_NAME = 'moneyflow-cache-v6'; // Versão do cache atualizada para forçar a renovação
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
            console.log('[SW v6] Cache aberto e assets armazenados.');
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
                        console.log('[SW v6] Deletando cache antigo:', cache);
                        return caches.delete(cache);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

// Intercepta as requisições de rede com a estratégia "Stale-While-Revalidate"
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(event.request).then(cachedResponse => {
                const fetchPromise = fetch(event.request).then(networkResponse => {
                    // Se a resposta da rede for válida, atualiza o cache
                    if (networkResponse) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(err => {
                    console.warn('[SW v6] Requisição de rede falhou. Servindo apenas do cache.', err);
                });

                // Retorna a resposta do cache imediatamente se existir,
                // caso contrário, aguarda a resposta da rede.
                // A rede sempre será consultada em segundo plano para atualizações.
                return cachedResponse || fetchPromise;
            });
        })
    );
});

