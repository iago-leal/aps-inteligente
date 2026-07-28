# Impacto no legado — 019-contribuicao-voluntaria-pix

> Data: 2026-07-28 · Âncora: extração reversa nº 3 em `_reversa_sdd/` (`architecture.md` + `domain.md`)
> Gerado por `/reversa-coding` ao fim da execução de `actions.md` (33 de 34 ações)

## 1. Tabela de impacto

| Arquivo afetado | Componente (`_reversa_sdd/`) | Tipo | Severidade | Justificativa |
|---|---|---|---|---|
| `models/contribuicao/{tipos,campo,crc16,validacao,br-code}.ts` | `architecture.md#1`, família `models/*` | componente-novo | MEDIUM | Primeiro unit de domínio **não clínico**. Isento por escrito dos invariantes de fonte clínica e `ReferenciaClinica` (`MD-0022`), com a isenção no cabeçalho da fachada para que a re-extração não a leia como violação |
| `interface/contribuicao/{beneficiario.ts,codigo-qr,acao-copiar,painel,bloco-de-apoio}.tsx` | `architecture.md#1`, camada de interface | componente-novo | LOW | Painel sobre o `Dialog` do Primer, envoltório do QR, comando de cópia parametrizado e a constante congelada do beneficiário |
| `interface/inicio/tela.tsx` | `code-analysis.md#Módulo 10 — interface/inicio` | regra-alterada | MEDIUM | Bloco de apoio ao pé das seções, **fora** do `map` do `CATALOGO` (D-12). O catálogo permanece byte a byte, e o teste de integração passou a afirmar isso |
| `interface/estilos/contribuicao.css` | `interface-estilos/requirements.md` | componente-novo | LOW | Sétima folha, importada em `pages/_app.tsx`. Nenhuma folha existente foi tocada, e `globais.css` segue nas 364 linhas |
| `pages/_app.tsx` | `code-analysis.md#Módulo 12 — pages` | regra-alterada | LOW | Uma linha de import da folha nova |
| `package.json`, `package-lock.json` | `dependencies.md`, `architecture.md#6` | delta-de-contrato-externo | MEDIUM | Entra `react-qr-code@2.2.0`, pinada exata, primeira dependência de runtime desde a feature 010. Ficha `MD-0024` |
| `models/contribuicao/br-code.ts` (formato emitido) | contrato externo novo | delta-de-contrato-externo | HIGH | O BR Code é lido por software de terceiros sob especificação que não controlamos e **sem canal de erro**. Conferido contra decodificador independente com os valores reais (`oraculo-externo.md` §2, verificação `DBD8`); a leitura por aplicativo de banco real segue pendente (`T033`) |
| `scripts/textos/classes/{interface,models-demais}.mts` | `addenda/018-revisao-linguagem-textos.md` | regra-alterada | LOW | Classe declarada dos literais novos. Sem entrada, o gerador para |
| `tests/apoio/inventario-textual.json` | `addenda/018` | delta-de-dados | LOW | Regerado três vezes ao longo da execução, e **710** ao fim: os literais do painel, os do README e o nome publicado do beneficiário. Idempotente na segunda execução de cada rodada |
| `tests/apoio/setup-jsdom.ts` | `architecture.md#5` (pirâmide de testes) | regra-alterada | LOW | Polyfill de `ResizeObserver` para o `useOverflow` do `Dialog`, no molde do polyfill de `adoptedStyleSheets` da feature 011 |
| `tests/unit/dominio-contribuicao/*`, `tests/unit/interface/beneficiario-sem-exemplo.test.ts`, `tests/integration/interface/contribuicao.test.tsx`, `e2e/contribuicao.spec.ts` | `architecture.md#5` | componente-novo (teste) | LOW | Três níveis da pirâmide. A suíte passa de 711 para **733** testes de unidade e integração e de 36 para **47** roteiros de ponta a ponta |
| `tests/integration/interface/inicio.test.tsx` | `architecture.md#5` | regra-alterada | LOW | Três casos novos; os anteriores permanecem byte a byte |
| `README.md` | documentação | regra-alterada | LOW | Seção de configuração do beneficiário e procedimento de conferência (RF-13) |
| `tests/apoio/citacao-linha-de-base.json`, `e2e/axe-baseline.json` | `addenda/018`, `architecture.md#5` | (nenhum) | — | **Intocados**, conferido por `git status` e não presumido |

