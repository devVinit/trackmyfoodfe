export function formatNumber(n: number) {
  return n.toLocaleString('en-US');
}

export function formatSignedNumber(n: number) {
  return (n > 0 ? '+' : '−') + formatNumber(Math.abs(n));
}

export function initialsOf(name: string) {
  return (name || 'U')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
