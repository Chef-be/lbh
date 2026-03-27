"""Vues API pour l'économie de la construction — Plateforme BEE."""

import sys
import os
from decimal import Decimal, ROUND_HALF_UP

from rest_framework import generics, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import EtudeEconomique, LignePrix
from .serialiseurs import (
    EtudeEconomiqueListeSerialiseur,
    EtudeEconomiqueDetailSerialiseur,
    LignePrixSerialiseur,
)


class VueListeEtudesEconomiques(generics.ListCreateAPIView):
    """Liste et création d'études économiques."""
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["intitule", "projet__reference", "lot__intitule"]
    ordering = ["-date_modification"]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return EtudeEconomiqueDetailSerialiseur
        return EtudeEconomiqueListeSerialiseur

    def get_queryset(self):
        qs = EtudeEconomique.objects.select_related("projet", "lot", "etude_parente")
        projet_id = self.request.query_params.get("projet")
        if projet_id:
            qs = qs.filter(projet_id=projet_id)
        statut = self.request.query_params.get("statut")
        if statut:
            qs = qs.filter(statut=statut)
        variantes = self.request.query_params.get("variantes")
        if variantes == "0":
            qs = qs.filter(est_variante=False)
        return qs

    def perform_create(self, serializer):
        serializer.save(cree_par=self.request.user)


