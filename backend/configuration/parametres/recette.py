"""
Paramètres Django — Environnement recette (staging).
"""
from .production import *  # noqa

# En recette, les courriels vont vers un compte de test
DEFAULT_FROM_EMAIL = f"[RECETTE] {NOM_PLATEFORME} <noreply@localhost>"  # noqa
