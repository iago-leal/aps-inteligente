# Análise de Código — aps-inteligente

> Regenerado pelo Reversa Archaeologist em 2026-07-28 (**re-extração nº 4** — absorve as features 015–022 sobre a base 001–014).
> Delta desta passagem: quinto domínio clínico `models/puericultura` (017) com **segunda fachada** no submódulo `consulta` (020); primeiro unit **não clínico** `models/contribuicao` (019); camada **dev-time** `scripts/**` (017–020); `Moldura` sem `logoComoTitulo` e dona da coluna do corpo (016/021); `/api/v1/status` com **I/O real** e seis chaves (022). Os quatro motores anteriores permanecem intocados (reconfirmados por leitura).
> Escala de confiança: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA
> Módulos (21): `models/{insulina,gestacao,cardiopatia-isquemica,risco-cardiovascular,puericultura,puericultura/consulta,contribuicao}`, `interface/{comum,calculadora,gestacao,cardiologia,risco-cardiovascular,puericultura,puericultura/consulta,contribuicao,inicio,estilos}`, `pages`, `pages/api/v1/status`, `infra`, `scripts`.

## Visão de conjunto

🟢 O sistema é uma **plataforma de calculadoras clínicas de apoio à decisão para a Atenção Primária à Saúde**, 100% client-side no cálculo clínico. Nasceu como calculadora única de insulinização no DM2 e hoje reúne **seis calculadoras sobre cinco domínios clínicos**, cada um com **uma fonte clínica única** (ADR 0001/0011):

| Domínio | Calculadora | Fonte única | Feature |
|---|---|---|---|
| `models/insulina` | Insulina DM2 (início, titulação, intensificação) | Guia Rápido Diabetes Mellitus — SMS-Rio, 2023 | 001+ |
| `models/gestacao` | Idade gestacional, DPP, trimestre (DUM × USG) | Guia Rápido Pré-Natal — SMS-Rio, 2025 | 007 |
| `models/cardiopatia-isquemica` | Dor torácica e probabilidade pré-teste de DAC | TeleCondutas — TelessaúdeRS-UFRGS, 2017 | 010 |
| `models/risco-cardiovascular` | Risco de ASCVD em 10 anos (PCE) | 2013 ACC/AHA (Goff et al.) | 014 |
| 🆕 `models/puericultura` | Escores z de crescimento infantil | Caderneta da Criança — MS, 2.ª ed., 2020, pp. 85–97 | 017 |
| 🆕 `models/puericultura/consulta` | Ficha de consulta em SOAP | Caderneta da Criança — MS, 2.ª ed., 2020, pp. 66–75 | 020 |

🟢 **A família `models/*` deixou de ser homogênea, e é o achado central desta passagem.** Três leituras que a extração anterior fazia como universais passam a ter exceção declarada:

1. **Uma fonte por unit ≠ uma fachada por unit.** `models/puericultura` tem duas fachadas — `CalculadoraCrescimentoInfantil.avaliar` e `RegistroDeConsultaPuericultura.montar` — sobre a mesma caderneta, em seções distintas. A ADR 0011 fala de **fonte**, e permanece intacta.
2. **Nem todo unit de `models/` é clínico.** `models/contribuicao` é isento por escrito (`MD-0022`) de fonte clínica única, `ReferenciaClinica` e catálogo congelado, e conserva os demais invariantes: pureza, erro como valor, coleta total de ofensores. A isenção está no cabeçalho da própria fachada, precisamente para que esta passagem não a leia como esquecimento.
3. **O produto nem sempre é um número.** A consulta SOAP emite texto de registro que atravessa para fora da plataforma por colagem no prontuário, com contrato de forma escrito.

🟢 A arquitetura tem agora **cinco camadas**, com dependência estritamente unidirecional entre as quatro de aplicação:

```
scripts/**  (DEV-TIME: aquisição, verificação, emissão, congelamento)
   ⋮ não é importada por nenhuma camada abaixo; não entra no bundle
pages (shell Next.js, 7 rotas de página + 1 de API, PWA)
  → interface/* (React + Primer: telas, formulários, painéis, home, Moldura)
    → models/* (5 domínios clínicos + 1 não clínico, TypeScript puro)
infra (pool pg + adaptador de saúde) — usada SÓ pelo healthcheck, e agora de fato
```

🟢 **Invariantes da família**, com o alcance de cada um explicitado:

| # | Invariante | Alcance |
|---|---|---|
| 1 | Domínio puro (sem React/Next/biblioteca; sem relógio) | Todos os 6 units — e desde a 017 **verificado por teste** em `models/puericultura/**` |
| 2 | Erro esperado é valor; exceção só para bug (`ErroDeInvariante`) | Todos os 6 |
| 3 | Toda saída carrega `ReferenciaClinica` | Só os 5 clínicos (`MD-0022` isenta a contribuição) |
| 4 | Coleta total de ofensores | Todos os 6 |
| 5 | Constantes congeladas em `fonte-clinica.ts` | Só os 5 clínicos |
| 6 | O motor informa, não escolhe | Todos os 6 — na consulta, a ficha sugerida é trocável |

