import { readDoc } from "./parser.js";
import { applyBusinessLogic } from "./rules.js";
import { toWord, toExcel } from "./writer.js";

async function main() {
  const rawData = await readDoc("tests/test_sample.docx");
  const processed = applyBusinessLogic(rawData);
  await toWord(processed, "out/Processed_RAW02.docx");
  await toExcel(processed, "out/Processed_RAW02.csv");
  console.log("✅ Rapport généré avec succès !");
}

main().catch(err => console.error("❌ Erreur:", err));
