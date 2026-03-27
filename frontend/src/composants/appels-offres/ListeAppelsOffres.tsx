"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { clsx } from "clsx";
import { api } from "@/crochets/useApi";
import { Search } from "lucide-react";
import { useState } from "react";

interface AppelOffres {
  id: string;
  intitule: string;
  type_libelle: string;
  projet_reference: string;
  projet: string;
  statut: string;
  statut_libelle: string;
  type_procedure: string;
  nb_offres: number;
  date_limite_remise: string | null;
  date_creation: string;
}

interface PageResultats {
  count: number;
  next: string | null;
  results: AppelOffres[];
}

const STYLES_STATUT: Record<string, string> = {
  preparation: "badge-neutre",
  publie: "badge-info",
  cloture: "badge-alerte",
  analyse: "badge-info",
  attribue: "badge-succes",
  infructueux: "badge-danger",
  annule: "badge-danger",
};

export function ListeAppelsOffres() {
  const [recherche, setRecherche] = useState("");
  const [page, setPage] = useState(1);

  const params = new URLSearchParams({ ordering: "-date_creation", page: String(page) });
  if (recherche) params.set("search", recherche);

  const { data, isLoading, isError } = useQuery<PageResultats>({
    queryKey: ["appels-offres", recherche, page],
    queryFn: () => api.get(`/api/appels-offres/?${params.toString()}`),
  });

  const aos = data?.results ?? [];

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
      ) : aos.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm">Aucun appel d&apos;offres.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-500">
                <th className="text-left py-2 pr-4 font-medium">Projet</th>
                <th className="text-left py-2 pr-4 font-medium">Intitulé / Type</th>
                <th className="text-left py-2 pr-4 font-medium">Statut</th>
                <th className="text-center py-2 pr-4 font-medium">Offres</th>
                <th className="text-right py-2 pr-4 font-medium">Date remise</th>
                <th className="text-right py-2 font-medium">Modifié</th>
              </tr>
            </thead>
            <tbody>
              {aos.map((ao) => (
                <tr key={ao.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-3 pr-4">
                    <Link href={`/projets/${ao.projet}`} className="font-mono text-xs text-primaire-700 hover:underline">
                      {ao.projet_reference}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">
                    <p className="font-medium">{ao.intitule}</p>
                    <p className="text-xs text-slate-400">{ao.type_libelle}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={clsx(STYLES_STATUT[ao.statut] || "badge-neutre")}>
                      {ao.statut_libelle || ao.statut}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-center font-mono text-xs">{ao.nb_offres}</td>
                  <td className="py-3 pr-4 text-right text-xs text-slate-500">
                    {ao.date_limite_remise ? new Date(ao.date_limite_remise).toLocaleDateString("fr-FR") : "—"}
                  </td>
                  <td className="py-3 text-right text-xs text-slate-400">
                    {new Date(ao.date_creation).toLocaleDateString("fr-FR")}
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