🟢 **Privacidade por construção:** nenhum domínio nem tela faz `fetch` ou `storage` de dado clínico. O único `localStorage` é a preferência de tema (`aps-inteligente:tema`). O único acesso a rede é o healthcheck `/api/v1/status` — que **desde a feature 022 é acesso real, e não hipotético** — e não recebe nem devolve dado clínico.

---

# Camada de Domínio (`models/`)

## Módulo 1 — `models/insulina` 🟢 (intocado nesta passagem)

**Propósito:** motor de insulina DM2 — início, titulação basal, fracionamento, intensificação e regra transversal de antidiabéticos orais.

🟢 Reconfirmado por leitura: 8 arquivos, 1.361 LOC, nenhuma linha executável alterada pelas features 015–022. Fachada `CalculadoraInsulinaDM2` com o pipeline `validarEntrada → motivoForaDoEscopo → Peso → despacho por modo → pós-processamento` (ordenação de alertas por `SEVERIDADE`, deduplicação de recomendações e referências). Regras clínicas inalteradas: alerta `INDICACAO_INSULINA` (HbA1c ≥ 10% ou jejum ≥ 300), faixa em vez de dose única (AMB-01), hipoglicemia prevalecendo sobre a média (AMB-06), fracionamento (> 30 UI ou > 0,4 UI/kg) e as duas condutas equivalentes do caso AJ (AMB-03). A precedência metformina × TFG segue como a feature 005 a fixou.

**Complexidade:** média-alta. Maior arquivo: `regra-intensificacao.ts` (250 linhas).

## Módulo 2 — `models/gestacao` 🟢 (um comentário, nenhuma linha executável)

🟢 Reconfirmado: datação por dias epoch UTC, DPP por Naegele, comparação DUM × USG pela margem do trimestre (7 dias no 1.º, 14 no 2.º, sem parâmetro no 3.º), veredito informado sem escolha do motor.

🟢 **Único arquivo de motor existente aberto em toda a passagem:** `datas.ts`, e só para declarar em comentário o gêmeo `models/puericultura/datas.ts` — dívida de convergência registrada (D-07 da 017). **Nenhuma linha executável mudou**, o que a própria feature verificou por `git diff`.

## Módulo 3 — `models/cardiopatia-isquemica` 🟢 (intocado)

🟢 Reconfirmado: classificação por contagem das três características do Quadro 1, lookup na matriz congelada de 24 células, ajuste por fatores de risco (base×2–base×3, capado em 99%), estrato descritivo (`"baixa"` ⟺ dor não anginosa **e** sem fatores), conduta e recusa honesta fora de 30–69 anos.

## Módulo 4 — `models/risco-cardiovascular` 🟢 (intocado)

🟢 Reconfirmado: Pooled Cohort Equations com `Risco₁₀ = 1 − S₀^exp(Σ(β·X) − mean_grupo)`, quatro modelos sexo×raça, clamp fisiológico sinalizado por `Aviso` (distinto de `Ofensor`), recusa fora de 40–79 anos ou com DCV prévia, categorias 5 / 7,5 / 20%, e a `NOTA_PROVENIENCIA` congelada que a tela lê em vez de duplicar.

## Módulo 5 — 🆕 `models/puericultura` (feature 017) 🟢

**Propósito:** escores z dos quatro índices antropométricos e classificação nutricional na redação literal da *Caderneta da Criança*, cobrindo também o nascido pré-termo pelas curvas INTERGROWTH-21st.

### Arquitetura interna

| Arquivo | Papel |
|---|---|
| `tipos.ts` | Contratos; **o discriminante da saída é `tipo`, o do índice é `estado`** — para que um resultado com quatro índices não tenha cinco campos `tipo` de significados distintos |
| `fonte-clinica.ts` | `REFERENCIAS`, `FRONTEIRAS`, os cinco conjuntos de cortes de rótulo, `CONVERSAO_DE_POSICAO_EM_CM`, `JANELA_PRETERMO_EM_SEMANAS`, `NOTA_PROVENIENCIA` |
| `validacao.ts` | Coleta total de ofensores (10 códigos) |
| `datas.ts` | Aritmética em dias epoch UTC — gêmeo declarado de `models/gestacao/datas.ts` |
| `idades.ts` | **Três** idades derivadas: cronológica, corrigida e pós-menstrual |
| `medidas.ts` | Conversão de posição (±0,7 cm) e IMC sobre a medida **já convertida** |
| `elegibilidade.ts` | Recusa **global** e recusa **parcial** |
| `padrao.ts` | Escolha da régua: INTERGROWTH-21st ou OMS — **ponto único de fronteira** |
| `classificacao.ts` | Rótulo literal por índice e faixa etária |
| `oms/lms.ts` | Escore z pelo método LMS e correção de cauda |
| `oms/leitura.ts` | Repositório injetável das 14 tabelas; busca aritmética, sem interpolação |
| `oms/tabelas/*` | **14 módulos gerados** (12.964 linhas L/M/S) + `manifesto.json` com `sha256` |
| `intergrowth/{equacoes,escore}.ts` | Curvas do pré-termo como equações fechadas |

