"""Vues API pour l'économie de la construction — Plateforme BEE."""

import sys
import os

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
            MoteurRentabilite,
            ParametresCalculEconomique,
        )
        from applications.parametres.models import Parametre

        def _taux(code: str, defaut: float) -> float:
            try:
                return float(Parametre.objects.get(cle=code).valeur_typee())
            except Exception:
                return defaut

        params = ParametresCalculEconomique(
            taux_frais_chantier=float(etude.taux_frais_chantier or _taux("TAUX_FRAIS_CHANTIER", 0.08)),
            taux_frais_generaux=float(etude.taux_frais_generaux or _taux("TAUX_FRAIS_GENERAUX", 0.12)),
            taux_aleas=float(etude.taux_aleas or _taux("TAUX_ALEAS", 0.03)),
            taux_marge=float(etude.taux_marge_cible or _taux("TAUX_MARGE_CIBLE", 0.10)),
            taux_pertes=float(etude.taux_pertes or _taux("TAUX_PERTES_MATIERES", 0.05)),
        )

        lignes = list(etude.lignes.all())
        moteur = MoteurRentabilite(params)

        a_sauvegarder = []
        for ligne in lignes:
            resultat = moteur.calculer_ligne(ligne)
            for champ, valeur in resultat.items():
                setattr(ligne, champ, valeur)
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
            ])

        # Recalcul des contributions relatives (après totaux connus)
        totaux = moteur.calculer_totaux(lignes)
        etude.total_debourse_sec = totaux["total_debourse_sec"]
        etude.total_cout_direct = totaux["total_cout_direct"]
        etude.total_cout_revient = totaux["total_cout_revient"]
        etude.total_prix_vente = totaux["total_prix_vente"]
        etude.total_marge_brute = totaux["total_marge_brute"]
        etude.total_marge_nette = totaux["total_marge_nette"]
        etude.taux_marge_nette_global = totaux["taux_marge_nette_global"]
        etude.save(update_fields=[
            "total_debourse_sec", "total_cout_direct", "total_cout_revient",
            "total_prix_vente", "total_marge_brute", "total_marge_nette",
            "taux_marge_nette_global",
        ])
        return len(a_sauvegarder)

    except ImportError:
        # Moteur non encore disponible — calcul différé
        return 0
