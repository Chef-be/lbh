"""
Modèles d'économie de la construction.
Plateforme BEE — Bureau d'Études Économiste

Cœur économique : déboursé sec, coûts, prix de vente, marges.
Aucune valeur métier codée en dur — tout passe par les paramètres.
"""

import uuid
import decimal
from django.db import models


class EtudeEconomique(models.Model):
    """Étude économique complète rattachée à un projet."""

    STATUTS = [
        ("brouillon", "Brouillon"),
        ("en_cours", "En cours"),
        ("a_valider", "À valider"),
        ("validee", "Validée"),
        ("archivee", "Archivée"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    projet = models.ForeignKey("projets.Projet", on_delete=models.CASCADE, related_name="etudes_economiques")
    lot = models.ForeignKey("projets.Lot", on_delete=models.SET_NULL, null=True, blank=True, related_name="etudes")
    intitule = models.CharField(max_length=300, verbose_name="Intitulé de l'étude")
    statut = models.CharField(max_length=30, choices=STATUTS, default="brouillon")
    version = models.PositiveSmallIntegerField(default=1)
    est_variante = models.BooleanField(default=False, verbose_name="Variante")
    etude_parente = models.ForeignKey(
        "self", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="variantes", verbose_name="Étude de base",
    )

    # Paramètres globaux de l'étude (surchargent les paramètres système)
    taux_frais_chantier = models.DecimalField(
        max_digits=6, decimal_places=4, null=True, blank=True,
        verbose_name="Taux frais de chantier",
        help_text="Laisser vide pour utiliser le paramètre système",
    )
    taux_frais_generaux = models.DecimalField(
        max_digits=6, decimal_places=4, null=True, blank=True,
        verbose_name="Taux frais généraux",
    )
    taux_aleas = models.DecimalField(
        max_digits=6, decimal_places=4, null=True, blank=True,
        verbose_name="Taux d'aléas",
    )
    taux_marge_cible = models.DecimalField(
        max_digits=6, decimal_places=4, null=True, blank=True,
        verbose_name="Taux de marge cible",
    )
    taux_pertes = models.DecimalField(
        max_digits=6, decimal_places=4, null=True, blank=True,
        verbose_name="Taux de pertes matières",
    )

    # Totaux calculés (mis à jour à chaque recalcul)
    total_debourse_sec = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_cout_direct = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_cout_revient = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_prix_vente = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_marge_brute = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_marge_nette = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    taux_marge_nette_global = models.DecimalField(max_digits=6, decimal_places=4, default=0)

    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    cree_par = models.ForeignKey("comptes.Utilisateur", on_delete=models.PROTECT, null=True)

    class Meta:
        db_table = "economie_etude_economique"
        verbose_name = "Étude économique"
        verbose_name_plural = "Études économiques"

    def __str__(self):
        return f"{self.intitule} v{self.version} — {self.projet.reference}"


class LignePrix(models.Model):
    """
    Ligne de prix dans une étude économique.
    Contient tous les éléments de calcul du déboursé sec au prix de vente.
    Les taux peuvent être surchargés individuellement ou hérités de l'étude/paramètres.
    """

    ETATS_RENTABILITE = [
        ("rentable", "Rentable"),
        ("surveiller", "À surveiller"),
        ("faible", "Faiblement rentable"),
        ("non_rentable", "Non rentable"),
        ("sous_condition", "Rentable sous condition"),
        ("deficitaire_origine", "Déficitaire dès l'origine"),
        ("indefini", "Non calculé"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    etude = models.ForeignKey(EtudeEconomique, on_delete=models.CASCADE, related_name="lignes")

    # Référence à la bibliothèque (optionnel — peut être saisi manuellement)
    ref_bibliotheque = models.ForeignKey(
        "bibliotheque.LignePrixBibliotheque", on_delete=models.SET_NULL,
        null=True, blank=True, related_name="utilisations",
    )

    # Identification de la ligne
    numero_ordre = models.PositiveSmallIntegerField(default=1, verbose_name="N° d'ordre")
    code = models.CharField(max_length=50, blank=True, verbose_name="Code")
    designation = models.TextField(verbose_name="Désignation")
    unite = models.CharField(max_length=20, verbose_name="Unité", default="u")

    # Quantités
    quantite_prevue = models.DecimalField(max_digits=15, decimal_places=3, verbose_name="Quantité prévue")
    quantite_reelle = models.DecimalField(
        max_digits=15, decimal_places=3, null=True, blank=True,
        verbose_name="Quantité réelle",
    )

    # Composantes du déboursé sec unitaire
    temps_main_oeuvre = models.DecimalField(
        max_digits=10, decimal_places=4, default=0,
        verbose_name="Temps MO (h/unité)",
    )
    cout_horaire_mo = models.DecimalField(
        max_digits=10, decimal_places=4, default=0,
        verbose_name="Coût horaire MO (€/h)",
    )
    cout_matieres = models.DecimalField(
        max_digits=12, decimal_places=4, default=0,
        verbose_name="Coût matières unitaire (€/u)",
    )
    cout_materiel = models.DecimalField(
        max_digits=12, decimal_places=4, default=0,
        verbose_name="Coût matériel unitaire (€/u)",
    )
    cout_sous_traitance = models.DecimalField(
        max_digits=12, decimal_places=4, default=0,
        verbose_name="Coût sous-traitance unitaire (€/u)",
    )
    cout_transport = models.DecimalField(
        max_digits=12, decimal_places=4, default=0,
        verbose_name="Coût transport unitaire (€/u)",
    )

    # Surcharges de taux (null = hérite de l'étude ou des paramètres)
    taux_pertes_surcharge = models.DecimalField(
        max_digits=6, decimal_places=4, null=True, blank=True,
    )
    taux_frais_chantier_surcharge = models.DecimalField(
        max_digits=6, decimal_places=4, null=True, blank=True,
    )
    taux_frais_generaux_surcharge = models.DecimalField(
        max_digits=6, decimal_places=4, null=True, blank=True,
    )
    taux_aleas_surcharge = models.DecimalField(
        max_digits=6, decimal_places=4, null=True, blank=True,
    )
    taux_marge_surcharge = models.DecimalField(
        max_digits=6, decimal_places=4, null=True, blank=True,
    )

    # Résultats calculés (mis à jour par le moteur de calcul)
    debourse_sec_unitaire = models.DecimalField(max_digits=12, decimal_places=4, default=0)
    cout_direct_unitaire = models.DecimalField(max_digits=12, decimal_places=4, default=0)
    cout_revient_unitaire = models.DecimalField(max_digits=12, decimal_places=4, default=0)
    prix_vente_unitaire = models.DecimalField(max_digits=12, decimal_places=4, default=0)
    marge_brute_unitaire = models.DecimalField(max_digits=12, decimal_places=4, default=0)
    marge_nette_unitaire = models.DecimalField(max_digits=12, decimal_places=4, default=0)
    taux_marge_nette = models.DecimalField(max_digits=6, decimal_places=4, default=0)
    marge_brute_totale = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    marge_nette_totale = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    contribution_marge = models.DecimalField(
        max_digits=6, decimal_places=4, default=0,
        verbose_name="Contribution à la marge du lot (%)",
    )

    # Rentabilité
    etat_rentabilite = models.CharField(
        max_length=30, choices=ETATS_RENTABILITE, default="indefini",
        verbose_name="État de rentabilité",
    )
    seuil_quantite_critique = models.DecimalField(
        max_digits=15, decimal_places=3, null=True, blank=True,
        verbose_name="Quantité critique (seuil de rentabilité nulle)",
    )
    seuil_prix_minimum = models.DecimalField(
        max_digits=12, decimal_places=4, null=True, blank=True,
        verbose_name="Prix de vente minimum (rentabilité nulle)",
    )

    # Sensibilités calculées
    indice_sensibilite_quantite = models.DecimalField(
        max_digits=6, decimal_places=2, null=True, blank=True,
    )
    indice_sensibilite_main_oeuvre = models.DecimalField(
        max_digits=6, decimal_places=2, null=True, blank=True,
    )
    indice_sensibilite_matieres = models.DecimalField(
        max_digits=6, decimal_places=2, null=True, blank=True,
    )

    # Causes de non-rentabilité (liste JSON)
    causes_non_rentabilite = models.JSONField(default=list, blank=True)

    # Métadonnées
    observations = models.TextField(blank=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "economie_ligne_prix"
        verbose_name = "Ligne de prix"
        verbose_name_plural = "Lignes de prix"
        ordering = ["etude", "numero_ordre"]

    def __str__(self):
        return f"{self.code} — {self.designation[:60]}"