### Algoritmos e regras

- 🟢 **Escore z por LMS (RN-02):** `z = ((X/M)^L − 1)/(L·S)` quando `L ≠ 0`, e `z = ln(X/M)/S` quando `L = 0`.
- 🟢 **Correção de cauda (RN-03):** quando `|z| > 3`, o escore é recalculado por extrapolação linear a partir do último ponto confiável, no passo `SD3 − SD2` daquele lado. Aplica-se **só aos dois indicadores baseados em peso** (`peso-idade`, `imc-idade`), e a lista é **dado, não `if`** — para que a pergunta tenha um lugar só e a sabotagem em teste seja visível. Omiti-la desloca o escore em até 10,4 unidades de IMC.
  - 🟡 **O dado real é silencioso sobre a outra metade** (D-10.1): em comprimento/estatura e perímetro cefálico, `L = 1` nas 14 tabelas, e com `L = 1` a LMS já é linear — corrigir e não corrigir diferem em 1e-14. A prova de que a cauda **não** se aplica a esses dois vive em acervo sintético com `L ≠ 1`.
- 🟢 **Três idades, três papéis** (a distinção que atravessa o domínio):
  - a **cronológica** governa o escopo da fonte, a posição de medida e até quando a correção vale;
  - a **corrigida** indexa a curva da OMS enquanto a correção vale;
  - a **pós-menstrual** indexa as curvas INTERGROWTH-21st e decide se elas ainda valem.
- 🟢 **Correção de prematuridade (RN-16):** desconto de `40 semanas − IG ao nascer`, ativo até **1.095 dias** quando a IG < 28 semanas e até **730** nos demais casos. IG ausente **não** é pré-termo: é criança tratada como termo, e a premissa sai **declarada** no resultado, nunca silenciada.
- 🟢 **Escolha da régua (`padrao.ts`, D-01):** entre 27 e 64 semanas pós-menstruais vale o INTERGROWTH-21st; passadas as 64, a OMS sobre idade corrigida. A escolha é **por criança, não por índice** — uma criança não pode ter o peso lido numa régua e o comprimento noutra.
- 🟢 **Duas espécies de recusa** — a novidade que esta unit acrescenta ao molde do risco CV:
  - **global** (idade acima de 3.682 dias, ou pós-menstrual abaixo de 27 semanas): nenhum índice é calculado;
  - **parcial** (perímetro cefálico acima de 730 dias): só aquele índice sai de escopo, e os demais seguem válidos. Devolve a variante de **índice**, e é isso que a mantém incapaz de derrubar o resultado.
- 🟢 **Duas fronteiras dos 5 anos que de propósito não coincidem:** a de **tabela** aos 1.856 dias (`oms/leitura.ts`) e a de **rótulo** aos 1.826 (`classificacao.ts`). Entre elas vale a tabela de 0–5 anos com os rótulos de 5–10. Alinhá-las produziria ora rótulo trocado, ora buraco de cobertura de 30 dias.
- 🟢 **Duas trocas de conjunto com a idade:** o IMC troca de **nomenclatura** aos 5 anos (o mesmo z = +2,5 é "Sobrepeso" aos 4 e "Obesidade" aos 6 — os três rótulos superiores deslizam um degrau), e o comprimento troca de **substantivo** aos 2 anos ("Comprimento" → "Estatura"), na mesma fronteira em que troca a posição de medida.
- 🟢 **Conversão de posição (RN-09):** ±0,7 cm entre deitado e em pé, **declarada e nunca silenciosa**, e o aviso acompanha os **dois** índices que consomem a medida convertida — estatura e IMC —, porque pendurá-lo só no primeiro esconderia que o IMC também mudou.
- 🟢 **Sem interpolação (D-06):** até 5 anos lê-se o **dia** inteiro; de 5 a 10, o **mês completo** `⌊dias/30,4375⌋`. Nenhum valor usado no cálculo é estimado.

**Complexidade:** alta — é o domínio mais ramificado da plataforma. **Nenhum arquivo de motor acima de 400 linhas**; os módulos gerados de `oms/tabelas/` são exceção nominal declarada no README.

## Módulo 6 — 🆕 `models/puericultura/consulta` (feature 020) 🟢 — a segunda fachada

**Propósito:** transformar as dez consultas datadas das páginas verdes da caderneta em ficha preenchível, e devolver o preenchimento organizado em SOAP.

| Arquivo | Papel |
|---|---|
| `calculadora.ts` | Fachada `RegistroDeConsultaPuericultura` — `catalogo()`, `sugerir()`, `montar()` |
| `selecao.ts` | Duas seleções: a **ficha** pela idade e os **campos** pelo sexo |
| `registro.ts` | Montagem do registro estruturado nas quatro seções do SOAP |
| `tipos.ts`, `fonte-clinica.ts` | Contratos e as notas/referências da fonte |
| `fichas/` | 10 fichas (primeira semana … 36.º mês) + `campos.ts` + `indice.ts` |

