'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function FiltrosPeliculas({ abecedario, anosDisponibles, coleccionesPopulares, letraActual, anoActual, coleccionActual }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCambio = (e) => {
    const { name, value } = e.target;
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    params.delete('page'); // Reiniciar a la página 1 al filtrar

    router.push(`/peliculas?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
      {/* Selector de Colecciones Populares */}
      <select 
        name="coleccion"
        defaultValue={coleccionActual}
        onChange={handleCambio}
        className="bg-[#090d16] border border-zinc-700/80 text-zinc-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-red-600 transition-colors cursor-pointer"
      >
        <option value="">🔥 Colecciones (Todas)</option>
        {coleccionesPopulares.map((c) => (
          <option key={c.id} value={c.id}>{c.nombre}</option>
        ))}
      </select>

      {/* Selector de Letras */}
      <select 
        name="letra"
        defaultValue={letraActual}
        onChange={handleCambio}
        className="bg-[#090d16] border border-zinc-700/80 text-zinc-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-red-600 transition-colors cursor-pointer"
      >
        <option value="">🔠 Letra (Todas)</option>
        {abecedario.map((l) => (
          <option key={l} value={l}>Letra {l}</option>
        ))}
      </select>

      {/* Selector de Años */}
      <select 
        name="ano"
        defaultValue={anoActual}
        onChange={handleCambio}
        className="bg-[#090d16] border border-zinc-700/80 text-zinc-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-red-600 transition-colors cursor-pointer"
      >
        <option value="">📅 Año (Todos)</option>
        {anosDisponibles.map((a) => (
          <option key={a} value={a}>{a}</option>
        ))}
      </select>
    </div>
  );
}