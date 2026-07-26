# Legacy impact: Puericultura — escores z de crescimento infantil

> Identificador: `017-puericultura-crescimento`
> Data: `2026-07-26`
> Âncora: **legado** (`_reversa_sdd/architecture.md` + `domain.md`, re-extração nº 3)
> Estado da execução: **parcial** — Fase 1 completa (T001–T006) e T029 do núcleo; 45 ações pendentes.

## 1. Arquivos afetados

| Arquivo afetado | Componente (`architecture.md`) | Tipo | Severidade | Justificativa |
|---|---|---|---|---|
| `interface/inicio/catalogo.ts` | Módulo 10 — `interface/inicio` | regra-alterada (extensão) | LOW | Quarta seção, `puericultura`, com uma ficha. Diff puramente aditivo: 12 linhas, nenhuma removida. As três seções existentes seguem byte a byte |
| `interface/inicio/icones.tsx` | Módulo 10 — `interface/inicio` | regra-alterada (extensão) | LOW | Entrada `puericultura → SmileyIcon`. O mapa mantém o fallback `null` e os três pares anteriores |
| `tsconfig.json` | — (configuração de raiz) | delta-de-configuração | LOW | `allowImportingTsExtensions`, exigido pelos scripts `.mts` que o Node executa em ESM. Só vale sob `noEmit`; o pipeline do Next não lê esta opção |
| `scripts/baixar-tabelas-oms.mts` | — | componente-novo (dev-time) | LOW | Aquisição das 14 planilhas da OMS. Fora do bundle e fora do runtime |
| `scripts/oms/origens.mts` | — | componente-novo (dev-time) | MEDIUM | Catálogo das origens com aba esperada e recorte por arquivo. É onde mora a barreira contra o arquivo mal nomeado da OMS: erro aqui é erro clínico silencioso |
| `scripts/lib/planilha.mts` | — | componente-novo (dev-time) | MEDIUM | Leitor de `.xlsx` (ZIP + XML) com built-ins. Não entra em produção, mas todo número clínico da feature passa por ele |
| `models/puericultura/oms/tabelas/manifesto.json` | — | delta-de-dados | MEDIUM | Procedência versionada das 14 origens (URL, data, `sha256`). É o que faz revisão silenciosa da OMS aparecer como divergência de hash |
| `referencias/caderneta/`, `referencias/oms/`, `referencias/intergrowth/` | — | delta-de-dados (fora do git) | LOW | Fontes clínicas em pasta ignorada (MD-0008). Não versionadas por decisão |
| `.harness/decisoes/MD-0002.md`, `MD-0004.md`, `MD-0006.md` | — | registro de decisão | — | Duas fichas fechadas e uma aberta-e-fechada nesta sessão |

## 2. Diff conceitual por componente

**`interface/inicio` (Módulo 10).** O catálogo continua sendo a fonte única tipada das seções,
e a plataforma passa de três para quatro. Nada na estrutura muda: a seção nova tem o mesmo
formato das anteriores, uma calculadora, e o mapa de ícones ganha o par correspondente. A regra
de anti-drift do README — calculadora nova entra primeiro no catálogo — foi respeitada à risca:
a entrada existe antes de a rota existir, de modo que a home hoje aponta para uma rota ainda não
implementada. É estado intermediário esperado, e desaparece em T045.

**Cadeia do dado (novo, dev-time).** Nasce uma cadeia que o legado não tinha: aquisição →
leitura → verificação → emissão. Nesta rodada, a aquisição e a leitura ficaram prontas. A
separação entre baixar e gerar (contrato §5.1) é a decisão estrutural do bloco: só o baixador
toca a rede, e o gerador é função determinística de arquivos em disco. O manifesto versionado é
a junta entre os dois, e é ele que dá ao "eu de daqui a doze meses" como saber se o dado
embarcado ainda corresponde ao que a OMS publica.

**Configuração.** `tsconfig.json` é o único arquivo de configuração tocado, e por um motivo
mecânico: em ESM, o Node exige extensão explícita no import, o que o `tsc` só aceita sob
`allowImportingTsExtensions`. A alternativa — um `tsconfig` separado para `scripts/` — tiraria os
scripts do `npm run typecheck`, o que seria pior: o leitor de planilha ficaria sem verificação de
tipo justamente por ser dev-time.

## 3. Preservadas

Regras 🟢 de `_reversa_sdd/domain.md` que continuam intactas, verificadas nesta rodada:

- **Os sete invariantes da família** (§7) seguem válidos: nenhum motor existente foi tocado,
  nenhuma linha executável de `models/**` mudou.
- **Regra 15 — coleta total de ofensores**: nenhum domínio foi alterado.
- **§8 — escopo é a fonte** (MD-0009): a fronteira ganhou números novos (D-15, D-16) para o
  domínio que ainda não existe, sem alterar a regra transversal.
- **Catálogo como fonte única** (Módulo 10, D-07 da feature 007): preservado, e a extensão o
  confirma como ponto de entrada.
- **Privacidade por construção** (ADR 0002): nada do que entrou faz requisição em runtime — o
  único `fetch` da feature vive num script dev-time que nunca é importado pela aplicação.
- **Suíte verde**: 424 testes em 32 arquivos, `typecheck` e `eslint` limpos depois das alterações.

## 4. Modificadas

Nenhuma regra 🟢 do legado foi alterada ou removida nesta rodada. As duas alterações em arquivos
existentes são extensões aditivas do catálogo e do mapa de ícones, previstas por D-12, e a
alteração de `tsconfig.json` não tem regra de domínio associada.

Fica registrada, para a próxima rodada, a única alteração de arquivo de motor prevista no plano:
o comentário de gêmeo em `models/gestacao/datas.ts` (T022, D-07), que não muda comportamento mas
abre arquivo de domínio existente.
