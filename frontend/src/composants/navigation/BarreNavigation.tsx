"use client";

import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { useSessionStore } from "@/crochets/useSession";

export function BarreNavigation() {
  const router = useRouter();
  const { utilisateur, deconnecter } = useSessionStore();

  const gererDeconnexion = async () => {
    await deconnecter();
    router.push("/connexion");
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-end px-6 gap-4 shrink-0">
      {utilisateur && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <User className="w-4 h-4" />
            <span className="font-medium">{utilisateur.nom_complet}</span>
            {utilisateur.profil_libelle && (
              <span className="text-slate-400">— {utilisateur.profil_libelle}</span>
            )}
          </div>

          <button
            onClick={gererDeconnexion}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 transition-colors px-2 py-1 rounded"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      )}
    </header>
  );
}
