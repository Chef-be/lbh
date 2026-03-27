"""
Sérialiseurs pour l'application Comptes — Plateforme BEE.
"""

from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Utilisateur, ProfilDroit, DroitFin, JournalConnexion


class ProfilDroitSerialiseur(serializers.ModelSerializer):
    class Meta:
        model = ProfilDroit
        fields = ["id", "code", "libelle", "description"]


class UtilisateurSerialiseur(serializers.ModelSerializer):
    """Sérialiseur public de l'utilisateur (sans données sensibles)."""

    nom_complet = serializers.CharField(read_only=True)
    profil_libelle = serializers.CharField(source="profil.libelle", read_only=True)
    organisation_nom = serializers.CharField(source="organisation.nom", read_only=True)

    class Meta:
        model = Utilisateur
        fields = [
            "id", "courriel", "prenom", "nom", "nom_complet",
            "telephone", "fonction", "avatar",
            "organisation", "organisation_nom",
            "profil", "profil_libelle",
            "est_actif", "est_super_admin",
            "langue", "fuseau_horaire", "notifications_courriel",
            "date_creation", "derniere_connexion_ip",
        ]
        read_only_fields = ["id", "date_creation", "est_super_admin"]


class UtilisateurCreationSerialiseur(serializers.ModelSerializer):
    """Sérialiseur pour la création d'un utilisateur."""

    mot_de_passe = serializers.CharField(write_only=True, min_length=12)
    mot_de_passe_confirmation = serializers.CharField(write_only=True)

    class Meta:
        model = Utilisateur
        fields = [
            "courriel", "prenom", "nom",
            "telephone", "fonction",
            "organisation", "profil",
            "mot_de_passe", "mot_de_passe_confirmation",
        ]

    def validate(self, donnees):
        if donnees["mot_de_passe"] != donnees["mot_de_passe_confirmation"]:
            raise serializers.ValidationError(
                {"mot_de_passe_confirmation": "Les mots de passe ne correspondent pas."}
            )
        return donnees

    def create(self, donnees_validees):
        mot_de_passe = donnees_validees.pop("mot_de_passe")
        donnees_validees.pop("mot_de_passe_confirmation")
        utilisateur = Utilisateur.objects.create_user(
            password=mot_de_passe, **donnees_validees
        )
        return utilisateur


class ConnexionSerialiseur(serializers.Serializer):
    """Sérialiseur pour la connexion (obtention d'un jeton JWT)."""

    courriel = serializers.EmailField()
    mot_de_passe = serializers.CharField(write_only=True)

    def validate(self, donnees):
        courriel = donnees.get("courriel", "").lower()
        mot_de_passe = donnees.get("mot_de_passe")

        utilisateur = authenticate(
            request=self.context.get("request"),
            username=courriel,
            password=mot_de_passe,
        )

        if not utilisateur:
            raise serializers.ValidationError(
                "Identifiants incorrects. Vérifiez votre adresse de courriel et votre mot de passe."
            )

        if utilisateur.est_verrouille:
            raise serializers.ValidationError(
                f"Ce compte est temporairement verrouillé jusqu'au "
                f"{utilisateur.verrouille_jusqu_au.strftime('%d/%m/%Y à %H:%M')}."
            )

        if not utilisateur.est_actif:
            raise serializers.ValidationError("Ce compte est désactivé.")

        donnees["utilisateur"] = utilisateur
        return donnees

    def obtenir_jetons(self) -> dict:
        utilisateur = self.validated_data["utilisateur"]
        jeton = RefreshToken.for_user(utilisateur)
        return {
            "acces": str(jeton.access_token),
            "rafraichissement": str(jeton),
        }


class ModificationMotDePasseSerialiseur(serializers.Serializer):
    """Modification du mot de passe par l'utilisateur connecté."""

    ancien_mot_de_passe = serializers.CharField(write_only=True)
    nouveau_mot_de_passe = serializers.CharField(write_only=True, min_length=12)
    confirmation = serializers.CharField(write_only=True)

    def validate(self, donnees):
        utilisateur = self.context["request"].user
        if not utilisateur.check_password(donnees["ancien_mot_de_passe"]):
            raise serializers.ValidationError(
                {"ancien_mot_de_passe": "L'ancien mot de passe est incorrect."}
            )
        if donnees["nouveau_mot_de_passe"] != donnees["confirmation"]:
            raise serializers.ValidationError(
                {"confirmation": "Les nouveaux mots de passe ne correspondent pas."}
            )
        return donnees
