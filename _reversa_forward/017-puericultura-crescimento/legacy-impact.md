# Legacy impact: Puericultura — escores z de crescimento infantil

> Identificador: `017-puericultura-crescimento`
> Data: `2026-07-28` (quarta rodada; anteriores em `2026-07-26` e três em `2026-07-27`)
> Âncora: **legado** (`_reversa_sdd/architecture.md` + `domain.md`, re-extração nº 3)
> Estado da execução: **completa** — **52 das 52 ações**, as cinco fases fechadas: Preparação
> (T001–T006), Testes (T007–T019), Núcleo (T020–T039), Integração (T040–T048) e Polimento
> (T049–T052). A feature existe para o usuário: a rota está no ar do lado do código, com tela,
> painel, proveniência, testes de integração e e2e com varredura axe.

## 1. Arquivos afetados

| Arquivo afetado | Componente (`architecture.md`) | Tipo | Severidade | Justificativa |
|---|---|---|---|---|
| `interface/inicio/catalogo.ts` | Módulo 10 — `interface/inicio` | regra-alterada (extensão) | LOW | Quarta seção, `puericultura`, com uma ficha. Diff puramente aditivo: 12 linhas, nenhuma removida. As três seções existentes seguem byte a byte |
| `interface/inicio/icones.tsx` | Módulo 10 — `interface/inicio` | regra-alterada (extensão) | LOW | Entrada `puericultura → SmileyIcon`. O mapa mantém o fallback `null` e os três pares anteriores |
| `models/gestacao/datas.ts` | Módulo 2 — `models/gestacao` | arquivo-tocado (comentário) | LOW | **Único arquivo de motor existente aberto na feature** (T022, D-07; ressalva A004). Recebe a declaração do gêmeo em comentário; nenhuma linha executável muda, e os 40 testes da unit seguem verdes sem alteração |
| `pages/_app.tsx` | Módulo 12 — `pages` (shell) | regra-alterada (extensão) | LOW | Uma linha: o `import` da folha nova, após as existentes. Nenhuma folha anterior tocada; ordem de cascata preservada |
| `tsconfig.json` | — (configuração de raiz) | delta-de-configuração | LOW | `allowImportingTsExtensions`, exigido pelos scripts `.mts` que o Node executa em ESM. Só vale sob `noEmit`; o pipeline do Next não lê esta opção |
| `README.md` | — (documentação de raiz) | regra-alterada (documentação) | LOW | Duas linhas novas na tabela de rotas (a quinta calculadora **e a quarta**, que a 014 esquecera), seção do procedimento de regeneração das tabelas da OMS, a exceção declarada aos tetos e a correção de "duas seções" para quatro |
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
| `models/puericultura/validacao.ts` | Domínio 5 | componente-novo | MEDIUM | Coleta total de ofensores; as faixas de plausibilidade travam, ao contrário do molde da 014. **Refatorado em T052**: os três blocos `if` repetidos viraram a tabela `MEDIDAS_VALIDAVEIS`, sem mudar mensagem nem código de ofensor |
| `models/puericultura/datas.ts` | Domínio 5 (gêmeo de `models/gestacao/datas.ts`) | componente-novo | LOW | Aritmética em dias epoch UTC, com a dívida de convergência declarada nos dois arquivos (D-07) |
| `models/puericultura/intergrowth/equacoes.ts` | Domínio 5 — subdiretório `intergrowth/` (D-01) | componente-novo | **HIGH** | Seis expressões fechadas de μ e σ. Substituem tabela por fórmula, e um coeficiente trocado não tem como ser notado a olho |
| `models/puericultura/intergrowth/escore.ts` | Domínio 5 — subdiretório `intergrowth/` | componente-novo | MEDIUM | Escore em escala log ou natural conforme a curva, e o IMC como ausência com motivo |
| `models/puericultura/calculadora.ts` | Domínio 5 — fachada (`architecture.md` §1) | componente-novo | **HIGH** | A porta única da unit. É onde as decisões de dez módulos têm de chegar coerentes, e onde a distinção entre as duas idades se materializa |
| `interface/puericultura/resultado.tsx` | Módulo de tela novo (família `interface/<tema>`) | componente-novo | **HIGH** | É o que o prescritor lê. Um erro de formatação do escore, de rótulo ou de variante (`ausente` × `fora-do-escopo`) produz leitura clínica errada sem que número algum esteja errado no motor |
| `interface/puericultura/formulario.tsx` | Módulo de tela novo | componente-novo | MEDIUM | Materializa duas regras clínicas na entrada: a posição da medição sem default (RN-09) e o campo vazio como ausência, não como zero (RF-06) |
| `interface/puericultura/proveniencia.tsx` | Módulo de tela novo | componente-novo | MEDIUM | Declara os limites do que a ferramenta pode afirmar (RF-13). Lê o texto congelado do domínio; divergir dele seria prometer mais do que a fonte sustenta |
| `interface/puericultura/app.tsx` | Módulo de tela novo | componente-novo | MEDIUM | Estado efêmero, motor e data injetáveis, invalidação por edição e painel honesto. Nenhum dado sai daqui |
| `interface/puericultura/tela.tsx` | Módulo de tela novo | componente-novo | LOW | Composição da `Moldura` com `comInicio` |
| `pages/puericultura/crescimento.tsx` | Módulo 12 — `pages` | componente-novo | LOW | Rota e metadados; o `<title>` e a descrição não repetem regra clínica |
| `interface/estilos/puericultura.css` | Módulo 11 — `interface/estilos` | componente-novo | LOW | Quinta folha, 3 classes novas sobre tokens Primer. `globais.css` intocado, e segue nas 364 linhas |
| `tests/apoio/puericultura.ts` | — (apoio de teste) | componente-novo | LOW | Tabelas sintéticas, construtores e `dataApos`. Nada em produção depende dele |
| `tests/apoio/casos-oraculo-puericultura.json` | — (apoio de teste) | componente-novo | **HIGH** | 356 casos da OMS e 1596 células do INTERGROWTH-21st, 224 kB. Única cópia versionada dos dois oráculos exatos da feature. Gerado, nunca editado à mão |
| `tests/unit/dominio-puericultura/*.test.ts` (12 arquivos) | — (suíte de unidade) | componente-novo | MEDIUM | 201 casos que prendem fronteiras, oráculos, rótulos literais e os invariantes da família. É o que impede regeneração ou refatoração futura de mudar número em silêncio |
| `tests/integration/interface/puericultura.test.tsx` | — (suíte de integração) | componente-novo | MEDIUM | 17 casos que prendem o que a tela mostra: formato do escore, rótulo literal, procedência por índice, invalidação, ausência de ritual e painel honesto |
| `e2e/puericultura.spec.ts` | — (suíte e2e) | componente-novo | MEDIUM | 5 casos contra o build de produção: a seção nova na home, o caso-base ponta a ponta, a recusa global, a proveniência fora do painel e a varredura axe |
| `_reversa_forward/.../medicao-bundle.md` | — (registro da feature) | componente-novo | LOW | Registro de D-09, exigido por T049 fora das notas de execução |
| `_reversa_forward/.../interfaces/tabelas-de-referencia.md` | — (spec da feature) | regra-alterada (reconciliação) | MEDIUM | Quatro pontos do contrato reconciliados contra o dado real (§3, §4.2, §5 V2/V5 e as novas §5.2 e §5.3) |
| `_reversa_forward/.../requirements.md`, `roadmap.md` | — (spec da feature) | regra-alterada (reconciliação) | MEDIUM | Critério de aceite de RF-03 corrigido e D-10 promovido a confirmação na fonte primária, com o novo D-10.1 |
| `referencias/caderneta/`, `referencias/oms/`, `referencias/intergrowth/` | — | delta-de-dados (fora do git) | LOW | Fontes clínicas em pasta ignorada (MD-0008). Não versionadas por decisão |
| `.harness/decisoes/MD-0002.md`, `MD-0004.md`, `MD-0006.md`, `MD-0007.md`, `MD-0008.md`, `MD-0010.md`, `MD-0011.md` | — | registro de decisão | — | Fichas das rodadas anteriores; nenhuma reaberta nesta |

