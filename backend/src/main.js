import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { applyRules } from './rules.js';

const app = express();

// ⚡ Autoriser le frontend à faire des requêtes
app.use(cors());

// ⚡ Servir le frontend HTML + Tailwind
app.use(express.static('frontend')); // <-- ton dossier qui contient index.html, style.css, etc.

// ⚡ Config pour l'upload de fichiers
const upload = multer({ dest: 'uploads/' });

// ⚡ Route pour traiter le fichier DOCX
app.post('/upload', upload.single('docx'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Fichier manquant' });

    // Ici tu parserais le fichier .docx et appliquerais les règles
    const data = []; // exemple : parseDocx(req.file.path)
    const result = applyRules(data);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ⚡ Démarrer le serveur
app.listen(3000, () => {
  console.log('Serveur lancé sur http://localhost:3000');
});
