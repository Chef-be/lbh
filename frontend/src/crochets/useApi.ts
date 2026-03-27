/**
 * Crochet utilitaire pour les appels API authentifiés.
 * Injecte automatiquement le jeton d'accès JWT dans les en-têtes.
 */

import { useSessionStore } from "@/crochets/useSession";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OptionsRequete extends RequestInit {
  corps?: unknown;
}

export class ErreurApi extends Error {
  constructor(
    public statut: number,
    public detail: string,
    public erreurs?: Record<string, string[]>
  ) {
    super(detail);
    this.name = "ErreurApi";
  }
}

// ---------------------------------------------------------------------------
// Client API de base
// ---------------------------------------------------------------------------

export async function requeteApi<T = unknown>(
  chemin: string,
  options: OptionsRequete = {}
): Promise<T> {
  const { jetonAcces } = useSessionStore.getState();
  const { corps, ...restOptions } = options;

  const entetes: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (jetonAcces) {
    (entetes as Record<string, string>)["Authorization"] = `Bearer ${jetonAcces}`;
  }

  const reponse = await fetch(chemin, {
    ...restOptions,
    headers: entetes,
    body: corps !== undefined ? JSON.stringify(corps) : options.body,
  });

  if (!reponse.ok) {
    let detail = `Erreur ${reponse.status}`;
    let erreurs: Record<string, string[]> | undefined;
    try {
      const donnees = await reponse.json();
      detail = donnees.detail || donnees.non_field_errors?.[0] || detail;
      erreurs = donnees;
    } catch {
      // Ignorer les erreurs de parsing
    }
    throw new ErreurApi(reponse.status, detail, erreurs);
  }

  if (reponse.status === 204) {
    return undefined as T;
  }

  return reponse.json();
}

// ---------------------------------------------------------------------------
// Helpers CRUD
// ---------------------------------------------------------------------------

export const api = {
  get: <T>(chemin: string) => requeteApi<T>(chemin),

  post: <T>(chemin: string, corps: unknown) =>
    requeteApi<T>(chemin, { method: "POST", corps }),

  patch: <T>(chemin: string, corps: unknown) =>
    requeteApi<T>(chemin, { method: "PATCH", corps }),

  put: <T>(chemin: string, corps: unknown) =>
    requeteApi<T>(chemin, { method: "PUT", corps }),

  supprimer: (chemin: string) =>
    requeteApi(chemin, { method: "DELETE" }),
};
