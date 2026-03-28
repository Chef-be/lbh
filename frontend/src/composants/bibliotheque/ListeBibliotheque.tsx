"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { clsx } from "clsx";
import { api } from "@/crochets/useApi";
import { Search, Filter } from "lucide-react";

interface LigneBibliotheque {
  id: string;
  code: string;
  designation_courte: string;
  designation_longue?: string;
  unite: string;
  famille: string;
  sous_famille: string;
  statut_validation: string;
  debourse_sec_unitaire: number | null;
  prix_vente_unitaire: number | null;
}

interface PageResultats {
  count: number;
  next: string | null;
  results: LigneBibliotheque[];
}

const STYLES_STATUT: Record<string, string> = {
  brouillon: "badge-neutre",
  valide: "badge-succes",
  archive: "badge-neutre",
};

const LIBELLES_STATUT: Record<string, string> = {
  brouillon: "Brouillon",
  valide: "Validée",
  archive: "Archivée",
};

function formaterMontant(val: number | null) {
  if (val == null) return "—";
  return `${Number(val).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

export function ListeBibliotheque() {
  const [recherche, setRecherche] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("valide");
  const [page, setPage] = useState(1);

  const params = new URLSearchParams({ ordering: "famille,code", page: String(page) });
  if (recherche) params.set("search", recherche);
  if (filtreStatut) params.set("statut_validation", filtreStatut);

  const { data, isLoading, isError } = useQuery<PageResultats>({
    queryKey: ["bibliotheque", recherche, filtreStatut, page],
    queryFn: () => api.get<PageResultats>(`/api/bibliotheque/?${params.toString()}`),
  });

  const lignes = data?.results ?? [];

  return (
    <div className="carte space-y-4">
      {/* Filtres */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Rechercher par code, désignation…"
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
            <option value="">Tous</option>
            {Object.entries(LIBELLES_STATUT).map(([val, lib]) => (
              <option key={val} value={val}>{lib}</option>
            ))}
          </select>
        </div>
        {data && (
          <span className="text-xs text-slate-400 ml-auto">
            {data.count} ligne{data.count > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Chargement…</div>
      ) : isError ? (
        <div className="py-12 text-center text-red-500 text-sm">Erreur lors du chargement.</div>
      ) : lignes.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm">
          {recherche || filtreStatut ? "Aucun résultat." : "Bibliothèque vide."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-500">
                <th className="text-left py-2 pr-4 font-medium">Code</th>
                <th className="text-left py-2 pr-4 font-medium">Désignation</th>
                <th className="text-left py-2 pr-4 font-medium">Famille</th>
                <th className="text-center py-2 pr-4 font-medium">Unité</th>
                <th className="text-right py-2 pr-4 font-medium">DS unit. HT</th>
                <th className="text-right py-2 pr-4 font-medium">PV unit. HT</th>
                <th className="text-left py-2 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((ligne) => (
                <tr key={ligne.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-3 pr-4 font-mono text-xs text-slate-600">{ligne.code || "—"}</td>
                  <td className="py-3 pr-4 max-w-xs">
                    <p className="font-medium truncate">{ligne.designation_courte}</p>
                    {ligne.sous_famille && (
                      <p className="text-xs text-slate-400 mt-0.5">{ligne.sous_famille}</p>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-xs text-slate-500">{ligne.famille || "—"}</td>
                  <td className="py-3 pr-4 text-center font-mono text-xs text-slate-500">{ligne.unite}</td>
                  <td className="py-3 pr-4 text-right font-mono text-xs text-slate-700">
                    {formaterMontant(ligne.debourse_sec_unitaire)}
                  </td>
                  <td className="py-3 pr-4 text-right font-mono text-xs font-medium text-primaire-700">
                    {formaterMontant(ligne.prix_vente_unitaire)}
                  </td>
                  <td className="py-3">
                    <span className={clsx(STYLES_STATUT[ligne.statut_validation] || "badge-neutre")}>
                      {LIBELLES_STATUT[ligne.statut_validation] || ligne.statut_validation}
                    </span>
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
          <p className="text-xs text-slate-400">{data.count} ligne{data.count > 1 ? "s" : ""}</p>
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
