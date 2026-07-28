# Legacy Impact — 020-consulta-puericultura-soap

> Data: `2026-07-28`
> Feature: ficha de consulta de puericultura, da caderneta ao SOAP
> Âncora: **legado** (`_reversa_sdd/architecture.md` e `domain.md`)
> Severidade alinhada a `/reversa-audit`: CRITICAL, HIGH, MEDIUM, LOW

## 1. O que esta feature fez ao sistema, em uma frase

Acrescentou um **segundo motor** à unit `models/puericultura`, sob a mesma fonte editorial e
em outra seção dela, e a tela que o consome. Nenhum dos cinco domínios existentes mudou de
comportamento; nenhum container nasceu; nada passou a ser persistido. O que se moveu no
legado foram três guardas transversais — o catálogo da home, a cadeia do inventário textual e
o setup de jsdom —, todos por acréscimo.

## 2. Arquivos afetados

| Arquivo afetado | Componente (`_reversa_sdd/`) | Tipo | Severidade | Justificativa |
|---|---|---|---|---|
| `models/puericultura/consulta/**` (9 arquivos) | `architecture.md#1`, `c4-components.md` | componente-novo | LOW | Submódulo novo dentro de unit existente. Segunda fachada da unit, primeira da plataforma a ter duas. Nada do motor da 017 foi tocado |
| `models/puericultura/consulta/fichas/**` (12 arquivos) | `code-analysis.md` (acervo declarado) | componente-novo | LOW | Acervo estático de dado citado: 278 campos das dez consultas datadas, com página por campo |
| `interface/puericultura/consulta/**` (8 arquivos) | `code-analysis.md#Módulo 10` | componente-novo | LOW | Subpasta nova; a tela da 017 (`interface/puericultura/*.tsx`) permanece byte a byte |
| `pages/puericultura/consulta.tsx` | `code-analysis.md#Módulo 12` | componente-novo | LOW | Nona rota; as oito existentes inalteradas |
| `interface/estilos/consulta-puericultura.css` | `code-analysis.md#Módulo 11` | componente-novo | LOW | Sétima folha, 108 linhas. `puericultura.css` e `globais.css` intocadas |
| `scripts/congelar-fichas-caderneta.mts` | camada dev-time (adendo 017) | componente-novo | LOW | Quarto gerador idempotente do projeto; não entra no bundle |
| `scripts/textos/classes/models-puericultura-consulta.mts` | cadeia da 018 | componente-novo | **MEDIUM** | Primeiro módulo de classes que **deriva** declarações do catálogo em vez de escrevê-las literal a literal. Ver §4 |
| `interface/inicio/catalogo.ts` | `code-analysis.md#Módulo 10` | regra-alterada | LOW | Diff **aditivo**: segunda ficha na seção Puericultura, cinco entradas anteriores byte a byte (asserido em `inicio.test.tsx`) |
| `scripts/textos/classificacao.mts` | cadeia da 018 | regra-alterada | LOW | Sexto módulo em `MODULOS`, com predicado do submódulo **antes** do da unit |
| `scripts/textos/classes/interface.mts` | cadeia da 018 | regra-alterada | LOW | +95 declarações da camada de apresentação nova. Ver a dívida em §5 |
| `scripts/textos/classes/pages-e-arquivos.mts` | cadeia da 018 | regra-alterada | LOW | +1 entrada, a rota nova |
| `tests/unit/textos/citacao.test.ts` | guarda de RF-07 da 018 | **regra-alterada** | **HIGH** | O verificador da classe citação ganhou isenção nominal. Ver §4, e é o item que mais merece leitura de terceiro |
| `tests/apoio/setup-jsdom.ts` | infraestrutura de teste | regra-alterada | LOW | Polyfill de `window.matchMedia`, exigido pelo `ActionMenu` do Primer. Aditivo e guardado por `typeof` |
| `tests/integration/interface/inicio.test.tsx` | guarda do catálogo | regra-alterada | LOW | Uma linha na lista esperada de rotas. O oráculo continua exaustivo e ordenado |
| `pages/_app.tsx` | `code-analysis.md#Módulo 12` | regra-alterada | LOW | Um `import` de folha de estilo |
| `README.md` | documentação | regra-alterada | LOW | Linha na tabela de calculadoras e seção sobre o acervo das fichas |
| `tests/apoio/fichas-caderneta-congeladas.json` | acervo dev-time | componente-novo | LOW | 175 kB de texto congelado do PDF; oráculo de transcrição, fora do bundle |
| `tests/apoio/inventario-textual.json` | dado gerado da 018 | delta-de-dados | LOW | 703 → 1 161 literais. Regerado, idempotente, `git diff` estável na segunda execução |
| `e2e/consulta-puericultura.spec.ts`, `tests/**/consulta-*.{ts,tsx}` | suíte | componente-novo | LOW | 7 roteiros e2e e 6 arquivos de teste novos |

