'use client';

import { useRouter } from 'next/navigation';
import { useRef } from 'react';

export default function SwipeWrapper({ children, anteriorId, siguienteId }) {
  const router = useRouter();
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    touchEndX.current = 0;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
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
      onTouchStart={onTouchStart} 
      onTouchMove={onTouchMove} 
      onTouchEnd={onTouchEnd}
      className="w-full min-h-screen"
    >
      {children}
    </div>
  );
}