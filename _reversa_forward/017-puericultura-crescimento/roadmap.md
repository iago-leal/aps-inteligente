# Roadmap: Puericultura — escores z de crescimento infantil

> Identificador: `017-puericultura-crescimento`
> Data: `2026-07-26`
> Requirements: `_reversa_forward/017-puericultura-crescimento/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA
> Categoria: **Produto** (Princípio nº 4 global) — rigor pleno mais premissas clínicas declaradas.

## 1. Resumo da abordagem

O quinto domínio nasce no molde estrutural de `models/risco-cardiovascular` (fachada única,
`fonte-clinica.ts` congelado, validação por coleta total, elegibilidade separada do cálculo)
e acrescenta a ele a novidade de peso do projeto: **dado tabular volumoso**. A abordagem
separa, dentro da mesma unit, as duas famílias de curvas que a caderneta imprime — as da OMS,
que exigem tabela LMS, e as do INTERGROWTH-21st para pré-termo, que **não exigem tabela
alguma**, porque a fonte publica equações fechadas (§3 de `investigation.md`; resolve a lacuna
🟡 principal de `requirements.md#10`).

O fluxo da fachada é `validar → datar → escolher o padrão → ler a régua → classificar`. A
datação produz três idades derivadas (cronológica, corrigida e pós-menstrual) em dias epoch
UTC; a escolha do padrão decide, por criança e não por índice, se a régua é INTERGROWTH-21st
ou OMS; a leitura converte medida em escore z (LMS com correção de cauda na OMS, μ/σ
polinomial no pré-termo); a classificação aplica os rótulos literais da caderneta e a troca de
nomenclatura do IMC aos cinco anos. Cada índice sai carimbado com o padrão, a idade usada e a
página — sem isso o número seria inauditável (RN-19).

As tabelas da OMS entram como módulos TypeScript gerados por script determinístico a partir das
tabelas expandidas oficiais, recortadas à cobertura da caderneta, e o `import` estático a partir
do domínio faz o `code-splitting` do Next isolar o custo na rota nova. A fachada aceita as
tabelas por construtor (com o padrão real por omissão), o que preserva a testabilidade e deixa
aberta a migração para carga dinâmica caso a medição do bundle exija.

## 2. Princípios aplicados

| Princípio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| I. A spec é a fonte de verdade | O `requirements.md` fixa o comportamento; este roadmap decide só o "como". Onde o plano descobriu algo que a spec não previu (a interpolação do software oficial da OMS, D-06), a divergência entra como decisão registrada e premissa, não como ajuste silencioso da spec | respeita |
| II. Cadeia de derivação | Toda decisão abaixo cita o RF/RN que a origina; nenhum artefato novo nasce sem RF correspondente. O `datas.ts` duplicado (D-07) é o único item sem RF próprio: entra como meio técnico de RF-05, com dívida declarada | respeita |
| III. Clarificação precede solução | A sessão de 26/07 fechou os três `[DÚVIDA]`; este plano não reabre decisão de produto, apenas apura o técnico que a própria clarificação delegou (`MD-0001`, campo ESTADO) | respeita |
| IV. Portão G1 | Requisitos travados em 26/07 (estágio `clarify` concluído em `.reversa/active-requirements.json`) | respeita |
| V. Fase 2 proporcional | Categoria Produto: coleção completa (roadmap, investigação, delta de dados, contrato de aquisição do dado, onboarding) | respeita |
| VI. Rastreabilidade bidirecional | Cada arquivo novo cita no cabeçalho o `RF-NN`; a matriz `_reversa_sdd/traceability/code-spec-matrix.md` ganha a quinta unit no `/reversa-sync` | respeita |
| VII. Testes como fonte de verdade | Oráculos externos independentes por família de curvas (§6 de `investigation.md`); property-based nos sete invariantes; um teste por cenário Gherkin | respeita |
| VIII. Proporcionalidade | Pirâmide inteira: unidade, integração, e2e com axe; sem contrato HTTP novo, logo sem suíte de contrato adicional | respeita |
| ADR 0011 (uma fonte por unit) | **Tensão registrada, não conflito.** A unit lê duas famílias de curvas numéricas (OMS e INTERGROWTH-21st). `MD-0001` já resolveu a leitura: a caderneta é a fonte editorial e ambas as curvas são o dado tabular que ela reproduz, com a própria caderneta determinando quando cada uma vale. O plano não altera essa leitura; apenas a materializa em dois subdiretórios distintos, sem mescla (D-01) | respeita |

