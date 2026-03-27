"""Routes URL pour le suivi d'exécution des travaux — Plateforme BEE."""

from django.urls import path
from . import views

urlpatterns = [
    # Suivis d'exécution
    path("", views.VueListeSuivisExecution.as_view(), name="suivis-liste"),
    path("<uuid:pk>/", views.VueDetailSuiviExecution.as_view(), name="suivi-detail"),

    # Comptes rendus de chantier
    path("<uuid:suivi_id>/comptes-rendus/", views.VueListeComptesRendus.as_view(), name="comptes-rendus-liste"),
    path("<uuid:suivi_id>/comptes-rendus/<uuid:pk>/", views.VueDetailCompteRendu.as_view(), name="compte-rendu-detail"),

    # Situations de travaux
    path("<uuid:suivi_id>/situations/", views.VueListeSituations.as_view(), name="situations-liste"),
    path("<uuid:suivi_id>/situations/<uuid:pk>/", views.VueDetailSituation.as_view(), name="situation-detail"),
    path("<uuid:suivi_id>/situations/<uuid:pk>/valider/", views.vue_valider_situation, name="situation-valider"),

    # Ordres de service
    path("<uuid:suivi_id>/ordres-service/", views.VueListeOrdresService.as_view(), name="ordres-service-liste"),
    path("<uuid:suivi_id>/ordres-service/<uuid:pk>/", views.VueDetailOrdreService.as_view(), name="ordre-service-detail"),
]
