'use client';

import { useRouter } from 'next/navigation';
import { useRef } from 'react';

export default function SwipeWrapper({ children, anteriorId, siguienteId }) {
  const router = useRouter();
  const startX = useRef(0);
  const endX = useRef(0);

  const minSwipeDistance = 50;

  const handleStart = (clientX) => {
    endX.current = 0;
    startX.current = clientX;
  };

  const handleMove = (clientX) => {
    endX.current = clientX;
  };

  const handleEnd = () => {
    if (!startX.current || !endX.current) return;
    
    const distance = startX.current - endX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && siguienteId) {
      router.push(`/pelicula/${siguienteId}`);
    }

    if (isRightSwipe && anteriorId) {
      router.push(`/pelicula/${anteriorId}`);
    }
  };

  return (
    <div 
      // Eventos táctiles para celular
      onTouchStart={(e) => handleStart(e.targetTouches[0].clientX)}
      onTouchMove={(e) => handleMove(e.targetTouches[0].clientX)}
      onTouchEnd={handleEnd}
      
      // Eventos de mouse para probar en la PC manteniendo click y arrastrando
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseMove={(e) => {
        if (e.buttons === 1) handleMove(e.clientX); // Solo si arrastra con el click apretado
      }}
      onMouseUp={handleEnd}

      className="w-full min-h-screen cursor-grab active:cursor-grabbing"
    >
      {children}
    </div>
  );
}