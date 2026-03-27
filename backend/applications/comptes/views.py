"""
Vues API pour les comptes utilisateurs — Plateforme BEE.
Authentification, gestion du profil et administration des utilisateurs.
"""

from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import Utilisateur, JournalConnexion
from .serialiseurs import (
    ConnexionSerialiseur,
    ModificationMotDePasseSerialiseur,
    UtilisateurCreationSerialiseur,
    UtilisateurSerialiseur,
)


class VueConnexion(generics.GenericAPIView):
    """
    POST /api/auth/connexion/
    Authentifie l'utilisateur et retourne une paire de jetons JWT.
    """

    serializer_class = ConnexionSerialiseur
    permission_classes = [permissions.AllowAny]

    def post(self, requete):
        serialiseur = self.get_serializer(
            data=requete.data,
            context={"request": requete},
        )
        if not serialiseur.is_valid():
            # Journalisation de l'échec
            JournalConnexion.objects.create(
                courriel_saisi=requete.data.get("courriel", ""),
                succes=False,
                adresse_ip=self._obtenir_ip(requete),
                agent_navigateur=requete.META.get("HTTP_USER_AGENT", ""),
                motif_echec=str(serialiseur.errors),
            )
            return Response(serialiseur.errors, status=status.HTTP_401_UNAUTHORIZED)

        utilisateur = serialiseur.validated_data["utilisateur"]

        # Réinitialisation du compteur de tentatives en cas de succès
        utilisateur.tentatives_connexion = 0
        utilisateur.verrouille_jusqu_au = None
        utilisateur.derniere_connexion_ip = self._obtenir_ip(requete)
        utilisateur.save(update_fields=[
            "tentatives_connexion", "verrouille_jusqu_au", "derniere_connexion_ip"
        ])

        # Journalisation du succès
        JournalConnexion.objects.create(
            utilisateur=utilisateur,
            courriel_saisi=utilisateur.courriel,
            succes=True,
            adresse_ip=self._obtenir_ip(requete),
            agent_navigateur=requete.META.get("HTTP_USER_AGENT", ""),
        )

        jetons = serialiseur.obtenir_jetons()
        return Response({
            "jetons": jetons,
            "utilisateur": UtilisateurSerialiseur(utilisateur).data,
        })

    def _obtenir_ip(self, requete) -> str:
        entete_forwarded = requete.META.get("HTTP_X_FORWARDED_FOR")
        if entete_forwarded:
            return entete_forwarded.split(",")[0].strip()
        return requete.META.get("REMOTE_ADDR", "")


class VueDeconnexion(generics.GenericAPIView):
    """
    POST /api/auth/deconnexion/
    Révoque le jeton de rafraîchissement.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, requete):
        jeton_rafraichissement = requete.data.get("rafraichissement")
        if jeton_rafraichissement:
            try:
                jeton = RefreshToken(jeton_rafraichissement)
                jeton.blacklist()
            except Exception:
                pass  # Jeton déjà invalide — pas d'erreur
        return Response(
            {"detail": "Déconnexion effectuée."},
            status=status.HTTP_200_OK,
        )


class VueMoiMeme(generics.RetrieveUpdateAPIView):
    """
    GET  /api/auth/moi/    → profil de l'utilisateur connecté
    PATCH /api/auth/moi/   → mise à jour partielle du profil
    """

    serializer_class = UtilisateurSerialiseur
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class VueModificationMotDePasse(generics.GenericAPIView):
    """
    POST /api/auth/modifier-mot-de-passe/
    """

    serializer_class = ModificationMotDePasseSerialiseur
    permission_classes = [permissions.IsAuthenticated]

    def post(self, requete):
        serialiseur = self.get_serializer(
            data=requete.data,
            context={"request": requete},
        )
        serialiseur.is_valid(raise_exception=True)
        requete.user.set_password(serialiseur.validated_data["nouveau_mot_de_passe"])
        requete.user.save()
        return Response({"detail": "Mot de passe modifié avec succès."})


class VueListeUtilisateurs(generics.ListCreateAPIView):
    """
    GET  /api/auth/utilisateurs/     → liste des utilisateurs (admin)
    POST /api/auth/utilisateurs/     → création d'un utilisateur (admin)
    """

    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return UtilisateurCreationSerialiseur
        return UtilisateurSerialiseur

    def get_queryset(self):
        utilisateur = self.request.user
        if not utilisateur.a_droit("comptes.lister_utilisateurs"):
            return Utilisateur.objects.none()
        qs = Utilisateur.objects.select_related("profil", "organisation")
        # Filtre par organisation si non super-admin
        if not utilisateur.est_super_admin and utilisateur.organisation:
            qs = qs.filter(organisation=utilisateur.organisation)
        return qs


class VueDetailUtilisateur(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/auth/utilisateurs/<id>/
    PATCH  /api/auth/utilisateurs/<id>/
    DELETE /api/auth/utilisateurs/<id>/
    """

    serializer_class = UtilisateurSerialiseur
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        utilisateur = self.request.user
        if not utilisateur.a_droit("comptes.modifier_utilisateur"):
            return Utilisateur.objects.none()
        return Utilisateur.objects.select_related("profil", "organisation")

    def destroy(self, requete, *args, **kwargs):
        # Désactivation plutôt que suppression physique
        objet = self.get_object()
        objet.est_actif = False
        objet.save(update_fields=["est_actif"])
        return Response(
            {"detail": "Compte désactivé."},
            status=status.HTTP_200_OK,
        )
