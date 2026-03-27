"""Routes URL pour la bibliothèque de prix — Plateforme BEE."""

from django.urls import path
from . import views

urlpatterns = [
    path("", views.VueListeBibliotheque.as_view(), name="bibliotheque-liste"),
    path("familles/", views.vue_familles, name="bibliotheque-familles"),
    path("<uuid:pk>/", views.VueDetailBibliotheque.as_view(), name="bibliotheque-detail"),
    path("<uuid:pk>/valider/", views.vue_valider_entree, name="bibliotheque-valider"),
]
