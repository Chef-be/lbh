"""
Sérialiseurs pour l'application Projets — Plateforme BEE.
"""

from rest_framework import serializers
from .models import Projet, Lot, Intervenant


class LotSerialiseur(serializers.ModelSerializer):
    class Meta:
        model = Lot
        fields = [
            "id", "numero", "intitule", "description", "montant_estime",
        ]


class IntervenantSerialiseur(serializers.ModelSerializer):
    utilisateur_nom = serializers.CharField(source="utilisateur.nom_complet", read_only=True)
    role_libelle = serializers.CharField(source="get_role_display", read_only=True)

    class Meta:
        model = Intervenant
        fields = [
            "id", "utilisateur", "utilisateur_nom",
            "role", "role_libelle",
            "date_debut", "date_fin",
        ]


class ProjetListeSerialiseur(serializers.ModelSerializer):
    """Sérialiseur allégé pour les listes de projets."""

    organisation_nom = serializers.CharField(source="organisation.nom", read_only=True)
    responsable_nom = serializers.CharField(source="responsable.nom_complet", read_only=True)

    class Meta:
        model = Projet
        fields = [
            "id", "reference", "intitule", "type_projet",
            "statut", "phase_actuelle",
            "organisation", "organisation_nom",
            "responsable", "responsable_nom",
            "commune", "departement",
            "montant_estime", "montant_marche",
            "date_debut_prevue", "date_fin_prevue",
            "date_modification",
        ]


class ProjetDetailSerialiseur(serializers.ModelSerializer):
    """Sérialiseur complet pour la fiche projet."""

    lots = LotSerialiseur(many=True, read_only=True)
    intervenants = IntervenantSerialiseur(many=True, read_only=True)
    organisation_nom = serializers.CharField(source="organisation.nom", read_only=True)
    responsable_nom = serializers.CharField(source="responsable.nom_complet", read_only=True)
    maitre_ouvrage_nom = serializers.CharField(
        source="maitre_ouvrage.nom", read_only=True, allow_null=True,
    )

    class Meta:
        model = Projet
        fields = [
            "id", "reference", "intitule", "type_projet",
            "statut", "phase_actuelle",
            "organisation", "organisation_nom",
            "maitre_ouvrage", "maitre_ouvrage_nom",
            "maitre_oeuvre",
            "responsable", "responsable_nom",
            "commune", "departement",
            "date_debut_prevue", "date_fin_prevue",
            "date_debut_reelle", "date_fin_reelle",
            "montant_estime", "montant_marche", "honoraires_prevus",
            "description", "observations",
            "publier_sur_site",
            "lots", "intervenants",
            "date_creation", "date_modification",
        ]
        read_only_fields = ["id", "reference", "date_creation", "date_modification"]
