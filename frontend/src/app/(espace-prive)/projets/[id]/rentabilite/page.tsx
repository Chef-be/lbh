import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AnalyseRentabiliteProjet } from "@/composants/rentabilite/AnalyseRentabiliteProjet";

export const metadata: Metadata = {
  title: "Analyse de rentabilité",
};

export default function PageRentabiliteProjet({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link
            href={`/projets/${params.id}`}
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-2"
          >
            <ArrowLeft size={14} /> Fiche projet
          </Link>
          <h1>Analyse de rentabilité</h1>
          <p className="text-slate-500 mt-1 text-sm">
            Synthèse des marges et simulation de scénarios
          </p>
        </div>
        <Link
          href={`/projets/${params.id}/economie`}
          className="btn-secondaire text-xs shrink-0"
        >
          Voir les études économiques
        </Link>
      </div>
      <AnalyseRentabiliteProjet projetId={params.id} />
    </div>
  );
}
