# Investigação: Puericultura — escores z de crescimento infantil

> Identificador: `017-puericultura-crescimento`
> Data: `2026-07-26`
> Papel deste documento: apurar o que `MD-0001` (campo ESTADO) e `requirements.md#10` deixaram
> explicitamente como trabalho técnico do `/reversa-plan`, e não como decisão de produto.

## 1. Pergunta que motivou a investigação

O `requirements.md` fixa **o que** deve acontecer com a criança pré-termo (RN-17: curvas
INTERGROWTH-21st entre 27 e 64 semanas pós-menstruais, sem IMC) e registra como lacuna 🟡
**como** se converte a medida em escore z nessas curvas, já que a fórmula LMS de RN-02 vale
para as curvas da OMS. Em segundo plano, ficaram por conferir o recorte das tabelas da OMS e a
granularidade de leitura entre 5 e 10 anos.

## 2. Resultado em uma linha

As curvas de pré-termo **não precisam de tabela**: a fonte publica equações fechadas de média e
desvio-padrão por semana pós-menstrual. As curvas da OMS **precisam**, e as tabelas expandidas
oficiais estão disponíveis, íntegras e com granularidade diária até os 5 anos.

## 3. Curvas INTERGROWTH-21st pós-natais: o modelo estatístico 🟢

O estudo de referência é o *Preterm Postnatal Follow-up Study* do INTERGROWTH-21st (Villar J,
Giuliani F, Bhutta ZA, Bertino E, Ohuma EO, Ismail LC et al., *Lancet Glob Health*
2015;3(11):e681–e691). O método declarado na seção estatística é claro em dois pontos:

1. **Não há assimetria a modelar.** A avaliação de resíduos não mostrou evidência de
   não-normalidade após transformação logarítmica, de modo que os autores dispensaram métodos
   que acomodam assimetria. Não há, portanto, `L` de LMS nem `ν`/`τ` de família assimétrica.
2. **Mediana e desvio-padrão são polinômios fracionários de segundo grau** ajustados em
   estrutura multinível (para as medidas repetidas do desenho longitudinal), sendo o
   desvio-padrão modelado a partir dos componentes de variância.

A consequência prática é a que interessa ao projeto: para cada semana pós-menstrual `x` e cada
sexo existem `μ(x)` e `σ(x)` dados por expressão fechada, e o escore z é a distância normal
padrão usual. Peso e comprimento vivem em escala logarítmica; o perímetro cefálico, em escala
natural.

```
peso (kg):        z = (ln(peso)        − μ_wfa(x))  / σ_wfa(x)
comprimento (cm): z = (ln(comprimento) − μ_lfa(x))  / σ_lfa(x)
perímetro (cm):   z = (perímetro       − μ_hcfa(x)) / σ_hcfa(x)

μ_wfa(x)  = 2,591277 − 0,01155·x^0,5 − 2201,705·x⁻² + 0,0911639·[masculino]
σ_wfa(x)  = 0,1470258 + 505,92394·x⁻² − 140,0576·x⁻²·ln(x)

μ_lfa(x)  = 4,136244 − 547,0018·x⁻² + 0,0026066·x + 0,0314961·[masculino]
σ_lfa(x)  = 0,050489 + 310,44761·x⁻² − 90,0742·x⁻²·ln(x)

μ_hcfa(x) = 55,53617 − 852,0059·x⁻¹ + 0,7957903·[masculino]
σ_hcfa(x) = 3,0582292 + 3910,05·x⁻² − 180,5625·x⁻¹

onde x = idade pós-menstrual em semanas exatas, 27 ≤ x ≤ 64,
e [masculino] vale 1 para o menino e 0 para a menina.
```

**Procedência dos coeficientes.** 🟡 Foram lidos da implementação de referência `gigs`
(rOpenSci; Parker SR, Vesel L, Ohuma EO), que os documenta como transcrição direta do artigo de
Villar 2015 e cita a mesma referência. Não foi possível abrir o texto integral no sítio do
Lancet (HTTP 403 a partir deste ambiente), de modo que a conferência coeficiente a coeficiente
contra a tabela impressa do artigo permanece **pendente e obrigatória** antes de o cálculo ir a
produção. A mesma implementação registra que o padrão peso-para-comprimento não consta do
artigo e foi fornecido diretamente pelos autores; esse padrão **não entra nesta feature** (a
caderneta não o reproduz), o que evita depender do único elemento de procedência indireta.

