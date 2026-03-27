import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { FournisseurRequetes } from "@/contextes/FournisseurRequetes";
import { FournisseurNotifications } from "@/contextes/FournisseurNotifications";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Plateforme BEE",
    template: "%s | Plateforme BEE",
  },
  description: "Bureau d'Études Économiste — Plateforme de gestion de projets",
  robots: "noindex, nofollow", // Interface privée
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