## 2. Diff conceitual por componente

**`interface/inicio` (Módulo 10).** Inalterado desde a primeira rodada, e agora **quitado**: o
estado intermediário em que a home apontava para uma rota inexistente — consequência deliberada
da regra de anti-drift do README, que manda registrar no catálogo antes de implementar — acabou
com T045. O cartão da seção Puericultura leva à tela, e o e2e prova a navegação.

**Cadeia do dado (dev-time), completa desde a segunda rodada.** Aquisição → leitura →
verificação → emissão, com duas decisões estruturais: só o baixador toca a rede, e o gerador é
função determinística de arquivos em disco. A ela somou-se a cadeia gêmea do oráculo, de
propósito oposto — uma produz o dado que o motor usa, a outra o dado contra o qual ele é medido.
A fórmula LMS aparece **duas vezes**, uma de cada lado, e é essa duplicação aparente que dá valor
à conferência.

**O quinto domínio, fechado na rodada anterior.** Onze módulos que vão da data à classificação,
com quatro escolhas de fundo: *o tipo carrega a regra* (`IndiceAntropometrico` como união de três
variantes realiza RF-06 por impossibilidade de representação, não por disciplina); *cada fronteira
tem um dono só*, e são quatro que não coincidem — TABELA aos 1856 dias, RÓTULO do IMC aos 1826,
DOIS ANOS aos 730 e as duas RÉGUAS em 27 e 64 semanas pós-menstruais; *duas idades governam coisas
diferentes*, a cronológica mandando na posição de medida e a que indexa a curva mandando em
leitura, escopo e rótulo (`MD-0011`); e *a política clínica não se repete*, com a leitura
informando sem decidir e a fachada compondo.