**Conferência de sanidade já executada.** Avaliando as expressões nos extremos e no meio da
janela, as medianas resultantes são clinicamente plausíveis e crescem monotonicamente:

| Idade pós-menstrual | Peso mediano (M / F) | Comprimento mediano (M / F) | Perímetro cefálico mediano (M / F) |
|---|---|---|---|
| 27 semanas | 0,672 / 0,613 kg | 32,7 / 31,7 cm | 24,8 / 24,0 cm |
| 36 semanas | 2,495 / 2,278 kg | 46,5 / 45,1 cm | 32,7 / 31,9 cm |
| 40 semanas | 3,433 / 3,134 kg | 50,9 / 49,3 cm | 35,0 / 34,2 cm |
| 50 semanas | 5,585 / 5,098 kg | 59,1 / 57,3 cm | 39,3 / 38,5 cm |
| 64 semanas | 7,787 / 7,109 kg | 66,8 / 64,7 cm | 43,0 / 42,2 cm |

Para o menino de 40 semanas pós-menstruais, a faixa de −2 a +2 desvios-padrão vai de 2,593 kg a
4,545 kg, o que corresponde ao esperado para um recém-nascido a termo.

**Ganho colateral da forma fechada.** Como a expressão é contínua em `x`, a idade pós-menstrual
pode entrar em semanas exatas fracionárias (dias ÷ 7) sem que nada seja interpolado: o valor
usado é o da própria curva, não uma estimativa entre dois pontos tabelados. A tensão entre
granularidade e fidelidade, que existe do lado da OMS, simplesmente não existe aqui.

**Alternativa descartada.** O sítio do projeto publica tabelas de z-score e de centis em PDF,
mas elas dão apenas os valores da medida em ±1, ±2 e ±3 desvios-padrão por semana. Usá-las
obrigaria a interpolar entre desvios para obter um escore intermediário, isto é, exatamente o
tipo de valor estimado que a clarificação vetou. Elas servem, porém, como **oráculo de
validação** (§6).

## 4. Curvas da OMS: fórmula, correção de cauda e a quem ela se aplica 🟢

A conversão é o método LMS de Cole, tal como a OMS o publica:

```
z = ((X / M)^L − 1) / (L · S)      quando L ≠ 0
z = ln(X / M) / S                  quando L = 0
```

A correção de cauda, que RN-03 já descreve, é o procedimento oficial da OMS para os indicadores
baseados em peso. A implementação de referência `gigs` a aplica quando `|z| > 3` e a **exclui
explicitamente** para perímetro cefálico e para comprimento/estatura-para-idade, o que confirma
RN-03 sem margem de dúvida:

```
z > 3:   z = 3 + (X − SD3⁺) / (SD3⁺ − SD2⁺)
z < −3:  z = −3 + (X − SD3⁻) / (SD2⁻ − SD3⁻)
```

onde `SDn±` é o valor do indicador em `z = ±n`, obtido da própria LMS. Note que os denominadores
são positivos nos dois casos, o que preserva o sinal da distância: é o ponto em que um erro de
implementação passa despercebido, e por isso ele tem teste próprio no §6.

## 5. Recorte, granularidade e as duas fronteiras dos 5 anos 🟢

As tabelas expandidas da OMS foram verificadas diretamente (download e leitura da planilha,
2026-07-26). Cada arquivo traz uma única aba com as colunas `L`, `M`, `S` e os valores em
±1 a ±4 desvios-padrão.

| Recorte | Índice de linha | Linhas | Disponibilidade |
|---|---|---|---|
| Padrões 2006, 0 a 5 anos | `Day`, 0 a 1856 | 1857 | verificada (peso, comprimento/estatura, IMC, perímetro cefálico) |
| Referência 2007, 5 a 10 anos | `Month`, 61 a 120 | 60 | verificada (peso 61–120; estatura e IMC publicados até 228, recortados em 120) |

Daí decorrem três achados que o plano converteu em decisão:

