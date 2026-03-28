"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const LIENS_NAVIGATION = [
  { libelle: "Accueil", ancre: "#accueil" },
  { libelle: "Prestations", ancre: "#prestations" },
  { libelle: "Notre démarche", ancre: "#demarche" },
  { libelle: "Contact", ancre: "#contact" },
];

export function NavigationPublique() {
  const [menuOuvert, setMenuOuvert] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primaire-950/95 backdrop-blur-sm border-b border-primaire-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-500 flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-white font-bold text-base">BEE</span>
              <p className="text-primaire-400 text-xs leading-none">Bureau d&apos;Études Économiste</p>
            </div>
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {LIENS_NAVIGATION.map((lien) => (
              <a
                key={lien.ancre}
                href={lien.ancre}
                className="px-3 py-2 text-sm text-primaire-300 hover:text-white hover:bg-primaire-800 rounded-lg transition-colors"
              >
                {lien.libelle}
              </a>
            ))}
          </nav>

          {/* Bouton connexion + menu mobile */}
          <div className="flex items-center gap-3">
            <Link
              href="/connexion"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-500 hover:bg-accent-600 text-white text-sm font-medium transition-colors"
            >
              Connexion
            </Link>
            <button
              onClick={() => setMenuOuvert(!menuOuvert)}
              className="md:hidden p-2 text-primaire-300 hover:text-white"
              aria-label="Menu"
            >
              {menuOuvert ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {menuOuvert && (
        <div className="md:hidden bg-primaire-950 border-t border-primaire-800 px-4 py-4 space-y-1">
          {LIENS_NAVIGATION.map((lien) => (
            <a
              key={lien.ancre}
              href={lien.ancre}
              onClick={() => setMenuOuvert(false)}
              className="block px-3 py-2 text-sm text-primaire-300 hover:text-white hover:bg-primaire-800 rounded-lg"
            >
              {lien.libelle}
            </a>
          ))}
          <div className="pt-2 border-t border-primaire-800 mt-2">
            <Link
              href="/connexion"
              className="block text-center px-4 py-2 rounded-lg bg-accent-500 text-white text-sm font-medium"
            >
              Se connecter
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
