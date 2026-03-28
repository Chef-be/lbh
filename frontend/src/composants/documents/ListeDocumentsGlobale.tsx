"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { clsx } from "clsx";
import { api } from "@/crochets/useApi";
import { Search, FileText, Filter } from "lucide-react";

interface Document {
  id: string;
  reference: string;
  intitule: string;
  type_libelle: string;
  statut: string;
  statut_libelle: string;
  version: string;
  est_version_courante: boolean;
  taille_octets: number | null;
  auteur_nom: string;
  date_modification: string;
  projet: string | null;
}

interface PageResultats {
  count: number;
  next: string | null;
  results: Document[];
}

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

export function ListeDocumentsGlobale() {
  const [recherche, setRecherche] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("");
  const [versionsCourantes, setVersionsCourantes] = useState(true);
  const [page, setPage] = useState(1);

  const params = new URLSearchParams({ ordering: "-date_modification", page: String(page) });
  if (recherche) params.set("search", recherche);
  if (filtreStatut) params.set("statut", filtreStatut);
  if (versionsCourantes) params.set("est_version_courante", "true");

  const { data, isLoading, isError } = useQuery<PageResultats>({
    queryKey: ["documents-globale", recherche, filtreStatut, versionsCourantes, page],
    queryFn: () => api.get<PageResultats>(`/api/documents/?${params.toString()}`),
  });

  const documents = data?.results ?? [];

  return (
    <div className="carte space-y-4">
      {/* Filtres */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Rechercher par référence, intitulé…"
            className="champ-saisie pl-8"
            value={recherche}
            onChange={(e) => { setRecherche(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select
            className="champ-saisie w-auto"
            value={filtreStatut}
            onChange={(e) => { setFiltreStatut(e.target.value); setPage(1); }}
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
          />
          Versions courantes
        </label>
        {data && (
          <span className="text-xs text-slate-400 ml-auto">
            {data.count} document{data.count > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Chargement…</div>
      ) : isError ? (
        <div className="py-12 text-center text-red-500 text-sm">Erreur lors du chargement.</div>
      ) : documents.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm">
          {recherche || filtreStatut ? "Aucun document ne correspond aux filtres." : "Aucun document."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-500">
                <th className="text-left py-2 pr-4 font-medium">Référence</th>
                <th className="text-left py-2 pr-4 font-medium">Intitulé</th>
                <th className="text-left py-2 pr-4 font-medium">Type</th>
                <th className="text-left py-2 pr-4 font-medium">Statut</th>
                <th className="text-center py-2 pr-4 font-medium">Ver.</th>
                <th className="text-right py-2 pr-4 font-medium">Taille</th>
                <th className="text-right py-2 font-medium">Modifié</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-3 pr-4 font-mono text-xs text-primaire-700">
                    {doc.reference || "—"}
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
                  <td className="py-3 pr-4 text-center font-mono text-xs text-slate-400">
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

      {/* Pagination */}
      {data && data.count > 20 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-400">{data.count} document{data.count > 1 ? "s" : ""}</p>
          <div className="flex gap-2">
            <button
              className="btn-secondaire py-1 px-3 text-xs"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ← Précédent
            </button>
            <button
              className="btn-secondaire py-1 px-3 text-xs"
              disabled={!data.next}
              onClick={() => setPage((p) => p + 1)}
            >
              Suivant →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
