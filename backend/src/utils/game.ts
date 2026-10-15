export const SYMBOLS = [
  { key: "peixe-palhaco", emoji: "🐠", weight: 30, multiplier: 2 },
  { key: "concha", emoji: "🐚", weight: 25, multiplier: 3 },
  { key: "tartaruga", emoji: "🐢", weight: 18, multiplier: 4 },
  { key: "agua-viva", emoji: "🪼", weight: 13, multiplier: 6 },
  { key: "baiacu", emoji: "🐡", weight: 8, multiplier: 10 },
  { key: "tubarao", emoji: "🦈", weight: 4, multiplier: 20 },
  { key: "lula-dourada", emoji: "🦑", weight: 2, multiplier: 50 },
];

export const ALLOWED_BETS: number[] = [
  500, 1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000,
];

export const DAILY_REWARD_AMOUNT = BigInt(50000);
export const DAILY_REWARD_INTERVAL_MS = 24 * 60 * 60 * 1000;
export const MIN_BET = 500;
export const MAX_BET = 1000000;
export const INITIAL_BALANCE = BigInt(50000);

const TOTAL_WEIGHT = SYMBOLS.reduce((acc, s) => acc + s.weight, 0);

export function multiplierOf(key: string): number {
  return SYMBOLS.find((s) => s.key === key)?.multiplier ?? 0;
}

export function pickRandomSymbol(): string {
  let r = Math.random() * TOTAL_WEIGHT;
  for (const s of SYMBOLS) {
    r -= s.weight;
    if (r < 0) return s.key;
  }
  return SYMBOLS[SYMBOLS.length - 1].key;
}

// Gera grade 3x3 (3 linhas, 3 colunas). Resultado é array de 9 strings (row-major).
export function generateGrid(): string[] {
  const grid: string[] = [];
  for (let i = 0; i < 9; i++) {
    grid.push(pickRandomSymbol());
  }
  return grid;
}

// Calcula prêmio: cada linha horizontal com 3 ícones iguais paga multiplier * bet.
export function computeWin(grid: string[], bet: bigint): bigint {
  let win = BigInt(0);
  for (let row = 0; row < 3; row++) {
    const a = grid[row * 3];
    const b = grid[row * 3 + 1];
    const c = grid[row * 3 + 2];
    if (a === b && b === c) {
      win += bet * BigInt(multiplierOf(a));
    }
  }
  return win;
}

export function isWinningRow(grid: string[], row: number): boolean {
  const a = grid[row * 3];
  const b = grid[row * 3 + 1];
  const c = grid[row * 3 + 2];
  return a === b && b === c;
}