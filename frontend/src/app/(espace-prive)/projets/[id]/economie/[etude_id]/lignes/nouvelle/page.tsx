import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FormulaireNouvelleLigne } from "@/composants/economie/FormulaireNouvelleLigne";

export const metadata: Metadata = {
  title: "Nouvelle ligne de prix",
};

export default function PageNouvelleLigne({
  params,
}: {
  params: { id: string; etude_id: string };
}) {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link
          href={`/projets/${params.id}/economie/${params.etude_id}`}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-2"
        >
          <ArrowLeft size={14} /> Retour à l&apos;étude
        </Link>
        <h1>Nouvelle ligne de prix</h1>
        <p className="text-slate-500 mt-1">Saisie manuelle ou import depuis la bibliothèque</p>
      </div>
      <FormulaireNouvelleLigne projetId={params.id} etudeId={params.etude_id} />
    </div>
  );
}
