"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/crochets/useSession";
import { BarreNavigation } from "@/composants/navigation/BarreNavigation";
import { MenuLateral } from "@/composants/navigation/MenuLateral";

export default function MiseEnPageEspacePrivé({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { estConnecte } = useSessionStore();

  useEffect(() => {
    if (!estConnecte) {
      router.replace("/connexion");
    }
  }, [estConnecte, router]);

  if (!estConnecte) {
    return null;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Menu latéral */}
      <MenuLateral />

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <BarreNavigation />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
