import fs from "fs";
import { writeFile } from "xlsx";

export async function toWord(data, outputPath) {
  // Logic to write data to a Word document
  fs.writeFileSync(outputPath, data.join("\n"));
}

export async function toExcel(data, outputPath) {
  // Logic to write data to an Excel file
  const workbook = { SheetNames: ["Sheet1"], Sheets: { Sheet1: writeFile(data) } };
  fs.writeFileSync(outputPath, workbook);
}