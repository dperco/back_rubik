// src/app/ClientOnlyAssistant.tsx
'use client'; // 👈 1. Esto convierte a este archivo en un Componente de Cliente

import dynamic from 'next/dynamic';

// 2. Ahora, la importación dinámica CON ssr: false está dentro de un Componente de Cliente,
//    lo cual es permitido.
const RubikoAssistant = dynamic(() => import('../components/RubikoAssistant/Rubiko'), { 
  ssr: false,
});

export default function ClientOnlyAssistant() {
  // 3. Simplemente retornamos el componente cargado dinámicamente.
  return <RubikoAssistant />;
}