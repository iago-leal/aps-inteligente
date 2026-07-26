# Legacy impact: Puericultura — escores z de crescimento infantil

> Identificador: `017-puericultura-crescimento`
> Data: `2026-07-27` (rodadas anteriores: `2026-07-26` e a primeira de `2026-07-27`)
> Âncora: **legado** (`_reversa_sdd/architecture.md` + `domain.md`, re-extração nº 3)
> Estado da execução: **parcial** — Fase 1 completa (T001–T006), a cadeia do gerador fechada
> (T029 a T033) e a leitura do dado entregue com o seu apoio e o seu teste (T020, T034, T007,
> T011); 37 ações pendentes, entre elas o restante do domínio e toda a interface.

## 1. Arquivos afetados

| Arquivo afetado | Componente (`architecture.md`) | Tipo | Severidade | Justificativa |
|---|---|---|---|---|
| `interface/inicio/catalogo.ts` | Módulo 10 — `interface/inicio` | regra-alterada (extensão) | LOW | Quarta seção, `puericultura`, com uma ficha. Diff puramente aditivo: 12 linhas, nenhuma removida. As três seções existentes seguem byte a byte |
| `interface/inicio/icones.tsx` | Módulo 10 — `interface/inicio` | regra-alterada (extensão) | LOW | Entrada `puericultura → SmileyIcon`. O mapa mantém o fallback `null` e os três pares anteriores |
| `tsconfig.json` | — (configuração de raiz) | delta-de-configuração | LOW | `allowImportingTsExtensions`, exigido pelos scripts `.mts` que o Node executa em ESM. Só vale sob `noEmit`; o pipeline do Next não lê esta opção |
| `scripts/baixar-tabelas-oms.mts` | — | componente-novo (dev-time) | LOW | Aquisição das 14 planilhas da OMS. Fora do bundle e fora do runtime |
| `scripts/oms/origens.mts` | — | componente-novo (dev-time) | MEDIUM | Catálogo das origens com aba esperada e recorte por arquivo. É onde mora a barreira contra o arquivo mal nomeado da OMS: erro aqui é erro clínico silencioso |
| `scripts/lib/planilha.mts` | — | componente-novo (dev-time) | MEDIUM | Leitor de `.xlsx` (ZIP + XML) com built-ins. Não entra em produção, mas todo número clínico da feature passa por ele |
| `scripts/oms/criterios.mts` | — | componente-novo (dev-time) | **HIGH** | Declara o que se exige do dado: colunas, precisão, ordens de grandeza, degraus tolerados e os valores-âncora. Um limite frouxo aqui deixa passar a curva errada sob o rótulo certo — o pior modo de falha da feature |
| `scripts/oms/extracao.mts` | — | componente-novo (dev-time) | **HIGH** | Converte célula em número, recorta ao escopo da fonte (D-04) e canoniza na precisão publicada. Toda linha `L/M/S` embarcada passa por aqui |
| `scripts/oms/verificacoes.mts` | — | componente-novo (dev-time) | **HIGH** | V1, V2 e V4 a V7. É o único ponto do sistema que pode barrar dado clínico corrompido antes de ele virar escore |
| `scripts/oms/falha.mts` | — | componente-novo (dev-time) | LOW | Modo de falha único, com arquivo e verificação na mensagem (contrato §7) |
| `scripts/oms/emitir-modulo.mts` | — | componente-novo (dev-time) | MEDIUM | Produz o texto dos módulos, com procedência determinística e round-trip conferido por número |
| `scripts/gerar-tabelas-oms.mts` | — | componente-novo (dev-time) | MEDIUM | Orquestração em duas fases; confere `sha256` contra o manifesto e não escreve nada antes de as 14 passarem |
| `models/puericultura/oms/tabelas/*.ts` (14 módulos) | Domínio 5 (`data-delta.md` §3) | delta-de-dados | **HIGH** | 12.964 linhas `L/M/S`, 344 kB. É o dado que decide todo escore z da faixa da OMS. Gerado, nunca editado à mão |
| `models/puericultura/oms/tabelas/manifesto.json` | — | delta-de-dados | MEDIUM | Procedência versionada das 14 origens (URL, data, `sha256`). É o que faz revisão silenciosa da OMS aparecer como divergência de hash |
| `models/puericultura/tipos.ts` | Domínio 5 (`architecture.md` §1, família de domínios) | componente-novo | **HIGH** | Contrato do quinto domínio. É onde RF-06 deixa de ser promessa e vira impossibilidade: a variante `ausente` impede que "não calculado" se confunda com "calculado como zero" em qualquer consumidor |
| `models/puericultura/oms/leitura.ts` | Domínio 5 — subdiretório `oms/` (D-01) | componente-novo | **HIGH** | Traduz idade em linha da tabela. Errar a fronteira por um dia produz escore de outra criança, com a mesma aparência de correção — o modo de falha que o roadmap §9 classifica como alto |
| `tests/apoio/puericultura.ts` | — (apoio de teste) | componente-novo | LOW | Tabelas sintéticas e construtores. Nada em produção depende dele |
| `tests/unit/dominio-puericultura/leitura-oms.test.ts` | — (suíte de unidade) | componente-novo | MEDIUM | Prende as três fronteiras nos seus pares e as quatro âncoras do contrato §5. É o que impede que uma regeneração futura mude o número em silêncio |
| `_reversa_forward/.../interfaces/tabelas-de-referencia.md` | — (spec da feature) | regra-alterada (reconciliação) | MEDIUM | Quatro pontos do contrato reconciliados contra o dado real na rodada anterior (§3, §4.2, §5 V2/V5 e as novas §5.2 e §5.3) |
| `referencias/caderneta/`, `referencias/oms/`, `referencias/intergrowth/` | — | delta-de-dados (fora do git) | LOW | Fontes clínicas em pasta ignorada (MD-0008). Não versionadas por decisão |
| `.harness/decisoes/MD-0002.md`, `MD-0004.md`, `MD-0006.md`, `MD-0007.md`, `MD-0008.md` | — | registro de decisão | — | Fichas das rodadas anteriores; nenhuma aberta nesta |

