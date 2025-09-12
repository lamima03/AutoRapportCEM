import inquirer from "inquirer";
import fs from "fs";
import crypto from "crypto";

// Permet à l’utilisateur de choisir un fichier
export async function chooseFile() {
  const files = fs.readdirSync("tests").filter(f => f.endsWith(".docx"));
  const answer = await inquirer.prompt([
    {
      type: "list",
      name: "file",
      message: "Choisissez un fichier à traiter :",
      choices: files
    }
  ]);
  return "tests/" + answer.file;
}

// Calcule le hash du fichier choisi
export function getFileHash(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hash = crypto.createHash("sha256");
  hash.update(fileBuffer);
  return hash.digest("hex");
}
