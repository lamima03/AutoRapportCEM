import applyRules from "../src/rules.js";

// 🔹 Données de test
const testData = [
  { section: "CISPR.AVG", frequency: 3.5, measure: 40.2, limit: 43 },
  { section: "CISPR.AVG", frequency: 10, measure: 42.5, limit: 43 },
  { section: "Q-PEAK", frequency: 20, measure: 49, limit: 49 },
  { section: "Q-PEAK", frequency: 30, measure: 50.5, limit: 49 },
];

// 🔹 Exécution des règles
const result = applyRules(testData);

// 🔹 Affichage lisible
console.log("\n===== Résultat du test =====\n");

for (const section of Object.keys(result.sectionVerdicts)) {
  console.log(`Section: ${section} -> Verdict: ${result.sectionVerdicts[section]}`);
  result.rows
    .filter(r => r.section === section)
    .forEach(r => {
      console.log(
        `  Freq: ${r.frequency} MHz | Mesure: ${r.measure} | Limite: ${r.limit} | Marge: ${r.marge} | Verdict: ${r.verdict}`
      );
    });
  console.log(""); // ligne vide pour espacer les sections
}

console.log(`Verdict global: ${result.globalVerdict}\n`);
console.log("===== Fin du test =====\n");
