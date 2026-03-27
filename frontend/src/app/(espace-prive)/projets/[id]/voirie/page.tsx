import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ListeEtudesVoirieProjet } from "@/composants/voirie/ListeEtudesVoirieProjet";

export const metadata: Metadata = {
  title: "Voirie — études de dimensionnement",
};

export default function PageVoirieProjet({ params }: { params: { id: string } }) {
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
          <h1>Dimensionnement voirie</h1>
        </div>
        <Link
          href={`/projets/${params.id}/voirie/nouvelle`}
          className="btn-primaire text-xs shrink-0"
        >
          + Nouvelle étude
        </Link>
      </div>
      <ListeEtudesVoirieProjet projetId={params.id} />
    </div>
  );
}