## 3. Diff conceitual, por componente

**A unit de puericultura passa a ter dois motores.** Até aqui, cada unit da família tinha uma
fachada. `models/puericultura` agora tem duas — `CalculadoraCrescimentoInfantil.avaliar`, da
017, e `RegistroDeConsultaPuericultura.montar`, desta feature —, e a razão é que a fonte
editorial é a mesma caderneta em seção diferente. ADR 0011 permanece intacto: uma fonte por
unit, e não uma fachada por unit. A alternativa examinada, uma sexta unit, exigiria ou
importar de outra unit, sem precedente na família, ou uma **terceira** cópia da aritmética de
datas, que é a dívida D-07 da 017 já gêmea da de `models/gestacao`.

**O produto da plataforma deixa de ser sempre um número.** As cinco calculadoras anteriores
emitem escore, dose, probabilidade ou data. Esta emite um **texto de registro**, que atravessa
para fora da plataforma por colagem no prontuário. É a primeira saída com contrato de forma
escrito (`interfaces/registro-soap.md`), e a primeira em que a estabilidade do formato é
promessa a quem o consome todo dia.

**A camada dev-time ganha um quarto gerador.** `congelar-fichas-caderneta.mts` entra na cadeia
já compreendida de `gerar-tabelas-oms.mts`, `congelar-casos-oraculo.mts` e
`inventariar-textos.mts`: fonte fora do git, artefato versionado, `git diff` vazio como sinal
de que a origem não mudou. A diferença é o que ele congela — texto de página impressa, e não
dado numérico.

**A tela da 017 é consumida, não alterada.** O painel de crescimento chama
`CalculadoraCrescimentoInfantil.avaliar` com a entrada montada da ficha e reaproveita o
`PainelCrescimento` como está. Os dois dados que a caderneta não imprime — o peso em gramas e
a posição da medição — entram declarados na camada de apresentação, e não como emenda no
contrato do motor. RF-18 se cumpre por construção: nenhum arquivo de `models/puericultura/`
fora do submódulo novo foi tocado.

## 4. Os dois pontos que pedem leitura de terceiro

**O verificador da classe citação (HIGH).** `tests/unit/textos/citacao.test.ts` comparava o
conjunto corrente de citações contra `citacao-linha-de-base.json` e exigia que os únicos
deltas fossem os dois afastamentos de `MD-0015`. Como está escrito, ele reprova **qualquer**
citação nova — e esta é a primeira feature depois da 018 a acrescentar citação clínica. O
guarda confundia duas coisas distintas: citação existente reescrita, que é violação, e matéria
nova, que não é afastamento nenhum.

A alteração introduz `SUBARVORES_COM_ORACULO_PROPRIO`, hoje com uma entrada:
`models/puericultura/consulta/`, isenta porque tem oráculo mais forte que a linha de base — o
de D-12, que confere contra a **página impressa** e não contra um congelado nosso. A isenção é
**nominal** de propósito: não vale "arquivo novo é isento", que tornaria o verificador
opcional na próxima feature. Quem acrescentar citação nova para de novo e tem de dizer contra
o que ela se confere. O arquivo `citacao-linha-de-base.json` **não foi tocado** (RF-15).

Ainda assim, é alteração num guarda de outra feature, e o julgamento de que ela não afrouxa o
que importa é meu, não do usuário. Merece microdecisão própria antes da re-extração.

