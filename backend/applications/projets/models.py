"""
Modèles de projets / affaires / missions.
Plateforme BEE — Bureau d'Études Économiste

Le projet est le cœur de la plateforme : tout s'organise autour de lui.
"""

import uuid
from django.db import models
from django.utils import timezone


class Projet(models.Model):
    """Projet / affaire / mission — entité centrale de la plateforme."""

    TYPES = [
        ("etude", "Étude"),
        ("travaux", "Travaux"),
        ("mission_moe", "Mission maîtrise d'œuvre"),
        ("assistance", "Assistance à maîtrise d'ouvrage"),
        ("expertise", "Expertise"),
        ("autre", "Autre"),
    ]

    STATUTS = [
        ("prospection", "Prospection"),
        ("en_cours", "En cours"),
        ("suspendu", "Suspendu"),
        ("termine", "Terminé"),
        ("abandonne", "Abandonné"),
        ("archive", "Archivé"),
    ]

    PHASES = [
        ("faisabilite", "Faisabilité"),
        ("programmation", "Programmation"),
        ("esquisse", "Esquisse / ESQ"),
        ("avp", "Avant-projet sommaire / APS"),
        ("pro", "Avant-projet définitif / APD / PRO"),
        ("dce", "Dossier de consultation / DCE"),
        ("ao", "Appel d'offres"),
        ("exe", "Exécution / DET"),
        ("reception", "Réception / AOR"),
        ("clos", "Clos"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Identification
    reference = models.CharField(max_length=50, unique=True, verbose_name="Référence")
    intitule = models.CharField(max_length=500, verbose_name="Intitulé")
    type_projet = models.CharField(max_length=50, choices=TYPES, default="etude", verbose_name="Type")
    statut = models.CharField(max_length=30, choices=STATUTS, default="en_cours", verbose_name="Statut")
    phase_actuelle = models.CharField(max_length=30, choices=PHASES, blank=True, verbose_name="Phase actuelle")

    # Parties prenantes
    organisation = models.ForeignKey(
        "organisations.Organisation", on_delete=models.PROTECT,
        related_name="projets", verbose_name="Bureau d'études",
    )
    maitre_ouvrage = models.ForeignKey(
        "organisations.Organisation", on_delete=models.PROTECT,
        null=True, blank=True, related_name="projets_en_tant_que_mo",
        verbose_name="Maître d'ouvrage",
    )
    maitre_oeuvre = models.ForeignKey(
        "organisations.Organisation", on_delete=models.PROTECT,
        null=True, blank=True, related_name="projets_en_tant_que_moe",
        verbose_name="Maître d'œuvre",
    )

    # Responsable interne
    responsable = models.ForeignKey(
        "comptes.Utilisateur", on_delete=models.PROTECT,
        related_name="projets_responsable", verbose_name="Responsable",
    )

    # Localisation
    commune = models.CharField(max_length=200, blank=True, verbose_name="Commune")
    departement = models.CharField(max_length=3, blank=True, verbose_name="Département")

    # Calendrier
    date_debut_prevue = models.DateField(null=True, blank=True, verbose_name="Début prévu")
    date_fin_prevue = models.DateField(null=True, blank=True, verbose_name="Fin prévue")
    date_debut_reelle = models.DateField(null=True, blank=True, verbose_name="Début réel")
    date_fin_reelle = models.DateField(null=True, blank=True, verbose_name="Fin réelle")

    # Financier
    montant_estime = models.DecimalField(
        max_digits=15, decimal_places=2, null=True, blank=True,
        verbose_name="Montant estimé HT (€)",
    )
    montant_marche = models.DecimalField(
        max_digits=15, decimal_places=2, null=True, blank=True,
        verbose_name="Montant du marché HT (€)",
    )
    honoraires_prevus = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True,
        verbose_name="Honoraires prévus HT (€)",
    )

    # Notes
    description = models.TextField(blank=True, verbose_name="Description")
    observations = models.TextField(blank=True, verbose_name="Observations")

    # Publication site public
    publier_sur_site = models.BooleanField(default=False, verbose_name="Publier sur le site vitrine")

    # Métadonnées
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    cree_par = models.ForeignKey(
        "comptes.Utilisateur", on_delete=models.PROTECT,
        related_name="projets_crees", null=True, blank=True,
    )

    class Meta:
        db_table = "projets_projet"
        verbose_name = "Projet"
        verbose_name_plural = "Projets"
        ordering = ["-date_modification"]
        indexes = [
            models.Index(fields=["statut"]),
            models.Index(fields=["organisation"]),
            models.Index(fields=["reference"]),
        ]

    def __str__(self):
        return f"{self.reference} — {self.intitule[:60]}"

    def generer_reference(self):
        """Génère une référence automatique si non fournie."""
        annee = timezone.now().year
        dernier = Projet.objects.filter(
            reference__startswith=f"{annee}-"
        ).count() + 1
        return f"{annee}-{dernier:04d}"

    def save(self, *args, **kwargs):
        if not self.reference:
            self.reference = self.generer_reference()
        super().save(*args, **kwargs)


class Lot(models.Model):
    """Lot ou sous-ensemble d'un projet."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    projet = models.ForeignKey(Projet, on_delete=models.CASCADE, related_name="lots")
    numero = models.PositiveSmallIntegerField(verbose_name="Numéro de lot")
    intitule = models.CharField(max_length=300, verbose_name="Intitulé")
    description = models.TextField(blank=True)
    montant_estime = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = "projets_lot"
        verbose_name = "Lot"
        verbose_name_plural = "Lots"
        unique_together = [("projet", "numero")]
        ordering = ["projet", "numero"]

    def __str__(self):
        return f"Lot {self.numero} — {self.intitule}"


class Intervenant(models.Model):
    """Intervenant affecté à un projet."""

    ROLES = [
        ("responsable", "Responsable"),
        ("charge_affaires", "Chargé d'affaires"),
        ("economiste", "Économiste"),
        ("redacteur", "Rédacteur"),
        ("verificateur", "Vérificateur"),
        ("conducteur_travaux", "Conducteur de travaux"),
        ("observateur", "Observateur"),
    ]

    projet = models.ForeignKey(Projet, on_delete=models.CASCADE, related_name="intervenants")
    utilisateur = models.ForeignKey("comptes.Utilisateur", on_delete=models.PROTECT)
    role = models.CharField(max_length=50, choices=ROLES, default="economiste")
    date_debut = models.DateField(null=True, blank=True)
    date_fin = models.DateField(null=True, blank=True)

    class Meta:
        db_table = "projets_intervenant"
        verbose_name = "Intervenant"
        unique_together = [("projet", "utilisateur")]

    def __str__(self):
        return f"{self.utilisateur.nom_complet} ({self.get_role_display()}) — {self.projet.reference}"
