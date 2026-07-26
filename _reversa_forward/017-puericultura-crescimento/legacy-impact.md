# Legacy impact: Puericultura — escores z de crescimento infantil

> Identificador: `017-puericultura-crescimento`
> Data: `2026-07-27` (rodada anterior: `2026-07-26`)
> Âncora: **legado** (`_reversa_sdd/architecture.md` + `domain.md`, re-extração nº 3)
> Estado da execução: **parcial** — Fase 1 completa (T001–T006) e a cadeia do gerador fechada
> (T029 a T033); 41 ações pendentes, entre elas todo o domínio e toda a interface.

## 1. Arquivos afetados

| Arquivo afetado | Componente (`architecture.md`) | Tipo | Severidade | Justificativa |
|---|---|---|---|---|
| `interface/inicio/catalogo.ts` | Módulo 10 — `interface/inicio` | regra-alterada (extensão) | LOW | Quarta seção, `puericultura`, com uma ficha. Diff puramente aditivo: 12 linhas, nenhuma removida. As três seções existentes seguem byte a byte |
| `interface/inicio/icones.tsx` | Módulo 10 — `interface/inicio` | regra-alterada (extensão) | LOW | Entrada `puericultura → SmileyIcon`. O mapa mantém o fallback `null` e os três pares anteriores |
| `tsconfig.json` | — (configuração de raiz) | delta-de-configuração | LOW | `allowImportingTsExtensions`, exigido pelos scripts `.mts` que o Node executa em ESM. Só vale sob `noEmit`; o pipeline do Next não lê esta opção |
| `scripts/baixar-tabelas-oms.mts` | — | componente-novo (dev-time) | LOW | Aquisição das 14 planilhas da OMS. Fora do bundle e fora do runtime |
| `scripts/oms/origens.mts` | — | componente-novo (dev-time) | MEDIUM | Catálogo das origens com aba esperada e recorte por arquivo. É onde mora a barreira contra o arquivo mal nomeado da OMS: erro aqui é erro clínico silencioso. **Corrigido nesta rodada:** a aba do comprimento 2006 é `LFA_*`, não `lhfa_*` |
| `scripts/lib/planilha.mts` | — | componente-novo (dev-time) | MEDIUM | Leitor de `.xlsx` (ZIP + XML) com built-ins. Não entra em produção, mas todo número clínico da feature passa por ele |
| `scripts/oms/criterios.mts` | — | componente-novo (dev-time) | **HIGH** | Declara o que se exige do dado: colunas, precisão, ordens de grandeza, degraus tolerados e os valores-âncora. Um limite frouxo aqui deixa passar a curva errada sob o rótulo certo — o pior modo de falha da feature |
| `scripts/oms/extracao.mts` | — | componente-novo (dev-time) | **HIGH** | Converte célula em número, recorta ao escopo da fonte (D-04) e canoniza na precisão publicada. Toda linha `L/M/S` embarcada passa por aqui |
| `scripts/oms/verificacoes.mts` | — | componente-novo (dev-time) | **HIGH** | V1, V2 e V4 a V7. É o único ponto do sistema que pode barrar dado clínico corrompido antes de ele virar escore |
| `scripts/oms/falha.mts` | — | componente-novo (dev-time) | LOW | Modo de falha único, com arquivo e verificação na mensagem (contrato §7) |
| `scripts/oms/emitir-modulo.mts` | — | componente-novo (dev-time) | MEDIUM | Produz o texto dos módulos, com procedência determinística e round-trip conferido por número |
| `scripts/gerar-tabelas-oms.mts` | — | componente-novo (dev-time) | MEDIUM | Orquestração em duas fases; confere `sha256` contra o manifesto e não escreve nada antes de as 14 passarem |
| `models/puericultura/oms/tabelas/*.ts` (14 módulos) | Domínio 5 (`data-delta.md` §3) | delta-de-dados | **HIGH** | 12.964 linhas `L/M/S`, 344 kB. É o dado que decide todo escore z da faixa da OMS. Gerado, nunca editado à mão |
| `models/puericultura/oms/tabelas/manifesto.json` | — | delta-de-dados | MEDIUM | Procedência versionada das 14 origens (URL, data, `sha256`). É o que faz revisão silenciosa da OMS aparecer como divergência de hash |
| `_reversa_forward/.../interfaces/tabelas-de-referencia.md` | — (spec da feature) | regra-alterada (reconciliação) | MEDIUM | Quatro pontos do contrato reconciliados contra o dado real (§3, §4.2, §5 V2/V5 e as novas §5.2 e §5.3) |
| `referencias/caderneta/`, `referencias/oms/`, `referencias/intergrowth/` | — | delta-de-dados (fora do git) | LOW | Fontes clínicas em pasta ignorada (MD-0008). Não versionadas por decisão |
| `.harness/decisoes/MD-0002.md`, `MD-0004.md`, `MD-0006.md` | — | registro de decisão | — | Fichas fechadas na rodada anterior; nenhuma aberta nesta |