**A tela (novidade desta rodada), e as três decisões que a definem.**

*Primeira, a tela formata, nunca recalcula.* O escore chega à apresentação como número não
arredondado e sai dela com uma casa decimal e sinal explícito, inclusive no zero (D-13). A casa
decimal é decisão de leitura — a caderneta lê faixa, não centésimo —, e o valor bruto permanece no
objeto de saída, disponível para teste e para exibição futura. O sinal explícito no positivo
importa mais do que parece: `+0.1` e `-0.1` distinguem-se à primeira vista, ao passo que `0.1`
convida a leitura apressada a supor um lado.

*Segunda, o título do bloco não repete a fronteira dos dois anos.* Seria natural escrever
"Comprimento" ou "Estatura" no cabeçalho de cada índice conforme a idade — e seria a segunda
implementação da mesma regra, agora na camada de apresentação, livre para divergir do domínio numa
refatoração futura. O título usa a forma neutra "Comprimento/estatura para a idade", e o
substantivo correto aparece onde a fonte o define: no rótulo literal que o motor devolve. Mesma
disciplina para as referências, impressas a partir de `referencia.versaoEdicao`, e não de uma
string repetida na tela.

*Terceira, a proveniência antecede o número.* RF-13 pede o bloco fora do painel de resultado, e a
tela vai um passo além: ele está visível **desde o primeiro carregamento**, antes de existir
qualquer escore. Os limites do que a ferramenta pode afirmar — medição isolada não é tendência,
cobertura de 0 a 10 anos, perímetro cefálico só até 2 — valem para quem ainda vai digitar, não só
para quem já leu um resultado.

