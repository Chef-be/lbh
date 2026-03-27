"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { clsx } from "clsx";
import { api } from "@/crochets/useApi";
import { Search } from "lucide-react";
import { useState } from "react";

interface Metre {
  id: string;
  intitule: string;
  projet_reference: string;
  projet: string;
  statut: string;
  statut_libelle: string;
  montant_total_ht: number | null;
  date_modification: string;
}

interface PageResultats {
  count: number;
  next: string | null;
  results: Metre[];
}

const STYLES_STATUT: Record<string, string> = {
  brouillon: "badge-neutre",
  en_cours: "badge-info",
  valide: "badge-succes",
  archive: "badge-neutre",
};

export function ListeMetres() {
  const [recherche, setRecherche] = useState("");
  const [page, setPage] = useState(1);

  const params = new URLSearchParams({ ordering: "-date_modification", page: String(page) });
  if (recherche) params.set("search", recherche);

  const { data, isLoading, isError } = useQuery<PageResultats>({
    queryKey: ["metres", recherche, page],
    queryFn: () => api.get(`/api/metres/?${params.toString()}`),
  });

  const metres = data?.results ?? [];

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
      ) : metres.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm">Aucun métré.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-500">
                <th className="text-left py-2 pr-4 font-medium">Projet</th>
                <th className="text-left py-2 pr-4 font-medium">Intitulé</th>
                <th className="text-left py-2 pr-4 font-medium">Statut</th>
                <th className="text-right py-2 pr-4 font-medium">Total</th>
                <th className="text-right py-2 font-medium">Modifié</th>
              </tr>
            </thead>
            <tbody>
              {metres.map((m) => (
                <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-3 pr-4">
                    <Link href={`/projets/${m.projet}`} className="font-mono text-xs text-primaire-700 hover:underline">
                      {m.projet_reference}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 font-medium">{m.intitule}</td>
                  <td className="py-3 pr-4">
                    <span className={clsx(STYLES_STATUT[m.statut] || "badge-neutre")}>
                      {m.statut_libelle || m.statut}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right font-mono text-xs">
                    {m.montant_total_ht != null ? Number(m.montant_total_ht).toLocaleString("fr-FR") : "—"}
                  </td>
                  <td className="py-3 text-right text-xs text-slate-400">
                    {new Date(m.date_modification).toLocaleDateString("fr-FR")}
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
