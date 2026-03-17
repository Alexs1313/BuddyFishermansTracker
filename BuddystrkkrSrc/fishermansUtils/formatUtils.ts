export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatSessionTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')} : ${String(m).padStart(
    2,
    '0',
  )} : ${String(s).padStart(2, '0')}`;
}

export function formatRecipeSteps(steps: string): string {
  return steps
    .split('\n')
    .filter(Boolean)
    .map((line, i) => `${i + 1}. ${line}`)
    .join('\n');
}
