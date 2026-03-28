import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export function PiedDePage() {
  const annee = new Date().getFullYear();

  return (
    <footer className="bg-primaire-950 border-t border-primaire-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Identité */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <div>
                <span className="text-white font-bold">BEE</span>
                <p className="text-primaire-400 text-xs">Bureau d&apos;Études Économiste</p>
              </div>
            </div>
            <p className="text-primaire-400 text-sm leading-relaxed">
              Expertise en économie de la construction, dimensionnement voirie et
              pré-dimensionnement bâtiment. Au service des maîtres d&apos;ouvrage,
              maîtres d&apos;œuvre et entreprises BTP.
            </p>
          </div>

          {/* Prestations */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Nos prestations</h3>
            <ul className="space-y-2 text-primaire-400 text-sm">
              <li><a href="#prestations" className="hover:text-white transition-colors">Économie de la construction</a></li>
              <li><a href="#prestations" className="hover:text-white transition-colors">Dimensionnement voirie</a></li>
              <li><a href="#prestations" className="hover:text-white transition-colors">Pré-dimensionnement bâtiment</a></li>
              <li><a href="#prestations" className="hover:text-white transition-colors">Métrés quantitatifs</a></li>
              <li><a href="#prestations" className="hover:text-white transition-colors">Assistance maîtrise d&apos;œuvre</a></li>
              <li><a href="#prestations" className="hover:text-white transition-colors">Appels d&apos;offres</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Contact</h3>
            <ul className="space-y-3 text-primaire-400 text-sm">
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 shrink-0 text-accent-400" />
                <span>contact@lbh-economiste.com</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 shrink-0 text-accent-400" />
                <span>Disponible sur rendez-vous</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-accent-400" />
                <span>France</span>
              </li>
            </ul>
            <div className="mt-4">
              <Link
                href="/connexion"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primaire-600 text-primaire-300 hover:border-accent-500 hover:text-white text-sm transition-colors"
              >
                Espace privé →
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-primaire-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-primaire-500 text-xs">
          <span>© {annee} BEE — Bureau d&apos;Études Économiste. Tous droits réservés.</span>
          <span>Plateforme de gestion interne — Accès réservé</span>
        </div>
      </div>
    </footer>
  );
}