**Primeiro: as duas fronteiras dos 5 anos não coincidem.** A tabela de 0 a 5 anos vai até 1856
dias, que são 61 meses, e a referência de 5 a 10 anos começa justamente em 61 meses — a
sobreposição é de projeto, para transição suave. A caderneta, porém, troca a nomenclatura do
IMC aos 5 anos exatos, ou seja, aos 1826 dias. Entre 1826 e 1856 dias, portanto, vale a tabela
da faixa de baixo com os rótulos da faixa de cima (D-05 do roadmap).

**Segundo: o software oficial da OMS interpola, e nós não vamos interpolar.** O pacote
`anthroplus`, publicado pela própria Organização Mundial da Saúde, calcula o mês inferior e o
superior e interpola linearmente `L`, `M` e `S` entre eles em proporção à fração de mês
decorrida. A decisão travada na clarificação foi a oposta ("nenhum valor usado no cálculo é
estimado por nós"). A divergência é, por construção, limitada ao interior de um mês e ao
intervalo de 5 a 10 anos, onde as curvas já são rasas; abaixo dos 5 anos ela não existe, porque
a OMS publica por dia. A consequência prática recai sobre os testes: o oráculo externo só bate
exatamente em idades que caiam em mês inteiro (D-06 do roadmap).

**Terceiro: o arquivo de peso-para-idade de 5 a 10 anos é publicado com o nome errado.** A OMS
o hospeda na pasta `weight-for-age-(5-10-years)` com o nome `hfa-boys-z-who-2007-exp_<GUID>.xlsx`,
isto é, com o prefixo do indicador de estatura. O conteúdo está correto (a aba se chama
`wfa_boys_z_WHO 2007_exp` e os valores são de peso em quilogramas), mas quem confiar no nome do
arquivo embarca a curva errada sob o rótulo certo. Esse é o risco de maior consequência clínica
da feature inteira, e a mitigação está no contrato de aquisição
(`interfaces/tabelas-de-referencia.md`): a verificação é do conteúdo, jamais do nome.

## 6. Estratégia de oráculos: como saber que os números estão certos

A feature tem duas famílias de curvas e, felizmente, oráculos independentes para as duas.

| Alvo | Oráculo | Natureza |
|---|---|---|
| LMS da OMS, escore em ±1 a ±4 DP | As próprias colunas `SD1neg`…`SD4` da tabela expandida: a medida igual ao valor de `SDn` deve devolver `z = n` | exato, embutido no dado |
| Correção de cauda | Mesma tabela: o valor em `SD3` devolve exatamente 3; um ponto além dele cresce linearmente na razão `SD3 − SD2` | exato |
| Escore z em idades de mês inteiro, 5 a 10 anos | `anthroplus` (WHO) ou `gigs` | externo, concordância esperada dentro do arredondamento |
| Escore z abaixo de 5 anos | `gigs` / `anthro` (WHO) | externo, concordância exata esperada (sem interpolação em jogo) |
| Curvas de pré-termo | Tabelas de z-score publicadas pelo INTERGROWTH-21st (valores em ±1, ±2, ±3 DP por semana) | externo; a equação deve reproduzir a tabela impressa |
| Rótulos e faixas | Caderneta da Criança, pp. 88–97, leitura direta | editorial |

Recomendação de execução: gerar uma vez, com script descartável, uma amostra de casos e seus
escores pelo `gigs`/`anthroplus`, e congelá-la como arquivo de casos-oráculo no repositório. Isso
evita depender de R no ambiente de teste e deixa a conferência auditável no futuro, à maneira do
que a feature 014 fez ao validar os coeficientes das Pooled Cohort Equations contra `CVrisk` e
`PooledCohort`.

## 7. Volume de dados e impacto no bundle 🟡

Estimativa a partir dos recortes verificados:

| Bloco | Registros |
|---|---|
| Peso, comprimento/estatura e IMC, 0 a 5 anos, por dia, dois sexos | 3 × 2 × 1857 = 11.142 |
| Perímetro cefálico, 0 a 2 anos, por dia, dois sexos (recorte D-04) | 2 × 731 = 1.462 |
| Peso, estatura e IMC, 5 a 10 anos, por mês, dois sexos | 3 × 2 × 60 = 360 |
| **Total** | **12.964** |

A cerca de 26 caracteres por registro em arrays numéricos paralelos, o texto-fonte fica na ordem
de 340 kB, o que comprimido tende a algo entre 90 e 120 kB. É o maior dado já embarcado no
projeto e a única novidade de peso desta feature, daí a medição obrigatória de D-09. Duas
alavancas ficam disponíveis sem tocar no motor, caso a medição decepcione: separar os módulos
por sexo (metade do dado por avaliação) e trocar o `import` estático por dinâmico na borda da
interface, que a injeção por construtor (D-08) já permite.

## 8. Padrões aplicáveis já presentes no legado

- **Molde de domínio com tabela congelada:** `models/risco-cardiovascular/fonte-clinica.ts`
  guarda a matriz de coeficientes das Pooled Cohort Equations em `Object.freeze`, com o
  comentário citando a origem e a validação cruzada. A diferença de escala (dezenas contra
  milhares de registros) é o que justifica o dado sair para módulos próprios, não a natureza.
- **Recusa honesta:** `models/risco-cardiovascular/elegibilidade.ts` mostra o formato exato de
  `ForaDoEscopoDaFonte` com motivo discriminado, que aqui ganha três motivos
  (`IDADE_FORA_DA_COBERTURA`, `PC_ACIMA_DE_2_ANOS`, `ABAIXO_DA_CURVA_DE_PRETERMO`) e uma
  novidade: o segundo é **parcial**, suprime um índice sem derrubar os outros.
- **Aritmética de datas:** `models/gestacao/datas.ts` já resolve o problema de fuso com
  `paraDiasEpoch` sobre `Date.UTC` e trata calendário impossível como valor nulo, nunca exceção.
- **Proveniência fora do painel:** `interface/risco-cardiovascular/proveniencia.tsx` separa a
  nota de limitação do resultado, lendo o texto congelado no domínio.
- **Catálogo primeiro:** o README define a ordem de entrada de uma calculadora nova, e a feature
  014 é o precedente imediato de seção que ganha ficha.

## 9. Fontes consultadas

- Villar J et al. *Postnatal growth standards for preterm infants: the Preterm Postnatal
  Follow-up Study of the INTERGROWTH-21st Project.* Lancet Glob Health 2015;3(11):e681–e691.
  [PubMed 26475015](https://pubmed.ncbi.nlm.nih.gov/26475015/) ·
  [Lancet](https://www.thelancet.com/journals/langlo/article/PIIS2214-109X(15)00163-1/fulltext)
  (texto integral inacessível deste ambiente: HTTP 403)
- INTERGROWTH-21st. *Postnatal Growth Standards and z-scores for Preterm Infants.*
  [tabelas de z-score e centis](https://intergrowth21.tghn.org/articles/intergrowth-21st-postnatal-growth-standards-and-z-scores-preterm-infants/)
- Parker SR, Vesel L, Ohuma EO. *gigs: assess fetal, newborn, and child growth with
  international standards.* rOpenSci. [documentação](https://docs.ropensci.org/gigs/) ·
  código de `ig_png.R` e `who_gs.R` lido no repositório `ropensci/gigs`
- World Health Organization. *WHO Child Growth Standards* (2006) e *Growth reference data for
  5–19 years* (2007), tabelas expandidas com `L`, `M`, `S`:
  [padrões 0–5 anos](https://www.who.int/tools/child-growth-standards/standards) ·
  [referência 5–19 anos](https://www.who.int/tools/growth-reference-data-for-5to19-years)
- World Health Organization. *anthroplus* (pacote R oficial), repositório
  `WorldHealthOrganization/anthroplus`, arquivo `R/zscores.R` — fonte do achado sobre
  interpolação entre meses
- Cole TJ. *The LMS method for constructing normalized growth standards.* Eur J Clin Nutr
  1990;44(1):45–60. [PubMed 2354692](https://pubmed.ncbi.nlm.nih.gov/2354692/)
- *Caderneta da Criança — Menino / Menina*, Ministério da Saúde, 2.ª ed., Brasília, 2020,
  pp. 85–97 (fonte editorial; PDF ainda a obter em `referencias/`)