class VueDetailEtudeEconomique(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'une étude économique."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = EtudeEconomiqueDetailSerialiseur

    def get_queryset(self):
        return EtudeEconomique.objects.select_related(
            "projet", "lot", "etude_parente"
        ).prefetch_related("lignes")

    def destroy(self, request, *args, **kwargs):
        etude = self.get_object()
        if etude.statut == "validee":
            return Response(
                {"detail": "Une étude validée ne peut pas être supprimée."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        etude.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class VueListeLignesPrix(generics.ListCreateAPIView):
    """Lignes de prix d'une étude économique."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = LignePrixSerialiseur
    ordering = ["numero_ordre"]

    def get_queryset(self):
        return LignePrix.objects.filter(
            etude_id=self.kwargs["etude_id"]
        ).select_related("ref_bibliotheque")

    def perform_create(self, serializer):
        etude = generics.get_object_or_404(EtudeEconomique, pk=self.kwargs["etude_id"])
        serializer.save(etude=etude)
        _recalculer_etude(etude)


class VueDetailLignePrix(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et suppression d'une ligne de prix."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = LignePrixSerialiseur

    def get_queryset(self):
        return LignePrix.objects.filter(etude_id=self.kwargs["etude_id"])

    def perform_update(self, serializer):
        instance = serializer.save()
        _recalculer_etude(instance.etude)

    def perform_destroy(self, instance):
        etude = instance.etude
        instance.delete()
        _recalculer_etude(etude)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def vue_recalculer_etude(request, pk):
    """Déclenche un recalcul complet de l'étude économique."""
    etude = generics.get_object_or_404(EtudeEconomique, pk=pk)
    nb_lignes = _recalculer_etude(etude)
    return Response({
        "detail": f"Recalcul effectué : {nb_lignes} ligne(s) traitée(s).",
        "nb_lignes": nb_lignes,
    })


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def vue_dupliquer_etude(request, pk):
    """Crée une copie de l'étude (variante ou nouvelle version)."""
    etude = generics.get_object_or_404(EtudeEconomique, pk=pk)
    est_variante = request.data.get("est_variante", False)

    nouvelle_etude = EtudeEconomique.objects.create(
        projet=etude.projet,
        lot=etude.lot,
        intitule=f"{etude.intitule} — Copie",
        statut="brouillon",
        version=etude.version + 1 if not est_variante else 1,
        est_variante=est_variante,
        etude_parente=etude if est_variante else etude.etude_parente,
        taux_frais_chantier=etude.taux_frais_chantier,
        taux_frais_generaux=etude.taux_frais_generaux,
        taux_aleas=etude.taux_aleas,
        taux_marge_cible=etude.taux_marge_cible,
        taux_pertes=etude.taux_pertes,
        cree_par=request.user,
    )

    for ligne in etude.lignes.all():
        LignePrix.objects.create(
            etude=nouvelle_etude,
            ref_bibliotheque=ligne.ref_bibliotheque,
            numero_ordre=ligne.numero_ordre,
            code=ligne.code,
            designation=ligne.designation,
            unite=ligne.unite,
            quantite_prevue=ligne.quantite_prevue,
            temps_main_oeuvre=ligne.temps_main_oeuvre,
            cout_horaire_mo=ligne.cout_horaire_mo,
            cout_matieres=ligne.cout_matieres,
            cout_materiel=ligne.cout_materiel,
            cout_sous_traitance=ligne.cout_sous_traitance,
            cout_transport=ligne.cout_transport,
            taux_pertes_surcharge=ligne.taux_pertes_surcharge,
            taux_frais_chantier_surcharge=ligne.taux_frais_chantier_surcharge,
            taux_frais_generaux_surcharge=ligne.taux_frais_generaux_surcharge,
            taux_aleas_surcharge=ligne.taux_aleas_surcharge,
            taux_marge_surcharge=ligne.taux_marge_surcharge,
            observations=ligne.observations,
        )

    _recalculer_etude(nouvelle_etude)

    serialiseur = EtudeEconomiqueDetailSerialiseur(
        nouvelle_etude, context={"request": request}
    )
    return Response(serialiseur.data, status=status.HTTP_201_CREATED)


def _recalculer_etude(etude: EtudeEconomique) -> int:
    """
    Appelle le moteur de rentabilité sur toutes les lignes de l'étude
    et met à jour les totaux. Retourne le nombre de lignes traitées.
    """
    try:
        # Chemin vers le moteur de calcul (hors du package Django)
        racine = os.path.dirname(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        )
        if racine not in sys.path:
            sys.path.insert(0, racine)
        from calculs.economie.moteur_rentabilite import (
            calculer_ligne,
            ParametresCalcul,
            ComposantesDebourse,
        )
        from applications.parametres.models import Parametre

        def _taux(code: str, defaut: str) -> Decimal:
            try:
                return Decimal(str(Parametre.objects.get(cle=code).valeur_typee()))
            except Exception:
                return Decimal(defaut)

        params = ParametresCalcul(
            taux_frais_chantier=Decimal(str(etude.taux_frais_chantier)) if etude.taux_frais_chantier else _taux("TAUX_FRAIS_CHANTIER", "0.08"),
            taux_frais_generaux=Decimal(str(etude.taux_frais_generaux)) if etude.taux_frais_generaux else _taux("TAUX_FRAIS_GENERAUX", "0.12"),
            taux_aleas=Decimal(str(etude.taux_aleas)) if etude.taux_aleas else _taux("TAUX_ALEAS", "0.03"),
            taux_marge_cible=Decimal(str(etude.taux_marge_cible)) if etude.taux_marge_cible else _taux("TAUX_MARGE_CIBLE", "0.10"),
            taux_pertes=Decimal(str(etude.taux_pertes)) if etude.taux_pertes else _taux("TAUX_PERTES_MATIERES", "0.05"),
        )

        lignes = list(etude.lignes.all())
        if not lignes:
            return 0

        # Calcul de chaque ligne via le moteur
        resultats = []
        for ligne in lignes:
            if not ligne.quantite_prevue or ligne.quantite_prevue <= 0:
                continue
            composantes = ComposantesDebourse(
                temps_main_oeuvre=ligne.temps_main_oeuvre,
                cout_horaire_mo=ligne.cout_horaire_mo,
                cout_matieres=ligne.cout_matieres,
                cout_materiel=ligne.cout_materiel,
                cout_sous_traitance=ligne.cout_sous_traitance,
                cout_transport=ligne.cout_transport,
            )
            res = calculer_ligne(
                composantes=composantes,
                quantite_prevue=ligne.quantite_prevue,
                params=params,
                taux_pertes_surcharge=ligne.taux_pertes_surcharge,
                taux_frais_chantier_surcharge=ligne.taux_frais_chantier_surcharge,
                taux_frais_generaux_surcharge=ligne.taux_frais_generaux_surcharge,
                taux_aleas_surcharge=ligne.taux_aleas_surcharge,
                taux_marge_surcharge=ligne.taux_marge_surcharge,
                quantite_reelle=ligne.quantite_reelle,
            )
            resultats.append((ligne, res))

        # Calcul des totaux pour contribution_marge
        total_marge_nette = sum(r.marge_nette_totale for _, r in resultats)
        total_prix_vente = sum(r.prix_vente_unitaire * r.quantite_prevue for _, r in resultats)

        # Application des résultats sur les lignes
        a_sauvegarder = []
        for ligne, res in resultats:
            ligne.debourse_sec_unitaire = res.debourse_sec_unitaire
            ligne.cout_direct_unitaire = res.cout_direct_unitaire
            ligne.cout_revient_unitaire = res.cout_revient_unitaire
            ligne.prix_vente_unitaire = res.prix_vente_unitaire
            ligne.marge_brute_unitaire = res.marge_brute_unitaire
            ligne.marge_nette_unitaire = res.marge_nette_unitaire
            ligne.taux_marge_nette = res.taux_marge_nette
            ligne.marge_brute_totale = res.marge_brute_totale
            ligne.marge_nette_totale = res.marge_nette_totale
            ligne.etat_rentabilite = res.etat_rentabilite.value
            ligne.seuil_quantite_critique = res.seuil_quantite_critique
            ligne.seuil_prix_minimum = res.seuil_prix_minimum
            ligne.causes_non_rentabilite = res.causes_non_rentabilite
            ligne.indice_sensibilite_quantite = res.indice_sensibilite_quantite
            ligne.indice_sensibilite_main_oeuvre = res.indice_sensibilite_main_oeuvre
            ligne.indice_sensibilite_matieres = res.indice_sensibilite_matieres
            if total_marge_nette and total_marge_nette != 0:
                ligne.contribution_marge = (res.marge_nette_totale / total_marge_nette).quantize(
                    Decimal("0.0001"), rounding=ROUND_HALF_UP,
                )
            else:
                ligne.contribution_marge = Decimal("0")
            a_sauvegarder.append(ligne)

        # Mise à jour en masse
        if a_sauvegarder:
            LignePrix.objects.bulk_update(a_sauvegarder, [
                "debourse_sec_unitaire", "cout_direct_unitaire",
                "cout_revient_unitaire", "prix_vente_unitaire",
                "marge_brute_unitaire", "marge_nette_unitaire", "taux_marge_nette",
                "marge_brute_totale", "marge_nette_totale", "contribution_marge",
                "etat_rentabilite", "seuil_quantite_critique", "seuil_prix_minimum",
                "causes_non_rentabilite",
                "indice_sensibilite_quantite", "indice_sensibilite_main_oeuvre",
                "indice_sensibilite_matieres",
            ])

        # Agrégation des totaux pour l'étude
        total_ds = sum(r.debourse_sec_total for _, r in resultats)
        total_cd = sum(r.cout_direct_unitaire * r.quantite_prevue for _, r in resultats)
        total_cr = sum(r.cout_revient_unitaire * r.quantite_prevue for _, r in resultats)
        total_mb = sum(r.marge_brute_totale for _, r in resultats)
        tau_global = (
            (total_marge_nette / total_prix_vente).quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)
            if total_prix_vente else Decimal("0")
        )

        etude.total_debourse_sec = total_ds
        etude.total_cout_direct = total_cd
        etude.total_cout_revient = total_cr
        etude.total_prix_vente = total_prix_vente
        etude.total_marge_brute = total_mb
        etude.total_marge_nette = total_marge_nette
        etude.taux_marge_nette_global = tau_global
        etude.save(update_fields=[
            "total_debourse_sec", "total_cout_direct", "total_cout_revient",
            "total_prix_vente", "total_marge_brute", "total_marge_nette",
            "taux_marge_nette_global",
        ])
        return len(a_sauvegarder)

    except ImportError:
        # Moteur non encore disponible — calcul différé
        return 0