### Algoritmos e regras

- 🟢 **O domínio devolve estrutura, nunca texto pronto (D-03).** A projeção em cadeia é da interface, e é uma função com **dois consumidores**: o `<pre>` que exibe e o comando de cópia que entrega. A identidade entre o que se vê e o que se copia é estrutural.
- 🟢 **RN-10, a regra que governa a montagem:** campo sem resposta não aparece, e **seção que fique sem item some inteira, cabeçalho incluído** — cabeçalho solto afirmaria averiguação que não houve, que é pior que a omissão.
- 🟢 **A ficha é sugerida pela idade CRONOLÓGICA**, inclusive no pré-termo, porque é ela que rege o calendário de acompanhamento e o vacinal. Não contradiz `MD-0011`: aquela ficha repartiu papéis entre medir o corpo e ler a curva, e escolher a ficha não é nenhum dos dois. A espécie volta **declarada**.
  - 🟡 Idade entre duas consultas previstas cai na ficha imediatamente **anterior** — premissa, porque a fonte não diz o que fazer com a criança de sete meses. O custo de errar é um clique: a troca é livre.
- 🟢 **O motor não recalcula escore algum (RN-11).** O `ResultadoAvaliacao` chega pronto da fachada da 017 e é **transposto** com a referência que aquele motor já carimbou. Recalcular criaria segunda fonte de escore z dentro da mesma unit.
- 🟢 **Onde cada coisa entra no SOAP (RN-09b):** os escores ocupam a **objetiva**, que é onde a medida mora; a classificação nutricional ocupa a **avaliação**, porque é juízo da própria fonte, e não conclusão que o produto tenha formado. O estado nutricional sai do IMC/I; na falta dele, do peso/I — e o índice que produziu o juízo vai dito no próprio valor.
- 🟢 **Aplicabilidade por sexo mora no dado (`MD-0026`), não em condicional de tela.** Campo sem `sexos` declarado vale para os dois: a restrição é a exceção, e por isso é ela que se escreve. Hoje a lista tem **um item só**, "Criptorquidia", e a supressão é inseparável da declaração ao leitor em `NOTA_SUPRESSAO_DE_CAMPO`.
- 🟢 **Flexão por par de rótulos declarado**, jamais por interpolação (`rotulo` / `rotuloFeminino`).

**Complexidade:** média-alta, com o peso no acervo das dez fichas (2.484 LOC no submódulo).

## Módulo 7 — 🆕 `models/contribuicao` (feature 019) 🟢 — o unit não clínico

**Propósito:** montar o payload do BR Code do PIX estático, para que a home possa exibir chave e QR sem transação, sem confirmação e sem que a plataforma saiba se alguém contribuiu.

| Arquivo | Papel |
|---|---|
| `br-code.ts` | Fachada `montarBrCode` — monta os campos EMV na ordem do padrão |
| `campo.ts` | Primitivas `campo(id, valor)` e `subtemplate(id, filhos)` no formato TLV |
| `crc16.ts` | CRC16-CCITT/FALSE em arquivo próprio |
| `validacao.ts` | Coleta total de ofensores + `normalizarTexto` (ASCII) |
| `tipos.ts` | `ParametrosPix`, `LIMITES`, `OfensorPix`, `SaidaBrCode` |

### Algoritmos e regras

- 🟢 **CRC16-CCITT/FALSE:** polinômio `0x1021`, inicial `0xFFFF`, sem reflexão nem xor final, saída em quatro dígitos hexadecimais maiúsculos. Em arquivo próprio por ser **a parte mais fácil de errar e a mais fácil de provar em isolamento**: meia dúzia de variantes compartilham o polinômio e todas produzem quatro dígitos plausíveis. O vetor conhecido (`"123456789"` → `29B1`) é o que distingue esta das outras.
- 🟢 **A verificação se calcula sobre a cadeia que já contém `6304`** — só os quatro dígitos do valor ficam de fora. Calcular sem esse sufixo produz código que nenhum aplicativo aceita.
- 🟢 **Recusa em vez de truncamento:** nome acima de 25 caracteres ou cidade acima de 15 fazem o painel exibir erro, e não um beneficiário errado na câmera. Os limites são medidos sobre o texto **já normalizado**.
- 🟢 **Primeiro contrato externo que a plataforma emite sem canal de erro:** o BR Code é lido por software de terceiros sob especificação do Banco Central. Payload malformado falha na mão de quem contribui, sem retorno para nós — daí a verificação em duas pontas, uma contra decodificador independente e outra humana, com o consumidor real.

**Complexidade:** baixa-média (336 LOC). Testado também por propriedade (`fast-check`).

---

# Camada de Interface (`interface/`)

## Módulo 8 — `interface/comum` 🟢 (features 016 e 021 — **contrato alterado**)

🟢 **`moldura.tsx` (`Moldura`)** — casca visual comum de todas as telas. **Duas mudanças de contrato nesta passagem:**

