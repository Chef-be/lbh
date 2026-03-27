"""Sérialiseurs pour la supervision — Plateforme BEE."""

from rest_framework import serializers
from .models import EvenementSysteme, MetriqueService, AlerteSupervision


class EvenementSystemeSerialiseur(serializers.ModelSerializer):
    niveau_libelle = serializers.CharField(source="get_niveau_display", read_only=True)
    categorie_libelle = serializers.CharField(source="get_categorie_display", read_only=True)
    utilisateur_nom = serializers.SerializerMethodField()

    class Meta:
        model = EvenementSysteme
        fields = [
            "id", "niveau", "niveau_libelle", "categorie", "categorie_libelle",
            "message", "details", "source", "adresse_ip",
            "utilisateur", "utilisateur_nom",
            "date_evenement", "resolu", "date_resolution",
        ]
        read_only_fields = fields

    def get_utilisateur_nom(self, obj):
        if obj.utilisateur:
            return f"{obj.utilisateur.prenom} {obj.utilisateur.nom}"
        return None


class MetriqueServiceSerialiseur(serializers.ModelSerializer):
    service_libelle = serializers.CharField(source="get_service_display", read_only=True)

    class Meta:
        model = MetriqueService
        fields = [
            "id", "service", "service_libelle",
            "disponible", "temps_reponse_ms",
            "charge_cpu_pct", "memoire_pct",
            "details", "horodatage",
        ]
        read_only_fields = fields


class AlerteSupervisionSerialiseur(serializers.ModelSerializer):
    type_libelle = serializers.CharField(source="get_type_alerte_display", read_only=True)
    niveau_libelle = serializers.CharField(source="get_niveau_display", read_only=True)
    acquittee_par_nom = serializers.SerializerMethodField()

    class Meta:
        model = AlerteSupervision
        fields = [
            "id", "type_alerte", "type_libelle",
            "niveau", "niveau_libelle",
            "titre", "description", "service_concerne",
            "est_active", "date_declenchement", "date_resolution",
            "acquittee_par", "acquittee_par_nom",
        ]
        read_only_fields = [
            f for f in fields
            if f not in ("est_active", "acquittee_par")
        ]

    def get_acquittee_par_nom(self, obj):
        if obj.acquittee_par:
            return f"{obj.acquittee_par.prenom} {obj.acquittee_par.nom}"
        return None
