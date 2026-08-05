'use client';
import { useEffect } from 'react';
import { App } from '@capacitor/app';

export default function AppListener() {
  useEffect(() => {
    // 1. Interceptar los clics en enlaces de Telegram para abrirlos directo en la app nativa
    const handleAnchorClick = (event) => {
      let target = event.target.closest('a');
      if (target && target.href && target.href.includes('t.me/')) {
        event.preventDefault();
        window.open(target.href, '_system');
      }
    };

    document.addEventListener('click', handleAnchorClick);

    // 2. Controlar el botón "Atrás" de Android con Capacitor
    let backButtonListener;
    async function setupBackButton() {
      try {
        backButtonListener = await App.addListener('backButton', () => {
          if (window.location.pathname === '/' || window.location.pathname === '') {
            const salir = window.confirm("¿Querés salir de CineChapu?");
            if (salir) {
              App.exitApp();
            }
          } else {
            window.history.back();
          }
        });
      } catch (e) {
        console.log("Capacitor App plugin no disponible en navegador web");
      }
    }

    setupBackButton();

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      if (backButtonListener) {
        backButtonListener.remove();
      }
    };
  }, []);

  return null; // Este componente no muestra nada visual en pantalla
}