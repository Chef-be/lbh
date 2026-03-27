"""Sérialiseurs pour la gestion documentaire — Plateforme BEE."""

from rest_framework import serializers
from .models import TypeDocument, Document, AnnotationDocument, DiffusionDocument


class TypeDocumentSerialiseur(serializers.ModelSerializer):
    class Meta:
        model = TypeDocument
        fields = ["id", "code", "libelle", "description", "icone", "ordre_affichage"]
        read_only_fields = ["id"]


class AnnotationDocumentSerialiseur(serializers.ModelSerializer):
    auteur_nom = serializers.SerializerMethodField()

    class Meta:
        model = AnnotationDocument
        fields = [
            "id", "document", "auteur", "auteur_nom",
            "contenu", "page", "resolue", "date_creation",
        ]
        read_only_fields = ["id", "auteur_nom", "date_creation"]

    def get_auteur_nom(self, obj):
        return f"{obj.auteur.prenom} {obj.auteur.nom}"


class DiffusionDocumentSerialiseur(serializers.ModelSerializer):
    destinataire_nom = serializers.CharField(source="destinataire.nom", read_only=True)
    mode_libelle = serializers.CharField(source="get_mode_diffusion_display", read_only=True)

    class Meta:
        model = DiffusionDocument
        fields = [
            "id", "document", "destinataire", "destinataire_nom",
            "destinataire_contact", "mode_diffusion", "mode_libelle",
            "date_diffusion", "observations",
        ]
        read_only_fields = ["id", "date_diffusion", "destinataire_nom", "mode_libelle"]


class DocumentListeSerialiseur(serializers.ModelSerializer):
    type_libelle = serializers.CharField(source="type_document.libelle", read_only=True)
    statut_libelle = serializers.CharField(source="get_statut_display", read_only=True)
    auteur_nom = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            "id", "reference", "intitule",
            "type_document", "type_libelle",
            "projet", "lot", "version", "est_version_courante",
            "statut", "statut_libelle", "origine",
            "taille_octets", "type_mime",
            "auteur", "auteur_nom",
            "date_creation", "date_modification",
        ]

    def get_auteur_nom(self, obj):
        if obj.auteur:
            return f"{obj.auteur.prenom} {obj.auteur.nom}"
        return None


class DocumentDetailSerialiseur(serializers.ModelSerializer):
    type_libelle = serializers.CharField(source="type_document.libelle", read_only=True)
    statut_libelle = serializers.CharField(source="get_statut_display", read_only=True)
    auteur_nom = serializers.SerializerMethodField()
    valide_par_nom = serializers.SerializerMethodField()
    annotations = AnnotationDocumentSerialiseur(many=True, read_only=True)
    diffusions = DiffusionDocumentSerialiseur(many=True, read_only=True)

    class Meta:
        model = Document
        fields = [
            "id", "reference", "intitule",
            "type_document", "type_libelle",
            "projet", "lot",
            "version", "est_version_courante", "document_parent",
            "fichier", "nom_fichier_origine", "taille_octets", "type_mime", "empreinte_sha256",
            "statut", "statut_libelle", "origine",
            "ocr_effectue", "contenu_texte", "mots_cles",
            "auteur", "auteur_nom",
            "date_creation", "date_modification", "date_validation",
            "valide_par", "valide_par_nom",
            "acces_client", "acces_partenaire", "confidentiel",
            "annotations", "diffusions",
        ]
        read_only_fields = [
            "id", "date_creation", "date_modification",
            "empreinte_sha256", "ocr_effectue", "contenu_texte", "mots_cles",
            "auteur_nom", "valide_par_nom", "type_libelle", "statut_libelle",
        ]

    def get_auteur_nom(self, obj):
        if obj.auteur:
            return f"{obj.auteur.prenom} {obj.auteur.nom}"
        return None

    def get_valide_par_nom(self, obj):
        if obj.valide_par:
            return f"{obj.valide_par.prenom} {obj.valide_par.nom}"
        return None
