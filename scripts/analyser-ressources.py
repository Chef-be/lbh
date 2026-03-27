#!/usr/bin/env python3
# ============================================================
# Analyseur de ressources documentaires
# Plateforme BEE — Script d'ingestion et d'analyse
# ============================================================
# Ce script analyse les fichiers déposés dans ressources/entree/
# Il peut aussi être utilisé par Claude Code pour lire et
# comprendre les documents métier et améliorer le projet.
#
# Usage :
#   python scripts/analyser-ressources.py [--mode ingestion|analyse|resume]
#   --mode ingestion : classe et indexe les nouveaux fichiers
#   --mode analyse   : extrait le texte et crée des résumés
#   --mode resume    : affiche un résumé de toutes les ressources
# ============================================================

import os
import sys
import json
import hashlib
import shutil
import datetime
import argparse
import unicodedata
import re
from pathlib import Path

RACINE_PROJET = Path(__file__).parent.parent
RACINE_RESSOURCES = Path("/var/www/vhosts/lbh-economiste.com/ressources")
ENTREE = RACINE_RESSOURCES / "entree"
DOCUMENTS = RACINE_RESSOURCES / "documents"
INDEXATION = RACINE_RESSOURCES / "indexation"
TRAITEMENT = RACINE_RESSOURCES / "traitement"
ARCHIVES = RACINE_RESSOURCES / "archives" / "imports"
CATALOGUE = INDEXATION / "catalogue.csv"
CORRESPONDANCES = INDEXATION / "correspondances.json"

# Familles métier et mots-clés associés pour la classification automatique
FAMILLES_METIER = {
    "voirie": ["voirie", "chaussée", "chaussee", "vrd", "bitume", "revêtement", "revetement",
               "terrassement", "drainage", "assainissement", "trafic", "essieu", "portance",
               "cbr", "ev2", "grave", "enrobé", "enrobe", "dimensionnement"],
    "batiment": ["bâtiment", "batiment", "maçonnerie", "maconnerie", "fondation", "dallage",
                 "structure", "béton", "beton", "acier", "charpente", "toiture", "plancher",
                 "soubassement", "mur", "paroi"],
    "economie": ["économie", "economie", "chiffrage", "estimation", "bordereau", "prix",
                 "marché", "marche", "appel offres", "mémoire", "memoire", "dpgf", "bpu", "dqe",
                 "déboursé", "debourse", "marge", "coût", "cout"],
    "reglementaire": ["dtü", "dtu", "norme", "nf", "en", "ccag", "ccap", "cctp", "fascicule",
                      "réglementation", "reglementation", "loi", "décret", "decret", "arrêté",
                      "arrete", "instruction"],
    "securite": ["sécurité", "securite", "sps", "ppsps", "risque", "prevention", "signalisation",
                 "balisage", "hygiène", "hygiene"],
}

TYPES_DOCUMENT = {
    "guide_technique": ["guide", "manuel", "méthode", "methode", "catalogue", "référentiel", "referentiel"],
    "norme": ["norme", "dtu", "nf ", "en ", "iso"],
    "etude": ["étude", "etude", "rapport", "note"],
    "plan": ["plan", "dessin", "coupe", "élévation", "elevation"],
    "tableur": ["bordereau", "quantitatif", "devis", "dpgf", "bpu", "dqe"],
    "procedure": ["procédure", "procedure", "mode opératoire", "mode operatoire"],
}


def normaliser_nom(nom: str) -> str:
    """Convertit un nom de fichier en nom normalisé stable."""
    # Supprimer l'extension
    extension = Path(nom).suffix.lower()
    base = Path(nom).stem
    # Normaliser les caractères
    base = unicodedata.normalize("NFKD", base).encode("ascii", "ignore").decode("ascii")
    # Minuscules, tirets
    base = base.lower()
    base = re.sub(r"[^a-z0-9]+", "-", base)
    base = re.sub(r"-+", "-", base).strip("-")
    return f"{base}{extension}"


def detecter_famille(nom: str, contenu: str = "") -> tuple[str, float]:
    """Détecte la famille métier d'un document par analyse du nom et du contenu."""
    texte = (nom + " " + contenu).lower()
    scores = {}
    for famille, mots_cles in FAMILLES_METIER.items():
        score = sum(1 for mc in mots_cles if mc in texte)
        if score > 0:
            scores[famille] = score

    if not scores:
        return "general", 0.3

    meilleure = max(scores, key=scores.get)
    confiance = min(0.95, 0.5 + scores[meilleure] * 0.1)
    return meilleure, confiance


