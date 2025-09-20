import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import applyRules from "./rules.js";

const uploadsDir = "./uploads";

// Lire tous les fichiers du dossier uploads
const files = fs.readdirSync(uploadsDir).filter(f => f.endsWith(".json") || f.endsWith(".docx"));

async function main() {
  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "fileChoice",
      message: "Choisissez un fichier à traiter :",
      choices: files,
    },
  ]);

  const selectedFile = answers.fileChoice;
  const filePath = path.join(uploadsDir, selectedFile);

  let data;

  if (selectedFile.endsWith(".json")) {
    // Lire le JSON
    const raw = fs.readFileSync(filePath, "utf-8");
    data = JSON.parse(raw);
  } else if (selectedFile.endsWith(".docx")) {
   
    console.log("Traitement des fichiers DOCX à implémenter...");
    return;
  }

  const result = applyRules(data);

  console.log(`\n===== Résultat pour ${selectedFile} =====\n`);
  for (const section of Object.keys(result.sectionVerdicts)) {
    console.log(`Section: ${section} -> Verdict: ${result.sectionVerdicts[section]}`);
    result.rows
      .filter(r => r.section === section)
      .forEach(r => {
        console.log(
          `  Sample: ${r.sample} | Freq: ${r.frequency} | Mesure: ${r.measure} | Limite: ${r.limit} | Marge: ${r.marge} | Verdict: ${r.verdict}`
        );
      });
    console.log("");
  }
  console.log(`Verdict global: ${result.globalVerdict}`);
  console.log("===== Fin du test =====\n");
}

main();
