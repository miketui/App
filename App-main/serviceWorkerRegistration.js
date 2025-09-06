// This file is intentionally left minimal. Vite's PWA plugin can handle
// generating a service worker.  For more control, you may register a
// custom service worker here.

export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          console.log('Service worker registered:', registration);
        })
        .catch(error => {
          console.error('Service worker registration failed:', error);
        });
    });
  }
}
