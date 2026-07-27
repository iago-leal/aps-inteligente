# Impacto no legado — feature 018-revisao-linguagem-textos

> Gerado por `/reversa-coding` em **2026-07-27**.
> Âncora: **legado** — `_reversa_sdd/architecture.md` e `_reversa_sdd/domain.md`, re-extração nº 3.
> Severidade alinhada a `/reversa-audit`: CRITICAL, HIGH, MEDIUM, LOW.

## 1. Arquivos afetados

| Arquivo afetado | Componente na extração | Tipo | Severidade | Justificativa |
|---|---|---|---|---|
| `.reversa/principles.md` | Princípios do projeto | regra-nova | **HIGH** | Ganha o princípio **IX**. É o primeiro que rege *como o artefato fala*, e passa a valer para toda feature seguinte |
| `docs/redacao.md` | — (não existe na extração) | componente-novo | **HIGH** | Primeiro artefato normativo de linguagem do projeto; materialização operacional do princípio IX |
| `scripts/inventariar-textos.mts` | `architecture.md#2` — família dos geradores `.mts` | componente-novo | MEDIUM | Terceiro gerador idempotente, com dois modos de emissão. Dev-time: não entra no bundle |
| `scripts/textos/` (7 arquivos) | — | componente-novo | MEDIUM | Mapa de classificação declarado (D-04). Dev-time |
| `tests/apoio/inventario-textual.json` | `casos-oraculo-puericultura.json` (precedente) | delta-de-dados | MEDIUM | 642 literais com arquivo, linha e classe. **Regerado** ao fim de toda revisão de texto |
| `tests/apoio/citacao-linha-de-base.json` | idem | delta-de-dados | **HIGH** | 108 citações congeladas do estado anterior. **Jamais regerado** — é o oposto do anterior no tempo, e o guarda permanente do invariante da citação (D-14) |
| `tests/unit/textos/` (7 verificadores + apoio) | `architecture.md#5` — pirâmide de testes | componente-novo | MEDIUM | Todos vistos reprovar antes de aceitos (T055). A suíte foi de 52 para 59 arquivos |
| `models/puericultura/fonte-clinica.ts` | `addenda/017` — fonte clínica | **regra-alterada** | **HIGH** | Dois rótulos citados corrigidos na concordância; constante nova `NOTA_CORRECAO_DE_CONCORDANCIA`; cabeçalho reescrito, inclusive a imprecisão da linha 9 |
| `interface/puericultura/proveniencia.tsx` | `addenda/017` — proveniência | regra-alterada | MEDIUM | Ganha um parágrafo, lido do domínio. Segue sem texto próprio (RN-05) |
| `pages/index.tsx` | `code-analysis.md#módulo-12` | **delta-de-contrato-externo** | **HIGH** | A `description` nomeava duas das quatro seções. Defeito de exatidão visível a quem chega pela busca |
| `pages/{dm2,pre-natal,cardiologia,puericultura}/*.tsx` (5) | idem | delta-de-contrato-externo | MEDIUM | `<title>` uniformizado ao separador único e à caixa de frase |
| `public/manifest.webmanifest` | `code-analysis.md#módulo-12` (feature 009) | delta-de-contrato-externo | MEDIUM | `description` revisada **no mesmo ato** que o subtítulo da home (D-18). `name` e `short_name` intactos |
| `interface/inicio/tela.tsx` | `code-analysis.md#módulo-10` | regra-alterada | MEDIUM | Subtítulo do hero: o outro lado do par duplicado |
| `interface/inicio/catalogo.ts` | `code-analysis.md#módulo-10` (D-07, anti-drift) | regra-alterada | LOW | Duas descrições revisadas em coesão. Passa a ser oráculo da descrição da home (D-05) |
| `interface/{calculadora,cardiologia,gestacao,puericultura,risco-cardiovascular}/tela.tsx` (5) | `code-analysis.md#módulos 6–11` | regra-alterada | LOW | `<h1>` em caixa de frase, alinhado ao catálogo |
| `interface/calculadora/resultado.tsx` | `code-analysis.md#módulo-6` | regra-alterada | LOW | Cinco literais: travessão fazendo ofício de dois-pontos |
| `interface/risco-cardiovascular/proveniencia.tsx` | `code-analysis.md#módulo-9` | regra-alterada | LOW | Separador do vínculo externo |
| `models/{cardiopatia-isquemica,risco-cardiovascular}/validacao.ts` | Módulos 3 e 4 | regra-alterada | MEDIUM | Molde do guia aplicado; a referência à fonte sai da mensagem (L-08); concordância de "raça" corrigida |
| `models/{insulina/fonte-clinica,insulina/regra-intensificacao,gestacao/calculadora,puericultura/calculadora,cardiopatia-isquemica/fonte-clinica}.ts` | Módulos 1–4 | regra-alterada | LOW | Prosa autoral de conduta e recusa, pela frente ampliada de D-16 |
| `CLAUDE.md`, `README.md` | raiz | regra-alterada | MEDIUM | Passam a apontar o guia; o README é ele próprio revisado e documenta o gerador |
| `_reversa_forward/017-.../regression-watch.md` | Vigilância da 017 | regra-alterada | **HIGH** | **W022 revogado em parte e reescrito no lugar** (D-11, `MD-0017`) |
| `tests/{unit,integration}/**` (5 arquivos) | `architecture.md#5` | regra-alterada | MEDIUM | Asserções atualizadas, nenhuma removida. Duas famílias medidas antes e depois |
| `e2e/{plataforma,calculadora,puericultura}.spec.ts` | idem | regra-alterada | MEDIUM | Textos asseverados atualizados. `axe-baseline.json` **não** foi tocado |

