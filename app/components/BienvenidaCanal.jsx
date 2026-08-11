'use client';
import { useState, useEffect } from 'react';

export default function BienvenidaCanal() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [minimizado, setMinimizado] = useState(false);

  useEffect(() => {
    // Verificamos si ya interactuo antes con el cartel
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
      {/* 1. Cartel Grande Central (Solo si no lo cerro nunca) */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-all duration-700 p-4">
          <div className="bg-[#131b2e] border border-red-600/50 p-6 rounded-2xl max-w-md text-center shadow-2xl relative mx-4">
            <h2 className="text-2xl font-bold text-red-500 mb-2">¡Bienvenido a CineChapu! 🍿</h2>
            <p className="text-zinc-300 text-sm mb-6">
              Este es un catalogo privado. ¡Sumate al canal oficial de Telegram para enterarte de todos los estrenos y pedir tus pelis!
            </p>
            <div className="flex gap-3 justify-center">
              <a 
                href="LINK_DE_TU_CANAL_DE_TELEGRAM" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={handleUnirse}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium transition text-sm"
              >
                Unirme al Canal 🚀
              </a>
              <button 
                onClick={handleMinimizar}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2.5 rounded-xl font-medium transition text-sm"
              >
                Minimizar ↘
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Boton Flotante Discreto (Si le dio a minimizar o ya recarga la pagina sabiendo que lo minimizo) */}
      {minimizado && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#131b2e]/90 border border-red-600/40 backdrop-blur-md px-4 py-3 rounded-xl shadow-xl flex items-center gap-3">
          <span className="text-xs text-zinc-300 font-medium">💬 ¡Unite al Canal Privado!</span>
          <a 
            href="LINK_DE_TU_CANAL_DE_TELEGRAM" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-lg font-bold transition"
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