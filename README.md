
**📊 AutoDocArranger - Analyseur CEM**
**🎯 Description**
Application web pour automatiser le traitement des documents Word de tests CEM et générer des rapports formatés.

**🚀 Installation**
bash
cd backend
npm install
node server


**📋 Utilisation**

Démarrez le serveur : node server
Accédez à : http://localhost:3000
Uploader un fichier DOCX avec données CEM
Téléchargez les résultats : CSV + DOCX

**⚙️ Fonctionnalités**

✅ Extraction automatique des données DOCX
✅ Analyse des verdicts PASS/FAIL
✅ Génération de CSV structuré
✅ Création de rapports Word professionnels
✅ Signature cryptographique pour traçabilité

**🏗️ Structure**

text
backend/

├── src/main.js
├── src/util.js.     # Utilities communes
├── src/parser.js    # Extraction données
├── src/rules.js     # Logique métier CEM  
├── src/writer.js    # Génération outputs
├── uploads/         # Fichiers temporaires
├── server.js
└── results/         # Fichiers générés

**🔗 API Endpoints**

POST /upload - Upload de fichier
GET /download/:filename - Téléchargement
GET /health - Statut du serveur

**📊 Formats Supportés**

Entrée : DOCX avec données CEM brutes
Sortie : CSV structuré + DOCX formaté

**Auteur jemima MUKANZA FULLSTACK**
