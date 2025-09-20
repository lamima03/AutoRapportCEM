

import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun } from "docx";


export function convertToCSV(data = []) {
  console.log("📊 convertToCSV appelée avec:", 
    Array.isArray(data) ? data.length : "non-array", 
    "éléments de type", 
    Array.isArray(data) && data.length > 0 ? typeof data[0] : "unknown"
  );

  const rows = data.rows || (Array.isArray(data) ? data : []);
  console.log("📊 Utilisation de", rows.length, "lignes pour le CSV");
  
  const header = ["Section", "Sample", "Frequency (MHz)", "Polarization", 
                 "Measure (dBµV/m)", "Limit (dBµV/m)", "Margin (dB)", 
                 "Verdict", "RBW", "Detector Type", "Configuration"];
  
  if (!Array.isArray(rows) || rows.length === 0) {
    console.log("❌ Aucune donnée valide pour CSV");
    return header.join(",") + "\n";
  }

  console.log("✅ Conversion de", rows.length, "lignes en CSV");
  
  const csvRows = rows.map((row, index) => {
    if (index < 3) {
      console.log(`📝 Ligne ${index + 1}:`, 
        row.sample, row.frequency, row.verdict);
    }
    
    return [
      row.section || "",
      row.sample || "",
      row.frequency || "",
      row.polarization || "",
      row.overtaking || "",
      row.appliedLimit || "",
      row.margin || "",
      row.verdict || "",
      row.rbw || "",
      row.detectorType || "",
      row.configuration || ""
    ].map(field => `"${field.toString().replace(/"/g, '""')}"`).join(",");
  });

  const result = [header.join(","), ...csvRows].join("\n");
  console.log("📋 CSV généré (premiers 300 caractères):", result.substring(0, 300));
  
  return result;
}
// === Fonction DOCX CORRIGÉE ===
export async function generateDocx(data = {}, outputPath, signature = "") {
  const fs = await import('fs');
  
  // Gérer à la fois data.rows et data direct
  const rows = data.rows || (Array.isArray(data) ? data : []);
  
  if (!Array.isArray(rows) || rows.length === 0) {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun({ text: "Aucune donnée à afficher", bold: true })]
          })
        ]
      }]
    });
    
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outputPath, buffer);
    return buffer;
  }

  // En-tête du document
  const header = new Paragraph({
    children: [
      new TextRun({
        text: "Rapport d'analyse CEM - Données traitées",
        bold: true,
        size: 28
      })
    ],
    alignment: "center"
  });

  // Cartouche d'information
  const sample = rows[0]?.sample || "N/A";
  const config = rows[0]?.configuration || "N/A";
  const globalVerdict = data.globalVerdict || "N/A";
  
  const infoTable = new Table({
    rows: [
      new TableRow({
        children: [
          createCell("Sample ID:", true),
          createCell(sample),
          createCell("Configuration:", true),
          createCell(config)
        ]
      }),
      new TableRow({
        children: [
          createCell("Date de traitement:", true),
          createCell(new Date().toLocaleDateString('fr-FR')),
          createCell("Verdict global:", true),
          createCell(globalVerdict, false, globalVerdict === "PASS" ? "00FF00" : "FF0000")
        ]
      })
    ],
    width: { size: 100, type: "pct" }
  });

  // En-tête du tableau de données
  const headers = ["Section", "Frequency (MHz)", "Polarization", "Measure (dBµV/m)", 
                  "Limit (dBµV/m)", "Margin (dB)", "Verdict"];
  
  const headerRow = new TableRow({
    children: headers.map(headerText => 
      new TableCell({
        children: [new Paragraph({
          children: [new TextRun({ text: headerText, bold: true })]
        })]
      })
    )
  });

  // Lignes de données
  const dataRows = rows.map(row => {
    return new TableRow({
      children: [
        row.section || "N/A",
        row.frequency || "",
        row.polarization || "",
        row.overtaking || "",
        row.appliedLimit || "",
        row.margin || "",
        row.verdict || "N/A"
      ].map((value, index) => {
        const isVerdict = index === 6;
        const color = isVerdict ? (value === "FAIL" ? "FF0000" : "008000") : "000000";
        const bold = isVerdict && value === "FAIL";
        
        return new TableCell({
          children: [new Paragraph({
            children: [new TextRun({
              text: String(value),
              color: color,
              bold: bold
            })]
          })]
        });
      })
    });
  });

  const dataTable = new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: "pct" }
  });

  // Signature en pied de page
  const footer = new Paragraph({
    children: [
      new TextRun({
        text: signature,
        size: 10,
        color: "666666"
      })
    ],
    alignment: "right"
  });

  const doc = new Document({ 
    sections: [{ 
      properties: {},
      children: [header, new Paragraph({ text: "" }), infoTable, new Paragraph({ text: "" }), dataTable, footer]
    }] 
  });
  
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`📄 DOCX généré : ${outputPath}`);
  return buffer;
}

function createCell(text, isHeader = false, color = "000000") {
  return new TableCell({
    children: [new Paragraph({
      children: [new TextRun({
        text: text,
        bold: isHeader,
        color: color
      })]
    })]
  });
}