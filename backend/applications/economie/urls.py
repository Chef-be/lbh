"""Routes URL pour l'économie de la construction — Plateforme BEE."""

from django.urls import path
from . import views

urlpatterns = [
    # Études économiques
    path("", views.VueListeEtudesEconomiques.as_view(), name="etudes-liste"),
    path("<uuid:pk>/", views.VueDetailEtudeEconomique.as_view(), name="etude-detail"),
    path("<uuid:pk>/recalculer/", views.vue_recalculer_etude, name="etude-recalculer"),
    path("<uuid:pk>/dupliquer/", views.vue_dupliquer_etude, name="etude-dupliquer"),

    # Lignes de prix
    path("<uuid:etude_id>/lignes/", views.VueListeLignesPrix.as_view(), name="lignes-liste"),
    path("<uuid:etude_id>/lignes/<uuid:pk>/", views.VueDetailLignePrix.as_view(), name="ligne-detail"),
]
