"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ErreurApi } from "@/crochets/useApi";

interface Organisation {
  id: string;
  nom: string;
}

interface ProjetDetail {
  id: string;
  reference: string;
  intitule: string;
  type_projet: string;
  statut: string;
  phase_actuelle: string;
  organisation: string;
  maitre_ouvrage: string | null;
  maitre_oeuvre: string | null;
  commune: string;
  departement: string;
  date_debut_prevue: string | null;
  date_fin_prevue: string | null;
  date_debut_reelle: string | null;
  date_fin_reelle: string | null;
  montant_estime: string | null;
  montant_marche: string | null;
  honoraires_prevus: string | null;
  description: string;
  observations: string;
}

export function FormulaireModifierProjet({ projetId }: { projetId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [erreurs, setErreurs] = useState<Record<string, string>>({});

  const { data: projet, isLoading } = useQuery<ProjetDetail>({
    queryKey: ["projet", projetId],
    queryFn: () => api.get<ProjetDetail>(`/api/projets/${projetId}/`),
  });

  const { data: organisations = [] } = useQuery<Organisation[]>({
    queryKey: ["organisations"],
    queryFn: () => api.get<Organisation[]>("/api/organisations/"),
    select: (data) => Array.isArray(data) ? data : (data as { results?: Organisation[] }).results ?? [],
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (donnees: Partial<ProjetDetail>) =>
      api.patch(`/api/projets/${projetId}/`, donnees),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projet", projetId] });
      router.push(`/projets/${projetId}`);
    },
    onError: (err) => {
      if (err instanceof ErreurApi && err.erreurs) {
        const nouvellesErreurs: Record<string, string> = {};
        Object.entries(err.erreurs).forEach(([champ, messages]) => {
          if (Array.isArray(messages)) nouvellesErreurs[champ] = messages[0];
        });
        setErreurs(nouvellesErreurs);
      }
    },
  });

  if (isLoading || !projet) {
    return <div className="py-12 text-center text-slate-400 text-sm">Chargement…</div>;
  }

  function soumettre(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreurs({});
    const f = new FormData(e.currentTarget);

    const donnees: Partial<ProjetDetail> = {
      intitule: f.get("intitule") as string,
      type_projet: f.get("type_projet") as string,
      statut: f.get("statut") as string,
      phase_actuelle: f.get("phase_actuelle") as string,
    };

    const optionnels: Array<keyof ProjetDetail> = [
      "organisation", "maitre_ouvrage", "maitre_oeuvre",
      "commune", "departement",
      "date_debut_prevue", "date_fin_prevue",
      "date_debut_reelle", "date_fin_reelle",
      "montant_estime", "montant_marche", "honoraires_prevus",
      "description", "observations",
    ];
    optionnels.forEach((cle) => {
      const val = f.get(cle as string) as string;
      (donnees as Record<string, string | null>)[cle] = val || null;
    });

    mutate(donnees);
  }

  return (
    <form onSubmit={soumettre} className="space-y-6">
      {/* Identification */}
      <div className="carte space-y-4">
        <h2>Identification</h2>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-slate-400 bg-slate-100 px-3 py-2 rounded">{projet.reference}</span>
          <p className="text-xs text-slate-400">La référence n&apos;est pas modifiable</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="libelle-champ" htmlFor="type_projet">Type de projet *</label>
            <select id="type_projet" name="type_projet" className="champ-saisie" required defaultValue={projet.type_projet}>
              <option value="etude">Étude</option>
              <option value="travaux">Travaux</option>
              <option value="mission_moe">Mission MOE</option>
              <option value="assistance">Assistance à MOA</option>
              <option value="expertise">Expertise</option>
              <option value="autre">Autre</option>
            </select>
          </div>
          <div>
            <label className="libelle-champ" htmlFor="statut">Statut *</label>
            <select id="statut" name="statut" className="champ-saisie" required defaultValue={projet.statut}>
              <option value="prospection">Prospection</option>
              <option value="en_cours">En cours</option>
              <option value="suspendu">Suspendu</option>
              <option value="termine">Terminé</option>
              <option value="abandonne">Abandonné</option>
              <option value="archive">Archivé</option>
            </select>
          </div>
        </div>

        <div>
          <label className="libelle-champ" htmlFor="intitule">Intitulé *</label>
          <input id="intitule" name="intitule" type="text" required className="champ-saisie"
            defaultValue={projet.intitule} />
          {erreurs.intitule && <p className="text-xs text-red-500 mt-1">{erreurs.intitule}</p>}
        </div>

        <div>
          <label className="libelle-champ" htmlFor="phase_actuelle">Phase actuelle</label>
          <select id="phase_actuelle" name="phase_actuelle" className="champ-saisie" defaultValue={projet.phase_actuelle || ""}>
            <option value="">— Aucune phase —</option>
            <option value="faisabilite">Faisabilité</option>
            <option value="programmation">Programmation</option>
            <option value="esquisse">Esquisse / ESQ</option>
            <option value="avp">APS</option>
            <option value="pro">APD / PRO</option>
            <option value="dce">DCE</option>
            <option value="ao">Appel d&apos;offres</option>
            <option value="exe">Exécution / DET</option>
            <option value="reception">Réception / AOR</option>
            <option value="clos">Clos</option>
          </select>
        </div>

        <div>
          <label className="libelle-champ" htmlFor="description">Description</label>
          <textarea id="description" name="description" rows={3} className="champ-saisie"
            defaultValue={projet.description || ""} />
        </div>
      </div>

      {/* Parties prenantes */}
      <div className="carte space-y-4">
        <h2>Parties prenantes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="libelle-champ" htmlFor="organisation">Bureau d&apos;études</label>
            <select id="organisation" name="organisation" className="champ-saisie" defaultValue={projet.organisation || ""}>
              <option value="">— Sélectionner —</option>
              {organisations.map((org) => (
                <option key={org.id} value={org.id}>{org.nom}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="libelle-champ" htmlFor="maitre_ouvrage">Maître d&apos;ouvrage</label>
            <select id="maitre_ouvrage" name="maitre_ouvrage" className="champ-saisie" defaultValue={projet.maitre_ouvrage || ""}>
              <option value="">— Optionnel —</option>
              {organisations.map((org) => (
                <option key={org.id} value={org.id}>{org.nom}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="libelle-champ" htmlFor="maitre_oeuvre">Maître d&apos;œuvre</label>
            <select id="maitre_oeuvre" name="maitre_oeuvre" className="champ-saisie" defaultValue={projet.maitre_oeuvre || ""}>
              <option value="">— Optionnel —</option>
              {organisations.map((org) => (
                <option key={org.id} value={org.id}>{org.nom}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Localisation et calendrier */}
      <div className="carte space-y-4">
        <h2>Localisation</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className="libelle-champ" htmlFor="commune">Commune</label>
            <input id="commune" name="commune" type="text" className="champ-saisie"
              defaultValue={projet.commune || ""} />
          </div>
          <div>
            <label className="libelle-champ" htmlFor="departement">Département</label>
            <input id="departement" name="departement" type="text" maxLength={3} className="champ-saisie"
              defaultValue={projet.departement || ""} />
          </div>
        </div>
      </div>

      <div className="carte space-y-4">
        <h2>Calendrier</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="libelle-champ" htmlFor="date_debut_prevue">Début prévu</label>
            <input id="date_debut_prevue" name="date_debut_prevue" type="date" className="champ-saisie"
              defaultValue={projet.date_debut_prevue || ""} />
          </div>
          <div>
            <label className="libelle-champ" htmlFor="date_fin_prevue">Fin prévue</label>
            <input id="date_fin_prevue" name="date_fin_prevue" type="date" className="champ-saisie"
              defaultValue={projet.date_fin_prevue || ""} />
          </div>
          <div>
            <label className="libelle-champ" htmlFor="date_debut_reelle">Début réel</label>
            <input id="date_debut_reelle" name="date_debut_reelle" type="date" className="champ-saisie"
              defaultValue={projet.date_debut_reelle || ""} />
          </div>
          <div>
            <label className="libelle-champ" htmlFor="date_fin_reelle">Fin réelle</label>
            <input id="date_fin_reelle" name="date_fin_reelle" type="date" className="champ-saisie"
              defaultValue={projet.date_fin_reelle || ""} />
          </div>
        </div>
      </div>

      {/* Financier */}
      <div className="carte space-y-4">
        <h2>Données financières</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="libelle-champ" htmlFor="montant_estime">Montant estimé HT (€)</label>
            <input id="montant_estime" name="montant_estime" type="number" min="0" step="0.01"
              className="champ-saisie font-mono" defaultValue={projet.montant_estime || ""} />
          </div>
          <div>
            <label className="libelle-champ" htmlFor="montant_marche">Montant du marché HT (€)</label>
            <input id="montant_marche" name="montant_marche" type="number" min="0" step="0.01"
              className="champ-saisie font-mono" defaultValue={projet.montant_marche || ""} />
          </div>
          <div>
            <label className="libelle-champ" htmlFor="honoraires_prevus">Honoraires prévus HT (€)</label>
            <input id="honoraires_prevus" name="honoraires_prevus" type="number" min="0" step="0.01"
              className="champ-saisie font-mono" defaultValue={projet.honoraires_prevus || ""} />
          </div>
        </div>
      </div>

      {/* Observations */}
      <div className="carte">
        <label className="libelle-champ" htmlFor="observations">Observations internes</label>
        <textarea id="observations" name="observations" rows={3} className="champ-saisie"
          defaultValue={projet.observations || ""} />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pb-6">
        <button type="button" className="btn-secondaire" onClick={() => router.back()}>
          Annuler
        </button>
        <button type="submit" className="btn-primaire" disabled={isPending}>
          {isPending ? "Enregistrement…" : "Enregistrer les modifications"}
        </button>
      </div>
    </form>
  );
}
