"""
Routage d'URL principal — Plateforme BEE.
Toutes les routes en français, regroupées par module.
"""

from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static

# URL admin personnalisée (définie dans les paramètres, jamais /admin/ en production)
_url_admin = getattr(settings, "ADMIN_URL", "admin-bee/")

urlpatterns = [
    # Administration Django
    path(_url_admin, admin.site.urls),

    # API — Authentification et comptes
    path("api/auth/", include("applications.comptes.urls")),

    # API — Projets
    path("api/projets/", include("applications.projets.urls")),

    # API — Organisations
    path("api/organisations/", include("applications.organisations.urls")),

    # API — Documents
    path("api/documents/", include("applications.documents.urls")),

    # API — Métrés et quantitatifs
    path("api/metres/", include("applications.metres.urls")),

    # API — Économie de la construction
    path("api/economie/", include("applications.economie.urls")),

    # API — Bibliothèque de prix
    path("api/bibliotheque/", include("applications.bibliotheque.urls")),

    # API — Pièces écrites (CCTP, DPGF, BPU…)
    path("api/pieces-ecrites/", include("applications.pieces_ecrites.urls")),

    # API — Appels d'offres
    path("api/appels-offres/", include("applications.appels_offres.urls")),

    # API — Suivi d'exécution des travaux
    path("api/execution/", include("applications.execution.urls")),

    # API — Voirie et dimensionnement
    path("api/voirie/", include("applications.voirie.urls")),

    # API — Pré-dimensionnement bâtiment
    path("api/batiment/", include("applications.batiment.urls")),

    # API — Paramètres et fonctionnalités activables
    path("api/parametres/", include("applications.parametres.urls")),

    # API — Supervision
    path("api/supervision/", include("applications.supervision.urls")),
]

# En développement : fichiers médias servis par Django
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