## 2. Diff conceitual por componente

**`interface/inicio` (Módulo 10).** Inalterado desde a rodada anterior. O catálogo continua sendo
a fonte única tipada das seções, e a plataforma passa de três para quatro. A regra de anti-drift
do README foi respeitada à risca: a entrada existe antes de a rota existir, de modo que a home
hoje aponta para uma rota ainda não implementada. É estado intermediário esperado, e desaparece
em T045.

**Cadeia do dado (dev-time), agora completa.** A cadeia que o legado não tinha — aquisição →
leitura → verificação → emissão — fechou nesta rodada. Duas decisões estruturais a governam.
A primeira, do contrato §5.1: só o baixador toca a rede, e o gerador é função determinística de
arquivos em disco, com o manifesto como junta entre os dois. A segunda, desta rodada: a
verificação não é um cuidado espalhado, é um portão único de sete provas que o dado atravessa
antes de existir como código, e cujo modo de falha é abortar sem escrever byte algum. As sete
provas foram exercitadas nos dois sentidos: as 14 tabelas passam, e nove sabotagens dirigidas
confirmaram que cada verificação morde a anomalia que lhe cabe.

**Dado de referência embarcado (categoria nova no projeto).** O projeto ganhou uma categoria de
dado que não tinha: 376 kB versionados que nenhum humano deve editar. O que a torna auditável não
é a promessa de que foi bem gerada, mas três propriedades verificáveis a qualquer momento: cada
módulo declara no cabeçalho a URL, a data e o `sha256` da planilha de que saiu; regerar sobre as
mesmas origens produz `git diff` vazio; e o recorte de D-04 está no próprio dado, não numa
checagem em tempo de execução — não existe linha fora da cobertura da caderneta para extrapolar.

**A spec cedeu ao dado, quatro vezes.** Esta é a mudança conceitual mais relevante da rodada.
O contrato de aquisição afirmava coisas que os arquivos reais desmentiram: que todos tinham 13
colunas (dois têm 15), que a aba do comprimento traria `lhfa` (traz `LFA`), que `M` cresceria
monotonicamente em peso e estatura (cai no dia 1 e no dia 731) e que a limpeza do ruído de ponto
flutuante poderia alterar valores (não altera nenhum). Em nenhum dos casos o código foi ajustado
para passar por uma verificação frouxa: as verificações ficaram mais estritas — V5 passou a
vigiar a magnitude de dois degraus nomeados, em vez de proibir um comportamento que a fonte tem —
e o contrato foi reconciliado, como o Princípio VI exige.

**Configuração.** `tsconfig.json` segue como o único arquivo de configuração tocado, pelo motivo
mecânico já registrado: em ESM, o Node exige extensão explícita no import, o que o `tsc` só
aceita sob `allowImportingTsExtensions`.

## 3. Preservadas

Regras 🟢 de `_reversa_sdd/domain.md` que continuam intactas, verificadas nesta rodada:

- **Os sete invariantes da família** (§7) seguem válidos: nenhum motor existente foi tocado,
  nenhuma linha executável de `models/**` mudou. O que entrou em `models/` é dado gerado, sem
  lógica.
- **Regra 15 — coleta total de ofensores**: nenhum domínio foi alterado.
- **§8 — escopo é a fonte** (MD-0009): a rodada a reforçou, transformando-a de checagem em
  propriedade do dado (D-04 aplicado na emissão).
- **Catálogo como fonte única** (Módulo 10, D-07 da feature 007): preservado.
- **Privacidade por construção** (ADR 0002): nada do que entrou faz requisição em runtime — o
  único `fetch` da feature vive num script dev-time que nunca é importado pela aplicação, e o
  gerador não toca a rede por contrato.
- **Camadas** (`architecture.md` §1): `scripts/**` não é importado por `models/**`,
  `interface/**` nem `pages/**`. Os módulos gerados são folhas: não importam nada.
- **Suíte verde**: 424 testes em 32 arquivos, `typecheck` e `eslint` limpos com os 376 kB de
  dado novo sob verificação de tipo.

## 4. Modificadas

Nenhuma regra 🟢 do **legado** foi alterada ou removida nesta rodada. As duas alterações em
arquivos existentes da aplicação continuam sendo as extensões aditivas do catálogo e do mapa de
ícones, previstas por D-12.

Foi modificado, sim, um artefato **desta feature**: o contrato de aquisição
`interfaces/tabelas-de-referencia.md`, em quatro pontos, para se reconciliar com o que os
arquivos reais mostraram (§1, item "A spec cedeu ao dado"). Os quatro geraram watch items
(W006 a W010) porque descrevem promessas que precisam continuar verdadeiras.

Segue registrada, para as rodadas seguintes, a única alteração de arquivo de motor prevista no
plano: o comentário de gêmeo em `models/gestacao/datas.ts` (T022, D-07), que não muda
comportamento mas abre arquivo de domínio existente.
