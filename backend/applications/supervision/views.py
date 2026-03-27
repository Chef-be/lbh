"""Vues API pour la supervision — Plateforme BEE."""

from datetime import datetime, timezone

from rest_framework import generics, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import EvenementSysteme, MetriqueService, AlerteSupervision
from .serialiseurs import (
    EvenementSystemeSerialiseur,
    MetriqueServiceSerialiseur,
    AlerteSupervisionSerialiseur,
)


class EstSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.est_super_admin


class VueListeEvenements(generics.ListAPIView):
    """Journal des événements système (lecture seule, super-admin uniquement)."""
    permission_classes = [EstSuperAdmin]
    serializer_class = EvenementSystemeSerialiseur
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["message", "source", "categorie"]
    ordering = ["-date_evenement"]

    def get_queryset(self):
        qs = EvenementSysteme.objects.select_related("utilisateur")
        niveau = self.request.query_params.get("niveau")
        if niveau:
            qs = qs.filter(niveau=niveau)
        categorie = self.request.query_params.get("categorie")
        if categorie:
            qs = qs.filter(categorie=categorie)
        non_resolus = self.request.query_params.get("non_resolus")
        if non_resolus == "1":
            qs = qs.filter(resolu=False)
        return qs


class VueListeMetriques(generics.ListAPIView):
    """Métriques de services (dernière valeur par service)."""
    permission_classes = [EstSuperAdmin]
    serializer_class = MetriqueServiceSerialiseur

    def get_queryset(self):
        # Retourne la métrique la plus récente pour chaque service
        from django.db.models import Max, OuterRef, Subquery
        derniers = MetriqueService.objects.filter(
            service=OuterRef("service")
        ).order_by("-horodatage").values("id")[:1]

        return MetriqueService.objects.filter(
            id__in=Subquery(derniers)
        ).order_by("service")


class VueListeAlertes(generics.ListAPIView):
    """Liste des alertes de supervision."""
    permission_classes = [EstSuperAdmin]
    serializer_class = AlerteSupervisionSerialiseur
    ordering = ["-date_declenchement"]

    def get_queryset(self):
        qs = AlerteSupervision.objects.select_related("acquittee_par")
        actives = self.request.query_params.get("actives")
        if actives == "1":
            qs = qs.filter(est_active=True)
        elif actives == "0":
            qs = qs.filter(est_active=False)
        return qs


@api_view(["POST"])
@permission_classes([EstSuperAdmin])
def vue_acquitter_alerte(request, pk):
    """Acquitte une alerte et la marque comme résolue."""
    alerte = generics.get_object_or_404(AlerteSupervision, pk=pk)
    alerte.est_active = False
    alerte.date_resolution = datetime.now(tz=timezone.utc)
    alerte.acquittee_par = request.user
    alerte.save(update_fields=["est_active", "date_resolution", "acquittee_par"])
    return Response({"detail": "Alerte acquittée."})


@api_view(["GET"])
@permission_classes([EstSuperAdmin])
def vue_tableau_bord_supervision(request):
    """
    Résumé de l'état du système pour le tableau de bord de supervision.
    """
    alertes_actives = AlerteSupervision.objects.filter(est_active=True).count()
    alertes_critiques = AlerteSupervision.objects.filter(
        est_active=True, niveau="critique"
    ).count()
    erreurs_non_resolues = EvenementSysteme.objects.filter(
        niveau__in=["erreur", "critique"], resolu=False
    ).count()

    # Dernières métriques par service
    from django.db.models import OuterRef, Subquery
    derniers_ids = MetriqueService.objects.filter(
        service=OuterRef("service")
    ).order_by("-horodatage").values("id")[:1]
    metriques = MetriqueService.objects.filter(id__in=Subquery(derniers_ids))

    services_ko = [m.service for m in metriques if not m.disponible]

    return Response({
        "alertes_actives": alertes_actives,
        "alertes_critiques": alertes_critiques,
        "erreurs_non_resolues": erreurs_non_resolues,
        "services_indisponibles": services_ko,
        "etat_global": "critique" if alertes_critiques or services_ko else (
            "avertissement" if alertes_actives or erreurs_non_resolues else "nominal"
        ),
    })
