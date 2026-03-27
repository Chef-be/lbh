import { redirect } from "next/navigation";

/**
 * Page racine — redirige vers le tableau de bord.
 * Le middleware d'authentification côté client gère la redirection vers /connexion.
 */
export default function PageRacine() {
  redirect("/tableau-de-bord");
}