**Duas correções de forma que T052 encontrou, e que não eram cosméticas.** `validarMedidas` tinha
62 linhas por repetir três vezes o mesmo bloco de faixa; virou a tabela `MEDIDAS_VALIDAVEIS`, com
40 linhas, e acrescentar uma quarta medida um dia passa a ser acrescentar uma linha. O formulário
repetia cinco vezes a anatomia campo → erro → blur; ganhou o subcomponente `CampoNumerico` e caiu
de 258 para 226 linhas. Nenhuma mensagem, código de ofensor ou rótulo mudou — os 218 testes do
domínio e da tela passaram sem edição, que é a prova de que a refatoração foi de forma.

**A fonte editorial virou dado congelado, e discorda da spec em três pontos de redação.** A
transcrição dos dois PDFs revelou que os rótulos são idênticos nos dois materiais, incluindo a
concordância destoante do comprimento ("Comprimento adequada", "Baixa comprimento", "Muito baixo
comprimento") que a lacuna 🟡 supunha ser peculiaridade da menina. Revelou também que a fonte
escreve "Peso elevado para idade", sem o artigo que RN-04 acrescentara, e usa a sigla no perímetro
cefálico, onde RN-07 escrevia o nome por extenso. Preservou-se o impresso: o médico compara a tela
com a caderneta que tem na mão, e "corrigir" o português criaria divergência onde a fonte não tem
nenhuma. **A tela herda a transcrição sem retocá-la**, e o teste de integração assere
"Comprimento adequada para idade" com essa concordância — de modo que um "conserto" bem-intencionado
no futuro quebra a suíte em vez de passar despercebido.

**Configuração.** `tsconfig.json` e `pages/_app.tsx` são os únicos arquivos de configuração e de
shell tocados, cada um por uma linha.

## 3. Preservadas

Regras 🟢 de `_reversa_sdd/domain.md` que continuam intactas, verificadas nesta rodada:

- **Os sete invariantes da família** (§7) seguem válidos, e o quinto domínio nasceu dentro deles —
  o que deixou de ser afirmação e passou a ser **teste**: `invariantes.test.ts` lê os 25 arquivos
  de `models/puericultura/**` e falha se algum importar de fora do domínio, mencionar React, Next
  ou Primer, ou ler o relógio (`Date.now()`, `new Date()` sem argumento, `process.env`, `fetch`).
  A tela nova não abriu exceção: quem lê o relógio é `app.tsx`, na camada de interface, e a data
  entra no motor como argumento.
- **Regra 8 — invalidação por edição**: preservada e realizada na tela nova, com o teste de
  integração que altera um campo depois de avaliar e cobra o aviso de desatualizado.
- **Regra 15 — coleta total de ofensores**: preservada em `validacao.ts` (inclusive após a
  refatoração de T052), com o cenário dos três ofensores simultâneos coberto na unidade, na
  fachada e agora na tela.
- **§8 — escopo é a fonte** (MD-0009): reforçada e agora com duas espécies de recusa. A parcial
  (`PC_ACIMA_DE_2_ANOS`) é novidade frente ao molde da 014, que só tem recusa global; o teste de
  integração vigia que ela não derrube os índices que a fonte ainda responde.
- **ADR 0005 — o motor informa, não escolhe**: nenhuma saída do domínio sugere conduta,
  investigação ou encaminhamento; a classificação é o rótulo literal da fonte e para aí. A tela
  tem teste negativo próprio: o painel não menciona encaminhamento, prescrição nem suplementação.
- **ADR 0004 — erro esperado é valor**: as três variantes de `SaidaAvaliacao` cobrem todo fluxo
  esperado; `ErroDeInvariante` só aparece em condição que a validação já deveria ter barrado, e a
  tela o converte em painel honesto com evento anônimo (só o nome da classe).
- **RN-13 — sem ritual de revisão** (invariante da família para calculadora que não prescreve):
  preservada, com teste negativo que exige zero `checkbox` no DOM antes e depois de avaliar.
- **Catálogo como fonte única** (Módulo 10, D-07 da feature 007): preservado, e agora exercitado
  ponta a ponta pelo e2e que navega da home à rota nova.
- **Privacidade por construção** (ADR 0002): `EntradaAvaliacao` não tem campo que identifique a
  criança, o que torna a minimização estrutural, e não disciplina da tela. A tela não faz rede nem
  usa armazenamento.
- **Acessibilidade**: a rota nova nasce com **zero violação axe**, antes e depois do resultado, e
  `e2e/axe-baseline.json` ficou **intocado** — a linha de base tolera dívida herdada, e não havia
  nenhuma a tolerar.
- **Camadas** (`architecture.md` §1): `scripts/**` não é importado por `models/**`,
  `interface/**` nem `pages/**`; o domínio novo só importa os próprios módulos; a tela importa o
  domínio, e nunca o contrário.
- **Isolamento de custo por rota** (D-09, medido em T049): as sete rotas existentes têm o
  *first load* bruto **idêntico byte a byte**. A premissa 🟡 pode ser promovida a 🟢.
- **Suíte verde**: **642 testes em 45 arquivos** (antes 625 em 44), **36 testes e2e**, `typecheck`
  e `eslint` limpos. Os quatro domínios existentes seguem com os mesmos testes e os mesmos números.
- **Cobertura de `models/**`**: 97,02% de statements, 96,05% de branches, 98,33% de funções e
  97,16% de linhas, com o quinto domínio incluído — acima do limite de 90 em todas as métricas, e
  **sem nenhuma exclusão** no `vitest.config.ts`, que ficou intocado.
- **Tetos do mantenedor**: nenhum arquivo de código acima de 400 linhas (o maior escrito à mão tem
  344) e nenhuma função de domínio acima de 50 (a maior tem 40). A exceção declarada segue valendo
  só para os módulos de dados gerados, e agora está escrita no README, com o seu limite.

## 4. Modificadas

Nenhuma regra 🟢 do **legado** foi alterada ou removida. O único arquivo de motor existente aberto
em toda a feature é `models/gestacao/datas.ts` (T022), que recebeu a declaração do gêmeo em
comentário: nenhuma linha executável mudou e a suíte da unit de gestação segue com os mesmos
resultados. É exatamente a ressalva que o `requirements.md` §1 registrou (A004), agora consumada.

As alterações funcionais em arquivos existentes são três, todas aditivas e previstas: as extensões
do catálogo e do mapa de ícones (D-12) e o `import` da folha nova em `pages/_app.tsx` (T046).

Uma alteração de documentação **corrige dívida alheia à feature**: a tabela de rotas do README
omitia a calculadora de risco cardiovascular desde a feature 014. Uma tabela que se anuncia como o
índice das rotas e esconde uma delas é pior do que a omissão de hoje, e o custo de acrescentá-la
junto da quinta era de uma linha.

Foram modificados artefatos **desta feature**, e a reconciliação deles cabe ao `/reversa-sync`:

1. O contrato de aquisição `interfaces/tabelas-de-referencia.md`, em quatro pontos (rodada do
   gerador).
2. `requirements.md` e `roadmap.md`, no critério de aceite de RF-03 e em D-10/D-10.1 (rodada do
   oráculo).
3. Três descrições de entidade do `data-delta.md` §2, que a implementação precisou de forma
   diferente da que o plano escreveu — o discriminante do índice (`estado`, não `tipo`),
   `idadeUsada` como objeto e a idade gestacional como campo opcional.
4. Quatro pontos das regras de negócio que a fonte impressa contradisse ou detalhou (rodada do
   motor): a redação literal de RN-04 e RN-07, a extensão de RN-05 a **dois** conjuntos de rótulo,
   a resolução da lacuna 🟡 de §10 e a tradução em dias do limite de três anos de RN-16 (1095).
5. **Nesta rodada**, dois pontos de forma: D-09 medida e passível de promoção a 🟢, e a
   constatação de que **nenhuma exceção de cobertura foi necessária** — T050 previa excluir os
   módulos de dados do `include` caso distorcessem a métrica, e eles não distorceram, por serem
   integralmente cobertos ao ser importados.
