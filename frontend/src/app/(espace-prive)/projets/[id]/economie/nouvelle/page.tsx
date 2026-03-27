import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FormulaireNouvelleEtude } from "@/composants/economie/FormulaireNouvelleEtude";

export const metadata: Metadata = {
  title: "Nouvelle étude économique",
};

export default function PageNouvelleEtude({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link
          href={`/projets/${params.id}/economie`}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-2"
        >
          <ArrowLeft size={14} /> Économie
        </Link>
        <h1>Nouvelle étude économique</h1>
        <p className="text-slate-500 mt-1">Créer une étude économique pour ce projet</p>
      </div>
      <FormulaireNouvelleEtude projetId={params.id} />
    </div>
  );
}
