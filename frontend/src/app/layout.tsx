import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { FournisseurRequetes } from "@/contextes/FournisseurRequetes";
import { FournisseurNotifications } from "@/contextes/FournisseurNotifications";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "BEE — Bureau d'Études Économiste",
    template: "%s | BEE",
  },
  description:
    "Bureau d'études spécialisé en économie de la construction, dimensionnement voirie et pré-dimensionnement bâtiment.",
  // Pas de directive robots globale — chaque page ou groupe la définit
};

export default function MiseEnPageRacine({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <FournisseurRequetes>
          <FournisseurNotifications>
            {children}
          </FournisseurNotifications>
        </FournisseurRequetes>
      </body>
    </html>
  );
}
