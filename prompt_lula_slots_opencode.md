# Prompt para o OpenCode — Lula Slots 🐟

Você é um desenvolvedor full-stack experiente. Crie um sistema web jogável de caça-níquel fictício chamado **Lula Slots**, com tema de peixes e vida marinha. O projeto será executado **somente em localhost**, para estudo e entretenimento, usando uma moeda virtual sem valor monetário real chamada **LulaCoins (LC)**. Não implemente depósitos, saques, pagamentos, conversão em dinheiro real ou integrações com serviços de apostas.

## 1. Objetivo

Entregar uma aplicação full-stack funcional, com frontend, backend e banco de dados PostgreSQL. Não crie apenas telas estáticas: os giros, saldos, recompensas diárias, histórico e configurações de auto-giro devem funcionar de ponta a ponta.

Antes de começar:
1. Analise os arquivos e a estrutura existentes no diretório atual.
2. Se o projeto já tiver código, preserve o que estiver funcionando e adapte a estrutura com cuidado.
3. Se estiver vazio, inicialize o projeto e configure todas as dependências necessárias.
4. Apresente um plano curto e, em seguida, implemente o sistema. Não pare apenas no planejamento.

## 2. Tecnologias

### Backend
- Node.js
- TypeScript
- Express
- PostgreSQL
- Prisma ORM
- Zod para validação dos dados de entrada
- `dotenv` para variáveis de ambiente

Organize o backend em camadas simples e claras:

```text
backend/
  prisma/
    schema.prisma
    seed.ts
  src/
    config/
    controllers/
    middlewares/
    routes/
    services/
    repositories/
    utils/
    app.ts
    server.ts
```

Use o fluxo **Routes → Controllers → Services → Repositories**. Evite abstrações desnecessárias: este é um projeto local de aprendizado, mas o código deve ser legível e consistente.

### Frontend
Escolha **React + TypeScript + Vite**, com:
- CSS moderno e responsivo;
- React Router, caso seja útil;
- TanStack Query ou uma solução simples para chamadas à API;
- ícones de uma biblioteca conhecida, como Lucide React.

Não use dados fictícios no frontend para simular operações que deveriam persistir no banco.

## 3. Identidade visual e experiência

Crie uma interface caprichada, com identidade visual própria:
- Tema de fundo do oceano, com azul-marinho, azul-turquesa, ciano e detalhes em coral/dourado.
- Nome e logotipo textual **Lula Slots**.
- Símbolos de caça-níquel inspirados em peixes e criaturas marinhas: peixe-palhaço, baiacu, tubarão, água-viva, tartaruga, concha e lula.
- Máquina de caça-níquel central e visualmente destacada.
- Animações suaves durante os giros, efeitos de vitória e feedback visual para saldo insuficiente.
- Painel com saldo de LulaCoins, aposta selecionada, botão de girar, auto-giro e recompensa diária.
- Layout responsivo para desktop e celular.
- Estados de carregamento, mensagens de erro e confirmação.
- Acessibilidade básica: contraste legível, botões com rótulos claros e navegação por teclado.

Use emojis, CSS ou SVGs locais para os símbolos se isso simplificar o projeto. Não dependa de APIs externas para exibir a máquina.

## 4. Usuário e sessão

Implemente um fluxo simples de cadastro e login para identificar o saldo de cada usuário:
- Cadastro com nome de usuário e senha.
- Login e logout.
- Senhas armazenadas com hash usando `bcrypt`.
- Sessão autenticada por JWT ou mecanismo equivalente simples.
- Validação dos campos no backend.
- Mensagens claras para credenciais inválidas e nome de usuário já utilizado.

Como o sistema é apenas local, não é necessário construir uma infraestrutura complexa. Mesmo assim, nunca confie no saldo, no resultado do giro ou no valor de prêmio enviado pelo frontend.

## 5. LulaCoins e recompensa diária

Cada usuário começa com **50.000 LulaCoins (LC)** ao criar a conta.

Implemente uma recompensa diária:
- O usuário pode resgatar **50.000 LC a cada 24 horas**.
- Mostre no painel se a recompensa está disponível.
- Mostre uma contagem regressiva até o próximo resgate.
- Registre a data e hora do último resgate no banco.
- A validação do intervalo de 24 horas deve ocorrer no backend, não apenas na interface.
- Impedir resgates duplicados, inclusive quando duas requisições forem enviadas quase simultaneamente.
- Mostrar uma notificação quando a recompensa for resgatada.