## 2. Diff conceitual, por componente

**A fonte clínica da puericultura é o componente que mais muda, e o que mais precisa ser
lido.** Até 26/07 ela era transcrição literal sem exceção, e o seu cabeçalho declarava a
razão: o médico compara a tela com a caderneta que tem na mão. A 018 abriu **uma** exceção,
estreita em três sentidos — alcança só desvio de concordância, vale sobre lista fechada de
dois rótulos, e é inseparável da declaração ao leitor. O que entrou junto foi o aparato que
mantém a exceção estreita: uma linha de base congelada do estado anterior e um verificador
que reprova qualquer terceiro afastamento. Sem esse aparato a exceção seria licença geral, e
foi por isso que ela custou mais código do que texto.

**Os metadados das rotas mudam de natureza, não só de forma.** A `description` da raiz
deixou de ser prosa mantida à mão e passou a ser prosa **verificada** contra o `CATALOGO`:
acrescentar uma quinta seção sem revisitá-la quebra a suíte. O anti-drift que o catálogo já
exercia sobre a home passa a alcançar o texto que sai para o buscador.

**A superfície textual vira dado.** O que antes existia só como leitura humana — "todos os
textos do produto" — passou a ter lista fechada, gerada, versionada e classificada. É a
mudança com maior alcance no tempo, porque muda o custo de toda revisão futura: literal novo
sem classe declarada faz o gerador parar, e a decisão que antes se adiava em silêncio passa
a ser tomada no momento em que nasce.

**O que não mudou, e sustenta o RNF de compatibilidade.** Nenhum dos cinco domínios de
cálculo mudou de comportamento; nenhuma rota nasceu ou morreu; o esquema do banco ficou
intacto; a `openapi/status.yaml` não foi tocada; `e2e/axe-baseline.json` não foi alterado.
As 673 asserções da suíte e os 36 roteiros de ponta a ponta passam.

## 3. Regras 🟢 preservadas

- **`domain.md` §7, invariante 3** — toda saída carrega `ReferenciaClinica`. Intacta, e
  reforçada: L-08 tirou a localização de dentro da mensagem de validação justamente para não
  criar segunda fonte do que a referência já carrega.
- **`domain.md` §7, invariante 5** — constantes clínicas congeladas por `Object.freeze` em
  `fonte-clinica.ts`. Intacta. As duas correções de concordância são de rótulo exibido, e o
  congelamento estrutural não foi tocado.
- **`domain.md` §7, invariante 6** — o motor informa e não escolhe. Intacta.
- **`domain.md` §7.1, regra 9** — a interface importa a constante do domínio em vez de
  reescrever o valor. Intacta, e é o que faz RN-04 quase não ter o que proteger nas telas.
- **`domain.md` §7.2, regra 12** — nomes acessíveis fixados por decisão. Intacta: RN-07
  entrou como restrição explícita da revisão, e nenhum nome acessível foi tocado.
- **`architecture.md` §1** — quatro domínios sob casca comum, fonte clínica única por
  domínio, mescla proibida. Intacta.
- **ADR 0002 — privacidade por construção.** Intacta, e agora asseverada: as seis rotas
  continuam afirmando que o cálculo não sai do navegador, na forma fraca de D-20.
- **Feature 009, marca** — `name` e `short_name` do manifesto. Intactos, e vigiados.
- **Feature 007, D-07** — o catálogo como fonte única da home e das rotas. Intacto, e
  promovido a oráculo da descrição.
- **Feature 006, RN-03** — `rotulos.ts` como fonte única entre painel e plano copiável.
  Intacto: nenhum literal dele foi reescrito, e é por isso que as dezessete asserções
  `toContain` de `formatar-plano.test.ts` não quebraram.

## 4. Regras 🟢 modificadas

| Regra | Onde estava | O que mudou |
|---|---|---|
| **Transcrição literal sem exceção** | `addenda/017-puericultura-crescimento.md`; cabeçalho de `models/puericultura/fonte-clinica.ts`; `MD-0014`, segunda metade | Passa a admitir **uma** exceção: desvio de concordância, sobre lista fechada de dois rótulos, inseparável da declaração ao leitor (`MD-0015`, RN-09, RF-10) |
| **`W022` — os vinte e cinco rótulos são intocáveis** | `_reversa_forward/017/regression-watch.md` | Revogado em parte: vinte e três seguem intocáveis, dois passaram a ser exibidos corrigidos, e o item passa a vigiar também a permanência da declaração |
| **A descrição da plataforma é prosa mantida à mão** | `code-analysis.md#módulo-12` | Passa a ser prosa **verificada** contra o catálogo, em duas formas conforme a superfície (D-17) |
| **A classe de um texto é leitura humana** | — (implícito) | Passa a ser **declaração versionada** em `scripts/textos/classes/`, com parada ruidosa do gerador em literal sem classe (D-04, `MD-0016`) |
| **`MD-0014`, primeira metade** | `.harness/decisoes/MD-0014.md` | **Não** mudou, e vale registrar: a classe vem da origem, não do diretório. Ela sustenta RN-01, RN-02 e agora o princípio IX |
