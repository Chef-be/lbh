"""Sérialiseurs pour les appels d'offres — Plateforme BEE."""

from rest_framework import serializers
from .models import AppelOffres, OffreEntreprise


class OffreEntrepriseSerialiseur(serializers.ModelSerializer):
    entreprise_nom = serializers.CharField(source="entreprise.nom", read_only=True)
    statut_libelle = serializers.CharField(source="get_statut_display", read_only=True)

    class Meta:
        model = OffreEntreprise
        fields = [
            "id", "appel_offres", "entreprise", "entreprise_nom",
            "statut", "statut_libelle",
            "montant_offre_ht", "montant_negociee_ht",
            "delai_propose_jours",
            "notes_criteres", "note_globale",
            "observations", "date_reception",
        ]
        read_only_fields = [
            "id", "date_reception", "entreprise_nom", "statut_libelle",
        ]


class AppelOffresListeSerialiseur(serializers.ModelSerializer):
    type_libelle = serializers.CharField(source="get_type_procedure_display", read_only=True)
    statut_libelle = serializers.CharField(source="get_statut_display", read_only=True)
    projet_reference = serializers.CharField(source="projet.reference", read_only=True)
    nb_offres = serializers.SerializerMethodField()

    class Meta:
        model = AppelOffres
        fields = [
            "id", "projet", "projet_reference", "lot",
            "intitule", "type_procedure", "type_libelle",
            "statut", "statut_libelle",
            "date_limite_remise", "montant_estime_ht",
            "nb_offres",
            "date_creation",
        ]

    def get_nb_offres(self, obj):
        return obj.offres.count()


class AppelOffresDetailSerialiseur(serializers.ModelSerializer):
    type_libelle = serializers.CharField(source="get_type_procedure_display", read_only=True)
    statut_libelle = serializers.CharField(source="get_statut_display", read_only=True)
    projet_reference = serializers.CharField(source="projet.reference", read_only=True)
    offres = OffreEntrepriseSerialiseur(many=True, read_only=True)

    class Meta:
        model = AppelOffres
        fields = [
            "id", "projet", "projet_reference", "lot",
            "intitule", "type_procedure", "type_libelle",
            "statut", "statut_libelle",
            "date_publication", "date_limite_questions",
            "date_limite_remise", "date_ouverture_plis", "date_attribution",
            "montant_estime_ht", "criteres_jugement",
            "observations", "offres",
            "date_creation", "date_modification",
        ]
        read_only_fields = [
            "id", "date_creation", "date_modification",
            "type_libelle", "statut_libelle", "projet_reference",
        ]
