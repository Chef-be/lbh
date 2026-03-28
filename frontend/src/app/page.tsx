import type { Metadata } from "next";
import Link from "next/link";
import {
  TrendingUp,
  Hammer,
  Building2,
  Calculator,
  FileText,
  Megaphone,
  CheckCircle,
  ArrowRight,
  Shield,
  Clock,
  Users,
  BarChart3,
} from "lucide-react";
import { NavigationPublique } from "@/composants/site-public/NavigationPublique";
import { PiedDePage } from "@/composants/site-public/PiedDePage";
import { FormulaireContact } from "@/composants/site-public/FormulaireContact";

export const metadata: Metadata = {
  title: "BEE — Bureau d'Études Économiste | Économie de la construction",
  description:
    "Bureau d'études spécialisé en économie de la construction, dimensionnement voirie, métrés et assistance maîtrise d'œuvre. Expertise au service des maîtres d'ouvrage, maîtres d'œuvre et entreprises BTP.",
  robots: "index, follow",
};

// ---------------------------------------------------------------------------
// Données statiques des prestations
// ---------------------------------------------------------------------------

const PRESTATIONS = [
  {
    icone: TrendingUp,
    titre: "Économie de la construction",
    description:
      "Estimations préalables, DPGF, BPU, DQE, analyses de rentabilité, révision et actualisation des prix. Du chiffrage initial au bilan final.",
    points: ["Déboursé sec et prix de vente", "Analyse de rentabilité par ligne", "Révision des prix (indices BT, TP)"],
    couleur: "text-primaire-600",
    fond: "bg-primaire-50",
    bordure: "border-primaire-200",
  },
  {
    icone: Hammer,
    titre: "Dimensionnement voirie",
    description:
      "Dimensionnement de chaussées neuves selon la méthode SETRA/LCPC, quantitatifs VRD, terrassements, drainage et aménagements urbains.",
    points: ["Méthode SETRA/LCPC 1994", "Structures de chaussée multicouches", "Notes techniques détaillées"],
    couleur: "text-amber-600",
    fond: "bg-amber-50",
    bordure: "border-amber-200",
  },
  {
    icone: Building2,
    titre: "Pré-dimensionnement bâtiment",
    description:
      "Pré-dimensionnement encadré pour fondations superficielles, dallages, maçonnerie et soubassements. Alertes de domaine de validité intégrées.",
    points: ["Fondations superficielles", "Dallages sur terre-plein", "Maçonneries et soubassements"],
    couleur: "text-green-600",
    fond: "bg-green-50",
    bordure: "border-green-200",
  },
  {
    icone: Calculator,
    titre: "Métrés quantitatifs",
    description:
      "Relevés de métrés manuels et semi-automatiques, quantitatifs par lot, traçabilité complète des sources, gestion des variantes.",
    points: ["Métrés par lots et sous-lots", "Traçabilité des sources", "Variantes et comparaisons"],
    couleur: "text-indigo-600",
    fond: "bg-indigo-50",
    bordure: "border-indigo-200",
  },
  {
    icone: FileText,
    titre: "Assistance maîtrise d'œuvre",
    description:
      "Rédaction de pièces écrites (CCTP, CCAP, RC), assistance AVP/PRO/DCE, VISA, DET et AOR. Suivi financier et ordres de service.",
    points: ["CCTP, CCAP, RC, DPGF", "Situations et attachements", "Comptes rendus de chantier"],
    couleur: "text-purple-600",
    fond: "bg-purple-50",
    bordure: "border-purple-200",
  },
  {
    icone: Megaphone,
    titre: "Appels d'offres",
    description:
      "Analyse des dossiers de consultation, vérification de conformité, constitution du dossier de réponse, mémoire technique et offre financière.",
    points: ["Analyse des pièces du DCE", "Mémoire technique assisté", "Vérification de conformité"],
    couleur: "text-rose-600",
    fond: "bg-rose-50",
    bordure: "border-rose-200",
  },
];

// ---------------------------------------------------------------------------
// Données de la démarche
// ---------------------------------------------------------------------------

const DEMARCHE = [
  {
    numero: "01",
    titre: "Analyse du besoin",
    description:
      "Nous étudions votre projet, ses contraintes techniques, financières et contractuelles pour vous proposer une intervention adaptée.",
  },
  {
    numero: "02",
    titre: "Production rigoureuse",
    description:
      "Nos études sont réalisées avec des outils métier éprouvés, une traçabilité complète des calculs et une documentation exhaustive.",
  },
  {
    numero: "03",
    titre: "Accompagnement continu",
    description:
      "Nous vous accompagnons de l'avant-projet à la réception des travaux, avec des mises à jour en temps réel et des rapports clairs.",
  },
];

