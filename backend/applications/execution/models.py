"""
Modèles de suivi d'exécution des travaux — Plateforme BEE.
Direction de l'exécution des travaux (DET), situations de travaux, OPR/AOR.
"""

import uuid
from django.db import models


class SuiviExecution(models.Model):
    """
    Dossier de suivi d'exécution rattaché à un projet.
    Regroupe les comptes rendus de chantier, situations et ordres de service.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    projet = models.OneToOneField(
        "projets.Projet", on_delete=models.CASCADE,
        related_name="suivi_execution", verbose_name="Projet",
    )
    entreprise_principale = models.ForeignKey(
        "organisations.Organisation", on_delete=models.PROTECT,
        null=True, blank=True, related_name="suivis_en_tant_qu_entreprise",
        verbose_name="Entreprise principale",
    )

    # Calendrier contractuel
    date_os_demarrage = models.DateField(
        null=True, blank=True, verbose_name="Date de l'OS de démarrage",
    )
    duree_contractuelle_jours = models.PositiveSmallIntegerField(
        null=True, blank=True, verbose_name="Durée contractuelle (jours ouvrés)",
    )
    date_fin_contractuelle = models.DateField(
        null=True, blank=True, verbose_name="Date de fin contractuelle",
    )

    # Montant du marché
    montant_marche_ht = models.DecimalField(
        max_digits=15, decimal_places=2,
        null=True, blank=True,
        verbose_name="Montant initial du marché HT (€)",
    )
    montant_travaux_supplementaires_ht = models.DecimalField(
        max_digits=14, decimal_places=2,
        default=0,
        verbose_name="Travaux supplémentaires / avenants HT (€)",
    )

    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "execution_suivi"
        verbose_name = "Suivi d'exécution"
        verbose_name_plural = "Suivis d'exécution"

    def __str__(self):
        return f"Suivi — {self.projet.reference}"

    @property
    def montant_total_ht(self):
        montant = self.montant_marche_ht or 0
        return montant + (self.montant_travaux_supplementaires_ht or 0)


class CompteRenduChantier(models.Model):
    """Compte rendu de réunion de chantier hebdomadaire."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    suivi = models.ForeignKey(
        SuiviExecution, on_delete=models.CASCADE,
        related_name="comptes_rendus", verbose_name="Suivi",
    )
    numero = models.PositiveSmallIntegerField(verbose_name="Numéro de réunion")
    date_reunion = models.DateField(verbose_name="Date de la réunion")
    redacteur = models.ForeignKey(
        "comptes.Utilisateur", on_delete=models.PROTECT,
        null=True, blank=True, related_name="comptes_rendus_rediges",
        verbose_name="Rédacteur",
    )

    ordre_du_jour = models.TextField(blank=True, verbose_name="Ordre du jour")
    contenu = models.TextField(verbose_name="Contenu de la réunion")
    decisions = models.TextField(blank=True, verbose_name="Décisions et points à traiter")

    avancement_physique_pct = models.DecimalField(
        max_digits=5, decimal_places=2,
        null=True, blank=True,
        verbose_name="Avancement physique (%)",
    )

    date_creation = models.DateTimeField(auto_now_add=True)
    date_diffusion = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "execution_compte_rendu"
        verbose_name = "Compte rendu de chantier"
        verbose_name_plural = "Comptes rendus de chantier"
        ordering = ["suivi", "-date_reunion"]
        unique_together = [("suivi", "numero")]

    def __str__(self):
        return f"CR n°{self.numero} du {self.date_reunion} — {self.suivi.projet.reference}"


class SituationTravaux(models.Model):
    """Situation mensuelle de travaux — décompte provisoire."""

    STATUTS = [
        ("en_cours", "En cours de rédaction"),
        ("soumise", "Soumise à l'entreprise"),
        ("acceptee", "Acceptée"),
        ("contestee", "Contestée"),
        ("validee_moa", "Validée par la MOA"),
        ("payee", "Payée"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    suivi = models.ForeignKey(
        SuiviExecution, on_delete=models.CASCADE,
        related_name="situations", verbose_name="Suivi",
    )
    numero = models.PositiveSmallIntegerField(verbose_name="Numéro de situation")
    periode_debut = models.DateField(verbose_name="Début de période")
    periode_fin = models.DateField(verbose_name="Fin de période")
    statut = models.CharField(
        max_length=20, choices=STATUTS, default="en_cours",
    )

    # Montants
    montant_cumule_ht = models.DecimalField(
        max_digits=14, decimal_places=2,
        verbose_name="Montant cumulé HT (€)",
    )
    montant_periode_ht = models.DecimalField(
        max_digits=14, decimal_places=2,
        verbose_name="Montant de la période HT (€)",
    )
    avancement_financier_pct = models.DecimalField(
        max_digits=5, decimal_places=2,
        null=True, blank=True,
        verbose_name="Avancement financier (%)",
    )

    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "execution_situation"
        verbose_name = "Situation de travaux"
        verbose_name_plural = "Situations de travaux"
        ordering = ["suivi", "numero"]
        unique_together = [("suivi", "numero")]

    def __str__(self):
        return f"Situation n°{self.numero} — {self.suivi.projet.reference}"


class OrdreService(models.Model):
    """Ordre de service — instruction écrite à l'entreprise."""

    TYPES = [
        ("demarrage", "Ordre de démarrage"),
        ("suspension", "Ordre de suspension"),
        ("reprise", "Ordre de reprise"),
        ("modification", "Ordre de modification"),
        ("arret_definitif", "Arrêt définitif"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    suivi = models.ForeignKey(
        SuiviExecution, on_delete=models.CASCADE,
        related_name="ordres_service", verbose_name="Suivi",
    )
    numero = models.PositiveSmallIntegerField(verbose_name="Numéro")
    type_ordre = models.CharField(max_length=20, choices=TYPES, verbose_name="Type")
    date_emission = models.DateField(verbose_name="Date d'émission")
    objet = models.CharField(max_length=500, verbose_name="Objet")
    contenu = models.TextField(blank=True, verbose_name="Contenu")

    class Meta:
        db_table = "execution_ordre_service"
        verbose_name = "Ordre de service"
        verbose_name_plural = "Ordres de service"
        ordering = ["suivi", "numero"]

    def __str__(self):
        return f"OS n°{self.numero} — {self.type_ordre} — {self.suivi.projet.reference}"
