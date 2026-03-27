"""Routes URL pour la supervision — Plateforme BEE."""

from django.urls import path
from . import views

urlpatterns = [
    path("", views.vue_tableau_bord_supervision, name="supervision-tableau-bord"),
    path("evenements/", views.VueListeEvenements.as_view(), name="supervision-evenements"),
    path("metriques/", views.VueListeMetriques.as_view(), name="supervision-metriques"),
    path("alertes/", views.VueListeAlertes.as_view(), name="supervision-alertes"),
    path("alertes/<uuid:pk>/acquitter/", views.vue_acquitter_alerte, name="supervision-acquitter"),
]
