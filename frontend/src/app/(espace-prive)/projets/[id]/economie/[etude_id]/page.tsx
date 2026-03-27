import type { Metadata } from "next";
import { DetailEtudeEconomique } from "@/composants/economie/DetailEtudeEconomique";

export const metadata: Metadata = {
  title: "Étude économique",
};

export default function PageDetailEtude({
  params,
}: {
  params: { id: string; etude_id: string };
}) {
  return <DetailEtudeEconomique projetId={params.id} etudeId={params.etude_id} />;
}
