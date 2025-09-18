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

// NOVO: Listener para pular a espera e ativar o novo Service Worker imediatamente
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ALTERAÇÃO INICIADA: Adicionado listener para o evento 'push'
// Este é o principal responsável por exibir a notificação quando o app está fechado.
self.addEventListener('push', event => {
  console.log('[Service Worker] Push Recebido.');
  const payload = event.data.json();
  console.log('[Service Worker] Payload:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/icone.png',
    data: {
      click_action: payload.fcmOptions ? payload.fcmOptions.link : 'https://navalha-de-ouro-v11.web.app/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(notificationTitle, notificationOptions)
  );
});

// Listener para quando o usuário clica na notificação
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Clique na notificação recebido.');
  
  event.notification.close();
  
  const clickAction = event.notification.data.click_action;
  
  event.waitUntil(
    clients.openWindow(clickAction)
  );
});
// ALTERAÇÃO FINALIZADA

// Manipulador para mensagens de dados recebidas em segundo plano (quando o app não está em foco)
messaging.onBackgroundMessage(function(payload) {
  console.log('[service-worker.js] Mensagem de segundo plano recebida.', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icone.png', // Opcional: Adiciona um ícone à notificação
    click_action: 'https://navalha-de-ouro-v11.web.app/' // Opcional: Abre a URL do seu site ao clicar na notificação
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
