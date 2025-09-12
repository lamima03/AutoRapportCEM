export function applyRules(data) {
  const processed = data.map(row => {
    const marge = row.limit - row.measure;
    const verdict = marge >= 0 ? "PASS" : "FAIL";
    return { ...row, marge, verdict };
  });

  const sectionVerdicts = {};
  processed.forEach(r => {
    if (!sectionVerdicts[r.section]) sectionVerdicts[r.section] = [];
    sectionVerdicts[r.section].push(r.verdict);
  });

  const finalVerdicts = {};
  for (let section in sectionVerdicts) {
    finalVerdicts[section] =
      sectionVerdicts[section].every(v => v === "PASS") ? "PASS" : "FAIL";
  }

  const globalVerdict = Object.values(finalVerdicts).every(v => v === "PASS")
    ? "PASS"
    : "FAIL";

  return {
    rows: processed, // <--- bien retourner "rows"
    sectionVerdicts: finalVerdicts,
    globalVerdict,
  };
}
