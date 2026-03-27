import type { Metadata } from "next";
import Link from "next/link";
import { ListeEtudesEconomiquesGlobale } from "@/composants/economie/ListeEtudesEconomiquesGlobale";

export const metadata: Metadata = {
  title: "Économie de la construction",
};

export default function PageEconomie() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1>Économie de la construction</h1>
          <p className="text-slate-500 mt-1">Toutes les études économiques</p>
        </div>
      </div>
      <ListeEtudesEconomiquesGlobale />
    </div>
  );
}
