"""
Bibliothèque de prix intelligente — Modèles.
Plateforme BEE — Bureau d'Études Économiste
"""

import uuid
from django.db import models


class LignePrixBibliotheque(models.Model):
    """
    Ligne de la bibliothèque de prix.
    Multi-niveaux : référence générale → territoire → entreprise → affaire.
    """

    NIVEAUX = [
        ("reference", "Prix de référence général"),
        ("territorial", "Prix territorial"),
        ("entreprise", "Prix entreprise"),
        ("affaire", "Prix affaire"),
        ("negocie", "Prix négocié"),
        ("constate", "Prix constaté en bilan"),
    ]

    STATUTS_VALIDATION = [
        ("brouillon", "Brouillon"),
        ("a_valider", "À valider"),
        ("valide", "Validé"),
        ("obsolete", "Obsolète"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Niveau de prix
    niveau = models.CharField(max_length=30, choices=NIVEAUX, default="reference")
    organisation = models.ForeignKey(
        "organisations.Organisation", on_delete=models.CASCADE,
        null=True, blank=True, related_name="bibliotheque_prix",
        verbose_name="Organisation (vide = référentiel général)",
    )
    projet = models.ForeignKey(
        "projets.Projet", on_delete=models.CASCADE,
        null=True, blank=True, related_name="bibliotheque_prix",
        verbose_name="Projet (pour niveau affaire)",
    )

    # Classification
    code = models.CharField(max_length=50, verbose_name="Code")
    famille = models.CharField(max_length=100, verbose_name="Famille")
    sous_famille = models.CharField(max_length=100, blank=True, verbose_name="Sous-famille")
    corps_etat = models.CharField(max_length=100, blank=True, verbose_name="Corps d'état")
    lot = models.CharField(max_length=100, blank=True, verbose_name="Lot")

    # Désignation
    designation_longue = models.TextField(verbose_name="Désignation longue")
    designation_courte = models.CharField(max_length=300, verbose_name="Désignation courte")
    unite = models.CharField(max_length=20, verbose_name="Unité")

    # Contexte d'emploi et hypothèses
    hypotheses = models.TextField(blank=True, verbose_name="Hypothèses de calcul")
    contexte_emploi = models.TextField(blank=True, verbose_name="Contexte d'emploi")
    observations_techniques = models.TextField(blank=True)
    observations_economiques = models.TextField(blank=True)

    # Composantes prix (déboursé sec unitaire ventilé)
    temps_main_oeuvre = models.DecimalField(max_digits=10, decimal_places=4, default=0)
    cout_horaire_mo = models.DecimalField(max_digits=10, decimal_places=4, default=0)
    cout_matieres = models.DecimalField(max_digits=12, decimal_places=4, default=0)
    cout_materiel = models.DecimalField(max_digits=12, decimal_places=4, default=0)
    cout_sous_traitance = models.DecimalField(max_digits=12, decimal_places=4, default=0)
    cout_transport = models.DecimalField(max_digits=12, decimal_places=4, default=0)
    debourse_sec_unitaire = models.DecimalField(max_digits=12, decimal_places=4, default=0)
    prix_vente_unitaire = models.DecimalField(max_digits=12, decimal_places=4, default=0)

    # Traçabilité
    source = models.CharField(max_length=200, blank=True, verbose_name="Source")
    auteur = models.ForeignKey(
        "comptes.Utilisateur", on_delete=models.PROTECT,
        null=True, blank=True, related_name="lignes_bibliotheque",
    )
    fiabilite = models.PositiveSmallIntegerField(
        default=3, verbose_name="Indice de fiabilité (1-5)",
        help_text="1 = estimatif, 5 = issu de bilan réel",
    )
    periode_validite_debut = models.DateField(null=True, blank=True)
    periode_validite_fin = models.DateField(null=True, blank=True)

    # Versionnement
    version = models.PositiveSmallIntegerField(default=1)
    statut_validation = models.CharField(
        max_length=30, choices=STATUTS_VALIDATION, default="brouillon",
    )
    ligne_parente = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="versions", verbose_name="Version précédente",
    )

    # Ajustement contextuel
    territoire = models.CharField(max_length=100, blank=True)
    saison = models.CharField(max_length=50, blank=True)
    coefficient_territoire = models.DecimalField(
        max_digits=5, decimal_places=3, default=1.0,
        verbose_name="Coefficient territorial",
    )

    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "bibliotheque_ligne_prix"
        verbose_name = "Ligne de bibliothèque de prix"
        verbose_name_plural = "Bibliothèque de prix"
        indexes = [
            models.Index(fields=["famille", "sous_famille"]),
            models.Index(fields=["code"]),
            models.Index(fields=["niveau", "organisation"]),
        ]

    def __str__(self):
        return f"[{self.niveau}] {self.code} — {self.designation_courte}"
