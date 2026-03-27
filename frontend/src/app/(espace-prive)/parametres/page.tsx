import type { Metadata } from "next";
import { ListeParametres } from "@/composants/parametres/ListeParametres";

export const metadata: Metadata = {
  title: "Paramètres système",
};

export default function PageParametres() {
  return (
    <div className="space-y-6">
      <div>
        <h1>Paramètres système</h1>
        <p className="text-slate-500 mt-1">Configuration de la plateforme et des calculs économiques</p>
      </div>
      <ListeParametres />
    </div>
  );
}
