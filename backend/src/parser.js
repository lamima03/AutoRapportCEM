import { extractRawText } from "mammoth";

export async function parseDocx(filePath) {
  // 1. Extraction du texte brut depuis le .docx
  const { value } = await extractRawText({ path: filePath });
  
  // 2. Découpe en lignes
  const lines = value.split("\n").map(l => l.trim()).filter(Boolean);

  // 3. Détection des sections et extraction (à adapter selon la structure réelle des RAW)
  let currentSection = null;
  const data = [];

  for (let line of lines) {
    if (/CISPR\.AVG|Q-PEAK|PEAK/i.test(line)) {
      currentSection = line.toUpperCase();
      continue;
    }

    // Exemple : si une ligne ressemble à "3.5 MHz   40.2 dBµV/m   43.0 dBµV/m   V"
    const parts = line.split(/\s+/);

    if (parts.length >= 4 && !isNaN(parts[0])) {
      const frequency = parseFloat(parts[0]);
      const measure = parseFloat(parts[1]);
      const limit = parseFloat(parts[2]);
      const polarization = parts[3];

      data.push({
        section: currentSection,
        frequency,
        sr: null, // à améliorer avec regex RBW
        polarization,
        correction: 0,
        measure,
        limit
      });
    }
  }

  return data;
}


function convertToCSV(rows = []) {
  if (!rows || rows.length === 0) {
    return "Sample,Section,Frequency,Measure,Limit,Marge,Verdict\n"; // header vide
  }

  const header = ['Sample','Section','Frequency','Measure','Limit','Marge','Verdict'];
  const csvRows = rows.map(r => [
    r.sample, r.section, r.frequency, r.measure, r.limit, r.marge, r.verdict
  ].join(','));

  return [header.join(','), ...csvRows].join('\n');
}
