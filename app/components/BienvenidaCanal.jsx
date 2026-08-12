'use client';
import { useState, useEffect } from 'react';

export default function BienvenidaCanal() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [minimizado, setMinimizado] = useState(false);
  const [expandidoFlotante, setExpandidoFlotante] = useState(true);

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

  const handleMaximizar = (e) => {
    e.stopPropagation();
    setModalAbierto(true);
    setMinimizado(false);
  };

  return (
    <>
      {modalAbierto && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 99999, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', padding: '16px' }}>
          <div style={{ backgroundColor: '#131b2e', border: '1px solid rgba(220, 38, 38, 0.5)', borderRadius: '16px', padding: '20px', width: '100%', maxWidth: '280px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}>
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
        <div 
          style={{ 
            position: 'fixed', 
            bottom: '40px',   // Subido más arriba para que no lo tape la barra del celu
            right: '20px',    // Separado del borde derecho
            zIndex: 99999, 
            backgroundColor: '#131b2e', 
            border: '1px solid rgba(220, 38, 38, 0.6)',
            borderRadius: '14px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.8)', 
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {expandidoFlotante ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: '#d1d5db', fontWeight: '500' }}>💬 ¡Canal!</span>
              <a 
                href="LINK_DE_TU_CANAL_DE_TELEGRAM" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={handleUnirse}
                style={{ backgroundColor: '#dc2626', color: '#ffffff', fontSize: '11px', padding: '5px 10px', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none' }}
              >
                Entrar 🚀
              </a>
              <button 
                onClick={() => setExpandidoFlotante(false)}
                style={{ backgroundColor: '#27272a', border: 'none', color: '#9ca3af', fontSize: '10px', cursor: 'pointer', padding: '4px 6px', borderRadius: '6px' }}
                title="Minimizar botón"
              >
                ◀
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setExpandidoFlotante(true)}
              style={{ backgroundColor: 'transparent', border: 'none', color: '#ef4444', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              💬 <span>Unite</span> ▶
            </button>
          )}

          <button 
            onClick={handleMaximizar}
            style={{ backgroundColor: 'transparent', border: 'none', color: '#9ca3af', fontSize: '12px', cursor: 'pointer', padding: '2px', borderLeft: '1px solid #3f3f46', paddingLeft: '6px' }}
            title="Ver cartel principal"
          >
            🔄
          </button>
        </div>
      )}
    </>
  );
}