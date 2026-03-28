"use client";

import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clsx } from "clsx";
import { api } from "@/crochets/useApi";
import { CheckCircle, AlertCircle, Clock, Calculator } from "lucide-react";

interface EtudeVoirie {
  id: string;
  intitule: string;
  type_voie_libelle: string;
  tmja_pl: number | null;
  calcul_conforme: boolean | null;
  date_calcul: string | null;
  date_modification: string;
}

interface PageResultats {
  results: EtudeVoirie[];
}

function IconeConformite({ conforme }: { conforme: boolean | null }) {
  if (conforme === true) return <CheckCircle size={14} className="text-green-500" />;
  if (conforme === false) return <AlertCircle size={14} className="text-red-500" />;
  return <Clock size={14} className="text-slate-300" />;
}

export function ListeEtudesVoirieProjet({ projetId }: { projetId: string }) {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<PageResultats>({
    queryKey: ["etudes-voirie", projetId],
    queryFn: () => api.get<PageResultats>(`/api/voirie/?projet=${projetId}&ordering=-date_modification`),
  });

  const { mutate: calculer, variables: calculsEnCours } = useMutation({
    mutationFn: (id: string) => api.post(`/api/voirie/${id}/calculer/`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["etudes-voirie", projetId] }),
  });

  const etudes = data?.results ?? [];

  if (isLoading) return <div className="carte py-12 text-center text-slate-400 text-sm">Chargement…</div>;
  if (isError) return <div className="carte py-12 text-center text-red-500 text-sm">Erreur lors du chargement.</div>;

  if (etudes.length === 0) {
    return (
      <div className="carte py-12 text-center text-slate-400">
        <p className="text-sm mb-4">Aucune étude de voirie pour ce projet.</p>
        <Link href={`/projets/${projetId}/voirie/nouvelle`} className="btn-primaire text-xs">
          Créer la première étude
        </Link>
      </div>
    );
  }

  return (
    <div className="carte overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs text-slate-500">
            <th className="text-left py-2 pr-4 font-medium">Intitulé</th>
            <th className="text-left py-2 pr-4 font-medium">Type de voie</th>
            <th className="text-right py-2 pr-4 font-medium">TMJA PL/j</th>
            <th className="text-center py-2 pr-4 font-medium">Calcul</th>
            <th className="text-right py-2 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {etudes.map((etude) => (
            <tr key={etude.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
              <td className="py-3 pr-4 font-medium">
                <Link href={`/projets/${projetId}/voirie/${etude.id}`} className="hover:text-primaire-700">
                  {etude.intitule}
                </Link>
              </td>
              <td className="py-3 pr-4 text-xs text-slate-500">{etude.type_voie_libelle}</td>
              <td className="py-3 pr-4 text-right font-mono text-xs">
                {etude.tmja_pl != null ? etude.tmja_pl.toLocaleString("fr-FR") : "—"}
              </td>
              <td className="py-3 pr-4 text-center">
                <div className="flex items-center justify-center gap-1">
                  <IconeConformite conforme={etude.calcul_conforme} />
                  {etude.date_calcul && (
                    <span className="text-xs text-slate-400">
                      {new Date(etude.date_calcul).toLocaleDateString("fr-FR")}
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 text-right">
                <button
                  onClick={() => calculer(etude.id)}
                  disabled={calculsEnCours === etude.id}
                  className={clsx(
                    "btn-primaire text-xs flex items-center gap-1 ml-auto",
                    calculsEnCours === etude.id && "opacity-50"
                  )}
                >
                  <Calculator size={12} />
                  {calculsEnCours === etude.id ? "Calcul…" : "Calculer"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
