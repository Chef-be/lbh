"""Sérialiseurs pour les métrés — Plateforme BEE."""

from rest_framework import serializers
from .models import Metre, LigneMetre


class LigneMetre_Serialiseur(serializers.ModelSerializer):
    montant_ht = serializers.SerializerMethodField()
    nature_libelle = serializers.CharField(source="get_nature_display", read_only=True)

    class Meta:
        model = LigneMetre
        fields = [
            "id", "metre", "numero_ordre", "code_article",
            "designation", "nature", "nature_libelle",
            "quantite", "unite", "detail_calcul",
            "prix_unitaire_ht", "montant_ht",
            "ligne_bibliotheque", "observations",
        ]
        read_only_fields = ["id", "montant_ht", "nature_libelle"]

    def get_montant_ht(self, obj):
        m = obj.montant_ht
        return float(m) if m is not None else None


class MetreListeSerialiseur(serializers.ModelSerializer):
    type_libelle = serializers.CharField(source="get_type_metre_display", read_only=True)
    statut_libelle = serializers.CharField(source="get_statut_display", read_only=True)
    montant_total_ht = serializers.SerializerMethodField()
    projet_reference = serializers.CharField(source="projet.reference", read_only=True)

    class Meta:
        model = Metre
        fields = [
            "id", "projet", "projet_reference", "lot",
            "type_metre", "type_libelle",
            "intitule", "statut", "statut_libelle",
            "montant_total_ht",
            "date_creation", "date_modification",
        ]

    def get_montant_total_ht(self, obj):
        return float(obj.montant_total_ht)


class MetreDetailSerialiseur(serializers.ModelSerializer):
    lignes = LigneMetre_Serialiseur(many=True, read_only=True)
    type_libelle = serializers.CharField(source="get_type_metre_display", read_only=True)
    statut_libelle = serializers.CharField(source="get_statut_display", read_only=True)
    montant_total_ht = serializers.SerializerMethodField()
    projet_reference = serializers.CharField(source="projet.reference", read_only=True)

    class Meta:
        model = Metre
        fields = [
            "id", "projet", "projet_reference", "lot",
            "type_metre", "type_libelle",
            "intitule", "statut", "statut_libelle",
            "montant_total_ht",
            "lignes",
            "date_creation", "date_modification",
        ]
        read_only_fields = [
            "id", "date_creation", "date_modification",
            "montant_total_ht", "type_libelle", "statut_libelle", "projet_reference",
        ]

    def get_montant_total_ht(self, obj):
        return float(obj.montant_total_ht)
