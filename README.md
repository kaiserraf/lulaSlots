# Lula Slots 🐟

Caça-níquel **fictício** com tema de vida marinha e moeda virtual **LulaCoins (LC)**. Roda apenas em **localhost**, para estudo e entretenimento. Não envolve dinheiro real, depósitos, saques ou pagamentos.

## Estrutura

```
aiProjects/
  backend/      # Node.js + Express + Prisma + PostgreSQL
  frontend/     # React + Vite + TypeScript
  README.md
```

## Requisitos

- Node.js 18+ (testado com v24)
- PostgreSQL 14+ instalado localmente (sem Docker)
- npm

## 1. Configurar o PostgreSQL

Crie usuário e banco (como superusuário do PostgreSQL):

```sql
CREATE USER lulaslots WITH PASSWORD 'lulaslots_dev' CREATEDB;
CREATE DATABASE lulaslots OWNER lulaslots;
GRANT ALL PRIVILEGES ON DATABASE lulaslots TO lulaslots;
```

> Dica: se não conseguir autenticar como superusuário, inicie o cluster com `pg_ctl` ou use os utilitários do próprio PostgreSQL (por exemplo `sudo -u postgres psql`). Este projeto **não usa Docker**.

## 2. Backend

```bash
cd backend
cp .env.example .env
# edite .env se necessário (DATABASE_URL, JWT_SECRET, PORT, CLIENT_URL)
npm install
npx prisma migrate dev
npm run prisma:seed   # usuário demo / demo123 (opcional)
npm run dev
```

Backend em `http://localhost:3001`. Teste: `curl http://localhost:3001/api/health`.

## 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend em `http://localhost:5173`. O Vite faz proxy de `/api` para o backend.

## 4. Build de produção (local)

```bash
cd backend && npm run build
cd ../frontend && npm run build
```

## Variáveis de ambiente (backend/.env)

- `DATABASE_URL` — conexão PostgreSQL.
- `JWT_SECRET` — segredo para assinar JWT (mínimo 16 caracteres).
- `PORT` — porta do backend (padrão 3001).
- `CLIENT_URL` — URL do frontend para CORS (padrão http://localhost:5173).

## Regras do jogo

- Símbodos (emoji) e pesos (probabilidade relativa):

| Símbodo | Emoji | Peso | Multiplicador (3 iguais) |
|---|---|---:|---:|
| Peixe-palhaço | 🐠 | 30 | 2x |
| Concha | 🐚 | 25 | 3x |
| Tartaruga | 🐢 | 18 | 4x |
| Água-viva | 🪼 | 13 | 6x |
| Baiacu | 🐡 | 8 | 10x |
| Tubarão | 🦈 | 4 | 20x |
| Lula dourada | 🦑 | 2 | 50x |

- Peso maior = mais comum; raros pagam mais.
- Máquina tem **3 rolos e 3 linhas horizontais visíveis**. Cada linha com três ícones iguais paga `aposta × multiplicador`. Linhas vencedoras múltiplas são somadas.
- Sem linha vencedora, a aposta é perdida.

## Cálculo do resultado

- O backend usa `Math.random()` ponderado por ícone para gerar uma grade 3×3 (row-major).
- O prêmio é calculado no servidor; o frontend apenas anima e exibe.
- O cliente não envia `symbols`, `winAmount`, `isWin` ou `balance`; o backend calcula e persiste.

## Atomicidade e segurança

- Débito da aposta, crédito do prêmio e registro do giro ocorrem em uma **transação Prisma** (`$transaction`, isolamento `Serializable`).
- Saldo nunca fica negativo: verificação dentro da transação.
- Recompensa diária usa `updateMany` condicional (respeita 24h) para evitar duplicidade em requisições simultâneas.
- Histórico/estatísticas/perfil filtram por `userId` do token JWT.

## Recompensa diária

- Cada usuário ganha **50.000 LC** ao cadastrar e pode resgatar **50.000 LC a cada 24 horas**.
- O intervalo é validado no backend (UTC). Frontend mostra contagem regressiva.

## Auto-giro

- Quantidades: 10, 25, 50, 100.
- Giros sequenciais, aguardando resposta do backend; para em erro/saldo insuficiente/sessão expirada ou ao clicar "Parar".

## Histórico e estatísticas

- Últimos 20 giros com aposta, prêmio, ícones, data/hora, vitória/derrota.
- Estatísticas da sessão (frontend) e totais da conta (backend).

## Acesso

Abra `http://localhost:5173`. Cadastre-se ou use `demo` / `demo123`.

## Observações

- Sem dinheiro real, depósitos, saques, conversão ou integrações com apostas.
- Projeto de estudo local.
