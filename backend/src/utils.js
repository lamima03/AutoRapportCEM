// import inquirer from "inquirer";
// import fs from "fs";
// import crypto from "crypto";


// export async function chooseFile() {
//   const files = fs.readdirSync("tests").filter(f => f.endsWith(".docx"));
//   const answer = await inquirer.prompt([
//     {
//       type: "list",
//       name: "file",
//       message: "Choisissez un fichier à traiter :",
//       choices: files
//     }
//   ]);
//   return "tests/" + answer.file;
// }

// // Calcule le hash du fichier choisi
// export function getFileHash(filePath) {
//   const fileBuffer = fs.readFileSync(filePath);
//   const hash = crypto.createHash("sha256");
//   hash.update(fileBuffer);
//   return hash.digest("hex");
// }


import crypto from "crypto";

// Normalisation des données
export function normalizeData(rows) {
  return rows.map(row => {
    // Normalisation des unités
    let measure = row.overtaking || "";
    let limit = row.appliedLimit || "";
    
    // Conversion dBµV/m
    measure = measure.replace(/dBÀµV\/m|dBµV\/m/gi, "dBµV/m");
    limit = limit.replace(/dBÀµV\/m|dBµV\/m/gi, "dBµV/m");
    
    // Normalisation des virgules décimales
    measure = measure.replace(/,/g, ".");
    limit = limit.replace(/,/g, ".");
    
    return {
      ...row,
      overtaking: measure,
      appliedLimit: limit,
    };
  });
}

// Génération de signature
export function generateSignature(name, fileHash) {
  const date = new Date().toLocaleDateString('fr-FR');
  return `${name} | ${date} | ${fileHash}`;
}