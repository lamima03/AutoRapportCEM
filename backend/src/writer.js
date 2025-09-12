// writer.js
import fs from "fs";

// Fonction pour écrire un "Word" simplifié (ici du texte brut dans un .docx)
export async function writeWord(data, outPath, hash) {
  const content = `Hash: ${hash}\n\n` + data.join("\n");
  fs.writeFileSync(outPath, content, "utf8");
  console.log(`📝 Fichier Word généré : ${outPath}`);
}

// Fonction pour écrire un fichier CSV
export async function writeCSV(data, outPath) {
  const csvContent = data.join("\n");
  fs.writeFileSync(outPath, csvContent, "utf8");
  console.log(`📊 Fichier CSV généré : ${outPath}`);
}
