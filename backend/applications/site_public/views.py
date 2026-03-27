"""Vues API pour le site vitrine public — Plateforme BEE."""

from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import Prestation, Realisation, MembreEquipe, DemandeContact
from .serialiseurs import (
    PrestationSerialiseur,
    RealisationSerialiseur,
    MembreEquipeSerialiseur,
    DemandeContactSerialiseur,
)


class PermissionPublicOuAdmin(permissions.BasePermission):
    """Lecture publique, écriture réservée aux utilisateurs connectés."""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated


class VueListePrestations(generics.ListAPIView):
    permission_classes = [PermissionPublicOuAdmin]
    serializer_class = PrestationSerialiseur

    def get_queryset(self):
        qs = Prestation.objects.all()
        if not (self.request.user and self.request.user.is_authenticated):
            qs = qs.filter(est_publie=True)
        return qs


class VueDetailPrestation(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PrestationSerialiseur
    queryset = Prestation.objects.all()


class VueListeRealisations(generics.ListAPIView):
    permission_classes = [PermissionPublicOuAdmin]
    serializer_class = RealisationSerialiseur

    def get_queryset(self):
        qs = Realisation.objects.all()
        if not (self.request.user and self.request.user.is_authenticated):
            qs = qs.filter(est_publie=True)
        return qs


class VueDetailRealisation(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = RealisationSerialiseur
    queryset = Realisation.objects.all()


class VueListeEquipe(generics.ListAPIView):
    permission_classes = [PermissionPublicOuAdmin]
    serializer_class = MembreEquipeSerialiseur

    def get_queryset(self):
        qs = MembreEquipe.objects.all()
        if not (self.request.user and self.request.user.is_authenticated):
            qs = qs.filter(est_publie=True)
        return qs


class VueDetailMembreEquipe(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MembreEquipeSerialiseur
    queryset = MembreEquipe.objects.all()


@api_view(["POST"])
def vue_soumettre_contact(request):
    """Reçoit une demande de contact du site vitrine (accès public)."""
    serialiseur = DemandeContactSerialiseur(data=request.data)
    if serialiseur.is_valid():
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        ip = x_forwarded_for.split(",")[0].strip() if x_forwarded_for else request.META.get("REMOTE_ADDR")
        serialiseur.save(adresse_ip=ip)
        return Response(
            {"detail": "Votre demande a bien été transmise. Nous vous répondrons rapidement."},
            status=status.HTTP_201_CREATED,
        )
    return Response(serialiseur.errors, status=status.HTTP_400_BAD_REQUEST)


class VueListeDemandesContact(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DemandeContactSerialiseur
    ordering = ["-date_reception"]

    def get_queryset(self):
        if not self.request.user.est_super_admin:
            return DemandeContact.objects.none()
        qs = DemandeContact.objects.all()
        traitee = self.request.query_params.get("traitee")
        if traitee == "0":
            qs = qs.filter(traitee=False)
        elif traitee == "1":
            qs = qs.filter(traitee=True)
        return qs


@api_view(["PATCH"])
@permission_classes([permissions.IsAuthenticated])
def vue_marquer_contact_traite(request, pk):
    demande = generics.get_object_or_404(DemandeContact, pk=pk)
    demande.traitee = True
    demande.save(update_fields=["traitee"])
    return Response({"detail": "Demande marquée comme traitée."})