Use o horário UTC no backend e converta para o horário local apenas para exibição.

## 6. Máquina caça-níquel

Implemente uma máquina com **3 rolos e 3 posições visíveis**, com animação de giro. O resultado oficial deve ser calculado no backend e enviado ao frontend; a animação deve apenas representar esse resultado.

### Símbolos sugeridos

Use pesos diferentes para cada símbolo, de modo que os mais comuns sejam menos valiosos e os raros paguem mais:

| Símbolo | Peso sugerido | Multiplicador de referência |
|---|---:|---:|
| Peixe-palhaço | 30 | 2x |
| Concha | 25 | 3x |
| Tartaruga | 18 | 4x |
| Água-viva | 13 | 6x |
| Baiacu | 8 | 10x |
| Tubarão | 4 | 20x |
| Lula dourada | 2 | 50x |

Esses números são referências iniciais. Ajuste-os se necessário para manter a lógica consistente e explique no README como os pesos e multiplicadores funcionam.

### Regras de vitória

- Uma linha horizontal com três símbolos iguais concede o multiplicador daquele símbolo.
- Duas ou mais linhas vencedoras podem ser pagas, se você implementar as três linhas horizontais.
- Se não houver linha vencedora, a aposta é perdida.
- Exiba os símbolos resultantes, as linhas vencedoras, o valor apostado e o prêmio recebido.
- O saldo final nunca pode ficar negativo.
- O servidor deve validar o saldo e processar o débito da aposta e o crédito do prêmio de maneira atômica.
- Use uma transação do PostgreSQL/Prisma para impedir inconsistências de saldo.
- Gere os resultados com um gerador aleatório do lado do servidor. O cliente não deve escolher nem alterar os símbolos.

### Valores de aposta

Disponibilize opções de aposta de **500 LC até 1.000.000 LC**, por exemplo:

`500`, `1.000`, `2.500`, `5.000`, `10.000`, `25.000`, `50.000`, `100.000`, `250.000`, `500.000` e `1.000.000`.

Regras:
- A aposta escolhida não pode ser menor que 500 LC nem maior que 1.000.000 LC.
- O valor precisa pertencer à lista permitida.
- A aposta não pode superar o saldo atual.
- Desabilite ou bloqueie o botão de girar quando o saldo for insuficiente.
- Permita trocar a aposta antes de iniciar um giro.
- Atualize o saldo com o resultado confirmado pelo backend.

## 7. Auto-giro

Implemente um modo de **auto-giro** com controles claros:
- Selecionar a quantidade de giros: 10, 25, 50 ou 100.
- Botões para iniciar e parar.
- Mostrar quantos giros foram concluídos e quantos faltam.
- Executar os giros sequencialmente, aguardando a resposta do backend antes de solicitar o próximo.
- Atualizar saldo, resultado e histórico após cada giro.
- Parar automaticamente quando a quantidade selecionada for concluída.
- Parar imediatamente quando o usuário clicar em “Parar”.
- Interromper quando o saldo ficar abaixo da aposta, ocorrer erro de API ou a sessão expirar.
- Não permitir vários auto-giros simultâneos nem múltiplas requisições de giro concorrentes.
- Não contornar as regras do backend nem executar giros diretamente no navegador.

## 8. Histórico e estatísticas

Registre cada giro no PostgreSQL com, no mínimo:
- Identificador do giro;
- Usuário;
- Valor apostado;
- Símbolos/resultados;
- Valor do prêmio;
- Saldo após o giro;
- Data e hora;
- Indicação de vitória ou derrota.

No frontend, exiba:
- Histórico dos últimos 20 giros;
- Aposta e prêmio de cada giro;
- Resultado visual dos símbolos;
- Data/hora;
- Total apostado e total ganho na sessão atual;
- Quantidade de vitórias e derrotas.

O histórico deve pertencer ao usuário autenticado. Um usuário não pode consultar o histórico de outro.

## 9. Modelo de dados

Crie o schema do Prisma com modelos equivalentes a:

### User
- `id`
- `username` (único)
- `passwordHash`
- `balance` (inteiro ou `BigInt`, com conversão segura para JSON)
- `lastDailyRewardAt` (data/hora opcional)
- `createdAt`
- `updatedAt`

