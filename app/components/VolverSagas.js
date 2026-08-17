'use client';

import { useRouter } from 'next/navigation';

export default function VolverSagas() {
  const router = useRouter();

  return (
    <button 
      onClick={() => router.back()} 
      className="text-xs text-red-400 hover:underline cursor-pointer bg-transparent border-none p-0 flex items-center gap-1"
    >
      ← Volver a Sagas
    </button>
  );
}