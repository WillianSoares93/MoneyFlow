const CACHE_NAME = 'moneyflow-cache-v8'; // Versão do cache atualizada
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/icon.png',
  'https://cdn.tailwindcss.com',
  'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js',
  'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js'
];

// 1. Instalação: Armazena os arquivos principais no cache.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW v8] Cache aberto. Armazenando arquivos principais.');
        return cache.addAll(URLS_TO_CACHE);
      })
      .then(() => self.skipWaiting()) // Ativa o novo SW imediatamente
  );
});

// 2. Ativação: Limpa os caches antigos.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[SW v8] Deletando cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // Garante que o novo SW assuma o controle
  );
});

// 3. Fetch: Intercepta as requisições.
self.addEventListener('fetch', event => {
  // Estratégia: Cache First (Cache Primeiro)
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Se a resposta estiver no cache, retorna ela.
        if (cachedResponse) {
          return cachedResponse;
        }
        // Se não estiver, busca na rede.
        return fetch(event.request);
      })
  );
});

