'use client';
import { useState, useEffect } from 'react';

export default function BienvenidaCanal() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [minimizado, setMinimizado] = useState(false);
  const [expandidoFlotante, setExpandidoFlotante] = useState(false);

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
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', padding: '16px' }}>
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
          onClick={() => setExpandidoFlotante(!expandidoFlotante)}
          style={{ 
            position: 'fixed', 
            bottom: '30px', 
            right: '0px', 
            zIndex: 99999, 
            backgroundColor: '#131b2e', 
            borderLeft: '2px solid #dc2626',
            borderTop: '1px solid rgba(220, 38, 38, 0.4)',
            borderBottom: '1px solid rgba(220, 38, 38, 0.4)',
            borderTopLeftRadius: '12px',
            borderBottomLeftRadius: '12px',
            boxShadow: '-5px 10px 25px rgba(0, 0, 0, 0.6)', 
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          {/* Si está expandido muestra el contenido completo, si está contraído muestra solo la solapa */}
          {expandidoFlotante ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
              <span style={{ fontSize: '11px', color: '#d1d5db', fontWeight: '500' }}>💬 ¡Canal Privado!</span>
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
                onClick={handleMaximizar}
                style={{ backgroundColor: 'transparent', border: 'none', color: '#9ca3af', fontSize: '12px', cursor: 'pointer', padding: '2px' }}
                title="Ver cartel grande"
              >
                🔄
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '14px' }}>💬</span>
              <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 'bold', writingMode: 'vertical-rl', textOrientation: 'mixed' }}>Unite</span>
            </div>
          )}
        </div>
      )}
    </>
  );
}