## 2. Diff conceitual por componente

**`interface/inicio` (Módulo 10).** Inalterado desde a primeira rodada. O catálogo continua sendo
a fonte única tipada das seções, e a plataforma passa de três para quatro. A regra de anti-drift
do README foi respeitada à risca: a entrada existe antes de a rota existir, de modo que a home
hoje aponta para uma rota ainda não implementada. É estado intermediário esperado, e desaparece
em T045.

**Cadeia do dado (dev-time), completa desde a rodada anterior.** Aquisição → leitura →
verificação → emissão. Duas decisões estruturais a governam: só o baixador toca a rede, e o
gerador é função determinística de arquivos em disco, com o manifesto como junta entre os dois;
a verificação não é um cuidado espalhado, mas um portão único de sete provas cujo modo de falha é
abortar sem escrever byte algum.

**Dado de referência embarcado (categoria nova no projeto).** O projeto ganhou uma categoria de
dado que não tinha: 376 kB versionados que nenhum humano deve editar. O que a torna auditável não
é a promessa de que foi bem gerada, mas três propriedades verificáveis a qualquer momento: cada
módulo declara no cabeçalho a URL, a data e o `sha256` da planilha de que saiu; regerar sobre as
mesmas origens produz `git diff` vazio; e o recorte de D-04 está no próprio dado, não numa
checagem em tempo de execução.

**O quinto domínio nasceu (novidade desta rodada).** Até aqui `models/puericultura/` era só dado;
agora tem contrato e tem porta. Três escolhas descrevem o que mudou conceitualmente:

*Primeira, o tipo carrega a regra.* `IndiceAntropometrico` é união de três variantes, e é ela que
realiza RF-06 — a independência dos índices deixa de depender de disciplina de quem escreve o
cálculo e passa a ser propriedade do que se pode representar. Um índice ausente não tem campo
`escoreZ` para preencher com zero; um índice fora do escopo não tem escore para inventar.

*Segunda, o acervo é uma porta, não um `import`.* D-08 previa o repositório injetável para
preservar a testabilidade, e o efeito apareceu de imediato: dos 22 casos de T011, os que exercitam
a aritmética de posição rodam contra tabelas de onze linhas, e não contra as 12.964 do acervo
real. A mesma porta é a que deixa D-09 em aberto — migrar para carga dinâmica, se a medição do
bundle exigir, não toca o cálculo.

