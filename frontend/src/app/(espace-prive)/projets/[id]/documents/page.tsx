import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ListeDocuments } from "@/composants/documents/ListeDocuments";

export const metadata: Metadata = {
  title: "Documents du projet",
};

export default async function PageDocumentsProjet({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/projets/${id}`}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-2"
        >
          <ArrowLeft size={14} /> Fiche projet
        </Link>
        <h1>Documents</h1>
        <p className="text-slate-500 mt-1 text-sm">Gestion documentaire du projet</p>
      </div>
      <ListeDocuments projetId={id} />
    </div>
  );
}
