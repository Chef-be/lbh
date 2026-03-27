"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Metadata } from "next";
import { useSessionStore } from "@/crochets/useSession";

// Schéma de validation
const schemaConnexion = z.object({
  courriel: z.string().email("Adresse de courriel invalide."),
  mot_de_passe: z.string().min(1, "Le mot de passe est requis."),
});

type DonneesConnexion = z.infer<typeof schemaConnexion>;

export default function PageConnexion() {
  const router = useRouter();
  const { connecter } = useSessionStore();
  const [erreurGlobale, setErreurGlobale] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DonneesConnexion>({
    resolver: zodResolver(schemaConnexion),
  });

  const soumettre = async (donnees: DonneesConnexion) => {
    setErreurGlobale(null);
    setChargement(true);

    try {
      await connecter(donnees.courriel, donnees.mot_de_passe);
      router.push("/tableau-de-bord");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErreurGlobale(err.message);
      } else {
        setErreurGlobale("Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primaire-950 to-primaire-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / En-tête */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 mb-4">
            <span className="text-3xl font-bold text-white">B</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Plateforme BEE</h1>
          <p className="text-primaire-300 text-sm mt-1">
            Bureau d&apos;Études Économiste
          </p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            Connexion à votre espace
          </h2>

          {erreurGlobale && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {erreurGlobale}
            </div>
          )}

          <form onSubmit={handleSubmit(soumettre)} className="space-y-4">
            <div>
              <label htmlFor="courriel" className="libelle-champ">
                Adresse de courriel
              </label>
              <input
                id="courriel"
                type="email"
                autoComplete="email"
                className="champ-saisie"
                placeholder="prenom.nom@exemple.fr"
                {...register("courriel")}
              />
              {errors.courriel && (
                <p className="mt-1 text-xs text-red-600">{errors.courriel.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="mot_de_passe" className="libelle-champ">
                Mot de passe
              </label>
              <input
                id="mot_de_passe"
                type="password"
                autoComplete="current-password"
                className="champ-saisie"
                placeholder="••••••••••••"
                {...register("mot_de_passe")}
              />
              {errors.mot_de_passe && (
                <p className="mt-1 text-xs text-red-600">{errors.mot_de_passe.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={chargement}
              className="w-full btn-primaire justify-center py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {chargement ? "Connexion en cours…" : "Se connecter"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            Accès réservé aux membres autorisés
          </p>
        </div>
      </div>
    </div>
  );
}
