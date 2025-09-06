const parser = require("./src/parser");
const rules = require("./src/rules");
const writer = require("./src/writer");

async function main() {
  const rawData = await parser.readDoc("tests/test_sample.docx");
  const processed = rules.applyBusinessLogic(rawData);
  await writer.toWord(processed, "out/Processed_RAW02.docx");
  await writer.toExcel(processed, "out/Processed_RAW02.csv");
  console.log("✅ Rapport généré avec succès !");
}

main().catch(err => console.error("❌ Erreur:", err));
