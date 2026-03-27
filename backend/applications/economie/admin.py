"""Administration Django pour l'économie de la construction — Plateforme BEE."""

from django.contrib import admin
from .models import EtudeEconomique, LignePrix


class LignePrixInline(admin.TabularInline):
    model = LignePrix
    extra = 0
    fields = [
        "numero_ordre", "code", "designation", "unite",
        "quantite_prevue", "prix_vente_unitaire", "etat_rentabilite",
    ]
    readonly_fields = ["prix_vente_unitaire", "etat_rentabilite"]
    ordering = ["numero_ordre"]


@admin.register(EtudeEconomique)
class EtudeEconomiqueAdmin(admin.ModelAdmin):
    list_display = [
        "intitule", "projet", "statut", "version",
        "total_prix_vente", "taux_marge_nette_global", "date_modification",
    ]
    list_filter = ["statut", "est_variante"]
    search_fields = ["intitule", "projet__reference"]
    readonly_fields = [
        "total_debourse_sec", "total_cout_direct", "total_cout_revient",
        "total_prix_vente", "total_marge_brute", "total_marge_nette",
        "taux_marge_nette_global", "date_creation", "date_modification",
    ]
    raw_id_fields = ["projet", "lot", "etude_parente", "cree_par"]
    inlines = [LignePrixInline]


@admin.register(LignePrix)
class LignePrixAdmin(admin.ModelAdmin):
    list_display = [
        "code", "designation", "unite", "quantite_prevue",
        "prix_vente_unitaire", "etat_rentabilite", "etude",
    ]
    list_filter = ["etat_rentabilite"]
    search_fields = ["code", "designation"]
    readonly_fields = [
        "debourse_sec_unitaire", "cout_direct_unitaire", "cout_revient_unitaire",
        "prix_vente_unitaire", "marge_brute_unitaire", "marge_nette_unitaire",
        "taux_marge_nette", "marge_brute_totale", "marge_nette_totale",
        "contribution_marge", "etat_rentabilite", "seuil_quantite_critique",
        "seuil_prix_minimum", "causes_non_rentabilite",
    ]
    raw_id_fields = ["etude", "ref_bibliotheque"]