- 🟢 **`logoComoTitulo` foi REMOVIDA (feature 016).** A prop governava duas preocupações ortogonais — "a logo é o `h1`?" e "o comando de início aparece?" — e a presença do ⌂ passou à prop dedicada **`comInicio`** (default `false`), uma responsabilidade por prop. A identidade ficou unificada: a logo é **sempre** marca decorativa (`.cabecalho-marca`, `aria-hidden`, `alt=""`) acima de um `h1` **sempre textual**, em toda tela. A home passou a exibir o texto "APS Inteligente", preservando o nome acessível que era o `alt`.
  - ⚠️ **Consequência para a extração:** `domain.md` §7.2, item 11, ainda descreve a `Moldura` governada por `logoComoTitulo`. É a dívida **L-07**, apontada pelo adendo 021 e que esta passagem encerra.
- 🟢 **A `Moldura` passou a ser dona do enquadramento horizontal (feature 021).** A coluna do corpo mora no `<main>`, governada pelo `data-apresentacao` que o componente já emitia — 1.180px na variante `padrao` e 720px na `destaque`. O `.tsx` **não mudou**: a regra alcança o `<main>` pelo seletor `.pagina[data-apresentacao="…"] > main`, sem classe nova no JSX.

🟢 Cabeçalho (011/013/015/016): alternador de tema como `IconButton` do **tema-alvo**, comando de início por `next/link` só quando `comInicio`, selo de privacidade na zona de identidade com `ShieldLockIcon`, alinhamento `flex-start` como regra única e altura igual em todas as rotas **por construção** (209px, sem `min-height` nem px chumbado).

🟡 **Dívida residual, comentada no próprio arquivo:** `preferencia-de-tema.ts` permanece em `interface/calculadora/`, mantendo o acoplamento `comum → calculadora`. Nenhuma das features 015–022 o resolveu.

## Módulo 9 — `interface/calculadora` 🟢 (insulina; cinco literais revistos na 018)

🟢 Reconfirmado: formulário controlado, máquina `EstadoResultado` (`vazio → sucesso | erro | falha-inesperada`) com as flags ortogonais `desatualizado` e `revisaoConfirmada`, e o botão **Copiar plano** gated pelo checkbox de revisão.

🟢 **Delta da 018:** cinco literais de `resultado.tsx`, todos da mesma família — travessão fazendo ofício de dois-pontos. `rotulos.ts` **não** foi tocado, e é por isso que as dezessete asserções `toContain` de `formatar-plano.test.ts` não quebraram: a fonte única segurou.

🟡 **Ponto de atenção herdado:** `let proximoId` módulo-global em `formulario.tsx`.

## Módulo 10 — `interface/gestacao` 🟢 · Módulo 11 — `interface/cardiologia` 🟢 · Módulo 12 — `interface/risco-cardiovascular` 🟢

🟢 Reconfirmados, sem alteração estrutural. Todos sem ritual de revisão (ADR 0012 o restringe à insulina). As três declaram `comInicio` na `Moldura`, preservando o ⌂ antes derivado de `!logoComoTitulo`.

## Módulo 13 — 🆕 `interface/puericultura` (feature 017) 🟢

🟢 Cinco arquivos (774 LOC): `tela.tsx`, `app.tsx`, `formulario.tsx`, `resultado.tsx` e `proveniencia.tsx`. Máquina `EstadoCrescimento` (`vazio → sucesso | fora-do-escopo | erro | falha-inesperada`), sem ritual de revisão e com invalidação por edição de campo. O escore é **formatado** com uma casa decimal e sinal explícito, jamais recalculado (D-13). A tela nomeia o índice pela forma neutra, e o rótulo clínico vem do domínio (`MD-0012`).

## Módulo 14 — 🆕 `interface/puericultura/consulta` (feature 020) 🟢

🟢 Nove arquivos (1.055 LOC). **Três diferenças em relação às cinco telas anteriores, todas com razão registrada:**

1. **Não há ritual de revisão** — preencher ficha não prescreve dose.
2. **Não há invalidação por edição** — aqui a edição **é** o preenchimento, e um aviso de "desatualizado" acusaria como defeito o comportamento normal da tela.
3. **O registro é derivado, e não submetido** — um `useMemo` produz a cadeia que a tela exibe e o comando de cópia entrega.

🟢 **`next/dynamic` no painel de crescimento (RF-11):** quem não abre o painel não paga as tabelas antropométricas no primeiro carregamento — achado da feature 019. `formatar-registro.ts` é a projeção estrutura → cadeia; `painel-crescimento.tsx` faz a ponte com a fachada da 017, devolvendo o `ResultadoAvaliacao` para o registro.

## Módulo 15 — 🆕 `interface/contribuicao` (feature 019) 🟢

🟢 Cinco arquivos (324 LOC): `bloco-de-apoio.tsx` (gatilho na home), `painel.tsx` (`Dialog` do Primer — foco preso, Esc, retorno de foco), `acao-copiar.tsx` (comando de cópia parametrizado), `codigo-qr.tsx` (envoltório de `react-qr-code`) e `beneficiario.ts`.

