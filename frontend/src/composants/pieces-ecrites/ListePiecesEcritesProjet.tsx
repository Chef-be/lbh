"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clsx } from "clsx";
import { api } from "@/crochets/useApi";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";

interface PieceEcrite {
  id: string;
  intitule: string;
  modele: string;
  modele_libelle: string;
  statut: string;
  statut_libelle: string;
  date_modification: string;
}

interface PageResultats {
  results: PieceEcrite[];
}

const STYLES_STATUT: Record<string, string> = {
  brouillon: "badge-neutre",
  en_cours: "badge-info",
  valide: "badge-succes",
  archive: "badge-neutre",
};

export function ListePiecesEcritesProjet({ projetId }: { projetId: string }) {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<PageResultats>({
    queryKey: ["pieces-ecrites-projet", projetId],
    queryFn: () =>
      api.get<PageResultats>(`/api/pieces-ecrites/?projet=${projetId}&ordering=-date_modification`),
  });

  const { mutate: valider, variables: validationEnCours } = useMutation({
    mutationFn: (id: string) => api.post(`/api/pieces-ecrites/${id}/valider/`, {}),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["pieces-ecrites-projet", projetId] }),
  });

  const pieces = data?.results ?? [];

  if (isLoading)
    return <div className="carte py-12 text-center text-slate-400 text-sm">Chargement…</div>;
  if (isError)
    return <div className="carte py-12 text-center text-red-500 text-sm">Erreur lors du chargement.</div>;

  if (pieces.length === 0) {
    return (
      <div className="carte py-12 text-center text-slate-400">
        <FileText size={32} className="mx-auto mb-3 opacity-30" />
        <p className="text-sm mb-4">Aucune pièce écrite pour ce projet.</p>
        <Link
          href={`/projets/${projetId}/pieces-ecrites/nouvelle`}
          className="btn-primaire text-xs"
        >
          Créer la première pièce
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
            <th className="text-left py-2 pr-4 font-medium">Modèle</th>
            <th className="text-left py-2 pr-4 font-medium">Statut</th>
            <th className="text-right py-2 pr-4 font-medium">Modifié</th>
            <th className="text-right py-2 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pieces.map((p) => (
            <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
              <td className="py-3 pr-4 font-medium">{p.intitule}</td>
              <td className="py-3 pr-4">
                <span className="badge-neutre">{p.modele_libelle || "—"}</span>
              </td>
              <td className="py-3 pr-4">
                <span className={clsx(STYLES_STATUT[p.statut] || "badge-neutre")}>
                  {p.statut_libelle || p.statut}
                </span>
              </td>
              <td className="py-3 pr-4 text-right text-xs text-slate-400">
                {new Date(p.date_modification).toLocaleDateString("fr-FR")}
              </td>
              <td className="py-3 text-right">
                {p.statut !== "valide" && (
                  <button
                    onClick={() => valider(p.id)}
                    disabled={validationEnCours === p.id}
                    className={clsx(
                      "btn-secondaire text-xs",
                      validationEnCours === p.id && "opacity-50"
                    )}
                  >
                    {validationEnCours === p.id ? "Validation…" : "Valider"}
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
