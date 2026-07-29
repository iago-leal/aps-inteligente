# Gaps — aps-inteligente

> Regenerado pelo Reversa Reviewer na **re-extração 4 (2026-07-28)**. Lacunas e dívidas após a
> geração das specs das features 015–022.
> Política vigente: as premissas clínicas permanecem 🟡 por decisão do usuário; nenhuma bloqueia
> a reimplementação.

## Lacunas 🔴 — as duas únicas desta extração

| # | Lacuna | Unit | Consequência prática |
|---|--------|------|----------------------|
| L-01 | **Literal montado por interpolação em tempo de execução fica fora do inventário textual**, por desenho do extrator. Alcança as recusas de `elegibilidade.ts` e o aviso de `medidas.ts`. | `scripts/` | Quem revisar esses textos não tem guarda automática, e o congelamento não os cobre. Decidir entre estender o extrator ou assumir cobertura manual. |
| L-02 | **As duas verificações que provam o BR Code na ponta não rodam em CI**: decodificação independente e leitura por aplicativo bancário real. | `models-contribuicao` | Mudança na norma do BR Code não dispara alarme: o payload continuaria a ser gerado e a suíte, verde. |

## Premissas clínicas abertas (🟡, aguardam chancela do prescritor)

### Novas nesta passagem

| # | Premissa | Unit | O que destrava |
|---|----------|------|----------------|
| Q-P1 | Limite estendido da correção (730 / 1.095 dias) | `models-puericultura` | Em prematuro extremo entre 2 e 3 anos, decide qual idade indexa a curva |
| Q-P2 | O ano conta 365 dias corridos | `models-puericultura` | Um dia de diferença em nascidos em ano bissexto |
| Q-P3 | A idade cronológica governa a posição de medida | `models-puericultura` | Define sobre quais crianças incide a conversão de 0,7 cm |
| Q-P4 | Faixas de plausibilidade da digitação | `models-puericultura` | Barra digitação legítima em prematuro extremo de muito baixo peso |
| Q-P5 | Correção de cauda só em peso e IMC | `models-puericultura` | Guarda contra tabela futura sem `L = 1` nos outros índices |
| Q-P6 | Exibição com uma casa decimal | `interface-puericultura` | Precisão que a conferência contra o gráfico exige |
| Q-P7 | Faixa de 30 dias entre as fronteiras dos 5 anos | `models-puericultura` | Confirma que ler tabela de 0–5 com rótulo de 5–10 é o mal menor |
| Q-S1 | Ficha imediatamente anterior entre consultas | `models-puericultura-consulta` | Conduta com a criança de sete meses |
| Q-S2 | Atribuição editorial dos campos ao SOAP | `models-puericultura-consulta` | Onde cada item entra no registro |
| Q-S3 | Supressão de campo por sexo, com lista de um item | `models-puericultura-consulta` | `MD-0027` segue aberta a revisão |
| Q-X1 | Conferência do BR Code fora do CI | `models-contribuicao` | Ver L-02 |

### Herdadas

| # | Premissa | Unit |
|---|----------|------|
| Q-G1 a Q-G4 | Trimestres, limites de DUM e USG, 3.º trimestre sem margem | `models-gestacao` |
| Q-C1 a Q-C5 | Transcrição do Quadro 2, estrato "baixa", ajuste por fatores, ausência de ritual, blocos complementares | `models-cardiopatia-isquemica`, `interface-cardiologia` |
| Q-R1 a Q-R4 | Clamp, cortes de categoria, `raca="outra"`, transportabilidade das PCE | `models-risco-cardiovascular` |

## Pendência de insumo

| # | Lacuna | Origem | O que destrava |
|---|--------|--------|----------------|
| G-01 | Caminho do PDF do *Guia Rápido DM* | `questions.md` Q-I1 | Conferência página a página das 20 referências de `models/insulina/fonte-clinica.ts`. Pendente há quatro passagens. |

## Dívidas técnicas registradas (sem bloqueio)

| # | Dívida | Onde | Estado |
|---|--------|------|--------|
| D-01 | `scripts/textos/classes/interface.mts` em **684 linhas**, acima do teto de 400, e fora da exceção nominal que o README concede às tabelas geradas | `scripts/` | 🟡 aberta; a saída natural é parti-lo por camada de tela |
| D-02 | **Duas cópias da aritmética de datas** — `models/gestacao/datas.ts` e `models/puericultura/datas.ts`, gêmeos declarados | domínio | 🟡 aberta; a duplicação é consciente, mas cresce o custo de manter as duas em sincronia |
| D-03 | `ehEstouroDeTempo` reconhece o estouro por **frase do driver** | `infra/` | 🟡 aberta; atualização de `pg` é gatilho de revisão (watch W007) |
| D-04 | `react-qr-code@2.2.0` encerrou a afirmação de zero dependência de runtime nova desde a feature 010 | `interface-contribuicao` | 🟡 aceita; mitigada pelo envoltório |
| D-05 | `README.md` reprova `prettier --check`, e já reprovava antes desta passagem | raiz | 🟡 aberta; dívida de formatação alheia às features |
| D-06 | `preferencia-de-tema.ts` mora em `interface/calculadora/` e é consumido pela Moldura | interface | 🟡 aberta desde a feature 007; candidata a realocação |
| D-07 | A **ordem de importação das folhas de estilo** virou requisito e não tem guarda automática | `pages-next`, `interface-estilos` | 🟡 nova; reordenar passa em typecheck, lint e suíte, e só aparece em captura de tela |
| D-08 | As fontes clínicas ficam fora do git (`referencias/`) | `scripts/` | 🟡 aceita; mitigada por `sha256` no manifesto e pelos oráculos congelados |

## Dívidas encerradas nesta passagem

| # | Dívida | Como se encerrou |
|---|--------|------------------|
| L-07 | `domain.md` §7.2 citava `logoComoTitulo`, prop removida na feature 016 | Reescrita em `domain.md` §10.2 e em `interface-comum/` |
| L-11 | Cifra de testes defasada ("37 arquivos") desde a feature 018 | **816 testes em 67 arquivos**, aferidos duas vezes em 2026-07-28 |
| — | A rota `/api/v1/status` descrita como sem I/O | `pages-api-v1-status/` e `infra/` reescritas; ADR 0020 e invariante 8 |
| — | `globais.css` no teto de 400 | Encerrada na re-extração 3; permanece abaixo (367) |
