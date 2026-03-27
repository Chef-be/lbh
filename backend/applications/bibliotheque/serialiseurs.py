"""Sérialiseurs pour la bibliothèque de prix — Plateforme BEE."""

from rest_framework import serializers
from .models import LignePrixBibliotheque


class LignePrixBibliothequeListeSerialiseur(serializers.ModelSerializer):
    """Sérialiseur allégé pour les listes et la sélection."""

    class Meta:
        model = LignePrixBibliotheque
        fields = [
            "id", "niveau", "code", "famille", "sous_famille",
            "designation_courte", "unite",
            "debourse_sec_unitaire", "prix_vente_unitaire",
            "fiabilite", "statut_validation",
        ]


class LignePrixBibliothequeDetailSerialiseur(serializers.ModelSerializer):
    """Sérialiseur complet pour la création et la modification."""
    auteur_nom = serializers.SerializerMethodField()
    niveau_libelle = serializers.CharField(source="get_niveau_display", read_only=True)
    statut_libelle = serializers.CharField(source="get_statut_validation_display", read_only=True)

    class Meta:
        model = LignePrixBibliotheque
        fields = [
            "id", "niveau", "niveau_libelle",
            "organisation", "projet",
            "code", "famille", "sous_famille", "corps_etat", "lot",
            "designation_longue", "designation_courte", "unite",
            "hypotheses", "contexte_emploi",
            "observations_techniques", "observations_economiques",
            "temps_main_oeuvre", "cout_horaire_mo",
            "cout_matieres", "cout_materiel", "cout_sous_traitance", "cout_transport",
            "debourse_sec_unitaire", "prix_vente_unitaire",
            "source", "auteur", "auteur_nom", "fiabilite",
            "periode_validite_debut", "periode_validite_fin",
            "version", "statut_validation", "statut_libelle",
            "ligne_parente",
            "territoire", "saison", "coefficient_territoire",
            "date_creation", "date_modification",
        ]
        read_only_fields = ["id", "date_creation", "date_modification", "auteur_nom"]

    def get_auteur_nom(self, obj):
        if obj.auteur:
            return f"{obj.auteur.prenom} {obj.auteur.nom}"
        return None
