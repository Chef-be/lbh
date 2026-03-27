/**
 * Crochet Zustand pour la gestion de la session utilisateur.
 * Stocke les jetons JWT et les informations de l'utilisateur connecté.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Utilisateur {
  id: string;
  courriel: string;
  prenom: string;
  nom: string;
  nom_complet: string;
  organisation: string | null;
  organisation_nom: string | null;
  profil: string | null;
  profil_libelle: string | null;
  est_super_admin: boolean;
}

interface EtatSession {
  utilisateur: Utilisateur | null;
  jetonAcces: string | null;
  jetonRafraichissement: string | null;
  estConnecte: boolean;
  // Actions
  connecter: (courriel: string, motDePasse: string) => Promise<void>;
  deconnecter: () => Promise<void>;
  definirUtilisateur: (utilisateur: Utilisateur) => void;
  definirJetons: (acces: string, rafraichissement: string) => void;
}

// ---------------------------------------------------------------------------
// Store Zustand
// ---------------------------------------------------------------------------

export const useSessionStore = create<EtatSession>()(
  persist(
    (set, get) => ({
      utilisateur: null,
      jetonAcces: null,
      jetonRafraichissement: null,
      estConnecte: false,

      connecter: async (courriel: string, motDePasse: string) => {
        const reponse = await fetch("/api/auth/connexion/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courriel, mot_de_passe: motDePasse }),
        });

        if (!reponse.ok) {
          const erreur = await reponse.json();
          const message =
            erreur?.non_field_errors?.[0] ||
            erreur?.detail ||
            "Identifiants incorrects.";
          throw new Error(message);
        }

        const donnees = await reponse.json();
        set({
          utilisateur: donnees.utilisateur,
          jetonAcces: donnees.jetons.acces,
          jetonRafraichissement: donnees.jetons.rafraichissement,
          estConnecte: true,
        });
      },

      deconnecter: async () => {
        const { jetonRafraichissement } = get();
        try {
          await fetch("/api/auth/deconnexion/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${get().jetonAcces}`,
            },
            body: JSON.stringify({ rafraichissement: jetonRafraichissement }),
          });
        } catch {
          // Ignorer les erreurs réseau à la déconnexion
        }
        set({
          utilisateur: null,
          jetonAcces: null,
          jetonRafraichissement: null,
          estConnecte: false,
        });
      },

      definirUtilisateur: (utilisateur) => set({ utilisateur }),
      definirJetons: (acces, rafraichissement) =>
        set({ jetonAcces: acces, jetonRafraichissement: rafraichissement }),
    }),
    {
      name: "session-bee",
      // Persister uniquement les données non sensibles
      partialize: (etat) => ({
        utilisateur: etat.utilisateur,
        estConnecte: etat.estConnecte,
        // Les jetons sont volontairement exclus de localStorage
        // pour les régénérer à chaque session navigateur
      }),
    }
  )
);
