"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { clsx } from "clsx";
import { api } from "@/crochets/useApi";
import { Search } from "lucide-react";
import { useState } from "react";

interface PieceEcrite {
  id: string;
  intitule: string;
  modele: string;
  modele_libelle: string;
  projet_reference: string;
  projet: string;
  statut: string;
  statut_libelle: string;
  date_modification: string;
}

interface PageResultats {
  count: number;
  next: string | null;
  results: PieceEcrite[];
}

const STYLES_STATUT: Record<string, string> = {
  brouillon: "badge-neutre",
  en_cours: "badge-info",
  valide: "badge-succes",
  archive: "badge-neutre",
};

export function ListePiecesEcrites() {
  const [recherche, setRecherche] = useState("");
  const [page, setPage] = useState(1);

  const params = new URLSearchParams({ ordering: "-date_modification", page: String(page) });
  if (recherche) params.set("search", recherche);

  const { data, isLoading, isError } = useQuery<PageResultats>({
    queryKey: ["pieces-ecrites", recherche, page],
    queryFn: () => api.get<PageResultats>(`/api/pieces-ecrites/?${params.toString()}`),
  });

  const pieces = data?.results ?? [];

  return (
    <div className="carte space-y-4">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Rechercher…"
          className="champ-saisie pl-8 w-full"
          value={recherche}
          onChange={(e) => { setRecherche(e.target.value); setPage(1); }}
        />
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Chargement…</div>
      ) : isError ? (
        <div className="py-12 text-center text-red-500 text-sm">Erreur lors du chargement.</div>
      ) : pieces.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm">Aucune pièce écrite.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-500">
                <th className="text-left py-2 pr-4 font-medium">Projet</th>
                <th className="text-left py-2 pr-4 font-medium">Intitulé</th>
                <th className="text-left py-2 pr-4 font-medium">Modèle</th>
                <th className="text-left py-2 pr-4 font-medium">Statut</th>
                <th className="text-right py-2 font-medium">Modifié</th>
              </tr>
            </thead>
            <tbody>
              {pieces.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-3 pr-4">
                    <Link href={`/projets/${p.projet}`} className="font-mono text-xs text-primaire-700 hover:underline">
                      {p.projet_reference}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 font-medium">{p.intitule}</td>
                  <td className="py-3 pr-4">
                    <span className="badge-neutre">{p.modele_libelle || "—"}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={clsx(STYLES_STATUT[p.statut] || "badge-neutre")}>
                      {p.statut_libelle || p.statut}
                    </span>
                  </td>
                  <td className="py-3 text-right text-xs text-slate-400">
                    {new Date(p.date_modification).toLocaleDateString("fr-FR")}
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
