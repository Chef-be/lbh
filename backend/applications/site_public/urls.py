"""Routes URL pour le site vitrine public — Plateforme BEE."""

from django.urls import path
from . import views

urlpatterns = [
    # Public (sans authentification)
    path("prestations/", views.VueListePrestations.as_view(), name="prestations-liste"),
    path("realisations/", views.VueListeRealisations.as_view(), name="realisations-liste"),
    path("equipe/", views.VueListeEquipe.as_view(), name="equipe-liste"),
    path("contact/", views.vue_soumettre_contact, name="contact-soumettre"),

    # Gestion (authentifié)
    path("prestations/<uuid:pk>/", views.VueDetailPrestation.as_view(), name="prestation-detail"),
    path("realisations/<uuid:pk>/", views.VueDetailRealisation.as_view(), name="realisation-detail"),
    path("equipe/<uuid:pk>/", views.VueDetailMembreEquipe.as_view(), name="membre-detail"),
    path("contact/demandes/", views.VueListeDemandesContact.as_view(), name="contact-demandes"),
    path("contact/demandes/<uuid:pk>/traiter/", views.vue_marquer_contact_traite, name="contact-traiter"),
]
