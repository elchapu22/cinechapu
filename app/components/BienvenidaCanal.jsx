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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-all duration-700 px-4">
          <div className="bg-[#131b2e] border border-red-600/50 p-5 sm:p-6 rounded-2xl w-full max-w-sm text-center shadow-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-red-500 mb-2">¡Bienvenido a CineChapu! 🍿</h2>
            <p className="text-zinc-300 text-xs sm:text-sm mb-5">
              Este es un catálogo privado. ¡Sumate al canal oficial de Telegram para enterarte de todos los estrenos y pedir tus pelis!
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
              <a 
                href="https://t.me/+ZEYpPHh-KglkNjNh" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={handleUnirse}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-medium transition text-xs sm:text-sm"
              >
                Unirme al Canal 🚀
              </a>
              <button 
                onClick={handleMinimizar}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2.5 rounded-xl font-medium transition text-xs sm:text-sm"
              >
                Minimizar ↘
              </button>
            </div>
          </div>
        </div>
      )}

      {minimizado && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#131b2e]/90 border border-red-600/40 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-3 rounded-xl shadow-xl flex items-center gap-2 sm:gap-3">
          <span className="text-[11px] sm:text-xs text-zinc-300 font-medium">💬 ¡Unite al Canal!</span>
          <a 
            href="https://t.me/+ZEYpPHh-KglkNjNh" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-red-600 hover:bg-red-700 text-white text-[11px] sm:text-xs px-2.5 py-1.5 rounded-lg font-bold transition"
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