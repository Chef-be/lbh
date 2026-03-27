import type { Metadata } from "next";
import { DetailProjet } from "@/composants/projets/DetailProjet";

export const metadata: Metadata = {
  title: "Détail du projet",
};

export default function PageDetailProjet({ params }: { params: { id: string } }) {
  return <DetailProjet id={params.id} />;
}