def detecter_type_document(nom: str, contenu: str = "") -> str:
    """Détecte le type de document."""
    texte = (nom + " " + contenu).lower()
    for type_doc, mots in TYPES_DOCUMENT.items():
        if any(m in texte for m in mots):
            return type_doc
    return "document_divers"


def extraire_texte_pdf(chemin: Path) -> str:
    """Extrait le texte d'un fichier PDF (si PyMuPDF disponible)."""
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(str(chemin))
        texte = ""
        for page in doc[:5]:  # Limiter aux 5 premières pages pour l'analyse
            texte += page.get_text()
        doc.close()
        return texte[:5000]  # Limiter à 5000 caractères
    except ImportError:
        return ""
    except Exception as e:
        return f"[Erreur extraction : {e}]"


def calculer_empreinte(chemin: Path) -> str:
    """Calcule le hash MD5 d'un fichier pour détecter les doublons."""
    h = hashlib.md5()
    with open(chemin, "rb") as f:
        for bloc in iter(lambda: f.read(65536), b""):
            h.update(bloc)
    return h.hexdigest()


def charger_catalogue() -> list:
    """Charge le catalogue CSV des ressources."""
    if not CATALOGUE.exists():
        return []
    import csv
    with open(CATALOGUE, "r", encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def sauvegarder_catalogue(entrees: list):
    """Sauvegarde le catalogue CSV."""
    import csv
    champs = ["nom_origine", "nom_normalise", "chemin_normalise", "date_import",
              "type_document", "famille_metier", "mots_cles", "niveau_confiance",
              "statut", "observations"]
    with open(CATALOGUE, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=champs)
        w.writeheader()
        w.writerows(entrees)


def charger_correspondances() -> dict:
    with open(CORRESPONDANCES, "r", encoding="utf-8") as f:
        return json.load(f)


def sauvegarder_correspondances(data: dict):
    with open(CORRESPONDANCES, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def ingerer_fichiers():
    """Mode ingestion : traite les fichiers dans entree/ et les classe."""
    fichiers = [f for f in ENTREE.iterdir() if f.is_file() and not f.name.startswith(".")]

    if not fichiers:
        print("✅ Aucun nouveau fichier à ingérer dans entree/")
        return

    print(f"📂 {len(fichiers)} fichier(s) trouvé(s) dans entree/\n")
    catalogue = charger_catalogue()
    correspondances = charger_correspondances()
    noms_existants = {e["nom_origine"] for e in catalogue}

    traites = 0
    erreurs = 0

    for fichier in fichiers:
        print(f"  → Traitement : {fichier.name}")
        if fichier.name in noms_existants:
            print(f"    ⚠️  Déjà indexé — ignoré.")
            continue

        try:
            # Extraire le texte si PDF
            contenu = ""
            if fichier.suffix.lower() == ".pdf":
                contenu = extraire_texte_pdf(fichier)

            # Classifier
            famille, confiance = detecter_famille(fichier.name, contenu)
            type_doc = detecter_type_document(fichier.name, contenu)
            nom_normalise = normaliser_nom(fichier.name)

            # Destination
            dest_dossier = DOCUMENTS / famille
            dest_dossier.mkdir(parents=True, exist_ok=True)
            dest_chemin = dest_dossier / nom_normalise

            # Gérer les conflits de noms
            compteur = 1
            while dest_chemin.exists():
                base = dest_dossier / f"{Path(nom_normalise).stem}-{compteur}{Path(nom_normalise).suffix}"
                dest_chemin = base
                compteur += 1

            # Copier vers archive
            ARCHIVES.mkdir(parents=True, exist_ok=True)
            shutil.copy2(fichier, ARCHIVES / fichier.name)

            # Déplacer vers destination classifiée
            shutil.move(str(fichier), str(dest_chemin))

            # Enregistrer dans le catalogue
            entree = {
                "nom_origine": fichier.name,
                "nom_normalise": dest_chemin.name,
                "chemin_normalise": str(dest_chemin.relative_to(RACINE_RESSOURCES)),
                "date_import": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
                "type_document": type_doc,
                "famille_metier": famille,
                "mots_cles": "",
                "niveau_confiance": f"{confiance:.2f}",
                "statut": "indexe",
                "observations": f"Classé automatiquement — confiance {confiance:.0%}",
            }
            catalogue.append(entree)

            # Enregistrer dans correspondances.json
            correspondances["documents"].append({
                "nom_origine": fichier.name,
                "nom_normalise": dest_chemin.name,
                "chemin_normalise": str(dest_chemin.relative_to(RACINE_RESSOURCES)),
                "date_import": datetime.datetime.now().isoformat(),
                "type_document": type_doc,
                "famille_metier": famille,
                "niveau_confiance": confiance,
                "extrait_texte": contenu[:500] if contenu else "",
            })

            print(f"    ✅ Classé → documents/{famille}/{dest_chemin.name} (confiance : {confiance:.0%})")
            traites += 1

        except Exception as e:
            print(f"    ❌ Erreur : {e}")
            erreurs += 1

    sauvegarder_catalogue(catalogue)
    sauvegarder_correspondances(correspondances)

    print(f"\n{'='*50}")
    print(f"✅ Ingestion terminée : {traites} traités, {erreurs} erreurs")
    print(f"📋 Catalogue mis à jour : {CATALOGUE}")


def afficher_resume():
    """Mode résumé : affiche l'état de toutes les ressources pour Claude."""
    catalogue = charger_catalogue()
    correspondances = charger_correspondances()

    print("=" * 60)
    print("RÉSUMÉ DES RESSOURCES DOCUMENTAIRES — Plateforme BEE")
    print("=" * 60)
    print(f"Total documents indexés : {len(catalogue)}")
    print()

    # Grouper par famille
    familles = {}
    for entree in catalogue:
        f = entree.get("famille_metier", "autre")
        familles.setdefault(f, []).append(entree)

    for famille, docs in sorted(familles.items()):
        print(f"\n📁 {famille.upper()} ({len(docs)} documents)")
        for doc in docs:
            print(f"   • {doc['nom_normalise']}")
            if doc.get("observations"):
                print(f"     → {doc['observations']}")

    # Fichiers en attente
    en_attente = [f for f in ENTREE.iterdir() if f.is_file() and not f.name.startswith(".")]
    if en_attente:
        print(f"\n⏳ FICHIERS EN ATTENTE D'INGESTION ({len(en_attente)})")
        for f in en_attente:
            print(f"   • {f.name}")
        print("\n  Lancer : python scripts/analyser-ressources.py --mode ingestion")

    print("\n" + "=" * 60)


def analyser_pour_claude():
    """
    Mode analyse : extrait le texte de tous les PDF pour que Claude
    puisse comprendre le domaine métier et améliorer le projet.
    Produit un fichier de résumé lisible par Claude.
    """
    correspondances = charger_correspondances()
    docs = correspondances.get("documents", [])

    print(f"Analyse de {len(docs)} documents pour compréhension du domaine...\n")

    rapport = {
        "date_analyse": datetime.datetime.now().isoformat(),
        "total_documents": len(docs),
        "documents_analyses": [],
    }

    for doc in docs:
        chemin = RACINE_RESSOURCES / doc["chemin_normalise"]
        if not Path(chemin).exists():
            continue

        if chemin.suffix.lower() == ".pdf":
            texte = extraire_texte_pdf(Path(chemin))
            rapport["documents_analyses"].append({
                "nom": doc["nom_normalise"],
                "famille": doc["famille_metier"],
                "type": doc["type_document"],
                "extrait": texte[:2000],
            })
            print(f"  ✅ {doc['nom_normalise']} ({doc['famille_metier']})")
        else:
            print(f"  ⏭️  {doc['nom_normalise']} (format non-PDF ignoré)")

    # Sauvegarder le rapport
    rapport_chemin = RACINE_RESSOURCES / "indexation" / "rapport-analyse.json"
    with open(rapport_chemin, "w", encoding="utf-8") as f:
        json.dump(rapport, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Rapport sauvegardé : {rapport_chemin}")
    print(f"   Claude peut maintenant lire ce fichier pour comprendre le domaine.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Analyseur de ressources documentaires")
    parser.add_argument("--mode", choices=["ingestion", "analyse", "resume"],
                        default="resume", help="Mode d'opération")
    args = parser.parse_args()

    if args.mode == "ingestion":
        ingerer_fichiers()
    elif args.mode == "analyse":
        analyser_pour_claude()
    elif args.mode == "resume":
        afficher_resume()
