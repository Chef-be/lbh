"""
Modèles de supervision — Alertes, journaux d'activité et métriques.
Plateforme BEE — Bureau d'Études Économiste
"""

import uuid
from django.db import models


class EvenementSysteme(models.Model):
    """
    Journal d'événements système (erreurs, démarrages, migrations, etc.).
    """

    NIVEAUX = [
        ("debug", "Débogage"),
        ("info", "Information"),
        ("avertissement", "Avertissement"),
        ("erreur", "Erreur"),
        ("critique", "Critique"),
    ]

    CATEGORIES = [
        ("securite", "Sécurité"),
        ("performance", "Performance"),
        ("erreur_applicative", "Erreur applicative"),
        ("maintenance", "Maintenance"),
        ("donnees", "Données"),
        ("authentification", "Authentification"),
        ("systeme", "Système"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    niveau = models.CharField(max_length=20, choices=NIVEAUX, default="info")
    categorie = models.CharField(max_length=30, choices=CATEGORIES, default="systeme")
    message = models.TextField(verbose_name="Message")
    details = models.JSONField(null=True, blank=True, verbose_name="Détails techniques")
    source = models.CharField(max_length=200, blank=True, verbose_name="Source (module, vue)")
    adresse_ip = models.GenericIPAddressField(null=True, blank=True)
    utilisateur = models.ForeignKey(
        "comptes.Utilisateur", on_delete=models.SET_NULL,
        null=True, blank=True, related_name="evenements_systeme",
    )
    date_evenement = models.DateTimeField(auto_now_add=True)
    resolu = models.BooleanField(default=False)
    date_resolution = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "supervision_evenement"
        verbose_name = "Événement système"
        verbose_name_plural = "Événements système"
        ordering = ["-date_evenement"]
        indexes = [
            models.Index(fields=["niveau", "date_evenement"]),
            models.Index(fields=["categorie"]),
        ]

    def __str__(self):
        return f"[{self.niveau.upper()}] {self.message[:80]}"


class MetriqueService(models.Model):
    """
    Métrique de performance d'un service (backend, celery, postgresql, etc.).
    Stocke des instantanés périodiques pour le tableau de bord de supervision.
    """

    SERVICES = [
        ("backend", "Cœur applicatif"),
        ("celery", "File de tâches Celery"),
        ("postgresql", "Base de données PostgreSQL"),
        ("redis", "Cache Redis"),
        ("minio", "Stockage MinIO"),
        ("frontend", "Interface utilisateur"),
    ]

    service = models.CharField(max_length=30, choices=SERVICES)
    disponible = models.BooleanField(default=True, verbose_name="Service disponible")
    temps_reponse_ms = models.PositiveIntegerField(
        null=True, blank=True, verbose_name="Temps de réponse (ms)",
    )
    charge_cpu_pct = models.DecimalField(
        max_digits=5, decimal_places=2,
        null=True, blank=True, verbose_name="Charge CPU (%)",
    )
    memoire_pct = models.DecimalField(
        max_digits=5, decimal_places=2,
        null=True, blank=True, verbose_name="Mémoire utilisée (%)",
    )
    details = models.JSONField(null=True, blank=True)
    horodatage = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "supervision_metrique"
        verbose_name = "Métrique de service"
        verbose_name_plural = "Métriques de services"
        ordering = ["-horodatage"]
        indexes = [models.Index(fields=["service", "horodatage"])]

    def __str__(self):
        etat = "✓" if self.disponible else "✗"
        return f"{etat} {self.service} — {self.horodatage.strftime('%d/%m %H:%M')}"


class AlerteSupervision(models.Model):
    """
    Alerte déclenchée automatiquement par la supervision.
    """

    TYPES = [
        ("service_indisponible", "Service indisponible"),
        ("performance_degradee", "Performance dégradée"),
        ("espace_disque", "Espace disque critique"),
        ("erreurs_repetees", "Erreurs répétées"),
        ("tentatives_connexion", "Tentatives de connexion suspectes"),
        ("tache_bloquee", "Tâche Celery bloquée"),
        ("certificat_expiration", "Certificat SSL proche de l'expiration"),
    ]

    NIVEAUX = [
        ("info", "Information"),
        ("avertissement", "Avertissement"),
        ("critique", "Critique"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    type_alerte = models.CharField(max_length=40, choices=TYPES)
    niveau = models.CharField(max_length=20, choices=NIVEAUX, default="avertissement")
    titre = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    service_concerne = models.CharField(max_length=100, blank=True)
    est_active = models.BooleanField(default=True, verbose_name="Alerte active")
    date_declenchement = models.DateTimeField(auto_now_add=True)
    date_resolution = models.DateTimeField(null=True, blank=True)
    acquittee_par = models.ForeignKey(
        "comptes.Utilisateur", on_delete=models.SET_NULL,
        null=True, blank=True, related_name="alertes_acquittees",
    )

    class Meta:
        db_table = "supervision_alerte"
        verbose_name = "Alerte de supervision"
        verbose_name_plural = "Alertes de supervision"
        ordering = ["-date_declenchement"]

    def __str__(self):
        return f"{self.titre} ({self.niveau})"
