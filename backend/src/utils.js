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
  return `"${name}" | ${date} | ${fileHash}`;
}

