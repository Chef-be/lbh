"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clsx } from "clsx";
import { api, ErreurApi } from "@/crochets/useApi";
import {
  ClipboardList, FileCheck, Send, Plus, CheckCircle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SuiviExecution {
  id: string;
  projet: string;
  projet_reference: string;
  entreprise_nom: string | null;
  date_os_demarrage: string | null;
  date_fin_contractuelle: string | null;
  montant_marche_ht: number | null;
  montant_total_ht: number;
}

interface CompteRendu {
  id: string;
  numero: number;
  date_reunion: string;
  avancement_physique_pct: string | null;
  redacteur_nom: string | null;
  decisions: string;
}

interface Situation {
  id: string;
  numero: number;
  periode_debut: string;
  periode_fin: string;
  statut: string;
  statut_libelle: string;
  montant_cumule_ht: number;
  montant_periode_ht: number;
}

interface OrdreService {
  id: string;
  numero: number;
  type_ordre: string;
  type_libelle: string;
  date_emission: string;
  objet: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STYLES_SITUATION: Record<string, string> = {
  en_cours: "badge-info",
  soumise: "badge-alerte",
  acceptee: "badge-alerte",
  contestee: "badge-danger",
  validee_moa: "badge-succes",
  payee: "badge-succes",
};

function formaterDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR");
}

function formaterMontant(val: number | null) {
  if (val == null) return "—";
  return `${Number(val).toLocaleString("fr-FR", { minimumFractionDigits: 0 })} €`;
}

// ---------------------------------------------------------------------------
// Sous-composants
// ---------------------------------------------------------------------------

function OngletComptesRendus({ suiviId }: { suiviId: string }) {
  const [ouvert, setOuvert] = useState(false);
  const [form, setForm] = useState({ date_reunion: "", contenu: "", decisions: "" });
  const queryClient = useQueryClient();

  const { data } = useQuery<{ results: CompteRendu[] }>({
    queryKey: ["comptes-rendus", suiviId],
    queryFn: () => api.get(`/api/execution/${suiviId}/comptes-rendus/?ordering=-date_reunion`),
  });

  const { mutate: creer, isPending } = useMutation({
    mutationFn: () => api.post(`/api/execution/${suiviId}/comptes-rendus/`, {
      suivi: suiviId,
      numero: (data?.results.length ?? 0) + 1,
      ...form,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comptes-rendus", suiviId] });
      setOuvert(false);
      setForm({ date_reunion: "", contenu: "", decisions: "" });
    },
  });

  const crs = data?.results ?? [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600">
          <ClipboardList size={14} className="inline mr-1" />
          Comptes rendus ({crs.length})
        </p>
        <button onClick={() => setOuvert(!ouvert)} className="btn-secondaire text-xs flex items-center gap-1">
          <Plus size={12} /> Nouveau CR
        </button>
      </div>

      {ouvert && (
        <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="libelle-champ">Date de réunion</label>
              <input type="date" className="champ-saisie font-mono"
                value={form.date_reunion}
                onChange={(e) => setForm(f => ({ ...f, date_reunion: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="libelle-champ">Contenu *</label>
            <textarea rows={3} className="champ-saisie"
              value={form.contenu}
              onChange={(e) => setForm(f => ({ ...f, contenu: e.target.value }))}
            />
          </div>
          <div>
            <label className="libelle-champ">Décisions</label>
            <textarea rows={2} className="champ-saisie"
              value={form.decisions}
              onChange={(e) => setForm(f => ({ ...f, decisions: e.target.value }))}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setOuvert(false)} className="btn-secondaire text-xs">Annuler</button>
            <button onClick={() => creer()} disabled={isPending || !form.date_reunion || !form.contenu}
              className="btn-primaire text-xs">
              {isPending ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </div>
      )}

      {crs.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-4">Aucun compte rendu.</p>
      ) : (
        <div className="space-y-2">
          {crs.map((cr) => (
            <div key={cr.id} className="flex items-start justify-between p-3 bg-slate-50 rounded-lg text-sm">
              <div>
                <span className="font-mono text-xs text-slate-500 mr-2">CR #{cr.numero}</span>
                <span className="font-medium">{formaterDate(cr.date_reunion)}</span>
                {cr.decisions && <p className="text-xs text-slate-500 mt-1 truncate max-w-lg">{cr.decisions}</p>}
              </div>
              {cr.avancement_physique_pct && (
                <span className="badge-info font-mono text-xs">{cr.avancement_physique_pct}%</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OngletSituations({ suiviId }: { suiviId: string }) {
  const queryClient = useQueryClient();

  const { data } = useQuery<{ results: Situation[] }>({
    queryKey: ["situations", suiviId],
    queryFn: () => api.get(`/api/execution/${suiviId}/situations/?ordering=-numero`),
  });

  const { mutate: valider, variables: validationEnCours } = useMutation({
    mutationFn: (id: string) => api.post(`/api/execution/${suiviId}/situations/${id}/valider/`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["situations", suiviId] }),
  });

  const situations = data?.results ?? [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600">
          <FileCheck size={14} className="inline mr-1" />
          Situations de travaux ({situations.length})
        </p>
      </div>

      {situations.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-4">Aucune situation de travaux.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs text-slate-500">
              <th className="text-left py-2 pr-4 font-medium">N°</th>
              <th className="text-left py-2 pr-4 font-medium">Période</th>
              <th className="text-left py-2 pr-4 font-medium">Statut</th>
              <th className="text-right py-2 pr-4 font-medium">Montant période</th>
              <th className="text-right py-2 pr-4 font-medium">Cumulé</th>
              <th className="text-right py-2 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {situations.map((s) => (
              <tr key={s.id} className="border-b border-slate-50">
                <td className="py-3 pr-4 font-mono text-xs">#{s.numero}</td>
                <td className="py-3 pr-4 text-xs text-slate-500">
                  {formaterDate(s.periode_debut)} → {formaterDate(s.periode_fin)}
                </td>
                <td className="py-3 pr-4">
                  <span className={clsx(STYLES_SITUATION[s.statut] || "badge-neutre")}>
                    {s.statut_libelle}
                  </span>
                </td>
                <td className="py-3 pr-4 text-right font-mono text-xs">{formaterMontant(s.montant_periode_ht)}</td>
                <td className="py-3 pr-4 text-right font-mono text-xs font-medium">{formaterMontant(s.montant_cumule_ht)}</td>
                <td className="py-3 text-right">
                  {s.statut === "soumise" && (
                    <button
                      onClick={() => valider(s.id)}
                      disabled={validationEnCours === s.id}
                      className="btn-secondaire text-xs flex items-center gap-1 ml-auto"
                    >
                      <CheckCircle size={12} />
                      {validationEnCours === s.id ? "…" : "Valider"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function OngletOrdresService({ suiviId }: { suiviId: string }) {
  const [ouvert, setOuvert] = useState(false);
  const [form, setForm] = useState({ type_ordre: "demarrage", date_emission: "", objet: "" });
  const queryClient = useQueryClient();

  const { data } = useQuery<{ results: OrdreService[] }>({
    queryKey: ["ordres-service", suiviId],
    queryFn: () => api.get(`/api/execution/${suiviId}/ordres-service/?ordering=-date_emission`),
  });

  const { mutate: creer, isPending } = useMutation({
    mutationFn: () => api.post(`/api/execution/${suiviId}/ordres-service/`, {
      suivi: suiviId,
      numero: (data?.results.length ?? 0) + 1,
      ...form,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ordres-service", suiviId] });
      setOuvert(false);
      setForm({ type_ordre: "demarrage", date_emission: "", objet: "" });
    },
  });

  const os = data?.results ?? [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600">
          <Send size={14} className="inline mr-1" />
          Ordres de service ({os.length})
        </p>
        <button onClick={() => setOuvert(!ouvert)} className="btn-secondaire text-xs flex items-center gap-1">
          <Plus size={12} /> Nouvel OS
        </button>
      </div>

      {ouvert && (
        <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-slate-50">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="libelle-champ">Type</label>
              <select className="champ-saisie" value={form.type_ordre}
                onChange={(e) => setForm(f => ({ ...f, type_ordre: e.target.value }))}>
                <option value="demarrage">Démarrage</option>
                <option value="arret">Arrêt</option>
                <option value="reprise">Reprise</option>
                <option value="modification">Modification</option>
                <option value="prolongation">Prolongation de délai</option>
              </select>
            </div>
            <div>
              <label className="libelle-champ">Date d&apos;émission</label>
              <input type="date" className="champ-saisie font-mono"
                value={form.date_emission}
                onChange={(e) => setForm(f => ({ ...f, date_emission: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="libelle-champ">Objet *</label>
            <input type="text" className="champ-saisie"
              value={form.objet}
              onChange={(e) => setForm(f => ({ ...f, objet: e.target.value }))}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setOuvert(false)} className="btn-secondaire text-xs">Annuler</button>
            <button onClick={() => creer()} disabled={isPending || !form.date_emission || !form.objet}
              className="btn-primaire text-xs">
              {isPending ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </div>
      )}

      {os.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-4">Aucun ordre de service.</p>
      ) : (
        <div className="space-y-2">
          {os.map((o) => (
            <div key={o.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-sm">
              <div>
                <span className="font-mono text-xs text-slate-500 mr-2">OS #{o.numero}</span>
                <span className="badge-neutre mr-2">{o.type_libelle}</span>
                <span className="font-medium">{o.objet}</span>
              </div>
              <span className="text-xs text-slate-400 shrink-0 ml-4">{formaterDate(o.date_emission)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Composant principal
// ---------------------------------------------------------------------------

type Onglet = "cr" | "situations" | "os";

export function SuiviExecutionProjet({ projetId }: { projetId: string }) {
  const [onglet, setOnglet] = useState<Onglet>("cr");
  const [erreurCreation, setErreurCreation] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: suivi, isLoading, isError } = useQuery<SuiviExecution>({
    queryKey: ["suivi-execution", projetId],
    queryFn: () => api.get(`/api/execution/?projet=${projetId}`).then(
      (d: { results?: SuiviExecution[] }) => {
        const liste = d.results ?? [];
        if (liste.length > 0) return liste[0];
        throw new Error("no_suivi");
      }
    ),
    retry: false,
  });

  const { mutate: creerSuivi, isPending: creationEnCours } = useMutation({
    mutationFn: () => api.post("/api/execution/", { projet: projetId }),
    onSuccess: () => {
      setErreurCreation(null);
      queryClient.invalidateQueries({ queryKey: ["suivi-execution", projetId] });
    },
    onError: (err) => {
      if (err instanceof ErreurApi) setErreurCreation(err.detail);
    },
  });

  if (isLoading) return <div className="carte py-12 text-center text-slate-400 text-sm">Chargement…</div>;

  if (isError || !suivi) {
    return (
      <div className="carte py-12 text-center text-slate-400 space-y-4">
        <p className="text-sm">Aucun dossier de suivi d&apos;exécution pour ce projet.</p>
        {erreurCreation && <p className="text-xs text-red-500">{erreurCreation}</p>}
        <button onClick={() => creerSuivi()} disabled={creationEnCours} className="btn-primaire text-xs">
          {creationEnCours ? "Création…" : "Ouvrir le dossier de suivi"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête dossier */}
      <div className="carte">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-500">Entreprise</p>
            <p className="font-medium mt-0.5">{suivi.entreprise_nom || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">OS démarrage</p>
            <p className="font-medium font-mono mt-0.5">{formaterDate(suivi.date_os_demarrage)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Fin contractuelle</p>
            <p className="font-medium font-mono mt-0.5">{formaterDate(suivi.date_fin_contractuelle)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Montant marché HT</p>
            <p className="font-medium font-mono mt-0.5">{formaterMontant(suivi.montant_marche_ht)}</p>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="carte space-y-4">
        <div className="flex gap-1 border-b border-slate-100 pb-3">
          {(["cr", "situations", "os"] as Onglet[]).map((o) => {
            const libelles = { cr: "Comptes rendus", situations: "Situations", os: "Ordres de service" };
            return (
              <button
                key={o}
                onClick={() => setOnglet(o)}
                className={clsx(
                  "px-3 py-1.5 text-sm rounded-lg transition-colors",
                  onglet === o
                    ? "bg-primaire-100 text-primaire-700 font-medium"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                {libelles[o]}
              </button>
            );
          })}
        </div>

        {onglet === "cr" && <OngletComptesRendus suiviId={suivi.id} />}
        {onglet === "situations" && <OngletSituations suiviId={suivi.id} />}
        {onglet === "os" && <OngletOrdresService suiviId={suivi.id} />}
      </div>
    </div>
  );
}
