"""Sérialiseurs pour les pièces écrites — Plateforme BEE."""

from rest_framework import serializers
from .models import ModeleDocument, PieceEcrite, ArticleCCTP


class ModeleDocumentSerialiseur(serializers.ModelSerializer):
    type_libelle = serializers.CharField(source="get_type_document_display", read_only=True)

    class Meta:
        model = ModeleDocument
        fields = [
            "id", "code", "libelle", "type_document", "type_libelle",
            "description", "gabarit", "variables_fusion", "est_actif",
            "date_creation", "date_modification",
        ]
        read_only_fields = ["id", "date_creation", "date_modification", "type_libelle"]


class ArticleCCTPSerialiseur(serializers.ModelSerializer):
    class Meta:
        model = ArticleCCTP
        fields = [
            "id", "piece_ecrite", "chapitre", "numero_article",
            "intitule", "corps_article",
            "normes_applicables", "est_dans_bibliotheque", "tags",
            "date_creation", "date_modification",
        ]
        read_only_fields = ["id", "date_creation", "date_modification"]


class PieceEcriteListeSerialiseur(serializers.ModelSerializer):
    modele_libelle = serializers.CharField(source="modele.libelle", read_only=True)
    statut_libelle = serializers.CharField(source="get_statut_display", read_only=True)
    projet_reference = serializers.CharField(source="projet.reference", read_only=True)

    class Meta:
        model = PieceEcrite
        fields = [
            "id", "projet", "projet_reference", "lot",
            "modele", "modele_libelle",
            "intitule", "statut", "statut_libelle",
            "date_creation", "date_modification",
        ]


class PieceEcriteDetailSerialiseur(serializers.ModelSerializer):
    articles = ArticleCCTPSerialiseur(many=True, read_only=True)
    modele_libelle = serializers.CharField(source="modele.libelle", read_only=True)
    statut_libelle = serializers.CharField(source="get_statut_display", read_only=True)
    projet_reference = serializers.CharField(source="projet.reference", read_only=True)
    redacteur_nom = serializers.SerializerMethodField()

    class Meta:
        model = PieceEcrite
        fields = [
            "id", "projet", "projet_reference", "lot",
            "modele", "modele_libelle",
            "intitule", "statut", "statut_libelle",
            "contenu_html", "fichier_genere", "date_generation",
            "redacteur", "redacteur_nom",
            "articles",
            "date_creation", "date_modification",
        ]
        read_only_fields = [
            "id", "date_creation", "date_modification", "date_generation",
            "modele_libelle", "statut_libelle", "projet_reference", "redacteur_nom",
        ]

    def get_redacteur_nom(self, obj):
        if obj.redacteur:
            return f"{obj.redacteur.prenom} {obj.redacteur.nom}"
        return None
