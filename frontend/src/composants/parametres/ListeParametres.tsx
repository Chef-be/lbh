"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clsx } from "clsx";
import { api, ErreurApi } from "@/crochets/useApi";
import { Lock, Edit2, Check, X } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Parametre {
  cle: string;
  libelle: string;
  description: string;
  type_valeur: string;
  valeur: string;
  verrouille: boolean;
  groupe: string;
}

// ---------------------------------------------------------------------------
// Composant édition inline
// ---------------------------------------------------------------------------

function LigneParametre({ parametre }: { parametre: Parametre }) {
  const queryClient = useQueryClient();
  const [edition, setEdition] = useState(false);
  const [valeur, setValeur] = useState(parametre.valeur);
  const [erreur, setErreur] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: (nouvelleValeur: string) =>
      api.patch(`/api/parametres/${parametre.cle}/`, { valeur: nouvelleValeur }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parametres"] });
      setEdition(false);
      setErreur("");
    },
    onError: (err) => {
      if (err instanceof ErreurApi) setErreur(err.detail);
    },
  });

  function annuler() {
    setValeur(parametre.valeur);
    setErreur("");
    setEdition(false);
  }

  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
      <td className="py-3 pr-4">
        <p className="font-medium text-sm">{parametre.libelle}</p>
        {parametre.description && (
          <p className="text-xs text-slate-400 mt-0.5">{parametre.description}</p>
        )}
      </td>
      <td className="py-3 pr-4 font-mono text-xs text-slate-500">{parametre.cle}</td>
      <td className="py-3 pr-4">
        <span className="badge-neutre text-xs">{parametre.type_valeur}</span>
      </td>
      <td className="py-3 pr-4">
        {edition ? (
          <div className="flex items-center gap-2">
            <input
              type={parametre.type_valeur === "decimal" || parametre.type_valeur === "entier" ? "number" : "text"}
              value={valeur}
              onChange={(e) => setValeur(e.target.value)}
              className="champ-saisie font-mono w-32 py-1 text-sm"
              autoFocus
              step={parametre.type_valeur === "decimal" ? "0.001" : undefined}
            />
            <button
              onClick={() => mutate(valeur)}
              disabled={isPending}
              className="btn-primaire p-1"
              title="Enregistrer"
            >
              <Check size={14} />
            </button>
            <button onClick={annuler} className="btn-secondaire p-1" title="Annuler">
              <X size={14} />
            </button>
          </div>
        ) : (
          <span className="font-mono text-sm font-medium">{parametre.valeur}</span>
        )}
        {erreur && <p className="text-xs text-red-500 mt-1">{erreur}</p>}
      </td>
      <td className="py-3 text-right">
        {parametre.verrouille ? (
          <Lock size={14} className="text-slate-300 ml-auto" title="Verrouillé" />
        ) : !edition ? (
          <button
            onClick={() => setEdition(true)}
            className="btn-secondaire p-1 ml-auto"
            title="Modifier"
          >
            <Edit2 size={14} />
          </button>
        ) : null}
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Composant principal
// ---------------------------------------------------------------------------

export function ListeParametres() {
  const { data: parametres = [], isLoading, isError } = useQuery<Parametre[]>({
    queryKey: ["parametres"],
    queryFn: () => api.get<Parametre[]>("/api/parametres/"),
    select: (data) => Array.isArray(data) ? data : (data as { results?: Parametre[] }).results ?? [],
  });

  // Regrouper par groupe
  const groupes = parametres.reduce<Record<string, Parametre[]>>((acc, p) => {
    const g = p.groupe || "Général";
    if (!acc[g]) acc[g] = [];
    acc[g].push(p);
    return acc;
  }, {});

  if (isLoading) {
    return <div className="py-12 text-center text-slate-400 text-sm">Chargement…</div>;
  }

  if (isError) {
    return <div className="py-12 text-center text-red-500 text-sm">Erreur lors du chargement.</div>;
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupes).map(([groupe, params]) => (
        <div key={groupe} className="carte">
          <h2 className="mb-4">{groupe}</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-500">
                  <th className="text-left py-2 pr-4 font-medium">Paramètre</th>
                  <th className="text-left py-2 pr-4 font-medium">Clé</th>
                  <th className="text-left py-2 pr-4 font-medium">Type</th>
                  <th className="text-left py-2 pr-4 font-medium">Valeur</th>
                  <th className="py-2 w-10" />
                </tr>
              </thead>
              <tbody>
                {params.map((p) => (
                  <LigneParametre key={p.cle} parametre={p} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
