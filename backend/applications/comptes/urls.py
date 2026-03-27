"""
Routes URL pour l'application Comptes — Plateforme BEE.
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    VueConnexion,
    VueDeconnexion,
    VueDetailUtilisateur,
    VueListeUtilisateurs,
    VueMoiMeme,
    VueModificationMotDePasse,
)

urlpatterns = [
    # Authentification
    path("connexion/", VueConnexion.as_view(), name="auth-connexion"),
    path("deconnexion/", VueDeconnexion.as_view(), name="auth-deconnexion"),
    path("rafraichir/", TokenRefreshView.as_view(), name="auth-rafraichir-jeton"),

    # Profil utilisateur connecté
    path("moi/", VueMoiMeme.as_view(), name="auth-moi"),
    path("modifier-mot-de-passe/", VueModificationMotDePasse.as_view(), name="auth-modifier-mdp"),

    # Gestion des utilisateurs (admin)
    path("utilisateurs/", VueListeUtilisateurs.as_view(), name="utilisateurs-liste"),
    path("utilisateurs/<uuid:pk>/", VueDetailUtilisateur.as_view(), name="utilisateurs-detail"),
]
