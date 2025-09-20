import fs from "fs";
import mammoth from "mammoth";

export async function parseWord(filePath) {
  try {
    console.log("Début du parsing du fichier:", filePath);
    
    // Extraction du texte brut
    const result = await mammoth.extractRawText({ path: filePath });
    const rawText = result.value;
    
    const lines = rawText.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    console.log("Nombre total de lignes:", lines.length);
    
    const rows = [];
    let currentSample = "";
    let currentConfig = "";
    let currentRBW = "";
    let currentSection = "";
    
    let currentData = null;
    let dataLines = [];

    // Parcourir toutes les lignes
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Détection du sample
      if (line.includes('Sample n°')) {
        currentSample = line.replace('Sample n°', '').trim();
        console.log("Sample détecté:", currentSample);
        continue;
      }
      
      // Détection de la configuration
      if (line.includes('Configuration')) {
        currentConfig = line;
        const rbwMatch = line.match(/RBW\s*[:]?\s*(\d+(?:\.\d+)?\s*k?Hz)/i);
        currentRBW = rbwMatch ? rbwMatch[1] : "";
        console.log("Configuration détectée:", currentConfig);
        
        // Déterminer la section basée sur la configuration
        if (line.includes('9kHz')) currentSection = "9kHz";
        if (line.includes('120kHz')) currentSection = "120kHz";
        if (line.includes('1MHz')) currentSection = "1MHz";
        if (line.includes('GNSS')) currentSection = "GNSS";
        
        continue;
      }
      
      // Détection du type de détecteur
      if (line.match(/CISPR\.AVG|CISPR_AVG|CISPR AVG|AVG/i)) {
        currentSection = "CISPR.AVG";
        continue;
      } else if (line.match(/Q-Peak|Q_Peak|Q Peak|QPk|QP/i)) {
        currentSection = "Q-Peak";
        continue;
      } else if (line.match(/Peak|Pk/i) && !line.match(/Quasi/)) {
        currentSection = "Peak";
        continue;
      }
      
      // Détection du début d'un bloc de données (Antenna Position)
      if (line.match(/\([XYZ]\)|[XYZ]\s+Vertical|[XYZ]\s+Horizontal/i)) {
        if (currentData) {
          // Sauvegarder le bloc précédent
          rows.push(currentData);
        }
        
        currentData = {
          section: currentSection,
          sample: currentSample,
          configuration: currentConfig,
          rbw: currentRBW,
          antennaPosition: line,
          polarization: "",
          margin: "",
          overtaking: "",
          conformity: "",
          frequency: "",
          appliedLimit: "",
          detectorType: "",
          comment: "",
          rawData: line
        };
        
        dataLines = [line];
        continue;
      }
      
    
      if (currentData && dataLines.length > 0) {
        dataLines.push(line);
        
        // Mapper les lignes aux champs correspondants
        const lineIndex = dataLines.length - 1;
        
        switch (lineIndex) {
          case 1: currentData.polarization = line; break;
          case 2: currentData.margin = line; break;
          case 3: currentData.overtaking = line; break;
          case 4: currentData.conformity = line; break;
          case 5: currentData.frequency = line; break;
          case 6: currentData.appliedLimit = line; break;
          case 7: currentData.detectorType = line; break;
          case 8: currentData.comment = line; break;
        }
        
        // Si on a collecté 8 lignes de données, terminer le bloc
        if (dataLines.length >= 9) {
          rows.push(currentData);
          currentData = null;
          dataLines = [];
        }
      }
    }
    
    // Ajouter le dernier bloc si exists
    if (currentData) {
      rows.push(currentData);
    }
    
    console.log("✅ Parse terminé :", rows.length, "lignes extraites");
    
    // Afficher quelques exemples pour vérification
    if (rows.length > 0) {
      console.log("Exemples de données extraites:");
      for (let i = 0; i < Math.min(3, rows.length); i++) {
        console.log(`Ligne ${i + 1}:`, {
          sample: rows[i].sample,
          config: rows[i].configuration,
          position: rows[i].antennaPosition,
          polarization: rows[i].polarization,
          margin: rows[i].margin,
          frequency: rows[i].frequency,
          conformity: rows[i].conformity
        });
      }
    }
    
    return rows;
    
  } catch (err) {
    console.error("❌ Erreur dans parseWord:", err);
    return [];
  }
}