"""Vues API pour la bibliothèque de prix — Plateforme BEE."""

from rest_framework import generics, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import LignePrixBibliotheque
from .serialiseurs import (
    LignePrixBibliothequeListeSerialiseur,
    LignePrixBibliothequeDetailSerialiseur,
)


class VueListeBibliotheque(generics.ListCreateAPIView):
    """Recherche et création dans la bibliothèque de prix."""
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["code", "designation_courte", "designation_longue", "famille", "sous_famille"]
    ordering = ["famille", "sous_famille", "code"]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return LignePrixBibliothequeDetailSerialiseur
        return LignePrixBibliothequeListeSerialiseur

    def get_queryset(self):
        qs = LignePrixBibliotheque.objects.select_related("organisation", "projet", "auteur")

        niveau = self.request.query_params.get("niveau")
        if niveau:
            qs = qs.filter(niveau=niveau)

        famille = self.request.query_params.get("famille")
        if famille:
            qs = qs.filter(famille__iexact=famille)

        sous_famille = self.request.query_params.get("sous_famille")
        if sous_famille:
            qs = qs.filter(sous_famille__iexact=sous_famille)

        organisation_id = self.request.query_params.get("organisation")
        if organisation_id:
            qs = qs.filter(organisation_id=organisation_id)

        projet_id = self.request.query_params.get("projet")
        if projet_id:
            qs = qs.filter(projet_id=projet_id)

        statut = self.request.query_params.get("statut")
        if statut:
            qs = qs.filter(statut_validation=statut)
        else:
            qs = qs.filter(statut_validation="valide")

        return qs

    def perform_create(self, serializer):
        serializer.save(auteur=self.request.user)


class VueDetailBibliotheque(generics.RetrieveUpdateDestroyAPIView):
    """Détail, modification et archivage d'une entrée de bibliothèque."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = LignePrixBibliothequeDetailSerialiseur
    queryset = LignePrixBibliotheque.objects.select_related("organisation", "projet", "auteur")

    def destroy(self, request, *args, **kwargs):
        entree = self.get_object()
        entree.statut_validation = "obsolete"
        entree.save(update_fields=["statut_validation"])
        return Response({"detail": "Entrée archivée (statut : obsolète)."})


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def vue_valider_entree(request, pk):
    """Valide une entrée de bibliothèque (passe en statut 'valide')."""
    entree = generics.get_object_or_404(LignePrixBibliotheque, pk=pk)
    entree.statut_validation = "valide"
    entree.save(update_fields=["statut_validation"])
    return Response({"detail": "Entrée validée."})


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def vue_familles(request):
    """Retourne la liste des familles et sous-familles disponibles."""
    qs = LignePrixBibliotheque.objects.filter(
        statut_validation="valide"
    ).values("famille", "sous_famille").distinct().order_by("famille", "sous_famille")
    return Response(list(qs))