const VALEURS = [
  {
    icone: Shield,
    titre: "Fiabilité",
    description: "Chaque calcul est documenté, tracé et vérifiable. Aucune constante métier codée en dur.",
  },
  {
    icone: BarChart3,
    titre: "Précision",
    description: "Moteurs de calcul paramétrables conformes aux guides techniques de référence (SETRA, LCPC, DTU).",
  },
  {
    icone: Clock,
    titre: "Réactivité",
    description: "Plateforme numérique intégrée pour une production rapide et des échanges efficaces.",
  },
  {
    icone: Users,
    titre: "Collaboration",
    description: "Espace partagé pour maîtres d'ouvrage, maîtres d'œuvre, entreprises et co-traitants.",
  },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PageAccueil() {
  return (
    <div className="min-h-screen bg-white">
      <NavigationPublique />

      {/* ================================================================
          SECTION HÉROS
          ================================================================ */}
      <section
        id="accueil"
        className="relative pt-16 bg-gradient-to-br from-primaire-950 via-primaire-900 to-primaire-800 overflow-hidden"
      >
        {/* Motif décoratif */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <div className="max-w-3xl">
            {/* Étiquette */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/20 border border-accent-500/30 text-accent-300 text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse" />
              Bureau d&apos;études spécialisé BTP · VRD · Économie de la construction
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
              L&apos;expertise économique au service de vos projets de construction
            </h1>

            <p className="text-primaire-300 text-lg sm:text-xl leading-relaxed mb-8 max-w-2xl">
              Économie, dimensionnement voirie, métrés, pièces écrites, appels d&apos;offres
              et suivi d&apos;exécution — une plateforme intégrée pour des études rigoureuses
              et traçables.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="#prestations"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent-500 hover:bg-accent-600 text-white font-semibold text-sm transition-colors"
              >
                Nos prestations
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-primaire-500 text-primaire-200 hover:bg-primaire-800 text-sm font-medium transition-colors"
              >
                Nous contacter
              </a>
            </div>
          </div>
        </div>

        {/* Vague décorative */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-white" style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }} />
      </section>

      {/* ================================================================
          CHIFFRES CLÉS
          ================================================================ */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { valeur: "6", unite: "domaines", libelle: "d'expertise couverts" },
              { valeur: "100%", unite: "", libelle: "études documentées et traçables" },
              { valeur: "Local", unite: "", libelle: "hébergement des données" },
              { valeur: "FR", unite: "", libelle: "interface entièrement en français" },
            ].map((stat) => (
              <div key={stat.libelle} className="py-4">
                <div className="text-3xl font-bold text-primaire-800">
                  {stat.valeur}
                  {stat.unite && (
                    <span className="text-lg font-medium text-primaire-600 ml-1">{stat.unite}</span>
                  )}
                </div>
                <p className="text-slate-500 text-sm mt-1">{stat.libelle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          PRESTATIONS
          ================================================================ */}
      <section id="prestations" className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Nos prestations</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              De l&apos;avant-projet à la réception des travaux, nous couvrons l&apos;ensemble
              des besoins en économie de la construction et ingénierie VRD.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRESTATIONS.map((prestation) => {
              const Icone = prestation.icone;
              return (
                <div
                  key={prestation.titre}
                  className={`rounded-xl border ${prestation.bordure} ${prestation.fond} p-6 flex flex-col gap-4`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-white shadow-sm ${prestation.couleur}`}>
                      <Icone className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 leading-snug pt-1">
                      {prestation.titre}
                    </h3>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {prestation.description}
                  </p>
                  <ul className="space-y-1.5 mt-auto">
                    {prestation.points.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm text-slate-700">
                        <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${prestation.couleur}`} />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================
          VALEURS
          ================================================================ */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALEURS.map((valeur) => {
              const Icone = valeur.icone;
              return (
                <div key={valeur.titre} className="text-center p-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primaire-100 text-primaire-700 mb-4">
                    <Icone className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{valeur.titre}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{valeur.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================
          DÉMARCHE
          ================================================================ */}
      <section id="demarche" className="py-20 bg-primaire-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Notre démarche</h2>
            <p className="text-primaire-400 max-w-xl mx-auto">
              Une méthode éprouvée pour des études fiables, documentées et exploitables
              à chaque étape de votre projet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {DEMARCHE.map((etape, index) => (
              <div key={etape.numero} className="relative">
                {index < DEMARCHE.length - 1 && (
                  <div
                    aria-hidden
                    className="hidden md:block absolute top-8 left-full w-full h-px bg-primaire-700 -translate-x-4"
                  />
                )}
                <div className="text-4xl font-bold text-primaire-700 mb-4">{etape.numero}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{etape.titre}</h3>
                <p className="text-primaire-400 text-sm leading-relaxed">{etape.description}</p>
              </div>
            ))}
          </div>

          {/* Bandeau CTA */}
          <div className="mt-16 p-8 rounded-2xl bg-accent-500/10 border border-accent-500/20 text-center">
            <h3 className="text-xl font-semibold text-white mb-2">
              Vous avez un projet de construction ?
            </h3>
            <p className="text-primaire-300 text-sm mb-6">
              Décrivez-nous votre besoin, nous vous répondrons rapidement avec une proposition adaptée.
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent-500 hover:bg-accent-600 text-white font-semibold text-sm transition-colors"
            >
              Prendre contact
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ================================================================
          CONTACT
          ================================================================ */}
      <section id="contact" className="py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Nous contacter</h2>
            <p className="text-slate-500">
              Remplissez ce formulaire pour nous soumettre votre demande. Nous vous répondrons
              dans les meilleurs délais.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <FormulaireContact />
          </div>
        </div>
      </section>

      {/* ================================================================
          ACCÈS PLATEFORME — CTA discret
          ================================================================ */}
      <section className="py-12 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-slate-500 text-sm mb-3">
            Vous êtes membre de l&apos;équipe ou partenaire autorisé ?
          </p>
          <Link
            href="/connexion"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-primaire-300 text-primaire-700 hover:bg-primaire-50 text-sm font-medium transition-colors"
          >
            Accéder à l&apos;espace de travail
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <PiedDePage />
    </div>
  );
}
