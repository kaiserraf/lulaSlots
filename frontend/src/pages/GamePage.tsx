import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import SlotMachine from "../components/SlotMachine";
import { ALLOWED_BETS, formatLC, SYMBOL_META } from "../utils/symbols";
import { LogOut, Gift, History as HistoryIcon, BarChart3 } from "lucide-react";

interface SpinResult {
  spinId: string;
  symbols: string[];
  betAmount: number;
  winAmount: number;
  balanceAfter: number;
  isWin: boolean;
  winningLines: number[];
  createdAt: string;
}

interface HistoryItem {
  id: string;
  betAmount: number;
  symbols: string[];
  winAmount: number;
  balanceAfter: number;
  isWin: boolean;
  createdAt: string;
}

interface Stats {
  totalSpins: number;
  totalBet: number;
  totalWin: number;
  wins: number;
  losses: number;
}

interface DailyStatus {
  available: boolean;
  nextClaimAt: string | null;
  rewardAmount: number;
}

export default function GamePage() {
  const { user, logout, setBalance } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [bet, setBet] = useState(1000);
  const [spinning, setSpinning] = useState(false);
  const [symbols, setSymbols] = useState<string[] | null>(null);
  const [winningLines, setWinningLines] = useState<number[]>([]);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [lastBet, setLastBet] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [notify, setNotify] = useState("");
  const [isAuto, setIsAuto] = useState(false);
  const [autoTotal, setAutoTotal] = useState(0);
  const [autoDone, setAutoDone] = useState(0);
  const autoStopRef = useRef(false);
  const busyRef = useRef(false);
  const balanceRef = useRef(user?.balance ?? 0);

  useEffect(() => {
    balanceRef.current = user?.balance ?? 0;
  }, [user?.balance]);

  const [sessionBet, setSessionBet] = useState(0);
  const [sessionWin, setSessionWin] = useState(0);
  const [sessionSpins, setSessionSpins] = useState(0);
  const [sessionWins, setSessionWins] = useState(0);
  const [sessionLosses, setSessionLosses] = useState(0);

  const [now, setNow] = useState(Date.now());

  const historyQ = useQuery({
    queryKey: ["history", user?.id],
    queryFn: () => api<HistoryItem[]>("/api/game/history"),
    enabled: !!user,
  });

  const statsQ = useQuery({
    queryKey: ["stats", user?.id],
    queryFn: () => api<Stats>("/api/game/stats"),
    enabled: !!user,
  });

  const dailyQ = useQuery({
    queryKey: ["daily", user?.id],
    queryFn: () => api<DailyStatus>("/api/rewards/daily"),
    enabled: !!user,
  });

  const dailyMutation = useMutation({
    mutationFn: () => api<any>("/api/rewards/daily/claim", { method: "POST" }),
    onSuccess: (data) => {
      setNotify(`Recompensa diária resgatada: +${formatLC(data.rewardAmount)}!`);
      setBalance(data.balanceAfter);
      qc.invalidateQueries({ queryKey: ["daily"] });
    },
    onError: (e: any) => setError(e?.message || "Erro ao resgatar."),
  });

  useEffect(() => {
    if (!notify) return;
    const t = setTimeout(() => setNotify(""), 3500);
    return () => clearTimeout(t);
  }, [notify]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  async function performSpin(amount: number): Promise<SpinResult> {
    if (busyRef.current) throw new Error("Giro em andamento.");
    busyRef.current = true;
    setSpinning(true);
    setError("");
    const start = Date.now();
    try {
      const result = await api<SpinResult>("/api/game/spin", {
        method: "POST",
        body: JSON.stringify({ betAmount: amount }),
      });
      const elapsed = Date.now() - start;
      if (elapsed < 1200) await new Promise((r) => setTimeout(r, 1200 - elapsed));
      setSymbols(result.symbols);
      setWinningLines(result.winningLines);
      setLastWin(result.winAmount);
      setLastBet(result.betAmount);
      setBalance(result.balanceAfter);
      balanceRef.current = result.balanceAfter;
      setSessionBet((s) => s + result.betAmount);
      setSessionWin((s) => s + result.winAmount);
      setSessionSpins((s) => s + 1);
      if (result.isWin) setSessionWins((w) => w + 1);
      else setSessionLosses((w) => w + 1);
      qc.invalidateQueries({ queryKey: ["history"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      if (result.winAmount > 0) setNotify(`Ganhou ${formatLC(result.winAmount)}!`);
      return result;
    } catch (e: any) {
      setError(e?.message || "Erro no giro.");
      throw e;
    } finally {
      setSpinning(false);
      busyRef.current = false;
    }
  }

  async function handleSpin() {
    if (isAuto) return;
    if ((user?.balance ?? 0) < bet) {
      setError("Saldo insuficiente para esta aposta.");
      return;
    }
    try {
      await performSpin(bet);
    } catch {
      /* handled */
    }
  }

  async function startAuto(count: number) {
    if (isAuto || busyRef.current) return;
    setIsAuto(true);
    setAutoTotal(count);
    setAutoDone(0);
    autoStopRef.current = false;
    let done = 0;
    while (done < count && !autoStopRef.current) {
      if (balanceRef.current < bet) {
        setError("Saldo insuficiente. Auto-giro interrompido.");
        break;
      }
      try {
        await performSpin(bet);
        done++;
        setAutoDone(done);
      } catch (e: any) {
        setError(e?.message || "Auto-giro interrompido.");
        break;
      }
      await new Promise((r) => setTimeout(r, 250));
    }
    setIsAuto(false);
  }

  function stopAuto() {
    autoStopRef.current = true;
  }

  function handleLogout() {
    logout();
    navigate("/auth");
  }

  const dailyStatus = dailyQ.data as DailyStatus | undefined;
  const nextClaimDate = dailyStatus?.nextClaimAt ? new Date(dailyStatus.nextClaimAt) : null;
  const remainingMs = nextClaimDate ? nextClaimDate.getTime() - now : 0;
  const canClaim = !!dailyStatus?.available;

  const countdownText = useMemo(() => {
    if (canClaim || !nextClaimDate) return "";
    const s = Math.max(0, Math.floor(remainingMs / 1000));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  }, [canClaim, remainingMs, nextClaimDate]);

  const history = (historyQ.data as HistoryItem[] | undefined) ?? [];
  const stats = (statsQ.data as Stats | undefined) ?? null;

  if (!user) return null;

  return (
    <div className="container">
      {notify ? <div className="notify">{notify}</div> : null}

      <header className="row" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <h1 className="title">Lula Slots 🐟</h1>
          <p className="subtitle">Olá, {user.username}! Bem-vindo ao oceano da sorte (fictícia).</p>
        </div>
        <div className="row" style={{ alignItems: "center" }}>
          <div className="badge">Saldo: {formatLC(user.balance)}</div>
          <button className="btn secondary" onClick={handleLogout} style={{ marginLeft: 8 }}>
            <LogOut size={16} /> Sair
          </button>
        </div>
      </header>

      <div className="row" style={{ alignItems: "stretch" }}>
        {/* Machine */}
        <div style={{ flex: "2 1 420px", minWidth: 300 }}>
          <SlotMachine symbols={symbols} spinning={spinning} winningLines={winningLines} />

          <div className="card" style={{ padding: 14, marginTop: 12 }}>
            <div className="row" style={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <div>
                <div className="label">Aposta selecionada</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{formatLC(bet)}</div>
              </div>
              <div>
                <div className="label">Último resultado</div>
                <div style={{ fontSize: 14 }}>
                  {lastBet !== null ? `Apostou ${formatLC(lastBet)} → Ganhou ${formatLC(lastWin ?? 0)}` : "—"}
                </div>
              </div>
            </div>

            {error ? <p className="error-text" style={{ marginTop: 8 }}>{error}</p> : null}

            <button
              className="btn"
              onClick={handleSpin}
              disabled={spinning || isAuto || user.balance < bet}
              style={{ width: "100%", marginTop: 12, fontSize: 18, padding: "14px 16px" }}
            >
              {spinning ? "Girando..." : "GIRAR"}
            </button>

            <div style={{ marginTop: 12 }}>
              <div className="label">Aposta</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {ALLOWED_BETS.map((b) => (
                  <button
                    key={b}
                    onClick={() => setBet(b)}
                    disabled={spinning || isAuto}
                    className={bet === b ? "btn" : "btn secondary"}
                    style={{ padding: "6px 10px", fontSize: 13 }}
                  >
                    {b >= 1000 ? `${b / 1000}k` : b}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Auto-giro */}
          <div className="card" style={{ padding: 14, marginTop: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Auto-giro</div>
            {isAuto ? (
              <div>
                <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
                  <span>Progresso: {autoDone}/{autoTotal}</span>
                  <button className="btn danger" onClick={stopAuto}>Parar</button>
                </div>
                <div style={{ height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 999, marginTop: 8, overflow: "hidden" }}>
                  <div style={{ width: `${(autoDone / autoTotal) * 100}%`, height: "100%", background: "linear-gradient(90deg,var(--cyan),var(--gold))", transition: "width .3s" }} />
                </div>
              </div>
            ) : (
              <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                {[10, 25, 50, 100].map((n) => (
                  <button
                    key={n}
                    className="btn secondary"
                    onClick={() => startAuto(n)}
                    disabled={spinning || user.balance < bet}
                    style={{ flex: "1 1 80px" }}
                  >
                    {n} giros
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Daily reward */}
          <div className="card" style={{ padding: 14, marginTop: 12 }}>
            <div className="row" style={{ alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 700 }}>Recompensa diária</div>
                <div className="muted" style={{ fontSize: 13 }}>Resgate 50.000 LC a cada 24h</div>
              </div>
              <button
                className="btn"
                onClick={() => dailyMutation.mutate()}
                disabled={!canClaim || dailyMutation.isPending}
              >
                <Gift size={16} /> {dailyMutation.isPending ? "Resgatando..." : canClaim ? "Resgatar" : "Aguardar"}
              </button>
            </div>
            {!canClaim && countdownText ? (
              <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>Próximo resgate em {countdownText}</div>
            ) : null}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ flex: "1 1 280px", minWidth: 260 }}>
          <div className="card" style={{ padding: 14 }}>
            <div style={{ fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <BarChart3 size={16} /> Nesta sessão
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 14 }}>
              <div>Giros: <strong>{sessionSpins}</strong></div>
              <div>Vitórias: <strong>{sessionWins}</strong></div>
              <div>Derrotas: <strong>{sessionLosses}</strong></div>
              <div>Apostado: <strong>{formatLC(sessionBet)}</strong></div>
              <div style={{ gridColumn: "1 / -1" }}>Ganho: <strong>{formatLC(sessionWin)}</strong></div>
            </div>
          </div>

          <div className="card" style={{ padding: 14, marginTop: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Conta (total)</div>
            {stats ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 14 }}>
                <div>Giros: <strong>{stats.totalSpins}</strong></div>
                <div>Vitórias: <strong>{stats.wins}</strong></div>
                <div>Derrotas: <strong>{stats.losses}</strong></div>
                <div>Apostado: <strong>{formatLC(stats.totalBet)}</strong></div>
                <div style={{ gridColumn: "1 / -1" }}>Ganho: <strong>{formatLC(stats.totalWin)}</strong></div>
              </div>
            ) : (
              <p className="loading">Carregando...</p>
            )}
          </div>

          <div className="card" style={{ padding: 14, marginTop: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <HistoryIcon size={16} /> Últimos giros
            </div>
            <div style={{ maxHeight: 420, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
              {historyQ.isLoading ? <p className="loading">Carregando...</p> : null}
              {history.length === 0 ? <p className="muted">Nenhum giro ainda.</p> : null}
              {history.map((h) => (
                <div key={h.id} className="fade-in" style={{ padding: 8, borderRadius: 10, background: "rgba(2,18,38,0.5)", border: "1px solid rgba(54,214,230,0.15)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-dim)", marginBottom: 4 }}>
                    <span>{new Date(h.createdAt).toLocaleString("pt-BR")}</span>
                    <span style={{ color: h.isWin ? "#8cffb0" : "#ff8a7a", fontWeight: 600 }}>
                      {h.isWin ? "VITÓRIA" : "DERROTA"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
                    <div style={{ fontSize: 22, letterSpacing: 2 }}>
                      {(h.symbols as string[]).map((s, i) => (
                        <span key={i}>{SYMBOL_META[s]?.emoji || "❓"}</span>
                      ))}
                    </div>
                    <div style={{ textAlign: "right", fontSize: 12 }}>
                      <div>Aposta: {formatLC(h.betAmount)}</div>
                      <div>Ganho: {formatLC(h.winAmount)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="muted" style={{ textAlign: "center", marginTop: 20, fontSize: 12 }}>
        Jogo fictício para estudo. Moeda virtual (LC) sem valor real. Nenhuma transação financeira.
      </p>
    </div>
  );
}