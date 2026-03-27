"""Administration Django pour la bibliothèque de prix — Plateforme BEE."""

from django.contrib import admin
from .models import LignePrixBibliotheque


@admin.register(LignePrixBibliotheque)
class LignePrixBibliothequeAdmin(admin.ModelAdmin):
    list_display = [
        "code", "designation_courte", "famille", "sous_famille",
        "unite", "debourse_sec_unitaire", "prix_vente_unitaire",
        "niveau", "statut_validation", "fiabilite",
    ]
    list_filter = ["niveau", "statut_validation", "famille"]
    search_fields = ["code", "designation_courte", "designation_longue", "famille"]
    readonly_fields = ["date_creation", "date_modification"]
    raw_id_fields = ["organisation", "projet", "auteur", "ligne_parente"]
    ordering = ["famille", "sous_famille", "code"]
