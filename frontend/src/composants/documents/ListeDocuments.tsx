"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { clsx } from "clsx";
import { api } from "@/crochets/useApi";
import { FileText, Download, Filter } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Document {
  id: string;
  reference: string;
  intitule: string;
  type_libelle: string;
  statut: string;
  statut_libelle: string;
  version: string;
  est_version_courante: boolean;
  origine: string;
  taille_octets: number | null;
  auteur_nom: string;
  date_modification: string;
}

interface PageResultats {
  count: number;
  results: Document[];
}

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const STYLES_STATUT: Record<string, string> = {
  brouillon: "badge-neutre",
  en_cours: "badge-info",
  a_valider: "badge-alerte",
  valide: "badge-succes",
  archive: "badge-neutre",
  annule: "badge-danger",
};

function formaterTaille(octets: number | null) {
  if (!octets) return "";
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${(octets / 1024).toFixed(1)} Ko`;
  return `${(octets / (1024 * 1024)).toFixed(1)} Mo`;
}

// ---------------------------------------------------------------------------
// Composant
// ---------------------------------------------------------------------------

export function ListeDocuments({ projetId }: { projetId: string }) {
  const [filtreStatut, setFiltreStatut] = useState("");
  const [versionsCourantes, setVersionsCourantes] = useState(true);

  const params = new URLSearchParams({ projet: projetId, ordering: "-date_modification" });
  if (filtreStatut) params.set("statut", filtreStatut);
  if (versionsCourantes) params.set("est_version_courante", "true");

  const { data, isLoading, isError } = useQuery<PageResultats>({
    queryKey: ["documents", projetId, filtreStatut, versionsCourantes],
    queryFn: () => api.get(`/api/documents/?${params.toString()}`),
  });

  const documents = data?.results ?? [];

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select
            className="champ-saisie w-auto text-sm"
            value={filtreStatut}
            onChange={(e) => setFiltreStatut(e.target.value)}
          >
            <option value="">Tous les statuts</option>
            <option value="brouillon">Brouillon</option>
            <option value="en_cours">En cours</option>
            <option value="a_valider">À valider</option>
            <option value="valide">Validé</option>
            <option value="archive">Archivé</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={versionsCourantes}
            onChange={(e) => setVersionsCourantes(e.target.checked)}
            className="rounded"
          />
          Versions courantes uniquement
        </label>
        {data && (
          <span className="text-xs text-slate-400 ml-auto">
            {data.count} document{data.count > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Contenu */}
      {isLoading ? (
        <div className="carte py-12 text-center text-slate-400 text-sm">Chargement…</div>
      ) : isError ? (
        <div className="carte py-12 text-center text-red-500 text-sm">Erreur lors du chargement.</div>
      ) : documents.length === 0 ? (
        <div className="carte py-12 text-center text-slate-400">
          <FileText size={32} className="mx-auto mb-3 text-slate-200" />
          <p className="text-sm">
            {filtreStatut ? "Aucun document ne correspond au filtre." : "Aucun document pour ce projet."}
          </p>
        </div>
      ) : (
        <div className="carte overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-500">
                <th className="text-left py-2 pr-4 font-medium">Référence</th>
                <th className="text-left py-2 pr-4 font-medium">Intitulé</th>
                <th className="text-left py-2 pr-4 font-medium">Type</th>
                <th className="text-left py-2 pr-4 font-medium">Statut</th>
                <th className="text-center py-2 pr-4 font-medium">Version</th>
                <th className="text-right py-2 pr-4 font-medium">Taille</th>
                <th className="text-right py-2 font-medium">Modifié</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-3 pr-4">
                    <span className="font-mono text-xs text-primaire-700">{doc.reference || "—"}</span>
                  </td>
                  <td className="py-3 pr-4 max-w-xs">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-slate-300 shrink-0" />
                      <span className="font-medium truncate">{doc.intitule}</span>
                    </div>
                    {doc.auteur_nom && (
                      <p className="text-xs text-slate-400 mt-0.5 ml-5">{doc.auteur_nom}</p>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="badge-neutre text-xs">{doc.type_libelle}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={clsx(STYLES_STATUT[doc.statut] || "badge-neutre")}>
                      {doc.statut_libelle}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-center font-mono text-xs text-slate-500">
                    {doc.version}
                  </td>
                  <td className="py-3 pr-4 text-right text-xs text-slate-400">
                    {formaterTaille(doc.taille_octets)}
                  </td>
                  <td className="py-3 text-right text-xs text-slate-400">
                    {new Date(doc.date_modification).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