Nenhum princípio de `.reversa/principles.md` é contrariado por esta feature.

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | Uma unit, dois subdiretórios de régua: `oms/` (LMS tabelado) e `intergrowth/` (equações fechadas), sem ponto de mescla; um único módulo `padrao.ts` decide qual vale | Preserva ADR 0011 na forma que `MD-0001` fixou e torna a fronteira auditável: a decisão de régua fica num arquivo só, testável isoladamente | (a) duas units separadas — quebraria a fachada única e duplicaria idade, validação e classificação; (b) um módulo único com `if` espalhado — a escolha de régua deixaria de ser inspecionável | 🟢 |
| D-02 | INTERGROWTH-21st pós-natal entra como **equações fechadas**, não como tabela: `μ` e `σ` por semana pós-menstrual (polinômios fracionários de Villar 2015), com `z = (ln(medida) − μ)/σ` para peso e comprimento e `z = (medida − μ)/σ` para perímetro cefálico | Resolve a lacuna 🟡 de `requirements.md#10`: a formulação é publicada, verificável e dispensa dado tabular. Como a equação é contínua, some também o problema de granularidade — nenhum valor é interpolado por nós (§3 de `investigation.md`) | (a) transcrever as tabelas de z-score do sítio do INTERGROWTH — só trazem os valores em ±1, ±2 e ±3 DP, o que forçaria interpolação entre desvios, justamente o que o usuário vetou; (b) digitalizar os centis dos gráficos da p. 87 — reconstrução aproximada de dado publicado em forma exata | 🟢 |
| D-03 | LMS da OMS embarcado a partir das **tabelas expandidas oficiais** (`.xlsx` do `cdn.who.int`), convertidas por script dev-time em módulos TypeScript versionados; o runtime nunca busca nada | `MD-0001` (arquivo versionado, reprodutibilidade temporal, Princípio 5.3). As tabelas expandidas trazem `L`, `M`, `S` **e** os valores em cada desvio-padrão, o que dá de graça o oráculo da correção de cauda | (a) baixar em build — dependência de servidor externo; (b) transcrever à mão — 13 mil registros; (c) depender de pacote npm de terceiros para as curvas — dependência de runtime nova e fonte indireta, contra o filtro de longevidade | 🟢 |
| D-04 | As tabelas são **recortadas à cobertura da caderneta** antes de virar código: perímetro cefálico só até 730 dias, demais índices até 120 meses | "Escopo = fonte" (`domain.md#8`) deixa de ser só uma checagem em tempo de execução e passa a ser propriedade do dado: o que a fonte não cobre não existe no repositório. De quebra, corta ~40% do volume do perímetro cefálico | Embarcar as tabelas completas da OMS (0–5 anos de PC, 5–19 anos de estatura e IMC) e recortar só na validação — dado morto no bundle e tentação futura de extrapolar | 🟢 |
| D-05 | Duas fronteiras distintas e explícitas: a **de rótulo**, aos 5 anos exatos (1826 dias), decidida pela caderneta (RN-06); e a **de tabela**, aos 61 meses (1856 dias), decidida pela OMS. Entre 1826 e 1856 dias vale a tabela 0–5 anos com os rótulos de 5–10 anos | As duas fronteiras não coincidem, e confundi-las produziria ora rótulo trocado, ora buraco de cobertura. Separá-las torna cada uma testável no seu próprio limite | Alinhar as duas em 1826 dias — criaria uma janela de 30 dias sem tabela; alinhar em 1856 — atrasaria em um mês a troca de nomenclatura que a fonte manda fazer aos 5 anos | 🟡 |
| D-06 | **Sem interpolação:** 0–5 anos lê o dia inteiro (a OMS publica por dia); 5–10 anos lê o mês completo, `mês = ⌊dias / 30,4375⌋`. Diverge deliberadamente do WHO AnthroPlus, que interpola `L`, `M` e `S` linearmente entre meses | Decisão de produto tomada na clarificação ("nenhum valor usado no cálculo é estimado por nós"), coerente com a leitura do gráfico impresso que a caderneta ensina. A divergência é pequena e sempre no interior de um mês (§5 de `investigation.md`) | Interpolar como o software oficial — mais fiel ao AnthroPlus, mas reabre uma decisão já travada e introduz valor estimado no cálculo | 🟡 |
| D-07 | A aritmética de datas em dias epoch UTC é **copiada** para `models/puericultura/datas.ts`, com a convergência para um `models/comum/` registrada como dívida | O `requirements.md#1` exige feature estritamente aditiva, e importar de `models/gestacao` acoplaria dois domínios que a arquitetura descreve como independentes (`architecture.md#1`). São ~40 linhas puras, já testadas, e o gêmeo fica declarado no cabeçalho dos dois arquivos | (a) importar de `models/gestacao/datas` — acoplamento entre domínios; (b) extrair já para `models/comum/datas.ts` e reapontar a gestação — tocaria motor existente, contra a spec | 🟡 |
| D-08 | Fachada síncrona `CalculadoraCrescimentoInfantil.avaliar(entrada)`, com o repositório de tabelas injetável pelo construtor e o real por omissão | Mantém o molde da família (`new Calculadora...()` sem argumento na tela) e ganha duas coisas: testes de unidade com tabelas sintéticas minúsculas e uma porta pronta caso D-09 exija carga dinâmica, sem refatorar o motor | Fachada que importa as tabelas diretamente — mais simples, mas fecharia a porta e obrigaria os testes a carregar 13 mil registros para exercitar uma regra de classificação | 🟢 |
| D-09 | Tabelas importadas estaticamente pelo domínio; o isolamento do custo fica por conta do `code-splitting` por rota do Next. **Verificação obrigatória** no fim da implementação: `next build` com comparação do *First Load JS* das outras rotas, que deve ficar inalterado | Atende ao RNF de desempenho sem introduzir assincronia no motor. O volume estimado é de ~13 mil registros, ~340 kB de texto cru (§7 de `investigation.md`), a confirmar por medição | Carga dinâmica por `import()` desde o início — tornaria a avaliação assíncrona e contaminaria a fachada pura por otimização ainda não demonstrada | 🟡 |
| D-10 | Correção de cauda aplicada **só** a P/I e IMC/I, com o par negativo e positivo derivados da própria LMS | RN-03, confirmado contra a implementação de referência `gigs`, que exclui explicitamente `hcfa` e `lhfa` do procedimento (§4 de `investigation.md`) | Aplicar a todos os índices — produziria escores errados de estatura e perímetro cefálico nas caudas; não aplicar a nenhum — devolveria escores irrealistas em desnutrição e obesidade graves | 🟢 |
| D-11 | O IMC é calculado sobre o comprimento/estatura **já convertido** pela regra dos 0,7 cm | A tabela de IMC da OMS é indexada pela mesma medida que a tabela de estatura; usar a medida bruta num índice e a convertida no outro produziria incoerência interna no mesmo resultado | Calcular o IMC com a medida bruta — mais próximo do "dado como medido", porém inconsistente com a régua que o lê | 🟢 |
| D-12 | Seção `puericultura` como quarta entrada de `interface/inicio/catalogo.ts`, rota `/puericultura/crescimento`, ícone `SmileyIcon` em `interface/inicio/icones.tsx` | Molde do README (catálogo primeiro, anti-drift) e da feature 014. O ícone é decorativo e existe na versão pinada de `@primer/octicons-react` (verificado) | `PersonIcon` e `HeartIcon` — o primeiro é genérico demais, o segundo já designa cardiologia | 🟢 |
| D-13 | Escore z exibido com **uma casa decimal e sinal sempre explícito**; o valor não arredondado permanece no objeto de saída, disponível para teste e para exibição futura | Fecha a lacuna 🟡 de precisão de `requirements.md#10` sem sobrecarregar a tela; a caderneta lê faixa, não centésimo | Duas casas decimais — precisão que a leitura clínica não usa; exibir o valor bruto — ruído numérico de ponto flutuante em tela | 🟡 |

