const updateListeners = new Set();
const installListeners = new Set();
let waitingRegistration = null;
let deferredPrompt = null;
let initialized = false;
let refreshing = false;

function notifyUpdateListeners() {
  updateListeners.forEach((listener) => listener(waitingRegistration));
}

function notifyInstallListeners() {
  installListeners.forEach((listener) => listener(deferredPrompt != null));
}

function monitorRegistration(registration) {
  if (!registration) return;

  if (registration.waiting && navigator.serviceWorker.controller) {
    waitingRegistration = registration;
    notifyUpdateListeners();
  }

  registration.addEventListener('updatefound', () => {
    const newWorker = registration.installing;
    if (!newWorker) return;

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        waitingRegistration = registration;
        notifyUpdateListeners();
      }
    });
  });
}

export function setupServiceWorker() {
  if (initialized) return;
  initialized = true;

  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    notifyInstallListeners();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notifyInstallListeners();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        monitorRegistration(registration);
      })
      .catch(() => {
        /* silent */
      });
  });
}

export function subscribeToServiceWorkerUpdate(listener) {
  updateListeners.add(listener);
  if (waitingRegistration) listener(waitingRegistration);
  return () => {
    updateListeners.delete(listener);
  };
}

export function applyServiceWorkerUpdate(registration) {
  const target = registration?.waiting || waitingRegistration?.waiting;
  if (!target) return;
  target.postMessage({ type: 'SKIP_WAITING' });
}

export function subscribeToInstallPrompt(listener) {
  installListeners.add(listener);
  listener(deferredPrompt != null);
  return () => {
    installListeners.delete(listener);
  };
}

export async function triggerInstallPrompt() {
  if (!deferredPrompt) return false;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  notifyInstallListeners();
  return outcome === 'accepted';
}
