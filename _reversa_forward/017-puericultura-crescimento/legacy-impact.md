# Legacy impact: Puericultura — escores z de crescimento infantil

> Identificador: `017-puericultura-crescimento`
> Data: `2026-07-27` (terceira rodada do dia; anteriores em `2026-07-26` e nas duas primeiras de `2026-07-27`)
> Âncora: **legado** (`_reversa_sdd/architecture.md` + `domain.md`, re-extração nº 3)
> Estado da execução: **parcial** — 39 das 52 ações. Completas a Preparação (T001–T006), a
> Fase 2 de Testes (T007–T019) e a Fase 3 do Núcleo (T020–T039). Pendentes as 13 da
> Integração e do Polimento (T040–T052): toda a interface, a rota, a medição de bundle e a
> documentação.

## 1. Arquivos afetados

| Arquivo afetado | Componente (`architecture.md`) | Tipo | Severidade | Justificativa |
|---|---|---|---|---|
| `interface/inicio/catalogo.ts` | Módulo 10 — `interface/inicio` | regra-alterada (extensão) | LOW | Quarta seção, `puericultura`, com uma ficha. Diff puramente aditivo: 12 linhas, nenhuma removida. As três seções existentes seguem byte a byte |
| `interface/inicio/icones.tsx` | Módulo 10 — `interface/inicio` | regra-alterada (extensão) | LOW | Entrada `puericultura → SmileyIcon`. O mapa mantém o fallback `null` e os três pares anteriores |
| `models/gestacao/datas.ts` | Módulo 2 — `models/gestacao` | arquivo-tocado (comentário) | LOW | **Único arquivo de motor existente aberto na feature** (T022, D-07; ressalva A004). Recebe a declaração do gêmeo em comentário; nenhuma linha executável muda, e os 40 testes da unit seguem verdes sem alteração |
| `tsconfig.json` | — (configuração de raiz) | delta-de-configuração | LOW | `allowImportingTsExtensions`, exigido pelos scripts `.mts` que o Node executa em ESM. Só vale sob `noEmit`; o pipeline do Next não lê esta opção |
| `scripts/baixar-tabelas-oms.mts` | — | componente-novo (dev-time) | LOW | Aquisição das 14 planilhas da OMS. Fora do bundle e fora do runtime |
| `scripts/oms/origens.mts` | — | componente-novo (dev-time) | MEDIUM | Catálogo das origens com aba esperada e recorte por arquivo. É onde mora a barreira contra o arquivo mal nomeado da OMS: erro aqui é erro clínico silencioso |
| `scripts/lib/planilha.mts` | — | componente-novo (dev-time) | MEDIUM | Leitor de `.xlsx` (ZIP + XML) com built-ins. Não entra em produção, mas todo número clínico da feature passa por ele |
| `scripts/oms/criterios.mts` | — | componente-novo (dev-time) | **HIGH** | Declara o que se exige do dado: colunas, precisão, ordens de grandeza, degraus tolerados e os valores-âncora. Um limite frouxo aqui deixa passar a curva errada sob o rótulo certo |
| `scripts/oms/extracao.mts` | — | componente-novo (dev-time) | **HIGH** | Converte célula em número, recorta ao escopo da fonte (D-04) e canoniza na precisão publicada. Toda linha `L/M/S` embarcada passa por aqui |
| `scripts/oms/verificacoes.mts` | — | componente-novo (dev-time) | **HIGH** | V1, V2 e V4 a V7. É o único ponto do sistema que pode barrar dado clínico corrompido antes de ele virar escore |
| `scripts/oms/falha.mts` | — | componente-novo (dev-time) | LOW | Modo de falha único, com arquivo e verificação na mensagem (contrato §7) |
| `scripts/oms/emitir-modulo.mts` | — | componente-novo (dev-time) | MEDIUM | Produz o texto dos módulos, com procedência determinística e round-trip conferido por número |
| `scripts/gerar-tabelas-oms.mts` | — | componente-novo (dev-time) | MEDIUM | Orquestração em duas fases; confere `sha256` contra o manifesto e não escreve nada antes de as 14 passarem |
| `scripts/oraculo/oms.mts` | — | componente-novo (dev-time) | **HIGH** | Seleciona a amostra, lê as colunas de desvio e confere cada par contra a LMS antes de congelar. Um oráculo errado é pior que oráculo nenhum: carimba de correta a implementação errada |
| `scripts/oraculo/intergrowth.mts` | — | componente-novo (dev-time) | MEDIUM | Extrai as 1596 células dos seis PDFs, com o título conferido no conteúdo e a janela 27–64 exigida linha a linha |
| `scripts/congelar-casos-oraculo.mts` | — | componente-novo (dev-time) | MEDIUM | Orquestração do congelamento: confere `sha256`, monta em memória e só então escreve. Idempotente |
| `models/puericultura/oms/tabelas/*.ts` (14 módulos) | Domínio 5 (`data-delta.md` §3) | delta-de-dados | **HIGH** | 12.964 linhas `L/M/S`, 344 kB. É o dado que decide todo escore z da faixa da OMS. Gerado, nunca editado à mão |
| `models/puericultura/oms/tabelas/manifesto.json` | — | delta-de-dados | MEDIUM | Procedência versionada das 14 origens (URL, data, `sha256`) |
| `models/puericultura/tipos.ts` | Domínio 5 (`architecture.md` §1, família de domínios) | componente-novo | **HIGH** | Contrato do quinto domínio. É onde RF-06 deixa de ser promessa e vira impossibilidade de representação |
| `models/puericultura/oms/leitura.ts` | Domínio 5 — subdiretório `oms/` (D-01) | componente-novo | **HIGH** | Traduz idade em linha da tabela. Errar a fronteira por um dia produz escore de outra criança, com a mesma aparência de correção |
| `models/puericultura/oms/lms.ts` | Domínio 5 — subdiretório `oms/` | componente-novo | **HIGH** | O cálculo do escore e a correção de cauda. É a função que converte medida em número clínico: erro de sinal ou de denominador aqui produz laudo invertido na desnutrição e na obesidade graves |
| `models/puericultura/fonte-clinica.ts` | Domínio 5 | componente-novo | **HIGH** | Rótulos literais dos quatro índices, os dois conjuntos do IMC, páginas por índice, fronteiras em dias e a nota de proveniência. Transcrição da fonte editorial: divergência aqui é divergência entre a tela e o documento impresso que o médico tem na mão |
| `models/puericultura/classificacao.ts` | Domínio 5 | componente-novo | **HIGH** | Converte escore em laudo nutricional. Concentra as duas trocas de conjunto por idade, e é onde a armadilha dos cinco anos se resolve ou se perde |
| `models/puericultura/idades.ts` | Domínio 5 | componente-novo | **HIGH** | As três idades e os limites da correção. Um dia de erro no limite muda a curva inteira de um prematuro |
| `models/puericultura/elegibilidade.ts` | Domínio 5 | componente-novo | MEDIUM | As duas espécies de recusa, global e parcial. Aplicação de MD-0009 (`domain.md` §8) |
| `models/puericultura/padrao.ts` | Domínio 5 | componente-novo | **HIGH** | Único ponto de fronteira entre as duas réguas (D-01). Escolher a régua errada devolve escore plausível da criança errada |
| `models/puericultura/medidas.ts` | Domínio 5 | componente-novo | MEDIUM | Conversão de posição de ±0,7 cm e IMC sobre a medida convertida |
| `models/puericultura/validacao.ts` | Domínio 5 | componente-novo | MEDIUM | Coleta total de ofensores; as faixas de plausibilidade travam, ao contrário do molde da 014 |
| `models/puericultura/datas.ts` | Domínio 5 (gêmeo de `models/gestacao/datas.ts`) | componente-novo | LOW | Aritmética em dias epoch UTC, com a dívida de convergência declarada nos dois arquivos (D-07) |
| `models/puericultura/intergrowth/equacoes.ts` | Domínio 5 — subdiretório `intergrowth/` (D-01) | componente-novo | **HIGH** | Seis expressões fechadas de μ e σ. Substituem tabela por fórmula, e um coeficiente trocado não tem como ser notado a olho |
| `models/puericultura/intergrowth/escore.ts` | Domínio 5 — subdiretório `intergrowth/` | componente-novo | MEDIUM | Escore em escala log ou natural conforme a curva, e o IMC como ausência com motivo |
| `models/puericultura/calculadora.ts` | Domínio 5 — fachada (`architecture.md` §1) | componente-novo | **HIGH** | A porta única da unit. É onde as decisões de dez módulos têm de chegar coerentes, e onde a distinção entre as duas idades se materializa |
| `tests/apoio/puericultura.ts` | — (apoio de teste) | componente-novo | LOW | Tabelas sintéticas, construtores e `dataApos`. Nada em produção depende dele |
| `tests/apoio/casos-oraculo-puericultura.json` | — (apoio de teste) | componente-novo | **HIGH** | 356 casos da OMS e 1596 células do INTERGROWTH-21st, 224 kB. Única cópia versionada dos dois oráculos exatos da feature. Gerado, nunca editado à mão |
| `tests/unit/dominio-puericultura/*.test.ts` (12 arquivos) | — (suíte de unidade) | componente-novo | MEDIUM | 201 casos que prendem fronteiras, oráculos, rótulos literais e os invariantes da família. É o que impede regeneração ou refatoração futura de mudar número em silêncio |
| `_reversa_forward/.../interfaces/tabelas-de-referencia.md` | — (spec da feature) | regra-alterada (reconciliação) | MEDIUM | Quatro pontos do contrato reconciliados contra o dado real (§3, §4.2, §5 V2/V5 e as novas §5.2 e §5.3) |
| `_reversa_forward/.../requirements.md`, `roadmap.md` | — (spec da feature) | regra-alterada (reconciliação) | MEDIUM | Critério de aceite de RF-03 corrigido e D-10 promovido a confirmação na fonte primária, com o novo D-10.1 |
| `referencias/caderneta/`, `referencias/oms/`, `referencias/intergrowth/` | — | delta-de-dados (fora do git) | LOW | Fontes clínicas em pasta ignorada (MD-0008). Não versionadas por decisão |
| `.harness/decisoes/MD-0002.md`, `MD-0004.md`, `MD-0006.md`, `MD-0007.md`, `MD-0008.md`, `MD-0010.md` | — | registro de decisão | — | Fichas das rodadas anteriores; nenhuma reaberta nesta |

