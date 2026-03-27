"""
Vues API pour les projets — Plateforme BEE.
"""

from rest_framework import generics, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import Projet, Lot, Intervenant
from .serialiseurs import (
    ProjetListeSerialiseur,
    ProjetDetailSerialiseur,
    LotSerialiseur,
    IntervenantSerialiseur,
)


class VueListeProjets(generics.ListCreateAPIView):
    """
    GET  /api/projets/          → liste des projets accessibles à l'utilisateur
    POST /api/projets/          → création d'un projet
    """

    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["reference", "intitule", "commune"]
    ordering_fields = ["reference", "date_modification", "statut"]
    ordering = ["-date_modification"]

    def get_serializer_class(self):
        return ProjetListeSerialiseur

    def get_queryset(self):
        utilisateur = self.request.user
        qs = Projet.objects.select_related(
            "organisation", "responsable", "maitre_ouvrage"
        )
        if not utilisateur.est_super_admin:
            # Restreindre aux projets de l'organisation ou où l'utilisateur intervient
            qs = qs.filter(
                organisation=utilisateur.organisation
            ) | qs.filter(
                intervenants__utilisateur=utilisateur
            )
            qs = qs.distinct()

        # Filtres optionnels
        statut = self.request.query_params.get("statut")
        if statut:
            qs = qs.filter(statut=statut)

        return qs

    def perform_create(self, serialiseur):
        serialiseur.save(
            organisation=self.request.user.organisation,
            responsable=self.request.user,
            cree_par=self.request.user,
        )


class VueDetailProjet(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/projets/<id>/
    PATCH  /api/projets/<id>/
    DELETE /api/projets/<id>/  → archivage (pas de suppression physique)
    """

    serializer_class = ProjetDetailSerialiseur
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        utilisateur = self.request.user
        return Projet.objects.select_related(
            "organisation", "responsable", "maitre_ouvrage"
        ).prefetch_related("lots", "intervenants__utilisateur")

    def destroy(self, requete, *args, **kwargs):
        projet = self.get_object()
        projet.statut = "archive"
        projet.save(update_fields=["statut"])
        return Response({"detail": "Projet archivé."})


class VueLotsProjet(generics.ListCreateAPIView):
    """
    GET  /api/projets/<projet_id>/lots/
    POST /api/projets/<projet_id>/lots/
    """

    serializer_class = LotSerialiseur
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Lot.objects.filter(projet_id=self.kwargs["projet_id"])

    def perform_create(self, serialiseur):
        serialiseur.save(projet_id=self.kwargs["projet_id"])


class VueIntervenantsProjet(generics.ListCreateAPIView):
    """
    GET  /api/projets/<projet_id>/intervenants/
    POST /api/projets/<projet_id>/intervenants/
    """

    serializer_class = IntervenantSerialiseur
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Intervenant.objects.filter(
            projet_id=self.kwargs["projet_id"]
        ).select_related("utilisateur")

    def perform_create(self, serialiseur):
        serialiseur.save(projet_id=self.kwargs["projet_id"])


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def vue_statistiques_projets(requete):
    """
    GET /api/projets/statistiques/
    Statistiques globales sur les projets de l'utilisateur.
    """
    utilisateur = requete.user
    qs = Projet.objects.filter(organisation=utilisateur.organisation)

    stats = {
        "total": qs.count(),
        "en_cours": qs.filter(statut="en_cours").count(),
        "termines": qs.filter(statut="termine").count(),
        "en_prospection": qs.filter(statut="prospection").count(),
        "suspendus": qs.filter(statut="suspendu").count(),
    }

    return Response(stats)
