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

// Manipulador para mensagens recebidas em segundo plano
messaging.onBackgroundMessage(function(payload) {
  console.log('[service-worker.js] Mensagem recebida em segundo plano.', payload);

  const notificationTitle = payload.notification.title;
  // Opções aprimoradas para a notificação
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icone.png',
    badge: '/icone.png', // Ícone para a barra de status no Android
    vibrate: [200, 100, 200] // Padrão de vibração
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});
