// import { extractRawText } from "mammoth";

// export async function parseDocx(filePath) {
//   const { value } = await extractRawText({ path: filePath });
//   const lines = value.split("\n").map(l => l.trim()).filter(Boolean);
  
//   const results = [];
//   let currentSample = "";
//   let currentConfig = "";
//   let currentRBW = "";
//   let antennaPosition = "";
//   let polarization = "";

//   for (let line of lines) {
//     // Détection de l'échantillon
//     if (line.includes("Sample n°")) {
//       currentSample = line.split("Sample n°").trim();
//       continue;
//     }

//     // Détection de la configuration
//     if (line.includes("Configuration")) {
//       const configMatch = line.match(/Configuration\s*\((.+?)\)\s*(RBW\s*\S+)/i);
//       if (configMatch) {
//         currentConfig = configMatch.trim();
//         currentRBW = configMatch.trim();
//       }
//       continue;
//     }

//     // Détection des positions d'antenne
//     const positionMatch = line.match(/^(\s*\([XYZ]\))/);
//     if (positionMatch) {
//       antennaPosition = positionMatch;
//       continue;
//     }

//     // Traitement des lignes de données
//     if (line.includes("Vertical") || line.includes("Horizontal")) {
//       const dataMatch = line.match(/(Vertical|Horizontal)\s+(-?\d+)\s+(-|\d+)\s+(\w+)\s+([\d.]+)/);
      
//       if (dataMatch) {
//         polarization = dataMatch;
        
//         results.push({
//           sample: currentSample,
//           section: `${currentConfig} ${currentRBW}`,
//           frequency: parseFloat(dataMatch),
//           detector: "CISPR_Av",
//           polarization,
//           antennaPosition,
//           margin: isNaN(dataMatch) ? null : parseInt(dataMatch),
//           overtaking: dataMatch === "-" ? 0 : parseInt(dataMatch),
//           conformity: dataMatch,
//           limit: "RNDS-C-00517 V4.0"
//         });
//       }
//     }
//   }

//   return results;
// }

// filepath: /Users/mac/Documents/MiniProjetCCC2/backend/src/parser.js

import mammoth from "mammoth";

export async function parseDocx(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value.split("\n").map(line => {
    const [sample, section, frequency, detector, polarization, antennaPosition, margin, overtaking, conformity, limit] = line.split(",");
    return {
      sample,
      section,
      frequency: parseFloat(frequency),
      detector,
      polarization,
      antennaPosition,
      margin: parseFloat(margin),
      overtaking: parseFloat(overtaking),
      conformity,
      limit: parseFloat(limit)
    };
  });
}