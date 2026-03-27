"""Sérialiseurs pour l'économie de la construction — Plateforme BEE."""

from rest_framework import serializers
from .models import EtudeEconomique, LignePrix


class LignePrixSerialiseur(serializers.ModelSerializer):
    etat_libelle = serializers.CharField(source="get_etat_rentabilite_display", read_only=True)

    class Meta:
        model = LignePrix
        fields = [
            "id", "numero_ordre", "code", "designation", "unite",
            "quantite_prevue", "quantite_reelle",
            "temps_main_oeuvre", "cout_horaire_mo",
            "cout_matieres", "cout_materiel", "cout_sous_traitance", "cout_transport",
            "taux_pertes_surcharge", "taux_frais_chantier_surcharge",
            "taux_frais_generaux_surcharge", "taux_aleas_surcharge", "taux_marge_surcharge",
            "debourse_sec_unitaire", "cout_direct_unitaire",
            "cout_revient_unitaire", "prix_vente_unitaire",
            "marge_brute_unitaire", "marge_nette_unitaire", "taux_marge_nette",
            "marge_brute_totale", "marge_nette_totale", "contribution_marge",
            "etat_rentabilite", "etat_libelle",
            "seuil_quantite_critique", "seuil_prix_minimum",
            "causes_non_rentabilite", "observations",
            "ref_bibliotheque",
        ]
        read_only_fields = [
            "debourse_sec_unitaire", "cout_direct_unitaire",
            "cout_revient_unitaire", "prix_vente_unitaire",
            "marge_brute_unitaire", "marge_nette_unitaire", "taux_marge_nette",
            "marge_brute_totale", "marge_nette_totale", "contribution_marge",
            "etat_rentabilite", "seuil_quantite_critique", "seuil_prix_minimum",
            "causes_non_rentabilite",
        ]


class EtudeEconomiqueListeSerialiseur(serializers.ModelSerializer):
    """Sérialiseur allégé pour les listes."""
    projet_reference = serializers.CharField(source="projet.reference", read_only=True)

    class Meta:
        model = EtudeEconomique
        fields = [
            "id", "projet", "projet_reference", "lot",
            "intitule", "statut", "version", "est_variante",
            "total_prix_vente", "taux_marge_nette_global",
            "date_modification",
        ]


class EtudeEconomiqueDetailSerialiseur(serializers.ModelSerializer):
    """Sérialiseur complet avec lignes."""
    lignes = LignePrixSerialiseur(many=True, read_only=True)
    projet_reference = serializers.CharField(source="projet.reference", read_only=True)

    class Meta:
        model = EtudeEconomique
        fields = [
            "id", "projet", "projet_reference", "lot",
            "intitule", "statut", "version", "est_variante", "etude_parente",
            "taux_frais_chantier", "taux_frais_generaux",
            "taux_aleas", "taux_marge_cible", "taux_pertes",
            "total_debourse_sec", "total_cout_direct",
            "total_cout_revient", "total_prix_vente",
            "total_marge_brute", "total_marge_nette", "taux_marge_nette_global",
            "lignes",
            "date_creation", "date_modification",
        ]
        read_only_fields = [
            "id", "total_debourse_sec", "total_cout_direct",
            "total_cout_revient", "total_prix_vente",
            "total_marge_brute", "total_marge_nette", "taux_marge_nette_global",
            "date_creation", "date_modification",
        ]
