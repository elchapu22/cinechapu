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

    // 2. Truco de historial para frenar el botón "Atrás"
    // Agregamos un estado fantasma al historial al cargar la página
    window.history.pushState(null, '', window.location.href);

    const handlePopState = (event) => {
      // Cuando el usuario toca "atrás", el navegador vuelve al estado fantasma
      const salir = window.confirm("¿Querés salir de CineChapu?");
      if (salir) {
        // Si acepta salir, cerramos la app (si está en Capacitor) o dejamos que salga
        try {
          App.exitApp();
        } catch (e) {
          window.close();
        }
      } else {
        // Si cancela, volvemos a empujar el estado para que no se salga
        window.history.pushState(null, '', window.location.href);
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