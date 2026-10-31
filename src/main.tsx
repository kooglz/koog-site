import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerSW } from 'virtual:pwa-register'

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data?.type === 'KOOG_UPDATE_CAPABLE') event.ports[0]?.postMessage({ ready: true });
  });
  registerSW({
    immediate: true,
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      const check = () => {
        if (navigator.onLine && !document.hidden) void registration.update().catch(() => {});
      };
      window.addEventListener('focus', check);
      document.addEventListener('visibilitychange', check);
      check();
    },
  });
}


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
