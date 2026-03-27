"""Routes URL pour la gestion documentaire — Plateforme BEE."""

from django.urls import path
from . import views

urlpatterns = [
    # Types de documents
    path("types/", views.VueListeTypesDocuments.as_view(), name="types-documents"),

    # Documents
    path("", views.VueListeDocuments.as_view(), name="documents-liste"),
    path("<uuid:pk>/", views.VueDetailDocument.as_view(), name="document-detail"),
    path("<uuid:pk>/valider/", views.vue_valider_document, name="document-valider"),
    path("<uuid:pk>/nouvelle-version/", views.vue_nouvelle_version, name="document-nouvelle-version"),

    # Annotations et diffusions
    path("<uuid:doc_id>/annotations/", views.VueAnnotationsDocument.as_view(), name="document-annotations"),
    path("<uuid:doc_id>/diffusions/", views.VueDiffusionsDocument.as_view(), name="document-diffusions"),
]
