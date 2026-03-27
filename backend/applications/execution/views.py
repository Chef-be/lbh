"""Vues API pour le suivi d'exécution des travaux — Plateforme BEE."""

from rest_framework import generics, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import SuiviExecution, CompteRenduChantier, SituationTravaux, OrdreService
from .serialiseurs import (
    SuiviExecutionSerialiseur,
    CompteRenduChantierSerialiseur,
    SituationTravauxSerialiseur,
    OrdreServiceSerialiseur,
)


class VueListeSuivisExecution(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SuiviExecutionSerialiseur
    filter_backends = [filters.SearchFilter]
    search_fields = ["projet__reference"]

    def get_queryset(self):
        qs = SuiviExecution.objects.select_related("projet", "entreprise_principale")
        projet_id = self.request.query_params.get("projet")
        if projet_id:
            qs = qs.filter(projet_id=projet_id)
        return qs


class VueDetailSuiviExecution(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SuiviExecutionSerialiseur
    queryset = SuiviExecution.objects.select_related("projet", "entreprise_principale")


class VueListeComptesRendus(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CompteRenduChantierSerialiseur
    ordering = ["-date_reunion"]

    def get_queryset(self):
        return CompteRenduChantier.objects.filter(
            suivi_id=self.kwargs["suivi_id"]
        ).select_related("redacteur")

    def perform_create(self, serializer):
        suivi = generics.get_object_or_404(SuiviExecution, pk=self.kwargs["suivi_id"])
        serializer.save(suivi=suivi, redacteur=self.request.user)


class VueDetailCompteRendu(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CompteRenduChantierSerialiseur

    def get_queryset(self):
        return CompteRenduChantier.objects.filter(suivi_id=self.kwargs["suivi_id"])


class VueListeSituations(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SituationTravauxSerialiseur
    ordering = ["numero"]

    def get_queryset(self):
        return SituationTravaux.objects.filter(suivi_id=self.kwargs["suivi_id"])

    def perform_create(self, serializer):
        suivi = generics.get_object_or_404(SuiviExecution, pk=self.kwargs["suivi_id"])
        serializer.save(suivi=suivi)


class VueDetailSituation(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SituationTravauxSerialiseur

    def get_queryset(self):
        return SituationTravaux.objects.filter(suivi_id=self.kwargs["suivi_id"])


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def vue_valider_situation(request, suivi_id, pk):
    situation = generics.get_object_or_404(SituationTravaux, pk=pk, suivi_id=suivi_id)
    situation.statut = "validee_moa"
    situation.save(update_fields=["statut"])
    return Response({"detail": f"Situation n°{situation.numero} validée par la MOA."})


class VueListeOrdresService(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrdreServiceSerialiseur
    ordering = ["numero"]

    def get_queryset(self):
        return OrdreService.objects.filter(suivi_id=self.kwargs["suivi_id"])

    def perform_create(self, serializer):
        suivi = generics.get_object_or_404(SuiviExecution, pk=self.kwargs["suivi_id"])
        serializer.save(suivi=suivi)


class VueDetailOrdreService(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrdreServiceSerialiseur

    def get_queryset(self):
        return OrdreService.objects.filter(suivi_id=self.kwargs["suivi_id"])