🟢 **Ordem do DOM deliberada (RF-16):** os dois comandos de cópia vêm **antes** do QR, porque quem abre a plataforma no próprio celular não tem como apontar a câmera do aparelho para a tela do mesmo aparelho. Copiar é o caminho principal, não a conveniência secundária.

🟢 **`beneficiario.ts` é ponto único de configuração**, na apresentação e não no domínio, porque é dado de instalação e não regra. A chave é pública por natureza — existe para ser exibida — e por isso mora no repositório, e não em `NEXT_PUBLIC_*`, que num produto client-side terminaria no mesmo bundle sem proteger nada. O `EXEMPLO` permanece no código como **oráculo** da guarda que reprova a suíte enquanto o beneficiário real for igual a ele.

## Módulo 16 — `interface/inicio` 🟢 (features 018, 019, 020)

🟢 **`catalogo.ts`** — fonte única tipada, `Object.freeze` profundo, agora com **quatro seções** e **seis fichas**: a seção `puericultura` entrou com duas (crescimento e consulta). Diff aditivo: as entradas anteriores permanecem byte a byte, aferido por lista ordenada exaustiva em `inicio.test.tsx`.

🟢 **O catálogo acumulou um segundo papel na feature 018:** além de fonte única da home, é **oráculo da descrição da plataforma**, verificada contra ele em vez de mantida à mão — o que corrigiu um defeito real de exatidão (a `description` da raiz nomeava duas das quatro seções).

🟢 **O bloco de apoio fica FORA do `map` do `CATALOGO`** (feature 019): um item que não calcula nada dentro dele corromperia os dois papéis. O teste de integração passou a afirmar isso.

🟢 **`icones.tsx`** — quatro pares `id → Octicon`, mantido o fallback `null`.

## Módulo 17 — `interface/estilos` 🟢 (features 015–021)

🟢 **Nove** folhas CSS (era cinco), todas sobre tokens Primer, zero cor própria, importadas por `_app.tsx`:

| Folha | Linhas | Origem |
|---|---|---|
| `globais.css` | 367 | base |
| `inicio.css` | 185 | 008, **reduzida** na 016 (hero aposentado) |
| `contribuicao.css` | 133 | 🆕 019 |
| `cabecalho.css` | 121 | 011/013, regra única de alinhamento na 015 |
| `consulta-puericultura.css` | 113 | 🆕 020 |
| `moldura.css` | 79 | 🆕 021 — sede única da coluna do corpo |
| `cardiologia.css` | 47 | 010 |
| `puericultura.css` | 33 | 🆕 017 |
| `risco-cardiovascular.css` | 8 | 014 |

🟢 **A dívida de `globais.css` folgou mais:** a folha **encolheu** de 400 → 364 → **367** linhas ao ceder as três propriedades horizontais à `moldura.css`, e a regra nova nasceu em folha própria justamente para não a reabrir. Nenhuma folha acima de 400.

🟡 **Sobre a contagem de folhas:** as features 019 e 020 chamaram, cada uma, a sua de "sétima", por terem corrido em paralelo. O total corrente **medido nesta passagem é nove**.

---

# Camada de Shell e Infraestrutura

## Módulo 18 — `pages` 🟢 (features 017, 018, 019, 020)

🟢 **Sete rotas de página** (era cinco): a home, quatro calculadoras anteriores e as duas de puericultura (`/puericultura/crescimento`, `/puericultura/consulta`). Cada rota é casca `<Head>` + tela.

🟢 **`_app.tsx`** — importa a fundação Primer e as **nove** folhas próprias, na ordem, dentro de `ProvedorTemaPrimer`. Cada feature de tela acrescentou uma linha de `import`.

🟢 **Delta de contrato externo da feature 018:** os **doze metadados** das rotas mudaram — `<title>` uniformizado ao separador único e à caixa de frase, e a `description` da raiz corrigida de exatidão. A descrição deixou de ser prosa à mão e passou a ser verificada contra o `CATALOGO`; a do `manifest.webmanifest` foi revista **no mesmo ato** que o subtítulo da home, por serem o mesmo literal byte a byte.

## Módulo 19 — `pages/api/v1/status` 🟢 (features 002 e **022** — a inversão desta passagem)

🟢 **A descrição anterior está superada.** Onde a extração dizia handler síncrono sem dependência, devolvendo `{atualizado_em, versao, commit}`, hoje o handler é **`async`**, consulta o banco a cada requisição e devolve **seis** chaves:

| Campo | Origem | Observação |
|---|---|---|
| `atualizado_em` | `new Date().toISOString()` | instante da requisição — feature 002, intocado |
| `versao` | `package.json` | feature 002, intocado |
| `commit` | `VERCEL_GIT_COMMIT_SHA ?? "local"` | feature 002, intocado |
| 🆕 `publicado_em` | `APS_PUBLICADO_EM ?? null` | carimbo do **build**, substituído estaticamente por `next.config.ts`; não é a data do commit nem o instante da requisição |
| 🆕 `ambiente` | `VERCEL_ENV` traduzido | vocabulário **do produto**: `producao` / `pre-visualizacao` / `local` — amarrar aos nomes do provedor faria a troca de hospedagem virar mudança incompatível |
| 🆕 `banco` | `verificarBanco()` | `{estado: "integro"}` ou `{estado: "degradado", causa}` |

