import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") await login(username.trim(), password);
      else await register(username.trim(), password);
      navigate("/");
    } catch (err: any) {
      setError(err?.message || "Erro ao autenticar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 420, marginTop: 40 }}>
      <div className="card" style={{ padding: 24 }}>
        <h1 className="title" style={{ marginBottom: 4 }}>Lula Slots 🐟</h1>
        <p className="subtitle" style={{ marginBottom: 20 }}>
          Caça-níquel fictício com LulaCoins (LC). Apenas localhost, sem dinheiro real.
        </p>

        <div className="row" style={{ marginBottom: 16 }}>
          <button
            type="button"
            className={mode === "login" ? "btn" : "btn secondary"}
            onClick={() => setMode("login")}
            style={{ flex: 1 }}
          >
            Entrar
          </button>
          <button
            type="button"
            className={mode === "register" ? "btn" : "btn secondary"}
            onClick={() => setMode("register")}
            style={{ flex: 1 }}
          >
            Cadastrar
          </button>
        </div>

        <form onSubmit={submit} className="col">
          <label className="label">Nome de usuário</label>
          <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="marinheiro" />
          <label className="label" style={{ marginTop: 12 }}>Senha</label>
          <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" />
          {error ? <p className="error-text" style={{ marginTop: 10 }}>{error}</p> : null}
          <button className="btn" type="submit" disabled={busy} style={{ marginTop: 16, width: "100%" }}>
            {busy ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
          </button>
          {mode === "register" ? (
            <p className="muted" style={{ marginTop: 12, fontSize: 13 }}>
              Novos usuários recebem 50.000 LC para começar.
            </p>
          ) : (
            <p className="muted" style={{ marginTop: 12, fontSize: 13 }}>
              Demo: <strong>demo</strong> / <strong>demo123</strong>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}