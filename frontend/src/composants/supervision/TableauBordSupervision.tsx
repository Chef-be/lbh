"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clsx } from "clsx";
import { api } from "@/crochets/useApi";
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Server, Activity } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Alerte {
  id: string;
  niveau: string;
  message: string;
  service: string;
  est_resolue: boolean;
  date_creation: string;
}

interface ServiceSante {
  nom: string;
  statut: string;
  message: string | null;
  derniere_verification: string;
}

interface TableauBord {
  alertes_actives: number;
  alertes_critiques: number;
  services_ko: number;
  alertes: Alerte[];
  services: ServiceSante[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STYLE_NIVEAU: Record<string, string> = {
  info: "badge-info",
  alerte: "badge-alerte",
  critique: "badge-danger",
};

const STYLE_STATUT_SERVICE: Record<string, string> = {
  ok: "text-green-600",
  alerte: "text-yellow-600",
  ko: "text-red-600",
};

function IconeStatut({ statut }: { statut: string }) {
  if (statut === "ok") return <CheckCircle size={16} className="text-green-500" />;
  if (statut === "alerte") return <AlertTriangle size={16} className="text-yellow-500" />;
  return <XCircle size={16} className="text-red-500" />;
}

// ---------------------------------------------------------------------------
// Composant
// ---------------------------------------------------------------------------

export function TableauBordSupervision() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch, isFetching } = useQuery<TableauBord>({
    queryKey: ["supervision-tableau-bord"],
    queryFn: () => api.get<TableauBord>("/api/supervision/"),
    refetchInterval: 60_000, // Rafraîchissement automatique toutes les 60 s
  });

  const { mutate: acquitter } = useMutation({
    mutationFn: (id: string) => api.post(`/api/supervision/alertes/${id}/acquitter/`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["supervision-tableau-bord"] }),
  });

  if (isLoading) {
    return <div className="py-12 text-center text-slate-400 text-sm">Chargement…</div>;
  }

  if (isError || !data) {
    return (
      <div className="carte py-12 text-center text-red-500 text-sm">
        Impossible de charger les données de supervision.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec bouton rafraîchir */}
      <div className="flex justify-end">
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="btn-secondaire text-xs flex items-center gap-1"
        >
          <RefreshCw size={12} className={isFetching ? "animate-spin" : ""} />
          Actualiser
        </button>
      </div>

      {/* Indicateurs */}
      <div className="grid grid-cols-3 gap-4">
        <div className={clsx("carte text-center", data.alertes_critiques > 0 && "border-red-200")}>
          <p className={clsx("text-3xl font-bold", data.alertes_critiques > 0 ? "text-red-600" : "text-green-600")}>
            {data.alertes_critiques}
          </p>
          <p className="text-sm text-slate-500 mt-1">Alertes critiques</p>
        </div>
        <div className={clsx("carte text-center", data.alertes_actives > 0 && "border-yellow-200")}>
          <p className={clsx("text-3xl font-bold", data.alertes_actives > 0 ? "text-yellow-600" : "text-green-600")}>
            {data.alertes_actives}
          </p>
          <p className="text-sm text-slate-500 mt-1">Alertes actives</p>
        </div>
        <div className={clsx("carte text-center", data.services_ko > 0 && "border-red-200")}>
          <p className={clsx("text-3xl font-bold", data.services_ko > 0 ? "text-red-600" : "text-green-600")}>
            {data.services_ko}
          </p>
          <p className="text-sm text-slate-500 mt-1">Services hors ligne</p>
        </div>
      </div>

      {/* État des services */}
      {data.services && data.services.length > 0 && (
        <div className="carte">
          <h2 className="mb-4 flex items-center gap-2">
            <Server size={16} /> État des services
          </h2>
          <div className="space-y-2">
            {data.services.map((svc) => (
              <div key={svc.nom} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <IconeStatut statut={svc.statut} />
                  <span className="font-medium text-sm">{svc.nom}</span>
                  {svc.message && (
                    <span className="text-xs text-slate-400">{svc.message}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={clsx("text-xs font-medium", STYLE_STATUT_SERVICE[svc.statut] || "text-slate-400")}>
                    {svc.statut.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(svc.derniere_verification).toLocaleTimeString("fr-FR")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alertes actives */}
      {data.alertes && data.alertes.length > 0 && (
        <div className="carte">
          <h2 className="mb-4 flex items-center gap-2">
            <Activity size={16} /> Alertes actives
          </h2>
          <div className="space-y-2">
            {data.alertes.map((alerte) => (
              <div
                key={alerte.id}
                className={clsx(
                  "flex items-start justify-between p-3 rounded-lg",
                  alerte.niveau === "critique" ? "bg-red-50" : alerte.niveau === "alerte" ? "bg-yellow-50" : "bg-blue-50"
                )}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={clsx(STYLE_NIVEAU[alerte.niveau] || "badge-neutre")}>
                      {alerte.niveau}
                    </span>
                    <span className="text-xs text-slate-500">{alerte.service}</span>
                    <span className="text-xs text-slate-400">
                      {new Date(alerte.date_creation).toLocaleString("fr-FR")}
                    </span>
                  </div>
                  <p className="text-sm">{alerte.message}</p>
                </div>
                <button
                  onClick={() => acquitter(alerte.id)}
                  className="btn-secondaire text-xs ml-4 shrink-0"
                >
                  Acquitter
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.alertes_actives === 0 && data.services_ko === 0 && (
        <div className="carte py-8 text-center">
          <CheckCircle size={32} className="mx-auto mb-3 text-green-400" />
          <p className="text-green-600 font-medium">Système opérationnel</p>
          <p className="text-slate-400 text-sm mt-1">Aucune alerte active</p>
        </div>
      )}
    </div>
  );
}
