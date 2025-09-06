import mammoth from "mammoth";

export async function readDoc(path) {
  const result = await mammoth.extractRawText({ path });
  return result.value.split("\n").filter(line => line.trim() !== "");
}