import express from "express";
import multer from "multer";
import mammoth from "mammoth";
import fs from "fs";
import path from "path";
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun } from "docx";
import { fileURLToPath } from "url";
import { applyRules } from "./src/rules.js";

// Résoudre __dirname (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "../frontend")));
app.use(express.json());

// Config multer (upload DOCX dans /uploads)
const upload = multer({ dest: "uploads/" });

// === Fonction CSV ===
function convertToCSV(rows = []) {
  if (!rows || rows.length === 0) {
    return "Sample,Section,Frequency,Measure,Limit,Marge,Verdict\n"; // header vide
  }

  const header = ["Sample","Section","Frequency","Measure","Limit","Marge","Verdict"];
  const csvRows = rows.map(r => [
    r.sample, r.section, r.frequency, r.measure, r.limit, r.marge, r.verdict
  ].join(","));

  return [header.join(","), ...csvRows].join("\n");
}

// === Fonction DOCX ===
async function generateDocx(results, outputPath) {
  const doc = new Document({
    sections: [{
      children: [
        new Table({
          rows: [
            new TableRow({
  children: [
    r.sample, 
    r.section, 
    r.frequency, 
    r.measure, 
    r.limit, 
    r.marge,
    r.verdict
  ].map(v => new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: String(v),
            color: v === "FAIL" ? "FF0000" : "008000", // rouge si FAIL, vert si PASS
            bold: v === "FAIL" // mettre en gras si FAIL
          })
        ]
      })
    ]
  }))
        })
      ]
    })
  ]
}],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`📄 DOCX généré : ${outputPath}`);
  return buffer;
}

export { generateDocx };

// ✅ Upload + analyse
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Aucun fichier reçu" });

    const filePath = req.file.path;
    const data = await mammoth.extractRawText({ path: filePath });
    const text = data.value;

    // Parser basique (⚠️ à adapter selon ton fichier)
    const rows = text.split("\n")
      .filter(line => line.trim() !== "")
      .map((line, i) => {
        const parts = line.split(/\s+/);
        return {
          sample: parts[0] || `S${i+1}`,
          section: parts[1] || "Unknown",
          frequency: parts[2] || "0",
          measure: parseFloat(parts[3]) || 0,
          limit: parseFloat(parts[4]) || 0
        };
      });

    // Appliquer les règles
    const results = applyRules(rows);

    // Générer CSV
    // const csvPath = path.join(__dirname, "results", "output.csv");
    // const csvData = convertToCSV(results.rows);
    // fs.writeFileSync(csvPath, csvData, "utf-8");

   // 4. Générer résultats CSV
const csvData = results.rows.map(r =>
  [r.sample, r.section, r.frequency, r.measure, r.limit, r.marge, r.verdict].join(",")
).join("\n");

// ⚠️ Mets le fichier dans /results pour qu'il soit téléchargeable
const csvPath = path.join(__dirname, "results", "output.csv");
fs.writeFileSync("file.csv", csvData, "utf-8");
console.log(`📄 CSV généré : ${csvPath}`);


// Après avoir généré les fichiers CSV et DOCX
res.json({
  message: "Analyse terminée ✅",
  verdict: results.globalVerdict,
  csvUrl: "/download/output.csv",
  docxUrl: "/download/output.docx"
});


    // Générer DOCX
    const docxPath = path.join(__dirname, "results", "output.docx");
    await generateDocx(results, docxPath);

    // Réponse au frontend
    res.json({
      message: "Analyse terminée ✅",
      verdict: results.globalVerdict,
      csv: "/results/output.csv",
      docx: "/results/output.docx"
    });

  } catch (err) {
    console.error("Erreur lors de l’analyse:", err);
    res.status(500).json({ error: "Impossible d’analyser le fichier" });
  }
});

// === Servir les fichiers générés ===
app.use("/results", express.static(path.join(__dirname, "results")));

app.get("/download/:filename", (req, res) => {
  const filePath = path.join(__dirname, "results", req.params.filename);
  res.download(filePath, (err) => {
    if (err) {
      console.error("Erreur téléchargement :", err);
      res.status(500).send("Erreur serveur");
    } else {
      console.log("✅ Téléchargement réussi :", req.params.filename);
    }
  });
});






// === Lancer serveur ===
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
