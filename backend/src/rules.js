function formatFrequency(freq) {
  if (!freq) return "0";
  if (freq < 10) {
    return freq.toFixed(5);
  } else {
    return freq.toFixed(3);
  }
}

export function applyRules(rows) {
  console.log("🔧 applyRules appelée avec", rows.length, "lignes");
  
  if (!Array.isArray(rows) || rows.length === 0) {
    console.log("❌ Aucune donnée dans applyRules");
    return { rows: [], sectionVerdicts: {}, globalVerdict: "N/A" };
  }

  const processed = rows.map((row, index) => {
    console.log(`📝 Traitement ligne ${index + 1}:`, row.sample, row.frequency);
    
    // Conversion et nettoyage des valeurs
    const frequency = parseFloat(row.frequency) || 0;
    const measure = parseFloat(row.overtaking) || 0;
    const limit = parseFloat(row.appliedLimit) || 0;
    
    // Calcul de la marge
    let margin = 0;
    if (limit > 0 && measure > 0) {
      margin = limit - measure;
    } else if (row.margin) {
      margin = parseFloat(row.margin) || 0;
    }
    
    // Détermination du verdict
    let verdict = "N/A";
    if (row.conformity && row.conformity.toUpperCase() === "OK") {
      verdict = "PASS";
    } else if (row.conformity && row.conformity.toUpperCase() === "NOK") {
      verdict = "FAIL";
    } else {
      verdict = margin >= 0 ? "PASS" : "FAIL";
    }
    
    return {
      ...row, // ← GARDEZ TOUTES LES DONNÉES ORIGINALES
      frequency: frequency,
      measure: measure,
      limit: limit,
      margin: margin,
      verdict: verdict,
      // Formatage pour l'affichage
      frequencyFormatted: formatFrequency(frequency),
      marginFormatted: margin.toFixed(2),
      measureFormatted: measure.toFixed(2),
      limitFormatted: limit.toFixed(2)
    };
  });

  // Calcul des verdicts par section
  const sectionVerdicts = {};
  processed.forEach(row => {
    if (row.section && !sectionVerdicts[row.section]) {
      sectionVerdicts[row.section] = "PASS";
    }
    if (row.verdict === "FAIL") {
      sectionVerdicts[row.section] = "FAIL";
    }
  });

  // Verdict global
  const globalVerdict = Object.values(sectionVerdicts).every(v => v === "PASS") ? "PASS" : "FAIL";

  console.log("✅ applyRules terminée:", {
    lignesTraitées: processed.length,
    verdictGlobal: globalVerdict
  });

  return { 
    rows: processed, 
    sectionVerdicts, 
    globalVerdict 
  };
}