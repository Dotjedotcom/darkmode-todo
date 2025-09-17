function fuzzyScore(query, text) {
  if (!query) return { ok: true, score: 0 };
  const q = query.toLowerCase();
  const t = (text || '').toLowerCase();
  let qi = 0;
  let score = 0;
  for (let i = 0; i < t.length && qi < q.length; i += 1) {
    if (t[i] === q[qi]) {
      score += 1;
      qi += 1;
    }
  }
  return { ok: qi === q.length, score };
}

export function fuzzyFilter(options, query) {
  const results = [];
  for (const option of options) {
    const { ok, score } = fuzzyScore(query, option);
    if (ok || !query) results.push({ option, score });
  }
  results.sort((a, b) => b.score - a.score || a.option.localeCompare(b.option));
  return results.map((entry) => entry.option);
}
