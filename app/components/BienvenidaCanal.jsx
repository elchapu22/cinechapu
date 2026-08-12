'use client';
import { useState, useEffect } from 'react';

export default function BienvenidaCanal() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [minimizado, setMinimizado] = useState(false);

  useEffect(() => {
    const yaVioBienvenida = localStorage.getItem('cinechapu_bienvenida_vista');
    if (!yaVioBienvenida) {
      setModalAbierto(true);
    } else if (yaVioBienvenida === 'minimizado') {
      setMinimizado(true);
    }
  }, []);

  const handleUnirse = () => {
    localStorage.setItem('cinechapu_bienvenida_vista', 'visto');
    setModalAbierto(false);
    setMinimizado(false);
  };

  const handleMinimizar = () => {
    localStorage.setItem('cinechapu_bienvenida_vista', 'minimizado');
    setModalAbierto(false);
    setMinimizado(true);
  };

  const handleMaximizar = () => {
    setModalAbierto(true);
    setMinimizado(false);
  };

  return (
    <>
      {modalAbierto && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', padding: '16px' }}>
          <div style={{ backgroundColor: '#131b2e', border: '1px solid rgba(220, 38, 38, 0.5)', borderRadius: '16px', padding: '20px', width: '100%', maxWidth: '280px', textAlign: 'center', boxChannel: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ef4444', marginBottom: '8px' }}>¡Bienvenido a CineChapu! 🍿</h2>
            <p style={{ fontSize: '11px', color: '#d1d5db', lineHeight: '1.4', marginBottom: '16px' }}>
              Este es un catálogo privado. ¡Sumate al canal oficial de Telegram para enterarte de todos los estrenos y pedir tus pelis!
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a 
                href="LINK_DE_TU_CANAL_DE_TELEGRAM" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={handleUnirse}
                style={{ backgroundColor: '#dc2626', color: '#ffffff', padding: '10px', borderRadius: '10px', fontWeight: '500', fontSize: '12px', textDecoration: 'none', display: 'block' }}
              >
                Unirme al Canal 🚀
              </a>
              <button 
                onClick={handleMinimizar}
                style={{ backgroundColor: '#27272a', color: '#d1d5db', padding: '10px', borderRadius: '10px', fontWeight: '500', fontSize: '12px', border: 'none', cursor: 'pointer', width: '100%' }}
              >
                Minimizar ↘
              </button>
            </div>
          </div>
        </div>
      )}

      {minimizado && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#131b2e]/90 border border-red-600/40 backdrop-blur-md px-3 py-2 rounded-xl shadow-xl flex items-center gap-2">
          <span className="text-[11px] text-zinc-300 font-medium">💬 ¡Unite!</span>
          <a 
            href="LINK_DE_TU_CANAL_DE_TELEGRAM" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-red-600 hover:bg-red-700 text-white text-[11px] px-2.5 py-1 rounded-lg font-bold transition"
          >
            Entrar
          </a>
          <button 
            onClick={handleMaximizar}
            className="text-zinc-400 hover:text-white text-xs ml-1"
            title="Maximizar"
          >
            ➕
          </button>
        </div>
      )}
    </>
  );
}