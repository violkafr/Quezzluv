QUESTIONNAIRE LOCAL — GUIDE RAPIDE
==================================

Contenu
- index.html : interface du questionnaire
- style.css  : mise en forme responsive
- app.js     : navigation, validation et LocalStorage
- questions.json : liste modifiable des questions

LANCEMENT
Le navigateur bloque souvent le chargement d'un fichier JSON quand index.html est ouvert directement (file://).
Lance donc un petit serveur local dans ce dossier :

Méthode Python (si Python est installé)
1. Ouvre le dossier dans l'Explorateur de fichiers.
2. Clique dans la barre d'adresse, tape cmd puis Entrée.
3. Dans la fenêtre qui s'ouvre, exécute :
   python -m http.server 8000
   (ou py -m http.server 8000 sur Windows)
4. Ouvre http://localhost:8000 dans ton navigateur.
5. Pour arrêter le serveur : Ctrl+C dans la fenêtre.

Alternative : utilise l'extension Live Server dans Visual Studio Code.

MODIFIER LES QUESTIONS
Ouvre questions.json et modifie le tableau "questions".
Chaque question doit avoir :
- questionId : identifiant unique (nombre ou texte)
- question : texte de la question
- reponses : tableau contenant autant de réponses que souhaité (minimum 2)

Exemple :
{
  "questions": [
    {
      "questionId": 1,
      "question": "À quelle fréquence vas-tu faire tes courses ?",
      "reponses": ["Tous les jours", "Tous les deux jours", "Deux fois par semaine", "Une fois par semaine"]
    },
    {
      "questionId": 2,
      "question": "Quel est ton moyen de transport préféré ?",
      "reponses": ["À pied", "Vélo", "Bus", "Voiture", "Autre"]
    }
  ]
}

Attention : JSON exige des guillemets doubles autour des clés et des textes, et pas de virgule après le dernier élément.
Les réponses et le pseudo sont enregistrés dans le LocalStorage du navigateur, sur l'adresse locale utilisée.
Les données ne sont pas partagées automatiquement entre navigateurs ou ordinateurs.
Le bouton "Effacer les données" supprime les données enregistrées.


QUESTION À RÉPONSE LIBRE
Si une question possède exactement une entrée dans "reponses", le site affiche un champ de texte à la place des choix.
Cette unique entrée sert de texte indicatif (placeholder), pas de réponse imposée.

Exemple :
{
  "questionId": 10,
  "question": "Ton meilleur souvenir en couple",
  "reponses": ["Écris ton souvenir ici…"]
}

La réponse tapée sera sauvegardée dans le LocalStorage et apparaîtra intégralement dans le récapitulatif.
Pour une question à choix multiples, mets au moins deux entrées dans "reponses".
