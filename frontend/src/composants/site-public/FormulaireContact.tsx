"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";

interface DonneesContact {
  nom: string;
  courriel: string;
  telephone: string;
  organisation: string;
  sujet: string;
  message: string;
}

const SUJETS = [
  { valeur: "devis", libelle: "Demande de devis" },
  { valeur: "information", libelle: "Demande d'information" },
  { valeur: "partenariat", libelle: "Partenariat" },
  { valeur: "recrutement", libelle: "Candidature" },
  { valeur: "autre", libelle: "Autre" },
];

const ETAT_INITIAL: DonneesContact = {
  nom: "",
  courriel: "",
  telephone: "",
  organisation: "",
  sujet: "information",
  message: "",
};

export function FormulaireContact() {
  const [donnees, setDonnees] = useState<DonneesContact>(ETAT_INITIAL);
  const [envoi, setEnvoi] = useState<"idle" | "chargement" | "succes" | "erreur">("idle");
  const [messageErreur, setMessageErreur] = useState("");

  const mettreAJour = (champ: keyof DonneesContact, valeur: string) => {
    setDonnees((prev) => ({ ...prev, [champ]: valeur }));
  };

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnvoi("chargement");
    setMessageErreur("");

    try {
      const reponse = await fetch("/api/site-public/contact/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(donnees),
      });

      if (reponse.ok) {
        setEnvoi("succes");
        setDonnees(ETAT_INITIAL);
      } else {
        const erreurs = await reponse.json();
        const premierMessage = Object.values(erreurs as Record<string, string[]>)
          .flat()[0] as string;
        setMessageErreur(premierMessage || "Une erreur est survenue.");
        setEnvoi("erreur");
      }
    } catch {
      setMessageErreur("Impossible d'envoyer le message. Vérifiez votre connexion.");
      setEnvoi("erreur");
    }
  };

  if (envoi === "succes") {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
        <CheckCircle className="w-16 h-16 text-green-500" />
        <h3 className="text-xl font-semibold text-slate-900">Message envoyé !</h3>
        <p className="text-slate-600 max-w-sm">
          Votre demande a bien été transmise. Nous vous répondrons dans les meilleurs délais.
        </p>
        <button
          onClick={() => setEnvoi("idle")}
          className="mt-2 px-4 py-2 text-sm text-primaire-600 hover:text-primaire-800 underline"
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={soumettre} className="space-y-4">
      {envoi === "erreur" && messageErreur && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {messageErreur}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nom et prénom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={donnees.nom}
            onChange={(e) => mettreAJour("nom", e.target.value)}
            placeholder="Dupont Jean"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primaire-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Adresse de courriel <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            value={donnees.courriel}
            onChange={(e) => mettreAJour("courriel", e.target.value)}
            placeholder="jean.dupont@exemple.fr"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primaire-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Téléphone
          </label>
          <input
            type="tel"
            value={donnees.telephone}
            onChange={(e) => mettreAJour("telephone", e.target.value)}
            placeholder="06 00 00 00 00"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primaire-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Organisation
          </label>
          <input
            type="text"
            value={donnees.organisation}
            onChange={(e) => mettreAJour("organisation", e.target.value)}
            placeholder="Mairie de..."
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primaire-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Sujet <span className="text-red-500">*</span>
        </label>
        <select
          required
          value={donnees.sujet}
          onChange={(e) => mettreAJour("sujet", e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primaire-500 focus:border-transparent bg-white"
        >
          {SUJETS.map((s) => (
            <option key={s.valeur} value={s.valeur}>{s.libelle}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          required
          rows={5}
          value={donnees.message}
          onChange={(e) => mettreAJour("message", e.target.value)}
          placeholder="Décrivez votre besoin, votre projet, les prestations recherchées…"
          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-primaire-500 focus:border-transparent resize-none"
        />
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={envoi === "chargement"}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primaire-700 hover:bg-primaire-800 text-white font-medium text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          {envoi === "chargement" ? "Envoi en cours…" : "Envoyer le message"}
        </button>
      </div>
    </form>
  );
}
