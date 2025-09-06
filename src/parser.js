const mammoth = require("mammoth");
const fs = require("fs");

async function readDoc(path) {
  const result = await mammoth.extractRawText({ path });
  return result.value.split("\n").filter(line => line.trim() !== "");
}

module.exports = { readDoc };
