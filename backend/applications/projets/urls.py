"""
Routes URL pour les projets — Plateforme BEE.
"""

from django.urls import path
from .views import (
    VueListeProjets,
    VueDetailProjet,
    VueLotsProjet,
    VueIntervenantsProjet,
    vue_statistiques_projets,
)

urlpatterns = [
    path("", VueListeProjets.as_view(), name="projets-liste"),
    path("statistiques/", vue_statistiques_projets, name="projets-statistiques"),
    path("<uuid:pk>/", VueDetailProjet.as_view(), name="projets-detail"),
    path("<uuid:projet_id>/lots/", VueLotsProjet.as_view(), name="projets-lots"),
    path("<uuid:projet_id>/intervenants/", VueIntervenantsProjet.as_view(), name="projets-intervenants"),
]