🟢 **200 em todo estado do banco (`MD-0031`).** As seis calculadoras são integralmente cliente e seguem servindo com a dependência caída; um 503 afirmaria queda de uma plataforma que está no ar. **O código responde se a rota funcionou; o corpo responde o que ela apurou.**

🟢 **A discriminação de método precede qualquer I/O:** 405 com `Allow: GET` não desperta a instância do banco. `Cache-Control: no-store` preservado. A mudança é **aditiva** e cabe em `/api/v1` pela regra que o próprio contrato escreveu para si.

## Módulo 20 — `infra` 🟢 (features 003 e **022**)

🟢 **`infra/` deixou de ser arquivo único.** Nasceu **`saude.ts`**, adaptador de uma função só que converte `ErroDeBanco` em valor e é o **único importador de `saude()` em produção** — o que mantém `database.ts` como ponto de acesso exclusivo ao banco. Não formata mensagem, não lê ambiente, não compõe resposta. Exceção que não seja `ErroDeBanco` é bug do contrato interno, e ainda assim não escapa: cai no balde `consulta` e faz barulho, porque derrubar o healthcheck trocaria degradação por indisponibilidade.

🟢 **`database.ts` — o teto passou a ser imposto no servidor.** O par fixo de 5.000 ms do driver deu lugar a orçamento configurável (`APS_TIMEOUT_SAUDE_MS`, padrão **3.000 ms**), aplicado como `connectionTimeoutMillis` **e** `statement_timeout` nos parâmetros de inicialização da sessão — o caminho quente não paga round-trip e o cancelamento fica a cargo do servidor. A escolha tem razão registrada: o `query_timeout` do `pg` é temporizador de cliente que **não cancela nada** e devolveria ao pool um cliente com resposta pendente. `query` aceita `{tetoMs}`, emite `set_config` só quando o teto difere do padrão, restaura o padrão no `finally` e descarta o cliente no caminho de estouro. Valor malformado cai no padrão **registrando log** — um `NaN` desligaria a proteção em silêncio.

🟢 **`CausaDeErroDeBanco` ganhou a quarta causa, `tempo_esgotado`**, que **retira casos** das duas existentes: o cancelamento pelo servidor (`57014`) deixa de cair em `consulta`, e o estouro na espera por conexão deixa de cair em `conexao`. Instância suspensa que demora a despertar deixa de ser lida como banco fora.

🔴 **O acoplamento mais frágil da passagem:** `ehEstouroDeTempo` reconhece o estouro de conexão por uma **frase** que o driver emite (`"connection terminated due to connection timeout"`), e precisa reconhecê-la **antes** de `ehErroDeConexao`, que casaria com o `"connection terminated"` de uma queda — outra coisa. Atualização de `pg` é gatilho de revisão. Está sob o watch W007 da feature 022.

🟢 Log estruturado JSON sem URL nem credencial, com host sempre mascarado; sem retentativa automática.

## Módulo 21 — 🆕 `scripts` (features 017–020, 022) 🟢 — a camada dev-time

🟢 **5.517 LOC em 23 arquivos `.mts`, volume comparável ao de um domínio inteiro, e que a extração anterior não conhecia de todo.** Não entra no bundle e não é importada por `models/`, `interface/` nem `pages/`. Roda no Node do `engines`, que executa TypeScript nativamente — sem `npx tsx`, e **sem dependência nova no manifesto**.

**Quatro geradores idempotentes, e um conferidor:**

| Script | Papel | Feature |
|---|---|---|
| `baixar-tabelas-oms.mts` | **Única leitura de rede** da cadeia; traz os `.xlsx` da OMS | 017 |
| `gerar-tabelas-oms.mts` + `oms/` (6 arq.) | `.xlsx` → 14 módulos TypeScript, conferindo `sha256` contra o manifesto | 017 |
| `congelar-casos-oraculo.mts` + `oraculo/` | Extrai 356 casos da OMS e 1.596 células do INTERGROWTH-21st das fontes originais | 017 |
| `congelar-fichas-caderneta.mts` | Congela ~350 rótulos das dez páginas verdes, em duas passagens e duas tiragens | 020 |
| `inventariar-textos.mts` + `textos/` (8 arq.) | Superfície textual → 1.187 literais com arquivo, linha e classe | 018 |
| `conferir-producao.mts` | Confere o SHA e a saúde da produção pela régua certa | 022 |

🟢 **Três promessas comuns a todos**, e são elas que fazem da camada um instrumento de auditoria e não um utilitário:

