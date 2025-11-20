// firebase-messaging-sw.js (CÓDIGO MESCLADO)

// Importa os scripts do Firebase necessários para o Service Worker
importScripts('https://www.gstatic.com/firebasejs/11.0.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging-compat.js');
// 1. ADIÇÃO DO WORKBOX AQUI
importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js'); 


// Suas credenciais do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDBt7NcU5rP-hsrBZ07ne_HbiMCHRyVcnY",
  authDomain: "navalha-de-ouro-v11.firebaseapp.com",
  projectId: "navalha-de-ouro-v11",
  storageBucket: "navalha-de-ouro-v11.firebasestorage.app",
  messagingSenderId: "434474263075",
  appId: "1:434474263075:web:163893d68a1b5dbe74c796"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// 2. CONFIGURAÇÕES DO OFFLINE/WORKBOX AQUI
const CACHE = "pwabuilder-page";
const offlineFallbackPage = "404.html"; // Usando seu arquivo 404.html existente

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Listener para o evento 'push' (notificação recebida com app fechado/em segundo plano)
self.addEventListener('push', event => {
  console.log('[Service Worker] Push Recebido.');
  // ... (restante do código push aqui)
  
  // Seu código existente do listener 'push'
  const payload = event.data.json();
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/icone.png',
    data: {
      url: payload.data.link || '/', // Usa o link do payload ou volta para a raiz
      // Adicione mais dados se necessário
    }
  };

  event.waitUntil(
    self.registration.showNotification(notificationTitle, notificationOptions)
  );
});

// Listener para quando o usuário clica na notificação (MELHORADO)
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Clique na notificação recebido.');
  
  event.notification.close();
  
  // Abre a URL que foi definida no 'data' da notificação
  const urlToOpen = new URL(event.notification.data.url, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(clientList => {
      // Se uma janela do app já estiver aberta e na mesma URL, foca nela
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Se não, abre uma nova janela com a URL correta
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handler para mensagens em segundo plano (onBackgroundMessage)
messaging.onBackgroundMessage(function(payload) {
  console.log('[service-worker.js] Mensagem de segundo plano recebida.', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/icone.png',
    data: {
      url: payload.data.link || '/' // Usa o link do payload ou volta para a raiz
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('sync', event => {
  if (event.tag === 'enviar-mensagem-chat') {
    event.waitUntil(
      // Coloque aqui a lógica para pegar a mensagem salva
      // do IndexedDB e enviá-la para o Firestore.
      console.log('Conexão reestabelecida, enviando mensagem em segundo plano...')
    );
  }
});

// -------------------------------------------------------------------------
// INÍCIO DA LÓGICA DO WORKBOX PARA CACHE E OFFLINE (NOVO CÓDIGO)
// -------------------------------------------------------------------------

self.addEventListener('install', async (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.add(offlineFallbackPage))
  );
});

if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        // Tenta pegar a resposta do preload
        const preloadResp = await event.preloadResponse;
        if (preloadResp) {
          return preloadResp;
        }

        // Se não tiver preload, faz o fetch normal
        const networkResp = await fetch(event.request);
        return networkResp;
      } catch (error) {
        console.log('Fetch failed; returning offline page instead.', error);
        
        const cache = await caches.open(CACHE);
        const cachedResp = await cache.match(offlineFallbackPage);
        return cachedResp;
      }
    })());
  }
});

// -------------------------------------------------------------------------
// FIM DA LÓGICA DO WORKBOX
// -------------------------------------------------------------------------
