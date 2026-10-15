import { useEffect, useState } from "react";
import { SYMBOL_META } from "../utils/symbols";

const FALLBACK = ["🐠", "🐚", "🐢", "🪼", "🐡", "🦈", "🦑"];

interface Props {
  symbols: string[] | null;
  spinning: boolean;
  winningLines: number[];
}

export default function SlotMachine({ symbols, spinning, winningLines }: Props) {
  const [display, setDisplay] = useState<string[]>(() =>
    symbols && symbols.length === 9 ? symbols : Array(9).fill("🐠"),
  );

  useEffect(() => {
    if (spinning) {
      const id = setInterval(() => {
        setDisplay(Array.from({ length: 9 }, () => FALLBACK[Math.floor(Math.random() * FALLBACK.length)]));
      }, 90);
      return () => clearInterval(id);
    }
    if (symbols && symbols.length === 9) {
      setDisplay(symbols);
    }
  }, [spinning, symbols]);

  const winSet = new Set(winningLines);

  return (
    <div className="card" style={{ padding: 14 }}>
      <div className="grid-reels">
        {display.map((key, idx) => {
          const row = Math.floor(idx / 3);
          const isWin = winSet.has(row) && !spinning;
          const meta = SYMBOL_META[key];
          return (
            <div
              key={idx}
              className={`reel-cell ${spinning ? "spinning" : ""} ${isWin ? "win" : ""}`}
              aria-label={meta?.label || key}
              role="img"
            >
              {meta?.emoji || "❓"}
            </div>
          );
        })}
      </div>
      {winningLines.length > 0 && !spinning ? (
        <div style={{ textAlign: "center", marginTop: 6, color: "var(--gold)", fontWeight: 700 }}>
          Linha(s) vencedora(s): {winningLines.map((r) => r + 1).join(", ")}
        </div>
      ) : null}
    </div>
  );
}