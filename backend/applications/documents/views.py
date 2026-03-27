"""Vues API pour la gestion documentaire — Plateforme BEE."""

from datetime import datetime, timezone

from rest_framework import generics, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import TypeDocument, Document, AnnotationDocument, DiffusionDocument
from .serialiseurs import (
    TypeDocumentSerialiseur,
    DocumentListeSerialiseur,
    DocumentDetailSerialiseur,
    AnnotationDocumentSerialiseur,
    DiffusionDocumentSerialiseur,
)


class VueListeTypesDocuments(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TypeDocumentSerialiseur
    queryset = TypeDocument.objects.all()


class VueListeDocuments(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["reference", "intitule", "contenu_texte"]
    ordering = ["-date_modification"]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return DocumentDetailSerialiseur
        return DocumentListeSerialiseur

    def get_queryset(self):
        qs = Document.objects.select_related(
            "type_document", "projet", "lot", "auteur", "valide_par"
        ).filter(est_version_courante=True)

        projet_id = self.request.query_params.get("projet")
        if projet_id:
            qs = qs.filter(projet_id=projet_id)

        type_doc = self.request.query_params.get("type")
        if type_doc:
            qs = qs.filter(type_document__code=type_doc)

        statut = self.request.query_params.get("statut")
        if statut:
            qs = qs.filter(statut=statut)

        confidentiel = self.request.query_params.get("confidentiel")
        if confidentiel == "0":
            qs = qs.filter(confidentiel=False)

        return qs

    def perform_create(self, serializer):
        serializer.save(auteur=self.request.user)


class VueDetailDocument(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DocumentDetailSerialiseur

    def get_queryset(self):
        return Document.objects.select_related(
            "type_document", "projet", "lot", "auteur", "valide_par"
        ).prefetch_related("annotations", "diffusions")

    def destroy(self, request, *args, **kwargs):
        doc = self.get_object()
        doc.statut = "archive"
        doc.est_version_courante = False
        doc.save(update_fields=["statut", "est_version_courante"])
        return Response({"detail": "Document archivé."})


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def vue_valider_document(request, pk):
    """Valide un document et enregistre le valideur."""
    doc = generics.get_object_or_404(Document, pk=pk)
    doc.statut = "valide"
    doc.valide_par = request.user
    doc.date_validation = datetime.now(tz=timezone.utc)
    doc.save(update_fields=["statut", "valide_par", "date_validation"])
    return Response({"detail": "Document validé."})


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def vue_nouvelle_version(request, pk):
    """Crée une nouvelle version d'un document existant."""
    doc_parent = generics.get_object_or_404(Document, pk=pk)

    prochain_indice = chr(ord(doc_parent.version[-1]) + 1) if doc_parent.version else "B"

    Document.objects.filter(
        projet=doc_parent.projet,
        reference=doc_parent.reference,
    ).update(est_version_courante=False)

    nouvelle_version = Document.objects.create(
        reference=doc_parent.reference,
        intitule=doc_parent.intitule,
        type_document=doc_parent.type_document,
        projet=doc_parent.projet,
        lot=doc_parent.lot,
        version=prochain_indice,
        est_version_courante=True,
        document_parent=doc_parent,
        statut="brouillon",
        origine=doc_parent.origine,
        auteur=request.user,
        acces_client=doc_parent.acces_client,
        acces_partenaire=doc_parent.acces_partenaire,
        confidentiel=doc_parent.confidentiel,
    )
    serialiseur = DocumentDetailSerialiseur(
        nouvelle_version, context={"request": request}
    )
    return Response(serialiseur.data, status=status.HTTP_201_CREATED)


class VueAnnotationsDocument(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AnnotationDocumentSerialiseur

    def get_queryset(self):
        return AnnotationDocument.objects.filter(
            document_id=self.kwargs["doc_id"]
        ).select_related("auteur")

    def perform_create(self, serializer):
        doc = generics.get_object_or_404(Document, pk=self.kwargs["doc_id"])
        serializer.save(auteur=self.request.user, document=doc)


class VueDiffusionsDocument(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DiffusionDocumentSerialiseur

    def get_queryset(self):
        return DiffusionDocument.objects.filter(
            document_id=self.kwargs["doc_id"]
        ).select_related("destinataire")

    def perform_create(self, serializer):
        doc = generics.get_object_or_404(Document, pk=self.kwargs["doc_id"])
        serializer.save(document=doc)
