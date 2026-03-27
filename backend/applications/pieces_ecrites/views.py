"""Vues API pour les pièces écrites — Plateforme BEE."""

from rest_framework import generics, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import ModeleDocument, PieceEcrite, ArticleCCTP
from .serialiseurs import (
    ModeleDocumentSerialiseur,
    PieceEcriteListeSerialiseur,
    PieceEcriteDetailSerialiseur,
    ArticleCCTPSerialiseur,
)


class VueListeModelesDocuments(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ModeleDocumentSerialiseur

    def get_queryset(self):
        qs = ModeleDocument.objects.filter(est_actif=True).order_by("type_document", "libelle")
        type_doc = self.request.query_params.get("type")
        if type_doc:
            qs = qs.filter(type_document=type_doc)
        return qs


class VueListePiecesEcrites(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["intitule", "projet__reference"]
    ordering = ["-date_modification"]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return PieceEcriteDetailSerialiseur
        return PieceEcriteListeSerialiseur

    def get_queryset(self):
        qs = PieceEcrite.objects.select_related("projet", "lot", "modele", "redacteur")
        projet_id = self.request.query_params.get("projet")
        if projet_id:
            qs = qs.filter(projet_id=projet_id)
        statut = self.request.query_params.get("statut")
        if statut:
            qs = qs.filter(statut=statut)
        return qs

    def perform_create(self, serializer):
        serializer.save(redacteur=self.request.user)


class VueDetailPieceEcrite(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PieceEcriteDetailSerialiseur

    def get_queryset(self):
        return PieceEcrite.objects.select_related(
            "projet", "lot", "modele", "redacteur"
        ).prefetch_related("articles")


class VueListeArticlesCCTP(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ArticleCCTPSerialiseur
    filter_backends = [filters.SearchFilter]
    search_fields = ["intitule", "corps_article", "chapitre"]

    def get_queryset(self):
        piece_id = self.kwargs.get("piece_id")
        if piece_id:
            return ArticleCCTP.objects.filter(piece_ecrite_id=piece_id)
        return ArticleCCTP.objects.filter(est_dans_bibliotheque=True)

    def perform_create(self, serializer):
        piece_id = self.kwargs.get("piece_id")
        if piece_id:
            piece = generics.get_object_or_404(PieceEcrite, pk=piece_id)
            serializer.save(piece_ecrite=piece)
        else:
            serializer.save()


class VueDetailArticleCCTP(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ArticleCCTPSerialiseur

    def get_queryset(self):
        piece_id = self.kwargs.get("piece_id")
        if piece_id:
            return ArticleCCTP.objects.filter(piece_ecrite_id=piece_id)
        return ArticleCCTP.objects.all()


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def vue_valider_piece_ecrite(request, pk):
    piece = generics.get_object_or_404(PieceEcrite, pk=pk)
    piece.statut = "valide"
    piece.save(update_fields=["statut"])
    return Response({"detail": "Pièce écrite validée."})
