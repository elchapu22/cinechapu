'use client';
import { useEffect } from 'react';
import { App } from '@capacitor/app';

export default function AppListener() {
  useEffect(() => {
    // 1. Interceptar los clics en enlaces de Telegram
    const handleAnchorClick = (event) => {
      let target = event.target.closest('a');
      if (target && target.href && target.href.includes('t.me/')) {
        event.preventDefault();
        window.open(target.href, '_system');
      }
    };

    document.addEventListener('click', handleAnchorClick);

    // 2. Escucha nativa robusta para Capacitor
    let backButtonSubscription;

    async function initNativeBack() {
      try {
        // Nos suscribimos al evento nativo del botón atrás de Android
        backButtonSubscription = await App.addListener('backButton', ({ canGoBack }) => {
          if (!canGoBack || window.location.pathname === '/') {
            const salir = window.confirm("¿Querés salir de CineChapu?");
            if (salir) {
              App.exitApp();
            }
          } else {
            window.history.back();
          }
        });
      } catch (e) {
        console.log("No estamos en un entorno nativo de Capacitor:", e);
      }
    }

    initNativeBack();

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      if (backButtonSubscription) {
        backButtonSubscription.remove();
      }
    };
  }, []);

  return null;
}