## 2. Diff conceitual por componente

**`interface/inicio` (Módulo 10).** Inalterado desde a primeira rodada. O catálogo continua sendo
a fonte única tipada das seções, e a plataforma passa de três para quatro. A regra de anti-drift
do README foi respeitada à risca: a entrada existe antes de a rota existir, de modo que a home
hoje aponta para uma rota ainda não implementada. É estado intermediário esperado, e desaparece
em T045.

**Cadeia do dado (dev-time), completa desde a segunda rodada.** Aquisição → leitura →
verificação → emissão, com duas decisões estruturais: só o baixador toca a rede, e o gerador é
função determinística de arquivos em disco. A ela somou-se a cadeia gêmea do oráculo, de
propósito oposto — uma produz o dado que o motor usa, a outra o dado contra o qual ele é medido.
A fórmula LMS aparece **duas vezes**, uma de cada lado, e é essa duplicação aparente que dá valor
à conferência.

**O quinto domínio ficou inteiro (novidade desta rodada).** Onde antes havia contrato e leitura,
há agora motor: onze módulos que vão da data à classificação. Quatro escolhas descrevem o que
mudou conceitualmente.

*Primeira, o tipo carrega a regra.* `IndiceAntropometrico` é união de três variantes, e é ela que
realiza RF-06 — a independência dos índices deixa de depender de disciplina de quem escreve o
cálculo e passa a ser propriedade do que se pode representar. Um índice ausente não tem campo
`escoreZ` para preencher com zero; um índice fora do escopo não tem escore para inventar. A
fachada, ao montar o resultado, não precisa lembrar-se da regra: o tipo não a deixa esquecer.

