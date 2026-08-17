// import type { Metadata } from "next";
// import "./globals.css";
// import ThemeProviderClient from "./ThemeProviderClient";
// import { UserProvider } from "./UserContext";
// import RubikoAssistant from '../components/RubikoAssistant/Rubiko'; 

// export const metadata: Metadata = {
//   title: "Rubik",
//   description: "rubik",
// };
// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en">
//       <head></head>
//       <body>
//         <UserProvider>
//           <ThemeProviderClient>{children}</ThemeProviderClient>
//           <RubikoAssistant /> 
//         </UserProvider>
//       </body>
//     </html>
//   );
// }

// src/app/layout.tsx

// src/app/layout.tsx

// src/app/layout.tsx

import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "./ClientProviders"; // 👈 Importa tu nuevo súper-provider

export const metadata: Metadata = {
  title: "Rubik",
  description: "rubik",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head></head>
      <body>
       
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}