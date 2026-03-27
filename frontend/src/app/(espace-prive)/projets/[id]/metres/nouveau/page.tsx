import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FormulaireNouveauMetre } from "@/composants/metres/FormulaireNouveauMetre";

export const metadata: Metadata = {
  title: "Nouveau métré",
};

export default function PageNouveauMetre({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link
          href={`/projets/${params.id}/metres`}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-2"
        >
          <ArrowLeft size={14} /> Métrés
        </Link>
        <h1>Nouveau métré</h1>
      </div>
      <FormulaireNouveauMetre projetId={params.id} />
    </div>
  );
}