*Segunda, cada fronteira tem um dono só, e o cabeçalho de cada uma declara onde estão as outras.*
São quatro, e nenhuma coincide: a de TABELA aos 1856 dias (`oms/leitura.ts`), a de RÓTULO do IMC
aos 1826 (`classificacao.ts`), a dos DOIS ANOS aos 730 — que governa posição de medida, escopo do
perímetro cefálico e agora também o substantivo do comprimento — e a das duas RÉGUAS em 27 e 64
semanas pós-menstruais (`padrao.ts`). Espalhar qualquer uma delas por `if` tornaria inauditável a
decisão de maior consequência clínica do motor.

*Terceira, duas idades governam coisas diferentes, e a distinção é explícita.* A idade CRONOLÓGICA
governa como a criança foi medida — a posição esperada é propriedade do corpo, não da curva —, ao
passo que a idade que INDEXA a curva, corrigida enquanto a correção vale, governa leitura, escopo
e faixa de rótulo. É a premissa do roadmap §4 levada a código, e o único ponto do motor em que as
duas divergem de propósito: um prematuro de dois anos de vida mede-se em pé, ainda que a sua
curva seja lida na idade corrigida.

*Quarta, a política clínica não se repete.* A leitura informa que a OMS não publica linha para uma
combinação (`MotivoSemTabela`), mas não decide o que fazer com isso; o escore de pré-termo calcula
sem saber se a janela ainda vale; a fachada é que compõe. Duas verdades sobre a mesma regra é o
começo de toda divergência silenciosa, e o preço de evitá-la foi aceitar que a fachada saiba um
pouco de tudo — que é o papel dela.

