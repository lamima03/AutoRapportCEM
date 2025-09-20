import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const upload = multer({ dest: path.join(__dirname, "uploads") });
const app = express();
const PORT = 3000;

const resultsDir = path.join(__dirname, "results");
if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir);

app.use(express.static(path.join(__dirname, "../frontend")));
app.use(express.json());
app.use("/results", express.static(path.join(__dirname, "results")));

// Import des modules
async function loadModules() {
  const { parseWord } = await import('./src/parser.js');
  const { applyRules } = await import('./src/rules.js');
  const { convertToCSV, generateDocx } = await import('./src/writer.js');
  const { generateSignature, normalizeData } = await import('./src/utils.js');
  
  return { parseWord, applyRules, convertToCSV, generateDocx, generateSignature, normalizeData };
}

// === Endpoint Upload + Analyse ===
app.post("/upload", upload.single("file"), async (req, res) => {
  const { parseWord, applyRules, convertToCSV, generateDocx, generateSignature, normalizeData } = await loadModules();
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Aucun fichier reçu" });
    }
    
    if (!fs.existsSync(req.file.path)) {
      return res.status(400).json({ error: "Le fichier uploadé est introuvable" });
    }
    
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    if (fileExt !== ".docx") {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Seuls les fichiers .docx sont acceptés" });
    }

    console.log("📄 Fichier reçu :", req.file.path);

    // Calcul du hash pour la signature
    const fileBuffer = fs.readFileSync(req.file.path);
    const fileHash = crypto.createHash('md5').update(fileBuffer).digest('hex');
    
    // Parsing du document
    let rows = await parseWord(req.file.path);
    console.log("✅ Parse terminé :", rows.length, "lignes");

    if (!Array.isArray(rows) || rows.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Le parseur n'a extrait aucune donnée valide" });
    }

    // Normalisation des données
    let normalizedData = normalizeData(rows);
    
    // Application des règles métier
  // === SECTION CORRIGÉE ===

// Application des règles métier
let results = applyRules(normalizedData); 
console.log("📋 Structure de results:", {
  rowsCount: results.rows ? results.rows.length : 0,
  hasRowsProperty: !!results.rows,
  isArray: Array.isArray(results.rows)
});

if (!Array.isArray(results.rows)) {
  results = { rows: [results] }; 
}


const csvData = convertToCSV(results.rows);
console.log("📊 convertToCSV appelée avec", results.rows.length, "lignes");

// Génération de la signature
const signature = generateSignature("VotreNom", fileHash);

// Générer des noms de fichiers uniques avec timestamp
const timestamp = Date.now();
const csvFilename = `output_${timestamp}.csv`;
const docxFilename = `output_${timestamp}.docx`;

const csvPath = path.join(resultsDir, csvFilename);
const docxPath = path.join(resultsDir, docxFilename);

fs.writeFileSync(csvPath, csvData);
console.log("✅ CSV généré :", csvPath);

// DOCX avec signature
await generateDocx(results, docxPath, signature);

// Nettoyer le fichier uploadé temporaire
fs.unlinkSync(req.file.path);

    res.json({
      message: "Analyse réussie",
      results: results,
      verdict: results.globalVerdict || "N/A",
      csvUrl: `http://localhost:${PORT}/results/${csvFilename}`,
      docxUrl: `http://localhost:${PORT}/results/${docxFilename}`,
      signature: signature
    });

  } catch (err) {
    console.error("❌ Erreur lors de l'analyse:", err);
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: err.message });
  }
});

// === Téléchargement ===
app.get("/download/:filename", (req, res) => {
  const filePath = path.join(resultsDir, req.params.filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Fichier introuvable" });
  }
  
  res.download(filePath, err => {
    if (err) {
      console.error("Erreur téléchargement :", err);
      res.status(500).json({ error: "Erreur lors du téléchargement" });
    } else {
      console.log("✅ Téléchargement réussi :", req.params.filename);
    }
  });
});

// Route pour lister les fichiers disponibles
app.get("/files", (req, res) => {
  try {
    const files = fs.readdirSync(resultsDir)
      .filter(file => fs.statSync(path.join(resultsDir, file)).isFile())
      .map(file => {
        return {
          name: file,
          size: fs.statSync(path.join(resultsDir, file)).size,
          url: `http://localhost:${PORT}/results/${file}`
        };
      });
    
    res.json({ files });
  } catch (err) {
    res.status(500).json({ error: "Impossible de lire le dossier des résultats" });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);

});