## 4. Premissas

Nenhum marcador `[DÚVIDA]` restou no `requirements.md`: as premissas abaixo vêm dos pontos 🟡
já registrados na seção 10 daquele documento, ou nasceram da apuração técnica deste plano.

| Premissa | Origem (`requirements.md` seção) | Risco se errada |
|----------|----------------------------------|-----------------|
| Ler a tabela sem interpolar (mês completo entre 5 e 10 anos) é aceitável clinicamente, ainda que o software oficial da OMS interpole | §10 (granularidade) + D-06 | Divergência de escore contra o AnthroPlus dentro do mês; magnitude pequena, mas o número da ferramenta não bateria com o do software de referência numa auditoria |
| A troca de rótulos do IMC ocorre aos 5 anos exatos de idade **cronológica ou corrigida**, conforme a idade que estiver valendo para a leitura da curva | §4 RN-06 + RN-16 | Num prematuro entre 4a11m e 5a de idade corrigida, o rótulo sairia da faixa errada da fonte |
| As faixas de plausibilidade da validação (peso ≤ 150 kg, comprimento 20–200 cm, PC 20–70 cm, IG 22–42 semanas) são bom senso clínico, não da fonte | §10 | Recusa de medida legítima em caso extremo, ou aceitação de erro grosseiro de digitação |
| O recorte das tabelas da OMS é 2006 para 0–5 anos e 2007 para 5–10 anos, que é o que a caderneta reproduz | §10 | Curva errada sob rótulo certo: o pior modo de falha possível nesta feature |
| A precisão de exibição do escore z é de uma casa decimal | §10 + D-13 | Nenhum risco clínico; ajuste de apresentação |
| A nomenclatura literal dos rótulos de comprimento no material da menina é transcrita como está na fonte, mesmo onde a concordância destoa | §10 | Divergência de texto entre a tela e o documento impresso que o médico tem à mão |

