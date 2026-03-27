"""
Modèles du site vitrine public — Plateforme BEE.
Contenu éditorial du site public : prestations, réalisations, équipe, actualités.
"""

import uuid
from django.db import models


class Prestation(models.Model):
    """Prestation proposée par le bureau d'études — affichée sur le site vitrine."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    titre = models.CharField(max_length=200)
    description_courte = models.CharField(max_length=400, blank=True)
    description_longue = models.TextField(blank=True)
    icone = models.CharField(max_length=100, blank=True)
    ordre_affichage = models.PositiveSmallIntegerField(default=100)
    est_publie = models.BooleanField(default=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "site_public_prestation"
        verbose_name = "Prestation"
        verbose_name_plural = "Prestations"
        ordering = ["ordre_affichage"]

    def __str__(self):
        return self.titre


class Realisation(models.Model):
    """
    Réalisation mise en avant sur le site vitrine.
    Peut être liée à un projet interne (si publier_sur_site = True).
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Lien optionnel vers un projet interne
    projet = models.OneToOneField(
        "projets.Projet", on_delete=models.SET_NULL,
        null=True, blank=True, related_name="realisation_vitrine",
    )

    titre = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    client = models.CharField(max_length=200, blank=True)
    lieu = models.CharField(max_length=200, blank=True)
    annee = models.PositiveSmallIntegerField(null=True, blank=True)
    montant_travaux_ht = models.DecimalField(
        max_digits=14, decimal_places=2,
        null=True, blank=True,
        verbose_name="Montant travaux HT (€)",
    )
    image_principale = models.ImageField(
        upload_to="site_public/realisations/",
        null=True, blank=True,
    )
    tags = models.JSONField(default=list, blank=True)
    est_publie = models.BooleanField(default=False)
    ordre_affichage = models.PositiveSmallIntegerField(default=100)
    date_publication = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "site_public_realisation"
        verbose_name = "Réalisation"
        verbose_name_plural = "Réalisations"
        ordering = ["-annee", "ordre_affichage"]

    def __str__(self):
        return f"{self.titre} ({self.annee or '—'})"


class MembreEquipe(models.Model):
    """Membre de l'équipe affiché sur la page À propos du site vitrine."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    utilisateur = models.OneToOneField(
        "comptes.Utilisateur", on_delete=models.CASCADE,
        null=True, blank=True, related_name="profil_vitrine",
    )
    prenom = models.CharField(max_length=100)
    nom = models.CharField(max_length=100)
    fonction = models.CharField(max_length=200, blank=True)
    biographie = models.TextField(blank=True)
    photo = models.ImageField(upload_to="site_public/equipe/", null=True, blank=True)
    ordre_affichage = models.PositiveSmallIntegerField(default=100)
    est_publie = models.BooleanField(default=True)

    class Meta:
        db_table = "site_public_membre"
        verbose_name = "Membre de l'équipe"
        verbose_name_plural = "Membres de l'équipe"
        ordering = ["ordre_affichage", "nom"]

    def __str__(self):
        return f"{self.prenom} {self.nom}"


class DemandeContact(models.Model):
    """Demande de contact reçue via le formulaire du site vitrine."""

    SUJETS = [
        ("devis", "Demande de devis"),
        ("information", "Demande d'information"),
        ("partenariat", "Partenariat"),
        ("recrutement", "Candidature"),
        ("autre", "Autre"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nom = models.CharField(max_length=200)
    courriel = models.EmailField()
    telephone = models.CharField(max_length=20, blank=True)
    organisation = models.CharField(max_length=200, blank=True)
    sujet = models.CharField(max_length=20, choices=SUJETS, default="information")
    message = models.TextField()
    traitee = models.BooleanField(default=False)
    date_reception = models.DateTimeField(auto_now_add=True)
    adresse_ip = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        db_table = "site_public_contact"
        verbose_name = "Demande de contact"
        verbose_name_plural = "Demandes de contact"
        ordering = ["-date_reception"]

    def __str__(self):
        return f"{self.nom} — {self.sujet} ({self.date_reception.strftime('%d/%m/%Y')})"
