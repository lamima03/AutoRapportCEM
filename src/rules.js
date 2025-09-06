export function applyBusinessLogic(rows) {
  return rows.map(row => {
    const margin = row.limit - row.measured;
    return {
      ...row,
      margin: margin.toFixed(2),
      verdict: margin >= 0 ? "PASS" : "FAIL"
    };
  });
}

