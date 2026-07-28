# Actions: Contribuição voluntária via PIX

> Identificador: `019-contribuicao-voluntaria-pix`
> Data: `2026-07-28`
> Roadmap: `_reversa_forward/019-contribuicao-voluntaria-pix/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 34 |
| Paralelizáveis (`[//]`) | 18 |
| Maior cadeia de dependência | 12 (T001 → T003 → T007 → T012 → T013 → T014 → T015 → T017 → T018 → T020 → T023 → T034) |

A ordem das fases reproduz o plano de migração de `roadmap.md` §8: o módulo puro nasce e se
prova antes de qualquer linha de React, e a dependência `react-qr-code` só entra no
`package.json` quando o payload já está provado (T014), para que a microdecisão registre a
versão pinada real e não uma previsão. Por isso a instalação da biblioteca aparece no núcleo, e
não na preparação: ela pertence ao passo 2 do plano, não ao passo 0.

## Fase 1, Preparação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Declarar `ParametrosPix` (todos os campos `readonly`), `SaidaBrCode` como união discriminada por `tipo` e `OfensorPix` com campo, motivo, limite e valor observado, conforme `data-delta.md` §2.1 e §2.2 | - | `[//]` | `models/contribuicao/tipos.ts` | 🟢 | `[X]` |
| T002 | Criar a constante `BENEFICIARIO` congelada por `Object.freeze`, tipada, com os três campos de RN-09 preenchidos por valores de exemplo **declarados como tais** em comentário, e com a nota do que muda ao editá-los (D-09, RF-10) | - | `[//]` | `interface/contribuicao/beneficiario.ts` | 🟢 | `[X]` |

## Fase 2, Testes

Os testes do domínio precedem o núcleo. Os de integração e os de ponta a ponta ficam na fase 4,
porque exercitam a cola entre tela, home e contrato externo.

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T003 | Acrescentar construtor de `ParametrosPix` válidos, com sobreposição por campo, no molde dos construtores já existentes dos domínios clínicos | T001 | - | `tests/apoio/construtores.ts` | 🟢 | `[X]` |
| T004 | Testar o CRC16-CCITT/FALSE contra o vetor conhecido (`123456789` produz `29B1`) e contra cadeia que já termina em `6304`, fixando polinômio `0x1021`, valor inicial `0xFFFF`, sem reflexão e sem `xor` final (RF-02, `interfaces/br-code.md` §3) | - | `[//]` | `tests/unit/dominio-contribuicao/crc16.test.ts` | 🟢 | `[X]` |
| T005 | Testar a montagem TLV: comprimento em dois dígitos decimais com zero à esquerda, contagem de caracteres do valor e composição de subtemplate dentro do próprio valor (RF-01, D-03) | - | `[//]` | `tests/unit/dominio-contribuicao/campo.test.ts` | 🟢 | `[X]` |
| T006 | Testar a validação com **coleta total** dos ofensores: chave vazia, nome acima de 25, cidade acima de 15, identificação acima de 25 e valor sugerido não positivo ou não finito, exigindo que os ofensores simultâneos voltem juntos e que nada seja truncado (RF-03, D-02, contrato §4) | T003 | `[//]` | `tests/unit/dominio-contribuicao/validacao.test.ts` | 🟢 | `[X]` |
| T007 | Testar a fachada contra oráculo congelado: payload sem valor começa por `000201`, contém `br.gov.bcb.pix`, `5303986` e `5802BR`, não contém `54`, termina por `6304` mais quatro dígitos que conferem; payload com valor sugerido traz `54` com `25.00` e CRC distinto; duas execuções produzem cadeias idênticas byte a byte (RF-01, RF-04, Gherkin 1 a 3) | T003 | `[//]` | `tests/unit/dominio-contribuicao/br-code.test.ts` | 🟢 | `[X]` |
| T008 | Escrever as propriedades com `fast-check`: qualquer payload emitido é aceito pela verificação do próprio CRC, a montagem é idempotente e nenhuma entrada válida produz cadeia com campo de comprimento divergente do valor (RF-02, RN-04) | T003 | `[//]` | `tests/unit/dominio-contribuicao/invariantes.test.ts` | 🟢 | `[X]` |

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T009 | Implementar o CRC16-CCITT/FALSE em arquivo próprio, recebendo a cadeia já acrescida de `6304` e devolvendo quatro dígitos hexadecimais maiúsculos (D-04, RF-02) | T004 | `[//]` | `models/contribuicao/crc16.ts` | 🟢 | `[X]` |
| T010 | Implementar `campo(id, valor)`, função única de montagem TLV que calcula o comprimento em dois dígitos, e a composição de subtemplate sobre ela (D-03) | T005 | `[//]` | `models/contribuicao/campo.ts` | 🟢 | `[X]` |
| T011 | Implementar a validação de `ParametrosPix` devolvendo erro como valor, com coleta total dos ofensores e mensagens que nomeiam limite e comprimento observado (RF-03, ADR 0004) | T001, T006 | - | `models/contribuicao/validacao.ts` | 🟢 | `[X]` |
| T012 | Escrever a fachada `montarBrCode`, com o cabeçalho declarando a isenção de `MD-0022` (sem fonte clínica única, sem `ReferenciaClinica`, fora do catálogo congelado), compondo os dez campos na ordem do contrato, com `54` condicional e `62/05` valendo `***` na ausência de identificação (RF-01, RF-04, RN-06) | T007, T009, T010, T011 | - | `models/contribuicao/br-code.ts` | 🟢 | `[X]` |
| T013 | Rodar a suíte de unidade do domínio e conferir que `models/contribuicao/**` atinge o limiar de 90% que o `vitest.config.ts` aplica a `models/**`, corrigindo lacuna de cobertura antes de seguir | T008, T012 | - | `tests/unit/dominio-contribuicao/` | 🟢 | `[X]` |
| T014 | Acrescentar `react-qr-code` em versão pinada exata, commitar o lockfile e confirmar por `typecheck` e build que `prop-types` sob React 19 não quebra a compilação (RNF de manutenibilidade, risco 3 do roadmap) | T013 | - | `package.json` | 🟢 | `[X]` |
| T015 | Escrever o envoltório de um arquivo sobre `react-qr-code`, recebendo o payload já montado por `value` e expondo alternativa textual acessível, de modo que nenhum outro arquivo importe a biblioteca (D-05, RF-06) | T014 | `[//]` | `interface/contribuicao/codigo-qr.tsx` | 🟢 | `[X]` |
| T016 | Escrever o componente de cópia parametrizado por rótulo, texto a copiar e recado de confirmação, com a função de cópia entrando por prop de valor padrão vinda de `interface/calculadora/area-de-transferencia.ts` e as duas variantes de `Flash` com `role="status"` e `role="alert"` (D-07, D-08, RF-07, RF-12) | - | `[//]` | `interface/contribuicao/acao-copiar.tsx` | 🟢 | `[X]` |
| T017 | Montar o painel sobre o `Dialog` de `@primer/react`, com o QR, a chave em texto, os dois comandos de cópia (chave e código copia e cola, este sobre a mesma cadeia que gera o QR), a prosa de contribuição voluntária de RF-08 e o fechamento por `Esc`, clique fora e comando explícito com devolução de foco (D-06, RF-05, RF-06, RF-09, RF-15, RN-10) | T002, T012, T015, T016 | - | `interface/contribuicao/painel.tsx` | 🟢 | `[X]` |
| T018 | Escrever o bloco de apoio que reúne o texto introdutório, o comando visível que abre o painel e o estado de abertura, com a ordem de DOM pondo os dois comandos de cópia antes do QR (D-11, RF-05, RF-16) | T017 | - | `interface/contribuicao/bloco-de-apoio.tsx` | 🟡 | `[X]` |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T019 | Criar a sétima folha de estilo sobre tokens do Primer, sem direção estética própria, resolvendo por CSS a disposição em telas largas sem duplicar marcação nem alterar a ordem do DOM, e importá-la em `pages/_app.tsx` ao lado das outras seis (D-10, D-11, RF-16) | T018 | - | `interface/estilos/contribuicao.css` | 🟡 | `[X]` |
| T020 | Montar o bloco de apoio ao pé da home, **fora** do `map` do `CATALOGO` e depois do `<div className="inicio-secoes">`, deixando o catálogo intocado (D-12, RF-11) | T018 | - | `interface/inicio/tela.tsx` | 🟢 | `[X]` |
| T021 | Declarar a classe dos literais do painel: prosa autoral para o texto de contribuição e os rótulos, identificador para a chave, o nome, a cidade e a marca `PIX` (D-13, RN-07, RF-14) | T018 | `[//]` | `scripts/textos/classes/interface.mts` | 🟢 | `[X]` |
| T022 | Declarar a classe dos literais das mensagens de validação do módulo puro (D-13, RN-07, RF-14) | T011 | `[//]` | `scripts/textos/classes/models-demais.mts` | 🟢 | `[X]` |
| T023 | Rodar `node scripts/inventariar-textos.mts --gerar` até concluir sem candidato órfão e conferir que a segunda execução deixa `git diff` vazio (RF-14) | T020, T021, T022 | - | `tests/apoio/inventario-textual.json` | 🟢 | `[X]` |
| T024 | Escrever os testes de integração do painel: abertura pelo comando, presença do desenho do QR, cópia da chave com confirmação visível, cópia do código copia e cola comparada byte a byte com o payload de T012, os três enunciados de RF-08, os três caminhos de fechamento com devolução de foco e o recado nomeado quando a área de transferência recusa (RF-05 a RF-09, RF-15) | T018 | `[//]` | `tests/integration/interface/contribuicao.test.tsx` | 🟢 | `[X]` |
| T025 | Acrescentar ao teste de integração da home a afirmação de que o comando de apoio aparece e de que o `CATALOGO` continua com as mesmas entradas (RF-11, D-12) | T020 | `[//]` | `tests/integration/interface/inicio.test.tsx` | 🟢 | `[X]` |
| T026 | Escrever o roteiro de ponta a ponta: viewport de telefone com os dois comandos visíveis sem rolagem adicional e antes do QR, zero requisição de rede na abertura, ciclo por teclado com `Esc`, ausência de chave nova em `localStorage` e `sessionStorage`, percurso negativo pelas cinco rotas de calculadora e passagem `axe` sem violação nova | T019, T020 | - | `e2e/contribuicao.spec.ts` | 🟡 | `[X]` |
| T027 | Decodificar o payload de exemplo em decodificador independente do nosso código, conferir campo a campo o beneficiário, a cidade, a chave e o CRC, e registrar o resultado por escrito (critério de pronto, contrato §6) | T012 | - | `_reversa_forward/019-contribuicao-voluntaria-pix/oraculo-externo.md` | 🟢 | `[X]` |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T028 | Substituir os valores de exemplo pelos três valores reais do beneficiário, conferidos pelo mantenedor: chave aleatória, nome civil dentro de 25 caracteres e cidade dentro de 15 (lacuna `D-02` de `requirements.md` §10) | T002 | - | `interface/contribuicao/beneficiario.ts` | 🟢 | `[X]` |
| T029 | Escrever a guarda que reprova a suíte enquanto a constante contiver o valor de exemplo, no molde de `tests/unit/interface/cabecalho-sem-altura-fixa.test.ts` (risco 2 do roadmap) | T002 | `[//]` | `tests/unit/interface/beneficiario-sem-exemplo.test.ts` | 🟢 | `[X]` |
| T030 | Escrever a microdecisão da dependência `react-qr-code`, com versão pinada real, o que a árvore traz junto (`prop-types` e `qrcode-generator`), a leitura do filtro de longevidade e a alternativa descartada de desenhar o SVG por conta própria | T014 | `[//]` | `.harness/decisoes/` | 🟢 | `[X]` |
| T031 | Documentar no `README.md` o ponto único de configuração do beneficiário e o que muda ao trocar a chave, no molde das seções que já documentam os geradores de tempo de desenvolvimento (RF-13) | T002 | `[//]` | `README.md` | 🟢 | `[X]` |
| T032 | Medir e registrar o acréscimo de bundle por rota, no molde da feature 018, separando o custo do desenho do QR do custo da home (RNF de desempenho) | T019, T020 | - | `_reversa_forward/019-contribuicao-voluntaria-pix/medicao-bundle.md` | 🟢 | `[X]` |
| T033 | Registrar a leitura do QR por aplicativo de banco real, confirmando que a tela de confirmação exibe o beneficiário correto, sem concluir a transferência (critério de pronto; confirmação do mantenedor, não automatizável) | T028 | - | `_reversa_forward/019-contribuicao-voluntaria-pix/oraculo-externo.md` | 🟢 | `[X]` |
| T034 | Conferir por `git status`, e não por presunção, que `tests/apoio/citacao-linha-de-base.json` e `e2e/axe-baseline.json` permanecem sem modificação, e rodar vitest, Playwright, `typecheck` e `eslint` até o verde | T023, T026 | - | `tests/apoio/citacao-linha-de-base.json` | 🟢 | `[X]` |

## Notas de execução

- **T028 fechou na mesma sessão**, quando os três valores chegaram: chave aleatória, `Iago Leal`
  e `Goiânia`. A guarda de T029 saiu de `it.todo` e passou a valer, e a confidência da ação subiu
  de 🔴 para 🟢, porque a lacuna `D-02` deixou de existir.
- **T033 fechou em 28/07/2026**, em sessão posterior à execução: o mantenedor leu o QR e usou
  também o código copia e cola, e ambos funcionaram. O consumidor real do contrato, que é o
  aplicativo de banco, aceitou o payload que a suíte só sabia aferir contra a nossa leitura da
  especificação.
- **T003 mudou de arquivo alvo**, de `tests/apoio/construtores.ts` para
  `tests/apoio/contribuicao.ts`: aquele é declaradamente de insulina, e arquivo próprio por
  domínio é o precedente de `tests/apoio/puericultura.ts`.
- **T022 mudou a forma das mensagens de validação.** Frases montadas por template interpolado
  seriam invisíveis ao extrator do inventário (`MD-0021`), de modo que a feature criaria três
  violações novas da norma ao declarar respeitá-la. Viraram literais completos, com limite e
  observado no dado estruturado do ofensor.
- **T024 acrescentou polyfill de `ResizeObserver`** a `tests/apoio/setup-jsdom.ts`: o `Dialog`
  do Primer o exige por `useOverflow`, e o jsdom não o implementa.
- **T026 corrigiu a hierarquia de títulos do painel** de `h3` para `h2`, apontada pelo `axe`: o
  `Dialog` publica o próprio título como `h1`. A guarda de rede afere requisição externa e busca
  de dado, e não carregamento de chunk da própria origem, que é o Next funcionando.
- **T032 mudou o código, e não apenas mediu.** O import estático do painel punha o `Dialog` e a
  biblioteca do QR no primeiro carregamento da home, quase 15 kB gzip por visita. Com
  `next/dynamic`, +2,5 kB.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-28 | Versão inicial gerada por `/reversa-to-do` | reversa |