## 5. Delta arquitetural

Feature aditiva: nenhum componente existente muda de comportamento. As duas alterações em
arquivos existentes (catálogo e ícones) são de extensão, no ponto que o próprio README define
como o de entrada de calculadora nova.

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| `models/puericultura` | `_reversa_sdd/architecture.md#1` (família de domínios) | componente-novo | Quinto domínio puro, sob os sete invariantes de `domain.md#7`; fachada `CalculadoraCrescimentoInfantil` |
| `models/puericultura/oms` | — | componente-novo | Leitura LMS com correção de cauda (D-10) e o dado tabular gerado (D-03) |
| `models/puericultura/intergrowth` | — | componente-novo | Equações fechadas de μ e σ por semana pós-menstrual (D-02); sem dado tabular |
| `models/puericultura/padrao.ts` | — | componente-novo | Única fronteira entre as duas réguas (D-01) |
| `models/puericultura/datas.ts` | `models/gestacao/datas.ts` (ADR 0013) | componente-novo (gêmeo declarado) | Cópia da aritmética em dias epoch UTC, com dívida de convergência (D-07) |
| `interface/puericultura` | `_reversa_sdd/code-analysis.md#Módulo 9 — interface/risco-cardiovascular` | componente-novo | Tela sem ritual de revisão, com `proveniencia.tsx` fora do painel de resultado |
| `pages/puericultura/crescimento.tsx` | `pages/cardiologia/risco-cardiovascular.tsx` | componente-novo | Rota com metadados próprios |
| `interface/inicio/catalogo.ts` | `_reversa_sdd/code-analysis.md#Módulo 10` | regra-alterada (extensão) | Quarta seção, `puericultura`, com uma ficha de calculadora |
| `interface/inicio/icones.tsx` | `_reversa_sdd/code-analysis.md#Módulo 10` | regra-alterada (extensão) | Entrada `puericultura → SmileyIcon` no mapa |
| `scripts/gerar-tabelas-oms.ts` | — | componente-novo (dev-time) | Conversor determinístico `.xlsx` → módulos TS, fora do bundle e fora do runtime |
| `e2e/axe-baseline.json` | `README.md` §e2e | regra-alterada (só se necessário) | A linha de base só muda por decisão registrada; a meta é delta 0/0 |

Camadas preservadas: `pages → interface/* → models/*`, sem via de volta. Nenhuma dependência de
runtime nova (`package.json` intocado); o script gerador roda com as ferramentas já presentes.

## 6. Delta no modelo de dados

- Resumo das mudanças: nenhuma persistência é criada — a plataforma segue sem dado clínico
  durável (ADR 0002). O delta é de **dado de referência embarcado**: cerca de 13 mil registros
  `L/M/S` da OMS, gerados em módulos TypeScript versionados, e nenhum registro para o
  pré-termo, cujas curvas são equações. As entidades de cálculo são efêmeras, em memória, como
  nos quatro domínios atuais.
- Detalhe completo em: `_reversa_forward/017-puericultura-crescimento/data-delta.md`

## 7. Delta de contratos externos

Nenhum contrato de rede muda: `GET /api/v1/status` fica intocado, não há endpoint novo e a
tela não faz requisição alguma. Existe, porém, um contrato de **arquivo** que precisa ser
explícito, porque dele depende a correção clínica de todos os números da feature.

