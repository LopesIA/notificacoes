// Importa os scripts do Firebase necessários para o Service Worker
importScripts('https://www.gstatic.com/firebasejs/11.0.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging-compat.js');

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

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Listener para o evento 'push' (notificação recebida com app fechado/em segundo plano)
self.addEventListener('push', event => {
  console.log('[Service Worker] Push Recebido.');
  const payload = event.data.json();
  console.log('[Service Worker] Payload:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/icone.png',
    // A mágica do deep linking acontece aqui:
    // O backend envia um 'link' dentro do campo 'data'
    data: {
      url: payload.data.link || '/' // Se nenhum link for fornecido, abre a página inicial
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
      url: payload.data.link || '/'
    }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});