"""Sérialiseurs pour le suivi d'exécution des travaux — Plateforme BEE."""

from rest_framework import serializers
from .models import SuiviExecution, CompteRenduChantier, SituationTravaux, OrdreService


class OrdreServiceSerialiseur(serializers.ModelSerializer):
    type_libelle = serializers.CharField(source="get_type_ordre_display", read_only=True)

    class Meta:
        model = OrdreService
        fields = [
            "id", "suivi", "numero", "type_ordre", "type_libelle",
            "date_emission", "objet", "contenu",
        ]
        read_only_fields = ["id", "type_libelle"]


class SituationTravauxSerialiseur(serializers.ModelSerializer):
    statut_libelle = serializers.CharField(source="get_statut_display", read_only=True)

    class Meta:
        model = SituationTravaux
        fields = [
            "id", "suivi", "numero",
            "periode_debut", "periode_fin",
            "statut", "statut_libelle",
            "montant_cumule_ht", "montant_periode_ht",
            "avancement_financier_pct",
            "date_creation", "date_modification",
        ]
        read_only_fields = ["id", "date_creation", "date_modification", "statut_libelle"]


class CompteRenduChantierSerialiseur(serializers.ModelSerializer):
    redacteur_nom = serializers.SerializerMethodField()

    class Meta:
        model = CompteRenduChantier
        fields = [
            "id", "suivi", "numero", "date_reunion",
            "redacteur", "redacteur_nom",
            "ordre_du_jour", "contenu", "decisions",
            "avancement_physique_pct",
            "date_creation", "date_diffusion",
        ]
        read_only_fields = ["id", "date_creation", "redacteur_nom"]

    def get_redacteur_nom(self, obj):
        if obj.redacteur:
            return f"{obj.redacteur.prenom} {obj.redacteur.nom}"
        return None


class SuiviExecutionSerialiseur(serializers.ModelSerializer):
    montant_total_ht = serializers.SerializerMethodField()
    entreprise_nom = serializers.SerializerMethodField()
    projet_reference = serializers.CharField(source="projet.reference", read_only=True)

    class Meta:
        model = SuiviExecution
        fields = [
            "id", "projet", "projet_reference",
            "entreprise_principale", "entreprise_nom",
            "date_os_demarrage", "duree_contractuelle_jours", "date_fin_contractuelle",
            "montant_marche_ht", "montant_travaux_supplementaires_ht", "montant_total_ht",
            "date_creation", "date_modification",
        ]
        read_only_fields = [
            "id", "date_creation", "date_modification",
            "montant_total_ht", "entreprise_nom", "projet_reference",
        ]

    def get_montant_total_ht(self, obj):
        return float(obj.montant_total_ht)

    def get_entreprise_nom(self, obj):
        if obj.entreprise_principale:
            return obj.entreprise_principale.nom
        return None
