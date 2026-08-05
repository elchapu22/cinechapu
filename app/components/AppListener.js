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

    // 2. Truco de trampolín en el historial para atrapar el botón Atrás
    // Empujamos un estado inicial para tener control de cuándo el usuario retrocede
    window.history.pushState({ page: 'root' }, '', window.location.href);

    const handlePopState = (event) => {
      // Verificamos si estamos en la ruta principal o si podemos volver atrás
      // Si el usuario está navegando dentro de la app, dejamos que el router actúe, 
      // pero si intenta salir de la app, frenamos y preguntamos.
      const salir = window.confirm("¿Querés salir de CineChapu?");
      
      if (salir) {
        try {
          App.exitApp();
        } catch (e) {
          window.close();
        }
      } else {
        // Si cancela, volvemos a asegurar el estado en el historial para que no cierre
        window.history.pushState({ page: 'root' }, '', window.location.href);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return null;
}