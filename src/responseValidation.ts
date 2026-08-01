export type ResponsePart = { expected?: string; heard?: string; ok: boolean };

export function normalizeLearnerText(value: string): string {
  return value
    .normalize("NFKC")
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, "")
    .replace(/[‘’‛`´]/g, "'")
    .replace(/[‐‑‒–—]/g, "-")
    .toLocaleLowerCase("en")
    .replace(/^[\s.,!?;:]+|[\s.,!?;:]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function isAcceptedAnswer(input: string, answers: string[]): boolean {
  const received = normalizeLearnerText(input);
  return received.length > 0 && answers.some(answer => normalizeLearnerText(answer) === received);
}

export function responseWords(value: string): string[] {
  return normalizeLearnerText(value)
    .replace(/[^\p{L}\p{N}'\s-]/gu, "")
    .split(/\s+/)
    .filter(Boolean);
}

export function compareResponseWords(expected: string, heard: string): ResponsePart[] {
  const a = responseWords(expected), b = responseWords(heard), rows = a.length + 1, cols = b.length + 1,
    dp = Array.from({ length: rows }, () => Array(cols).fill(0));
  for (let i = 0; i < rows; i++) dp[i][0] = i;
  for (let j = 0; j < cols; j++) dp[0][j] = j;
  for (let i = 1; i < rows; i++)
    for (let j = 1; j < cols; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  const out: ResponsePart[] = [];
  let i = a.length, j = b.length;
  while (i || j) {
    if (i && j && a[i - 1] === b[j - 1]) out.unshift({ expected: a[--i], heard: b[--j], ok: true });
    else if (i && j && dp[i][j] === dp[i - 1][j - 1] + 1) out.unshift({ expected: a[--i], heard: b[--j], ok: false });
    else if (i && dp[i][j] === dp[i - 1][j] + 1) out.unshift({ expected: a[--i], ok: false });
    else out.unshift({ heard: b[--j], ok: false });
  }
  return out;
}

export function orderedResponseScore(expected: string, received: string): number {
  const parts = compareResponseWords(expected, received), expectedCount = parts.filter(part => part.expected).length;
  return expectedCount ? Math.round(parts.filter(part => part.ok && part.expected).length / expectedCount * 100) : 0;
}