## 2. Diff conceitual, por componente

**O domínio ganhou uma família nova, e a fronteira dela está escrita.** `models/contribuicao`
segue a disciplina de todos os outros: erro como valor, coleta total dos ofensores, nenhum
import de framework, nenhuma leitura de relógio. Difere no que **não** tem, e é essa ausência
que precisou ser declarada: sem fonte clínica única, sem `ReferenciaClinica`, fora do catálogo
congelado. Sem a declaração, a próxima passagem do Reversa leria três violações onde há uma
decisão.

**A home ganhou um bloco, e o catálogo não ganhou nada.** É a distinção que `D-12` protege: o
`CATALOGO` é fonte única de **calculadoras** e, desde a 018, oráculo da descrição da plataforma.
Um item de apoio ali dentro corromperia os dois papéis. O bloco entra depois do `map`, e o teste
de integração agora afirma tanto a presença do comando quanto a lista intacta de rotas.

**Uma decisão de implementação mudou por medição, e não por gosto.** O painel já era montado só
quando aberto, mas o `import` estático arrastava o `Dialog` e a biblioteca do QR para o primeiro
carregamento da home: quase 15 kB gzip cobrados de toda visita. Com `next/dynamic`, o custo da
home caiu a +2,5 kB e o resto virou chunk sob demanda. O número está em `medicao-bundle.md`.

**Uma correção de acessibilidade veio do axe, e não da revisão humana.** Os subtítulos do painel
nasceram como `h3` e pulavam nível, porque o `Dialog` do Primer publica o próprio título como
`h1`. Viraram `h2`, e a baseline de zero violação por rota continua verdadeira com o painel
aberto.

**A prosa das mensagens de validação foi escrita como literal completo de propósito.** Montá-la
por template interpolado a tornaria invisível ao extrator do inventário (`MD-0021`), o que
significaria criar três violações novas da norma no mesmo movimento em que a feature declara
respeitá-la. O limite e o comprimento observado viajam no dado estruturado do ofensor.

## 3. Preservadas

Regras 🟢 de `_reversa_sdd/domain.md` e ADRs que continuam intactos, e que esta feature tocou de
perto o bastante para valer a afirmação:

- **ADR 0002 (privacidade por arquitetura).** Nenhum `fetch`, nenhum durável novo, nenhum
  identificador de visitante. O e2e afere ausência de requisição externa e de busca de dado na
  abertura do painel, e ausência de chave nova em `localStorage` e `sessionStorage`.
- **ADR 0007 (telemetria nula).** Nada foi instrumentado: a plataforma não sabe quem abriu o
  painel nem se alguém contribuiu, e isso é propriedade do PIX estático, não limitação a
  contornar.
- **ADR 0003 (domínio isolado de framework).** O motor do BR Code não importa React nem Next.
- **ADR 0004 (erros como valores).** A fachada nunca lança; a propriedade está verificada por
  `fast-check` sobre entradas arbitrárias.
- **Regra 15 de `domain.md` (coleta total de ofensores).** Reaproveitada sem alteração.
- **Os quatro domínios clínicos.** Nenhum motor foi tocado, nenhuma dose, escore ou datação
  mudou. `/api/v1/status` é idêntico e nenhuma rota nasceu ou morreu.
- **Contrato da `Moldura` (adendo 016) e guardas geométricas do cabeçalho (013, 015, 016).**
  Intocados: o comando de apoio não subiu para o cabeçalho.
- **Linha de base da citação (`MD-0018`).** Intocada, como manda o escopo negativo.

## 4. Modificadas

Nenhuma regra 🟢 de `_reversa_sdd/domain.md` foi alterada ou removida. O que mudou é de outra
natureza, e por isso não gera watch item de regra clínica:

- **A tabela de invariantes de `architecture.md#1` deixa de valer para todo módulo de `models/`
  e passa a valer para todo módulo clínico de `models/`.** É a `MD-0022`, e a re-extração nº 4
  precisa absorvê-la, sob pena de reportar três violações inexistentes.
- **`dependencies.md` deixa de dizer "nenhuma dependência de runtime nova desde a feature
  010".** A afirmação era verdadeira e passou a não ser.
- **A cifra de testes de `architecture.md#5` fica mais defasada**, dívida L-11 herdada da 018.
