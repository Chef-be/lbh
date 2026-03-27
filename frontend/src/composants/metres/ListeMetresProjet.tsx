"use client";

import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clsx } from "clsx";
import { api } from "@/crochets/useApi";
import { CheckCircle } from "lucide-react";

interface Metre {
  id: string;
  intitule: string;
  type_metre: string;
  type_libelle: string;
  statut: string;
  statut_libelle: string;
  montant_total_ht: number;
  date_modification: string;
}

interface PageResultats {
  results: Metre[];
}

const STYLES_STATUT: Record<string, string> = {
  en_cours: "badge-info",
  valide: "badge-succes",
  archive: "badge-neutre",
};

function formaterMontant(val: number) {
  if (val == null) return "—";
  return `${Number(val).toLocaleString("fr-FR", { minimumFractionDigits: 0 })} €`;
}

export function ListeMetresProjet({ projetId }: { projetId: string }) {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<PageResultats>({
    queryKey: ["metres-projet", projetId],
    queryFn: () => api.get(`/api/metres/?projet=${projetId}&ordering=-date_modification`),
  });

  const { mutate: valider, variables: validationEnCours } = useMutation({
    mutationFn: (id: string) => api.post(`/api/metres/${id}/valider/`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["metres-projet", projetId] }),
  });

  const metres = data?.results ?? [];

  if (isLoading) return <div className="carte py-12 text-center text-slate-400 text-sm">Chargement…</div>;
  if (isError) return <div className="carte py-12 text-center text-red-500 text-sm">Erreur lors du chargement.</div>;

  if (metres.length === 0) {
    return (
      <div className="carte py-12 text-center text-slate-400">
        <p className="text-sm mb-4">Aucun métré pour ce projet.</p>
        <Link href={`/projets/${projetId}/metres/nouveau`} className="btn-primaire text-xs">
          Créer le premier métré
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
            <th className="text-left py-2 pr-4 font-medium">Type</th>
            <th className="text-left py-2 pr-4 font-medium">Statut</th>
            <th className="text-right py-2 pr-4 font-medium">Montant HT</th>
            <th className="text-right py-2 pr-4 font-medium">Modifié</th>
            <th className="text-right py-2 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {metres.map((m) => (
            <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
              <td className="py-3 pr-4 font-medium">{m.intitule}</td>
              <td className="py-3 pr-4 text-xs text-slate-500">{m.type_libelle}</td>
              <td className="py-3 pr-4">
                <span className={clsx(STYLES_STATUT[m.statut] || "badge-neutre")}>
                  {m.statut_libelle}
                </span>
              </td>
              <td className="py-3 pr-4 text-right font-mono text-xs font-medium text-primaire-700">
                {formaterMontant(m.montant_total_ht)}
              </td>
              <td className="py-3 pr-4 text-right text-xs text-slate-400">
                {new Date(m.date_modification).toLocaleDateString("fr-FR")}
              </td>
              <td className="py-3 text-right">
                {m.statut !== "valide" && (
                  <button
                    onClick={() => valider(m.id)}
                    disabled={validationEnCours === m.id}
                    className={clsx(
                      "btn-secondaire text-xs flex items-center gap-1 ml-auto",
                      validationEnCours === m.id && "opacity-50",
                    )}
                  >
                    <CheckCircle size={12} />
                    {validationEnCours === m.id ? "Validation…" : "Valider"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