### Spin
- `id`
- `userId`
- `betAmount`
- `symbols` (JSON ou estrutura equivalente)
- `winAmount`
- `balanceAfter`
- `isWin`
- `createdAt`

Ajuste os tipos conforme a implementação. Como as moedas são valores inteiros, não use ponto flutuante para armazenar saldo ou prêmios. Inclua relações, índices e restrições adequados.

## 10. API REST

Implemente, documente e teste manualmente endpoints semelhantes a:

### Autenticação
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Jogo
- `POST /api/game/spin` — recebe somente a aposta escolhida; calcula o resultado no backend.
- `GET /api/game/history` — retorna os últimos 20 giros do usuário autenticado.
- `GET /api/game/stats` — retorna estatísticas do usuário.

### Recompensa diária
- `GET /api/rewards/daily` — informa disponibilidade e tempo restante.
- `POST /api/rewards/daily/claim` — resgata 50.000 LC se o intervalo permitir.

### Conta
- `GET /api/users/me` — retorna perfil e saldo.

Use códigos HTTP adequados, validação com Zod e um formato consistente para erros. Não exponha hashes de senha nem informações privadas.

## 11. Consistência e regras importantes

- O backend é a fonte oficial para saldo, aposta, resultado, prêmio e recompensa.
- O débito da aposta, o crédito do prêmio e o registro do giro devem ocorrer na mesma transação.
- Previna saldo negativo e condições de corrida em operações simultâneas.
- Garanta que os endpoints de histórico, estatísticas e perfil retornem apenas dados do usuário autenticado.
- Não aceite `balance`, `winAmount`, `symbols` ou `isWin` como valores definidos pelo cliente.
- Evite duplicar a lógica de regras de jogo entre frontend e backend.
- Exiba erros amigáveis sem revelar stack traces ao usuário.
- Não implemente dinheiro real, depósitos, saques, prêmios convertíveis ou pagamentos.

## 12. Configuração e execução local

Crie um `.env.example` com as variáveis necessárias, por exemplo:
- `DATABASE_URL`
- `JWT_SECRET`
- `PORT`
- `CLIENT_URL`

Não inclua segredos reais no repositório. Configure o `.gitignore` para ignorar `.env`, `node_modules`, builds e arquivos gerados pelo Prisma quando aplicável.

Forneça scripts de desenvolvimento e comandos para:
1. Instalar dependências do backend e frontend.
2. Configurar o PostgreSQL.
3. Criar/aplicar a migração do Prisma.
4. Executar o seed, se necessário.
5. Iniciar o backend.
6. Iniciar o frontend.
7. Acessar a aplicação no navegador.

Se for útil, adicione `docker-compose.yml` apenas para subir o PostgreSQL localmente; a aplicação em si pode continuar sendo executada por comandos npm.

## 13. Qualidade e entrega

- Crie um `README.md` em português do Brasil com requisitos, configuração, comandos e explicação das regras.
- Inclua tratamento de erros e validação.
- Não deixe botões decorativos sem funcionalidade.
- Não deixe endpoints importantes como TODO.
- Não use dados mockados como substitutos do backend.
- Mantenha o código organizado, tipado e fácil de estudar.
- Ao terminar, execute as verificações disponíveis, como build, lint e/ou testes. Corrija os erros encontrados.
- Se alguma dependência ou comando falhar, explique a causa e tente uma alternativa apropriada.

## 14. Critérios de aceite

Considere o projeto concluído somente quando:
- [ ] Cadastro e login funcionarem.
- [ ] Cada novo usuário receber 50.000 LC iniciais.
- [ ] O resgate diário de 50.000 LC respeitar o intervalo de 24 horas.
- [ ] A máquina realizar giros com resultado calculado no backend.
- [ ] Todas as apostas permitidas funcionarem e apostas inválidas serem recusadas.
- [ ] Débito, prêmio e histórico persistirem corretamente no PostgreSQL.
- [ ] Auto-giro iniciar, atualizar o progresso e parar corretamente.
- [ ] Histórico e estatísticas refletirem os dados reais do usuário.
- [ ] A interface estiver responsiva e apresentar estados de carregamento/erro.
- [ ] O README explicar claramente como executar tudo em localhost.

**Comece analisando o diretório atual e implemente a aplicação completa, arquivo por arquivo. Ao final, informe o que foi criado, quais comandos executei para rodar o sistema e quaisquer limitações que ainda existam.**