1. **Nenhuma escrita parcial** — tudo é lido, verificado e emitido em memória; o primeiro byte só chega ao disco quando o último passou. Uma falha na décima quarta tabela não deixa treze módulos novos ao lado de um antigo.
2. **Falha ruidosa e localizada** — a mensagem diz qual arquivo e em que verificação parou. Avisar e seguir seria o pior modo de falha possível.
3. **Idempotência byte a byte** — rodar duas vezes sobre as mesmas origens produz arquivos idênticos, e o **`git diff` vazio é a prova de que a origem não mudou**.

🟢 **Dois artefatos de propósito oposto no tempo** (feature 018): `inventario-textual.json` é **regerado** ao fim de toda revisão; `citacao-linha-de-base.json` **jamais** é regerado — é congelamento, e regerá-lo apagaria justamente o que ele existe para comparar.

🟢 **Por que árvore sintática e não expressão regular** (D-03 da 018): regex confunde literal exibido com a mesma sequência dentro de comentário, e este repositório é denso em comentário longo. O extrator distingue `StringLiteral`, template sem substituição e `JsxText` de trivia de comentário sem heurística nenhuma.

🟢 **O gerador não infere classe alguma** (D-04): autoral, citação e identificador são decisão declarada em `scripts/textos/classes/`, e candidato sem entrada **faz o gerador parar**, nomeando arquivo e linha. Classificar por diretório erraria nas duas direções e erraria em silêncio, revisando citação por omissão.

🟡 **Dívida amarela herdada e agravada:** `scripts/textos/classes/interface.mts` está em **684 linhas**, e já passava do teto de 400 antes da feature 020. É mapa de declarações, não lógica, e a exceção que o README concede a `models/puericultura/oms/tabelas/` **não o alcança nominalmente**. A saída natural é parti-lo por camada de tela.

🔴 **Limitação declarada do inventário:** literal montado por interpolação em tempo de execução (recusas de `elegibilidade.ts`, aviso de `medidas.ts`) fica **fora** do inventário por desenho do extrator, e o congelamento não o cobre.

---

## Testes (contexto para o Detetive)

🟢 **Aferido nesta passagem, e não copiado dos adendos:** `npx vitest run` em 28/07 → **67 arquivos, 816 testes, exit 0, 8,6 s**. Fora da suíte padrão correm 3 arquivos de contrato (exigem servidor de pé) e 6 roteiros e2e com 56 casos. Isso encerra a dívida **L-11**, que mantinha `architecture.md` §5 em "37 arquivos".

🟢 **A pirâmide cresceu nos três níveis nesta janela:**

- **Unidade** — 39 arquivos de domínio em seis pastas, uma por unit. `models/puericultura` traz o **oráculo congelado**: a suíte julga o motor com números extraídos das fontes originais, que não vieram dele (`MD-0010`). `models/contribuicao` traz propriedade com `fast-check` sobre o BR Code, mais o vetor conhecido do CRC.
- **Guardas de camada** — `invariantes.test.ts` de puericultura **varre** `models/puericultura/**` e falha se algum arquivo importar de fora, mencionar React/Next/Primer ou ler o relógio. Os outros quatro domínios clínicos seguem sem essa guarda: a fronteira ali continua confiada à disciplina.
- **Textos** — sete verificadores em `tests/unit/textos/`, todos vistos reprovar antes de aceitos.
- **Geométricas** — a guarda de enquadramento deixou de medir rota nomeada e passou a percorrer as rotas que o `CATALOGO` declarar, mais a home: **calculadora nova cai sob a guarda ao entrar no catálogo**.
- **Contrato** — a suíte da rota ganhou **alvo duplo**, lido de `API_BASE_URL_DEGRADADO` e pulado quando a variável falta, de modo que a suíte siga executável com um servidor só. A denylist é aferida sobre o corpo **realmente serializado**, nos dois estados do banco.

## Síntese de riscos e lacunas

1. 🔴 **`ehEstouroDeTempo` depende de frase do driver** (`infra/database.ts:110`). Atualização de `pg` é gatilho de revisão — watch W007 da feature 022.
2. 🟡 **Premissas clínicas a validar pelo prescritor**, acrescidas nesta janela: os 1.095 dias do limite de correção, a idade cronológica governando a posição de medida, a exibição em uma casa decimal (017); a ficha imediatamente anterior para idade intermediária (020). Somam-se às 13 herdadas de gestação, cardiopatia e risco CV.
3. 🟡 **O dado real é silencioso sobre metade da regra de cauda** (D-10.1): a prova de que ela não se aplica a estatura e perímetro cefálico vive em acervo sintético, porque `L = 1` em todas as 14 tabelas reais.
4. 🟡 **`scripts/textos/classes/interface.mts` em 684 linhas**, acima do teto, sem exceção nominal que o alcance.
5. 🟡 **Acoplamento residual `interface/comum` → `interface/calculadora`** (`preferencia-de-tema.ts`), sem movimento há oito features.
6. 🟢 **A dívida de `globais.css` seguiu folgando** — 367 linhas, e a regra nova da 021 nasceu em folha própria para não a reabrir.
7. 🟢 **Nenhuma lacuna 🔴 estrutural nos domínios novos:** os três chegam com fonte declarada (ou isenção declarada), referências, oráculo e testes.
