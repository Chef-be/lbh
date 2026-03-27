"""Sérialiseurs pour le site vitrine public — Plateforme BEE."""

from rest_framework import serializers
from .models import Prestation, Realisation, MembreEquipe, DemandeContact


class PrestationSerialiseur(serializers.ModelSerializer):
    class Meta:
        model = Prestation
        fields = [
            "id", "titre", "description_courte", "description_longue",
            "icone", "ordre_affichage", "est_publie", "date_modification",
        ]
        read_only_fields = ["id", "date_modification"]


class RealisationSerialiseur(serializers.ModelSerializer):
    class Meta:
        model = Realisation
        fields = [
            "id", "projet", "titre", "description",
            "client", "lieu", "annee", "montant_travaux_ht",
            "image_principale", "tags",
            "est_publie", "ordre_affichage", "date_publication",
        ]
        read_only_fields = ["id"]


class MembreEquipeSerialiseur(serializers.ModelSerializer):
    class Meta:
        model = MembreEquipe
        fields = [
            "id", "utilisateur", "prenom", "nom", "fonction",
            "biographie", "photo", "ordre_affichage", "est_publie",
        ]
        read_only_fields = ["id"]


class DemandeContactSerialiseur(serializers.ModelSerializer):
    sujet_libelle = serializers.CharField(source="get_sujet_display", read_only=True)

    class Meta:
        model = DemandeContact
        fields = [
            "id", "nom", "courriel", "telephone", "organisation",
            "sujet", "sujet_libelle", "message",
            "traitee", "date_reception", "adresse_ip",
        ]
        read_only_fields = [
            "id", "traitee", "date_reception", "adresse_ip", "sujet_libelle",
        ]
