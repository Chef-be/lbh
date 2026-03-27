"use client";

/**
 * Fournisseur de notifications toast — Plateforme BEE.
 */

import { createContext, useContext, useState, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TypeNotification = "succes" | "erreur" | "alerte" | "info";

interface Notification {
  id: string;
  type: TypeNotification;
  message: string;
  duree?: number;
}

interface ContexteNotifications {
  notifier: (type: TypeNotification, message: string, duree?: number) => void;
  succes: (message: string) => void;
  erreur: (message: string) => void;
  alerte: (message: string) => void;
}

// ---------------------------------------------------------------------------
// Contexte
// ---------------------------------------------------------------------------

const ContexteNotif = createContext<ContexteNotifications | null>(null);

export function FournisseurNotifications({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notifier = useCallback(
    (type: TypeNotification, message: string, duree = 4000) => {
      const id = `notif-${Date.now()}`;
      setNotifications((prev) => [...prev, { id, type, message, duree }]);
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, duree);
    },
    []
  );

  const succes = useCallback((m: string) => notifier("succes", m), [notifier]);
  const erreur = useCallback((m: string) => notifier("erreur", m), [notifier]);
  const alerte = useCallback((m: string) => notifier("alerte", m), [notifier]);

  const styleParType: Record<TypeNotification, string> = {
    succes: "bg-green-50 border-green-400 text-green-800",
    erreur: "bg-red-50 border-red-400 text-red-800",
    alerte: "bg-amber-50 border-amber-400 text-amber-800",
    info: "bg-blue-50 border-blue-400 text-blue-800",
  };

  return (
    <ContexteNotif.Provider value={{ notifier, succes, erreur, alerte }}>
      {children}

      {/* Zone d'affichage des notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`rounded-lg border px-4 py-3 text-sm shadow-lg ${styleParType[notif.type]}`}
          >
            {notif.message}
          </div>
        ))}
      </div>
    </ContexteNotif.Provider>
  );
}

export function useNotifications(): ContexteNotifications {
  const ctx = useContext(ContexteNotif);
  if (!ctx) {
    throw new Error("useNotifications doit être utilisé dans FournisseurNotifications");
  }
  return ctx;
}
