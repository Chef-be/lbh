"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Calculator,
  BookOpen,
  TrendingUp,
  Hammer,
  Building2,
  FileEdit,
  Megaphone,
  HardHat,
  Settings,
  Activity,
} from "lucide-react";

interface EntreeMenu {
  libelle: string;
  chemin: string;
  icone: React.ComponentType<{ className?: string }>;
  codeModule?: string;
}

const ENTREES_MENU: EntreeMenu[] = [
  { libelle: "Tableau de bord", chemin: "/tableau-de-bord", icone: LayoutDashboard },
  { libelle: "Projets", chemin: "/projets", icone: FolderKanban },
  { libelle: "Documents", chemin: "/documents", icone: FileText, codeModule: "GESTION_DOCUMENTAIRE" },
  { libelle: "Métrés", chemin: "/metres", icone: Calculator, codeModule: "METRES_QUANTITATIFS" },
  { libelle: "Économie", chemin: "/economie", icone: TrendingUp, codeModule: "ECONOMIE_CONSTRUCTION" },
  { libelle: "Bibliothèque de prix", chemin: "/bibliotheque", icone: BookOpen, codeModule: "BIBLIOTHEQUE_PRIX" },
  { libelle: "Voirie", chemin: "/voirie", icone: Hammer, codeModule: "DIMENSIONNEMENT_VOIRIE" },
  { libelle: "Bâtiment", chemin: "/batiment", icone: Building2, codeModule: "PRESIZING_BATIMENT" },
  { libelle: "Pièces écrites", chemin: "/pieces-ecrites", icone: FileEdit, codeModule: "PIECES_ECRITES" },
  { libelle: "Appels d'offres", chemin: "/appels-offres", icone: Megaphone, codeModule: "APPELS_OFFRES" },
  { libelle: "Exécution", chemin: "/execution", icone: HardHat, codeModule: "SUIVI_EXECUTION" },
];

const ENTREES_ADMINISTRATION: EntreeMenu[] = [
  { libelle: "Supervision", chemin: "/supervision", icone: Activity },
  { libelle: "Paramètres", chemin: "/parametres", icone: Settings },
];

export function MenuLateral() {
  const chemin = usePathname();

  const estActif = (cheminEntree: string) =>
    chemin === cheminEntree || chemin.startsWith(cheminEntree + "/");

  return (
    <nav
      aria-label="Navigation principale"
      className="w-64 bg-primaire-950 flex flex-col h-full shrink-0"
    >
      {/* Logo */}
      <div className="px-6 py-5 border-b border-primaire-800">
        <span className="text-xl font-bold text-white">BEE</span>
        <p className="text-primaire-400 text-xs mt-0.5">Bureau d&apos;Études Économiste</p>
      </div>

      {/* Liens principaux */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-0.5">
          {ENTREES_MENU.map((entree) => {
            const Icone = entree.icone;
            return (
              <li key={entree.chemin}>
                <Link
                  href={entree.chemin}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    estActif(entree.chemin)
                      ? "bg-primaire-700 text-white font-medium"
                      : "text-primaire-300 hover:bg-primaire-800 hover:text-white"
                  )}
                >
                  <Icone className="w-4 h-4 shrink-0" />
                  {entree.libelle}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Séparateur administration */}
        <div className="mt-6 mb-2 px-3">
          <p className="text-xs font-semibold text-primaire-500 uppercase tracking-wider">
            Administration
          </p>
        </div>
        <ul className="space-y-0.5">
          {ENTREES_ADMINISTRATION.map((entree) => {
            const Icone = entree.icone;
            return (
              <li key={entree.chemin}>
                <Link
                  href={entree.chemin}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    estActif(entree.chemin)
                      ? "bg-primaire-700 text-white font-medium"
                      : "text-primaire-300 hover:bg-primaire-800 hover:text-white"
                  )}
                >
                  <Icone className="w-4 h-4 shrink-0" />
                  {entree.libelle}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
