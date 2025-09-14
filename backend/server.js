import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun } from "docx";
import { fileURLToPath } from "url";
import { parseDocx } from "./src/parser.js"; // Ajout de l'extension .js

// Résoudre __dirname (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "../frontend")));
app.use(express.json());

// Config multer (upload DOCX dans /uploads)
const upload = multer({ dest: "uploads/" });

// === Fonction de conversion CSV ===
export function convertToCSV(rows = []) {
  if (!rows || rows.length === 0) {
    return "Sample,Section,Frequency,Detector,Polarization,AntennaPosition,Margin,Overtaking,Conformity,Limit\n";
  }

  const header = [
    "Sample", "Section", "Frequency", "Detector", "Polarization",
    "AntennaPosition", "Margin", "Overtaking", "Conformity", "Limit"
  ];

  const csvRows = rows.map(row => [
    row.sample,
    `"${row.section}"`,
    row.frequency,
    row.detector,
    row.polarization,
    row.antennaPosition,
    row.margin,
    row.overtaking,
    row.conformity,
    `"${row.limit}"`
  ].join(","));

  return [header.join(","), ...csvRows].join("\n");
}

// === Fonction de génération DOCX ===
async function generateDocx(results, outputPath) {
  // Création du tableau avec en-têtes
  const headerRow = new TableRow({
    children: [
      "Sample", "Section", "Frequency", "Detector", "Polarization",
      "Antenna", "Margin", "Overtaking", "Conformity", "Limit"
    ].map(text => new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })],
      shading: { fill: "DDDDDD" }
    }))
  });

  // Création des lignes de données
  const dataRows = results.rows.map(row => new TableRow({
    children: [
      row.sample,
      row.section,
      row.frequency.toString(),
      row.detector,
      row.polarization,
      row.antennaPosition,
      row.margin.toString(),
      row.overtaking.toString(),
      row.conformity,
      row.limit
    ].map((value, index) => {
      // Mise en forme conditionnelle pour les échecs
      const isFailure = row.conformity === "NOK" && (index === 6 || index === 7);
      return new TableCell({
        children: [new Paragraph({
          children: [new TextRun({
            text: value,
            color: isFailure ? "FF0000" : "000000",
            bold: isFailure
          })]
        })]
      });
    })
  }));

  // Construction du document
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          children: [new TextRun({
            text: "Rapport de Tests CEM",
            size: 28,
            bold: true
          })],
          alignment: "CENTER"
        }),
        new Table({
          rows: [headerRow, ...dataRows],
          width: { size: 100, type: "PERCENTAGE" }
        })
      ]
    }]
  });

  // Génération du fichier
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  return buffer;
}

// Vérification/création des répertoires
const dirs = ["uploads", "results"];
dirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);
});

// ✅ Upload + analyse
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Aucun fichier reçu" });

    // 1. Parsing du document
    const data = await parseDocx(req.file.path);

    // 2. Calcul du verdict global
    const globalVerdict = data.some(item => item.conformity === "NOK")
      ? "FAIL"
      : "PASS";

    // 3. Préparation des résultats
    const results = {
      globalVerdict,
      rows: data
    };

    // 4. Génération des fichiers de sortie
    const timestamp = Date.now();

    // Fichier CSV
    const csvContent = convertToCSV(results.rows);
    const csvPath = path.join(__dirname, "results", `output-${timestamp}.csv`);
    fs.writeFileSync(csvPath, csvContent, "utf-8");

    // Fichier DOCX
    const docxPath = path.join(__dirname, "results", `output-${timestamp}.docx`);
    await generateDocx(results, docxPath);

    // 5. Réponse
    res.json({
      message: "Analyse terminée ✅",
      verdict: globalVerdict,
      csvUrl: `/download/output-${timestamp}.csv`,
      docxUrl: `/download/output-${timestamp}.docx`
    });

  } catch (err) {
    console.error("Erreur lors de l'analyse:", err);
    res.status(500).json({ error: "Impossible d'analyser le fichier" });
  }
});

// === Servir les fichiers générés ===
app.use("/download", express.static(path.join(__dirname, "results")));

// === Lancer serveur ===
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});