**A fonte editorial virou dado congelado, e discorda da spec em três pontos de redação.** A
transcrição dos dois PDFs revelou que os rótulos são idênticos nos dois materiais, incluindo a
concordância destoante do comprimento ("Comprimento adequada", "Baixa comprimento", "Muito baixo
comprimento") que a lacuna 🟡 supunha ser peculiaridade da menina. Revelou também que a fonte
escreve "Peso elevado para idade", sem o artigo que RN-04 acrescentara, e usa a sigla no perímetro
cefálico, onde RN-07 escrevia o nome por extenso. Preservou-se o impresso: o médico compara a tela
com a caderneta que tem na mão, e "corrigir" o português criaria divergência onde a fonte não tem
nenhuma.

**Um achado de conteúdo que o plano não previa: a segunda troca de rótulo.** O plano antecipava a
troca de nomenclatura do IMC aos cinco anos, que é a armadilha central da fonte. A transcrição
mostrou uma segunda, na outra fronteira: a caderneta imprime "Comprimento" nos gráficos de 0 a 2
anos e "Estatura" a partir de 2, na mesma fronteira de D-16 em que troca a posição de medida.
Entrou em `classificacao.ts` com teste no par 730/731, e o efeito é que uma criança de dois anos e
um dia recebe outro substantivo — o que a fonte manda, e o que o plano teria deixado passar.

**Um empate de arredondamento, nomeado em vez de acomodado.** Das 1596 células do INTERGROWTH-21st,
uma excede a tolerância de 0,005 por 2,6·10⁻⁵: peso masculino, semana 55, `z = −3`, em que a tabela
publica 4,40 kg e a equação devolve 4,40503. O valor verdadeiro cai sobre o 4,405, e a publicação
arredondou para baixo enquanto o cálculo sobe. O teste **nomeia a célula** em vez de afrouxar o
limite, porque uma tolerância maior acomodaria também um coeficiente errado — e é o coeficiente
que a conferência existe para vigiar. A conclusão de T004 ("pior desvio 0,005") fica confirmada
por outro caminho.

**Configuração.** `tsconfig.json` segue como o único arquivo de configuração tocado.

## 3. Preservadas

Regras 🟢 de `_reversa_sdd/domain.md` que continuam intactas, verificadas nesta rodada:

- **Os sete invariantes da família** (§7) seguem válidos, e o quinto domínio nasceu dentro deles —
  o que deixou de ser afirmação e passou a ser **teste**: `invariantes.test.ts` lê os 25 arquivos
  de `models/puericultura/**` e falha se algum importar de fora do domínio, mencionar React, Next
  ou Primer, ou ler o relógio (`Date.now()`, `new Date()` sem argumento, `process.env`, `fetch`).
- **Regra 15 — coleta total de ofensores**: preservada e realizada em `validacao.ts`, com o
  cenário dos três ofensores simultâneos coberto na unidade e na fachada.
- **§8 — escopo é a fonte** (MD-0009): reforçada e agora com duas espécies de recusa. A parcial
  (`PC_ACIMA_DE_2_ANOS`) é novidade frente ao molde da 014, que só tem recusa global, e o teste
  vigia que ela não derrube os índices que a fonte ainda responde.
- **ADR 0005 — o motor informa, não escolhe**: nenhuma saída do domínio sugere conduta,
  investigação ou encaminhamento; a classificação é o rótulo literal da fonte e para aí.
- **ADR 0004 — erro esperado é valor**: as três variantes de `SaidaAvaliacao` cobrem todo fluxo
  esperado; `ErroDeInvariante` só aparece em condição que a validação já deveria ter barrado.
- **Catálogo como fonte única** (Módulo 10, D-07 da feature 007): preservado.
- **Privacidade por construção** (ADR 0002): `EntradaAvaliacao` não tem campo que identifique a
  criança, o que torna a minimização estrutural, e não disciplina da tela.
- **Camadas** (`architecture.md` §1): `scripts/**` não é importado por `models/**`,
  `interface/**` nem `pages/**`, e o domínio novo só importa os próprios módulos.
- **Suíte verde**: **625 testes em 44 arquivos** (antes 446 em 33), `typecheck` e `eslint` limpos,
  Prettier conforme nos arquivos da rodada. Os quatro domínios existentes seguem com os mesmos
  testes e os mesmos números.
- **Tetos do mantenedor**: nenhum arquivo de código acima de 400 linhas — no domínio, o maior é
  `oms/leitura.ts` com 331; nos testes, `fachada.test.ts` nasceu com 441 e foi partido em dois por
  coesão. A exceção declarada segue valendo só para os módulos de dados gerados.

## 4. Modificadas

Nenhuma regra 🟢 do **legado** foi alterada ou removida. O único arquivo de motor existente aberto
em toda a feature é `models/gestacao/datas.ts` (T022), que recebeu a declaração do gêmeo em
comentário: nenhuma linha executável mudou e a suíte da unit de gestação segue com os mesmos
resultados. É exatamente a ressalva que o `requirements.md` §1 registrou (A004), agora consumada.

As duas alterações funcionais em arquivos existentes seguem sendo as extensões aditivas do
catálogo e do mapa de ícones, previstas por D-12.

Foram modificados artefatos **desta feature**, e a reconciliação deles cabe ao `/reversa-sync`:

1. O contrato de aquisição `interfaces/tabelas-de-referencia.md`, em quatro pontos (rodada do
   gerador).
2. `requirements.md` e `roadmap.md`, no critério de aceite de RF-03 e em D-10/D-10.1 (rodada do
   oráculo).
3. Três descrições de entidade do `data-delta.md` §2, que a implementação precisou de forma
   diferente da que o plano escreveu — o discriminante do índice (`estado`, não `tipo`),
   `idadeUsada` como objeto e a idade gestacional como campo opcional.
4. **Nesta rodada**, quatro pontos das regras de negócio que a fonte impressa contradisse ou
   detalhou: a redação literal de RN-04 e RN-07 (artigo e sigla), a extensão de RN-05 a **dois**
   conjuntos de rótulo em vez de um, a resolução da lacuna 🟡 de §10 sobre a concordância do
   material da menina, e a tradução em dias do limite de três anos de RN-16 (1095), que o plano
   deixara em anos. Os quatro estão descritos nas notas de execução do `actions.md`; nenhum altera
   comportamento planejado — descrevem o comportamento que a fonte determina.
