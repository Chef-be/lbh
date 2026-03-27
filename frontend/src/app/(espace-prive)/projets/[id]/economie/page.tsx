import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ListeEtudesEconomiques } from "@/composants/economie/ListeEtudesEconomiques";

export const metadata: Metadata = {
  title: "Économie du projet",
};

export default function PageEconomieProjet({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/projets/${params.id}`}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-2"
        >
          <ArrowLeft size={14} /> Fiche projet
        </Link>
        <h1>Économie</h1>
        <p className="text-slate-500 mt-1 text-sm">Études économiques et analyses de rentabilité</p>
      </div>
      <ListeEtudesEconomiques projetId={params.id} />
    </div>
  );
}