*Terceira, cada fronteira tem um dono só.* As duas dos cinco anos foram separadas de propósito
(D-05): a de tabela mora na leitura, a de rótulo morará na classificação, e o cabeçalho de cada
uma declara onde está a outra. Do mesmo modo, a leitura informa que a OMS não publica linha para
uma combinação (`MotivoSemTabela`), mas não decide o que fazer com isso: a tradução em recusa
clínica, global ou parcial, continua sendo de `elegibilidade.ts`. Duas verdades sobre a mesma
regra é o começo de toda divergência silenciosa.

**Um achado de aritmética no plano, sem consequência de comportamento.** D-05 enuncia a fronteira
de tabela como "61 meses (1856 dias)", tratando os dois números como o mesmo ponto — e
`⌊1856 / 30,4375⌋` é 60, não 61. O que a fonte tem é um encaixe exato entre as duas tabelas: o
dia 1856 é a última linha de 2006 e o dia **1857** é o primeiro do mês 61 de 2007, sem buraco nem
sobreposição. É a decisão que o plano pretendia, com a aritmética corrigida; o teste a prova nos
dois lados.

**Configuração.** `tsconfig.json` segue como o único arquivo de configuração tocado, pelo motivo
mecânico já registrado: em ESM, o Node exige extensão explícita no import, o que o `tsc` só
aceita sob `allowImportingTsExtensions`.

## 3. Preservadas

Regras 🟢 de `_reversa_sdd/domain.md` que continuam intactas, verificadas nesta rodada:

- **Os sete invariantes da família** (§7) seguem válidos, e o quinto domínio já nasce dentro
  deles: `models/puericultura/**` não importa framework algum (RF-01); erro esperado é valor e
  exceção só para bug interno (`ErroDeInvariante`, ADR 0004); toda saída de resultado carrega
  `ReferenciaClinica` no tipo, de modo que omiti-la nem compila.
- **Regra 15 — coleta total de ofensores**: preservada, e já refletida no tipo `ErroValidacao`
  do domínio novo, que só existe na forma de lista.
- **§8 — escopo é a fonte** (MD-0009): reforçada. O que era checagem em tempo de execução virou
  propriedade do dado na rodada anterior (D-04 aplicado na emissão) e ganhou agora um segundo
  guardião — não existe linha para extrapolar, e a leitura recusa antes de procurar.
- **Catálogo como fonte única** (Módulo 10, D-07 da feature 007): preservado.
- **Privacidade por construção** (ADR 0002): nada do que entrou faz requisição em runtime; o
  único `fetch` da feature vive num script dev-time que a aplicação nunca importa. `EntradaAvaliacao`
  não tem campo que identifique a criança, o que torna a minimização estrutural, e não uma
  disciplina da tela.
- **Camadas** (`architecture.md` §1): `scripts/**` não é importado por `models/**`,
  `interface/**` nem `pages/**`. O domínio novo importa apenas os módulos de dado, que são folhas.
- **Suíte verde**: **446 testes em 33 arquivos** (antes 424 em 32), `typecheck` e `eslint` limpos.

## 4. Modificadas

Nenhuma regra 🟢 do **legado** foi alterada ou removida nesta rodada — nenhum arquivo
pré-existente da aplicação foi sequer aberto. As duas alterações em arquivos existentes seguem
sendo as extensões aditivas do catálogo e do mapa de ícones, previstas por D-12.

Foram modificados artefatos **desta feature**: na rodada anterior, o contrato de aquisição
`interfaces/tabelas-de-referencia.md`, em quatro pontos; nesta, três descrições de entidade do
`data-delta.md` §2 que a implementação precisou de forma diferente da que o plano escreveu — o
discriminante do índice (`estado`, não `tipo`), `idadeUsada` como objeto e a idade gestacional
como campo opcional. As três são de forma, não de comportamento, e estão declaradas nas notas de
execução do `actions.md`; a reconciliação do delta de dados cabe ao `/reversa-sync`.

Segue registrada, para as rodadas seguintes, a única alteração de arquivo de motor prevista no
plano: o comentário de gêmeo em `models/gestacao/datas.ts` (T022, D-07), que não muda
comportamento mas abre arquivo de domínio existente.
