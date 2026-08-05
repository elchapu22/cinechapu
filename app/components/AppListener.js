'use client';
import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { useRouter, usePathname } from 'next/navigation';

export default function AppListener() {
  const router = useRouter();
  const pathname = usePathname();

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

    // 2. Controlar el botón "Atrás" nativo de Android de forma precisa
    let backButtonListener;
    async function setupBackButton() {
      try {
        backButtonListener = await App.addListener('backButton', () => {
          // Si estamos en la página de inicio exacta, preguntamos si quiere salir
          if (pathname === '/') {
            const salir = window.confirm("¿Querés salir de CineChapu?");
            if (salir) {
              App.exitApp();
            }
          } else {
            // Si estamos adentro de una película, saga, etc., retrocedemos una página en la web
            router.back();
          }
        });
      } catch (e) {
        console.log("Capacitor no disponible en navegador web");
      }
    }

    setupBackButton();

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      if (backButtonListener) {
        backButtonListener.remove();
      }
    };
  }, [pathname, router]);

  return null;
}