**A declaração derivada de classe textual (MEDIUM).** D-04 da feature 018 manda declarar a
classe literal a literal, e este módulo deriva 382 declarações do próprio catálogo. A tensão
está registrada no roadmap §2 desta feature, e a saída não é inferência por diretório — que é
o que aquela decisão proíbe —, e sim a página impressa que cada campo já declara por outra
razão. Declarar trezentas e cinquenta entradas à mão satisfaria a letra e derrotaria o
propósito, porque um mapa desse tamanho passa a ser mantido no automático.

## 5. Sinais de dívida sob o volume desta feature (T046)

| Sinal | Estado |
|---|---|
| Arquivo de aplicação acima de 400 linhas | **Nenhum.** O maior é `models/puericultura/consulta/registro.ts`, com 261 |
| Função acima de 50 linhas | **Nenhuma**, conferido por árvore sintática sobre os arquivos novos |
| Cobertura de `models/**` | 97,3% de linhas no total; 96,6% no submódulo novo, com 100% de funções |
| Lista de exceções do oráculo de transcrição | **4 de 10**, cada uma com o motivo escrito e conferida à mão contra a página |
| `citacao-linha-de-base.json` e `e2e/axe-baseline.json` | **Intocados** (`git status` limpo quanto aos dois) |
| Suíte | 808 unidades/integração e 54 e2e, todas verdes, sem alteração de asserção anterior |

**Uma dívida amarela nova, e ela é herdada agravada.**
`scripts/textos/classes/interface.mts` foi de 589 para **684 linhas**, e já estava acima do
teto de 400 antes desta feature. É mapa de declarações, não lógica — a mesma natureza da
exceção que o README concede a `models/puericultura/oms/tabelas/` —, mas a exceção **não está
declarada** para este arquivo. A saída natural é parti-lo por camada de tela, no dia em que
alguém o abrir para outra coisa.

**Uma observação de cobertura.** O submódulo novo tem 82,8% de cobertura de ramos, contra
95,2% do conjunto. O limiar contratual de `vitest.config.ts` é global e continua satisfeito; o
número local vem dos ramos de apresentação de campo por natureza, que os testes exercitam por
caminho feliz.

## 6. Regras 🟢 preservadas

Todas as invariantes da família de domínios (`_reversa_sdd/architecture.md#1`) continuam
válidas, e esta feature exercita cada uma delas:

- **Domínio puro** (ADR 0003): `models/puericultura/consulta/**` não importa `interface/`, e é
  por isso que os rótulos neutros dos índices foram declarados no domínio em vez de reusados
  da tela da 017.
- **Uma fonte clínica por unit** (ADR 0011, `MD-0001`): a mesma caderneta, outra seção.
- **Erro como valor** (ADR 0004): a área de transferência devolve recusa; `ErroDeInvariante`
  só para bug interno.
- **`ReferenciaClinica` em toda saída**: o registro nunca sai sem referência, verificado por
  propriedade.
- **O motor informa e não escolhe** (ADR 0005): a ficha é sugestão, a troca é do prescritor, e
  a seção de avaliação só recebe campo que a ficha imprime como juízo (RN-09b).
- **Escopo igual ao da fonte** (`domain.md#8`): as três fichas de fora vão declaradas.
- **Privacidade por construção** (ADR 0002): zero rede, zero storage novo, nenhum campo
  identifica a criança. Verificado em e2e.
- **Ritual de revisão só na prescrição de dose** (ADR 0012): esta tela não tem, e há teste
  negativo que o afirma.

## 7. Regras 🟢 modificadas

**Uma, e é a de §4.** A regra "toda citação corrente pertence à linha de base de 27/07, salvo
os dois afastamentos de `MD-0015`" passa a ler "…salvo os dois afastamentos e as subárvores
com oráculo próprio nominalmente declaradas". Nenhuma outra regra 🟢 do `domain.md` ou dos ADRs
foi alterada ou removida.

## 8. Histórico

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-28 | Versão inicial, ao fim das 46 ações de `/reversa-coding` | reversa |
