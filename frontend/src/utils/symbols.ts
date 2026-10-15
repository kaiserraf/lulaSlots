export const SYMBOL_META: Record<string, { emoji: string; label: string }> = {
  "peixe-palhaco": { emoji: "🐠", label: "Peixe-palhaço" },
  concha: { emoji: "🐚", label: "Concha" },
  tartaruga: { emoji: "🐢", label: "Tartaruga" },
  "agua-viva": { emoji: "🪼", label: "Água-viva" },
  baiacu: { emoji: "🐡", label: "Baiacu" },
  tubarao: { emoji: "🦈", label: "Tubarão" },
  "lula-dourada": { emoji: "🦑", label: "Lula dourada" },
};

export const ALLOWED_BETS = [500, 1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000];

export function formatLC(n: number): string {
  return new Intl.NumberFormat("pt-BR").format(n) + " LC";
}