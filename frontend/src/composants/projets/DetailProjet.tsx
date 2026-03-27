"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { clsx } from "clsx";
import { api } from "@/crochets/useApi";
import {
  ArrowLeft, Calendar, MapPin, Building2, User,
  Euro, FolderOpen, Users, Pencil,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Lot {
  id: string;
  numero: number;
  intitule: string;
  description: string;
  montant_estime: number | null;
}

interface Intervenant {
  id: string;
  utilisateur_nom: string;
  role: string;
  role_libelle: string;
}

interface ProjetDetail {
  id: string;
  reference: string;
  intitule: string;
  statut: string;
  statut_libelle: string;
  type_projet: string;
  type_libelle: string;
  phase_actuelle: string;
  phase_libelle: string;
  organisation_nom: string;
  maitre_ouvrage_nom: string | null;
  maitre_oeuvre_nom: string | null;
  responsable_nom: string;
  commune: string;
  departement: string;
  date_debut_prevue: string | null;
  date_fin_prevue: string | null;
  date_debut_reelle: string | null;
  date_fin_reelle: string | null;
  montant_estime: number | null;
  montant_marche: number | null;
  honoraires_prevus: number | null;
  description: string;
  lots: Lot[];
  intervenants: Intervenant[];
  date_creation: string;
  date_modification: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STYLES_STATUT: Record<string, string> = {
  en_cours: "badge-info",
  termine: "badge-succes",
  suspendu: "badge-alerte",
  abandonne: "badge-danger",
  prospection: "badge-neutre",
  archive: "badge-neutre",
};

function formaterDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

function formaterMontant(val: number | null) {
  if (val == null) return "—";
  return `${Number(val).toLocaleString("fr-FR", { minimumFractionDigits: 0 })} €`;
}

// ---------------------------------------------------------------------------
// Composant
// ---------------------------------------------------------------------------

export function DetailProjet({ id }: { id: string }) {
  const { data: projet, isLoading, isError } = useQuery<ProjetDetail>({
    queryKey: ["projet", id],
    queryFn: () => api.get(`/api/projets/${id}/`),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 text-sm">
        Chargement du projet…
      </div>
    );
  }

  if (isError || !projet) {
    return (
      <div className="carte text-center py-12">
        <p className="text-red-500 mb-4">Impossible de charger ce projet.</p>
        <Link href="/projets" className="btn-secondaire">← Retour aux projets</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/projets" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-2">
            <ArrowLeft size={14} /> Projets
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-mono">{projet.reference}</h1>
            <span className={clsx(STYLES_STATUT[projet.statut] || "badge-neutre")}>
              {projet.statut_libelle}
            </span>
            {projet.phase_libelle && (
              <span className="badge-neutre">{projet.phase_libelle}</span>
            )}
          </div>
          <p className="text-slate-600 mt-1 text-lg">{projet.intitule}</p>
        </div>

        <div className="flex gap-2 shrink-0">
          <Link href={`/projets/${id}/economie`} className="btn-secondaire text-xs">
            Économie
          </Link>
          <Link href={`/projets/${id}/documents`} className="btn-secondaire text-xs">
            Documents
          </Link>
          <Link href={`/projets/${id}/modifier`} className="btn-primaire text-xs flex items-center gap-1">
            <Pencil size={12} /> Modifier
          </Link>
        </div>
      </div>

      {/* Grille informations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche : données principales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations générales */}
          <div className="carte">
            <h2 className="mb-4">Informations générales</h2>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div>
                <dt className="text-slate-500 flex items-center gap-1">
                  <Building2 size={12} /> Bureau d&apos;études
                </dt>
                <dd className="font-medium mt-0.5">{projet.organisation_nom}</dd>
              </div>
              {projet.maitre_ouvrage_nom && (
                <div>
                  <dt className="text-slate-500">Maître d&apos;ouvrage</dt>
                  <dd className="font-medium mt-0.5">{projet.maitre_ouvrage_nom}</dd>
                </div>
              )}
              {projet.maitre_oeuvre_nom && (
                <div>
                  <dt className="text-slate-500">Maître d&apos;œuvre</dt>
                  <dd className="font-medium mt-0.5">{projet.maitre_oeuvre_nom}</dd>
                </div>
              )}
              <div>
                <dt className="text-slate-500 flex items-center gap-1">
                  <User size={12} /> Responsable
                </dt>
                <dd className="font-medium mt-0.5">{projet.responsable_nom}</dd>
              </div>
              {(projet.commune || projet.departement) && (
                <div>
                  <dt className="text-slate-500 flex items-center gap-1">
                    <MapPin size={12} /> Localisation
                  </dt>
                  <dd className="font-medium mt-0.5">
                    {[projet.commune, projet.departement ? `(${projet.departement})` : ""].filter(Boolean).join(" ")}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-slate-500">Type</dt>
                <dd className="font-medium mt-0.5">{projet.type_libelle}</dd>
              </div>
            </dl>
          </div>

          {/* Calendrier */}
          <div className="carte">
            <h2 className="mb-4 flex items-center gap-2">
              <Calendar size={16} /> Calendrier
            </h2>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div>
                <dt className="text-slate-500">Début prévu</dt>
                <dd className="font-medium mt-0.5">{formaterDate(projet.date_debut_prevue)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Fin prévue</dt>
                <dd className="font-medium mt-0.5">{formaterDate(projet.date_fin_prevue)}</dd>
              </div>
              {projet.date_debut_reelle && (
                <div>
                  <dt className="text-slate-500">Début réel</dt>
                  <dd className="font-medium mt-0.5">{formaterDate(projet.date_debut_reelle)}</dd>
                </div>
              )}
              {projet.date_fin_reelle && (
                <div>
                  <dt className="text-slate-500">Fin réelle</dt>
                  <dd className="font-medium mt-0.5">{formaterDate(projet.date_fin_reelle)}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Lots */}
          {projet.lots.length > 0 && (
            <div className="carte">
              <div className="flex items-center justify-between mb-4">
                <h2 className="flex items-center gap-2">
                  <FolderOpen size={16} /> Lots ({projet.lots.length})
                </h2>
              </div>
              <div className="space-y-2">
                {projet.lots.map((lot) => (
                  <div key={lot.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                    <div>
                      <span className="font-mono text-xs text-slate-500 mr-2">Lot {lot.numero}</span>
                      <span className="font-medium text-sm">{lot.intitule}</span>
                      {lot.description && (
                        <p className="text-xs text-slate-400 mt-0.5">{lot.description}</p>
                      )}
                    </div>
                    {lot.montant_estime != null && (
                      <span className="font-mono text-sm text-slate-700">
                        {formaterMontant(lot.montant_estime)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Colonne droite : synthèse financière + équipe */}
        <div className="space-y-6">
          {/* Synthèse financière */}
          <div className="carte">
            <h2 className="mb-4 flex items-center gap-2">
              <Euro size={16} /> Synthèse financière
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Montant estimé HT</dt>
                <dd className="font-mono font-medium">{formaterMontant(projet.montant_estime)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Montant du marché HT</dt>
                <dd className="font-mono font-medium">{formaterMontant(projet.montant_marche)}</dd>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-3">
                <dt className="text-slate-500">Honoraires prévus HT</dt>
                <dd className="font-mono font-medium text-primaire-700">
                  {formaterMontant(projet.honoraires_prevus)}
                </dd>
              </div>
            </dl>
          </div>

          {/* Intervenants */}
          <div className="carte">
            <h2 className="mb-4 flex items-center gap-2">
              <Users size={16} /> Équipe ({projet.intervenants.length})
            </h2>
            {projet.intervenants.length === 0 ? (
              <p className="text-sm text-slate-400">Aucun intervenant affecté.</p>
            ) : (
              <ul className="space-y-2">
                {projet.intervenants.map((intervenant, idx) => (
                  <li key={idx} className="flex items-center justify-between text-sm">
                    <span className="font-medium">{intervenant.utilisateur_nom}</span>
                    <span className="badge-neutre">{intervenant.role_libelle}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Métadonnées */}
          <div className="carte text-xs text-slate-400 space-y-1">
            <p>Créé le {formaterDate(projet.date_creation)}</p>
            <p>Modifié le {formaterDate(projet.date_modification)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
