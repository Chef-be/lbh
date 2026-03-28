"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api, ErreurApi } from "@/crochets/useApi";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Organisation {
  id: string;
  nom: string;
  type_organisation: string;
}

interface DonneesProjet {
  reference: string;
  intitule: string;
  type_projet: string;
  statut: string;
  organisation: string;
  maitre_ouvrage?: string;
  commune?: string;
  departement?: string;
  date_debut_prevue?: string;
  date_fin_prevue?: string;
  montant_estime?: string;
  honoraires_prevus?: string;
}

// ---------------------------------------------------------------------------
// Composant
// ---------------------------------------------------------------------------

export function FormulaireNouveauProjet() {
  const router = useRouter();
  const [erreurs, setErreurs] = useState<Record<string, string>>({});

  const { data: organisations = [] } = useQuery<Organisation[]>({
    queryKey: ["organisations"],
    queryFn: () => api.get<Organisation[]>("/api/organisations/"),
    select: (data) => Array.isArray(data) ? data : (data as { results?: Organisation[] }).results ?? [],
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (donnees: DonneesProjet) => api.post<{ id: string }>("/api/projets/", donnees),
    onSuccess: (projet: { id: string }) => {
      router.push(`/projets/${projet.id}`);
    },
    onError: (err) => {
      if (err instanceof ErreurApi && err.erreurs) {
        const nouvellesErreurs: Record<string, string> = {};
        Object.entries(err.erreurs).forEach(([champ, messages]) => {
          if (Array.isArray(messages)) {
            nouvellesErreurs[champ] = messages[0];
          }
        });
        setErreurs(nouvellesErreurs);
      }
    },
  });

  function soumettre(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreurs({});
    const formulaire = new FormData(e.currentTarget);
    const donnees: DonneesProjet = {
      reference: formulaire.get("reference") as string,
      intitule: formulaire.get("intitule") as string,
      type_projet: formulaire.get("type_projet") as string,
      statut: formulaire.get("statut") as string,
      organisation: formulaire.get("organisation") as string,
    };
    const mo = formulaire.get("maitre_ouvrage") as string;
    if (mo) donnees.maitre_ouvrage = mo;
    const commune = formulaire.get("commune") as string;
    if (commune) donnees.commune = commune;
    const dept = formulaire.get("departement") as string;
    if (dept) donnees.departement = dept;
    const debut = formulaire.get("date_debut_prevue") as string;
    if (debut) donnees.date_debut_prevue = debut;
    const fin = formulaire.get("date_fin_prevue") as string;
    if (fin) donnees.date_fin_prevue = fin;
    const montant = formulaire.get("montant_estime") as string;
    if (montant) donnees.montant_estime = montant;
    const honoraires = formulaire.get("honoraires_prevus") as string;
    if (honoraires) donnees.honoraires_prevus = honoraires;

    mutate(donnees);
  }

  return (
    <form onSubmit={soumettre} className="carte space-y-5">
      {/* Identification */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="libelle-champ" htmlFor="reference">Référence *</label>
          <input
            id="reference"
            name="reference"
            type="text"
            required
            placeholder="Ex : 2026-VRD-001"
            className="champ-saisie font-mono"
          />
          {erreurs.reference && <p className="text-xs text-red-500 mt-1">{erreurs.reference}</p>}
        </div>

        <div>
          <label className="libelle-champ" htmlFor="type_projet">Type de projet *</label>
          <select id="type_projet" name="type_projet" className="champ-saisie" required>
            <option value="etude">Étude</option>
            <option value="travaux">Travaux</option>
            <option value="mission_moe">Mission MOE</option>
            <option value="assistance">Assistance à MOA</option>
            <option value="expertise">Expertise</option>
            <option value="autre">Autre</option>
          </select>
        </div>
      </div>

      <div>
        <label className="libelle-champ" htmlFor="intitule">Intitulé *</label>
        <input
          id="intitule"
          name="intitule"
          type="text"
          required
          placeholder="Description courte du projet"
          className="champ-saisie"
        />
        {erreurs.intitule && <p className="text-xs text-red-500 mt-1">{erreurs.intitule}</p>}
      </div>

      {/* Organisation et statut */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="libelle-champ" htmlFor="organisation">Bureau d&apos;études *</label>
          <select id="organisation" name="organisation" className="champ-saisie" required>
            <option value="">— Sélectionner —</option>
            {organisations.map((org) => (
              <option key={org.id} value={org.id}>{org.nom}</option>
            ))}
          </select>
          {erreurs.organisation && <p className="text-xs text-red-500 mt-1">{erreurs.organisation}</p>}
        </div>

        <div>
          <label className="libelle-champ" htmlFor="statut">Statut initial</label>
          <select id="statut" name="statut" className="champ-saisie" defaultValue="en_cours">
            <option value="prospection">Prospection</option>
            <option value="en_cours">En cours</option>
          </select>
        </div>
      </div>

      {/* Maître d'ouvrage */}
      <div>
        <label className="libelle-champ" htmlFor="maitre_ouvrage">Maître d&apos;ouvrage</label>
        <select id="maitre_ouvrage" name="maitre_ouvrage" className="champ-saisie">
          <option value="">— Optionnel —</option>
          {organisations.map((org) => (
            <option key={org.id} value={org.id}>{org.nom}</option>
          ))}
        </select>
      </div>

      {/* Localisation */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className="libelle-champ" htmlFor="commune">Commune</label>
          <input id="commune" name="commune" type="text" placeholder="Ex : Lyon" className="champ-saisie" />
        </div>
        <div>
          <label className="libelle-champ" htmlFor="departement">Département</label>
          <input id="departement" name="departement" type="text" placeholder="Ex : 69" maxLength={3} className="champ-saisie" />
        </div>
      </div>

      {/* Calendrier */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="libelle-champ" htmlFor="date_debut_prevue">Début prévu</label>
          <input id="date_debut_prevue" name="date_debut_prevue" type="date" className="champ-saisie" />
        </div>
        <div>
          <label className="libelle-champ" htmlFor="date_fin_prevue">Fin prévue</label>
          <input id="date_fin_prevue" name="date_fin_prevue" type="date" className="champ-saisie" />
        </div>
      </div>

      {/* Financier */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="libelle-champ" htmlFor="montant_estime">Montant estimé HT (€)</label>
          <input
            id="montant_estime"
            name="montant_estime"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            className="champ-saisie"
          />
        </div>
        <div>
          <label className="libelle-champ" htmlFor="honoraires_prevus">Honoraires prévus HT (€)</label>
          <input
            id="honoraires_prevus"
            name="honoraires_prevus"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            className="champ-saisie"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-secondaire" onClick={() => router.back()}>
          Annuler
        </button>
        <button type="submit" className="btn-primaire" disabled={isPending}>
          {isPending ? "Création en cours…" : "Créer le projet"}
        </button>
      </div>
    </form>
  );
}