| Contrato | Tipo | Arquivo de detalhe |
|----------|------|--------------------|
| Tabelas de referência da OMS (aquisição, formato, verificação) | arquivo (dev-time) | `_reversa_forward/017-puericultura-crescimento/interfaces/tabelas-de-referencia.md` |

## 8. Plano de migração

Não há migração de dados nem de esquema. A sequência de implantação é a de uma feature aditiva:

1. Obter a fonte editorial (PDF da *Caderneta da Criança*, meninos e meninas) em `referencias/`,
   pasta ignorada pelo git, e fixar as páginas 85 a 97 como origem dos rótulos literais.
2. Rodar o script gerador, conferir os valores-âncora contra as tabelas publicadas e commitar os
   módulos de dados junto do gerador que os produziu.
3. Implementar domínio, tela e rota; o catálogo entra primeiro, como manda o README.
4. Medir o bundle (D-09) antes de considerar a feature pronta.
5. Publicar: nenhuma variável de ambiente, nenhuma migração de banco, nenhum passo manual em
   produção.

Reversão: remover a entrada do catálogo devolve a plataforma ao estado anterior sem tocar em
nenhum motor existente.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Baixar a tabela errada da OMS: o arquivo de peso-para-idade de 5 a 10 anos é publicado com nome `hfa-…` e sufixo GUID, e o de altura tem nome quase idêntico | alto — curva errada sob rótulo certo, o pior modo de falha da feature | média | O gerador valida o conteúdo, não o nome: confere o cabeçalho da planilha, a faixa de índices e valores-âncora conhecidos antes de escrever qualquer arquivo (`interfaces/tabelas-de-referencia.md`) |
| Erro de sinal ou de denominador na correção de cauda | alto — escore muito errado justamente na desnutrição e na obesidade graves | média | Oráculo direto: as tabelas expandidas trazem os valores em ±2 e ±3 DP, de modo que a medida no ponto `SD3` deve devolver exatamente `z = 3` |
| Confundir as duas fronteiras dos 5 anos (D-05) | alto — rótulo trocado ou buraco de cobertura de 30 dias | média | Testes de limite nos quatro pontos: 1825, 1826, 1855 e 1856 dias |
| Volume das tabelas degradar a rota nova ou vazar para as outras | médio | média | Medição obrigatória no `next build` (D-09) e porta de injeção já pronta (D-08) para migrar à carga dinâmica sem tocar no motor |
| Divergência contra o software oficial da OMS por não interpolar (D-06) | médio — auditoria externa acharia diferença | alta (é consequência assumida) | Documentar na nota de proveniência da tela que a leitura é por dia até 5 anos e por mês completo depois; oráculos de teste ancorados em idades de mês inteiro |
| Idade corrigida aplicada além do limite, ou não aplicada dentro dele | alto — classificação errada em prematuro | média | Testes de limite em 2 anos, 3 anos e no par 64/65 semanas pós-menstruais, com o padrão declarado na saída conferido em cada um |
| A caderneta não está em `referencias/` hoje; os rótulos literais dependem dela | médio — transcrição por memória seria inaceitável | alta | Bloqueio explícito: nenhuma linha de `fonte-clinica.ts` é escrita antes de o PDF estar à mão (passo 1 do §8) |
| Cobertura de `models/**` cair abaixo de 90% por causa do volume de dados | baixo | baixa | Os módulos de dados são objetos literais integralmente carregados no `import`; se ainda assim distorcerem a métrica, excluí-los do `include` de cobertura por decisão registrada |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] `cross-check.md` (se executado) sem CRITICAL nem HIGH
- [ ] `regression-watch.md` gerado
- [ ] Suíte verde: unidade, integração, e2e com axe em delta 0/0 na rota nova
- [ ] Cobertura de `models/**` ≥ 90%, com o quinto domínio incluído
- [ ] Todos os cenários Gherkin de `requirements.md#7` cobertos por teste nomeado
- [ ] Oráculos externos conferidos nas duas famílias de curvas (§6 de `investigation.md`)
- [ ] Bundle medido (D-09): *First Load JS* das rotas existentes inalterado
- [ ] Nenhum arquivo de **código** acima de 400 linhas e nenhuma função acima de 50; a exceção
      vale só para os módulos de dados gerados
- [ ] Re-extração reversa executada e sem regressão vermelha (recomendado, não obrigatório)

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-26 | Versão inicial gerada por `/reversa-plan`; lacuna 🟡 do modelo estatístico das curvas de pré-termo resolvida na investigação (D-02) | reversa |
