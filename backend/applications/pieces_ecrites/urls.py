"""Routes URL pour les pièces écrites — Plateforme BEE."""

from django.urls import path
from . import views

urlpatterns = [
    # Modèles de documents
    path("modeles/", views.VueListeModelesDocuments.as_view(), name="modeles-documents"),

    # Bibliothèque d'articles CCTP
    path("articles/", views.VueListeArticlesCCTP.as_view(), name="articles-cctp-bibliotheque"),
    path("articles/<uuid:pk>/", views.VueDetailArticleCCTP.as_view(), name="article-cctp-detail"),

    # Pièces écrites
    path("", views.VueListePiecesEcrites.as_view(), name="pieces-ecrites-liste"),
    path("<uuid:pk>/", views.VueDetailPieceEcrite.as_view(), name="piece-ecrite-detail"),
    path("<uuid:pk>/valider/", views.vue_valider_piece_ecrite, name="piece-ecrite-valider"),
    path("<uuid:piece_id>/articles/", views.VueListeArticlesCCTP.as_view(), name="piece-articles-liste"),
    path("<uuid:piece_id>/articles/<uuid:pk>/", views.VueDetailArticleCCTP.as_view(), name="piece-article-detail"),
]
