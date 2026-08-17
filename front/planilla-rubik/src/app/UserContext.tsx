"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  _id: string;
  name: string;
  email: string;
  rol: "administrador" | "manager" | "visitante"; // ajusta si hay más
  status: "active" | "inactive";
}

interface Session {
  user: User;
  token: string;
}

interface Ctx { // ctx => context
  user: User | null;
  token: string | null;
  /** guarda sesión después de login */
  setSession: (s: Session) => void;
  /** borra sesión (logout) */
  clearSession: () => void;
}

/* ------------------------ contexto ------------------------ */
const UserContext = createContext<Ctx | null>(null);

/* ------------------------ provider ------------------------ */
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  /* al montar — lee localStorage */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("authData");
    if (raw) {
      try {
        const parsed: Session = JSON.parse(raw);
        setUser(parsed.user);
        setToken(parsed.token);
      } catch {
        localStorage.removeItem("authData");
      }
    }
  }, []);

  const setSession = (s: Session) => {
    setUser(s.user);
    setToken(s.token);
    localStorage.setItem("authData", JSON.stringify(s));
  };

  const clearSession = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("authData");
  };

  return (
    <UserContext.Provider value={{ user, token, setSession, clearSession }}>
      {children}
    </UserContext.Provider>
  );
}

/* ------------------------ hook ------------------------ */
export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser debe usarse dentro de <UserProvider>");
  return ctx;
}
