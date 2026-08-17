// src/app/ClientProviders.tsx  <-- NUEVO ARCHIVO

'use client'; // ¡Lo más importante!

import { UserProvider } from "./UserContext";
import ThemeProviderClient from "./ThemeProviderClient";
import ClientOnlyAssistant from "./ClientOnlyAssistant";

// Este componente envuelve a todos los providers y componentes que son 'use client'
export default function ClientProviders({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <UserProvider>
      <ThemeProviderClient>
        {children}
        <ClientOnlyAssistant />
      </ThemeProviderClient>
    </UserProvider>
  );
}