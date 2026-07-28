# Delta de dados: ficha de consulta de puericultura

> Feature: `020-consulta-puericultura-soap`
> Data: `2026-07-28`
> Base: `_reversa_sdd/erd-complete.md` (Domínio 5) e `_reversa_sdd/data-dictionary.md`

## 1. Natureza do delta

**Não há persistência, não há migração, não há schema.** O banco PostgreSQL do healthcheck
permanece sem dado clínico (`SELECT 1`), e o único durável do sistema continua sendo a preferência
de tema em `localStorage` (ADR 0002). O delta tem duas naturezas, ambas em código:

1. **Acervo estático declarado** — as dez fichas, seus campos e rótulos, importados como módulos.
   É a mesma natureza do acervo tabular da 017 (`oms/tabelas`), com uma diferença que decide o
   plano: aquele é dado numérico gerado, este é **texto citado escrito à mão**.
2. **Entidades em memória** — o preenchimento e o registro montado, efêmeros por sessão de tela.

## 2. Entidades novas

### 2.1 Acervo declarado (`models/puericultura/consulta/fichas/`)

```
Ficha
  id            : identificador estável ("primeira-semana", "quarto-mes", …)
  titulo        : citação — o título impresso ("Consulta do 4º Mês")
  pagina        : número da página impressa de onde a ficha foi transcrita
  faixaEmDias   : { de, ate } — a janela que a sugestão por idade consulta (D-07)
  secoes        : SecaoDaFicha[]

SecaoDaFicha
  numero        : o número impresso na fonte (1, 2, 3…), preservado por ser parte do rótulo
  titulo        : citação — "Aleitamento/alimentação", "Sinais de alerta", …
  campos        : Campo[]

Campo (união discriminada por `natureza`)
  id            : identificador estável dentro da ficha
  rotulo        : citação — o texto impresso, byte a byte
  rotuloFeminino: citação — a flexão da tiragem feminina, quando difere (D-06)
  natureza      : "marcacao" | "escolha" | "medida" | "texto"
  secaoSoap     : "S" | "O" | "A" | "P"        ← estruturação AUTORAL (RN-09)
  pagina        : página impressa de onde este rótulo veio
  sexos         : Sexo[] — presente só quando o campo não se aplica aos dois (D-05, MD-0026)
  opcoes        : citação[] — só em `escolha` ("Leite materno exclusivo", …)
  unidade       : "g" | "cm" — só em `medida`
  vinculoAntropometrico : "peso" | "comprimento" | "perimetroCefalico" — só em `medida`,
                  liga o campo à entrada da calculadora da 017 (D-08)
```

Volume estimado: **dez módulos**, entre 30 e 45 campos cada, na ordem de 350 campos e um número
semelhante de rótulos de classe `citação`. Cada módulo abaixo do teto de 400 linhas por construção
(D-02).

### 2.2 Preenchimento (em memória, na camada de interface)

```
Preenchimento
  fichaId       : id da ficha escolhida
  respostas     : Map<idDoCampo, Resposta>

Resposta (união por natureza do campo)
  marcacao      : "sim" | "nao"
  escolha       : índice ou rótulo da opção escolhida, mais o complemento livre quando a fonte o imprime
  medida        : número bruto como digitado, mais a unidade do campo
  texto         : cadeia livre
```

Campo sem entrada em `respostas` **é** campo não preenchido, e não aparece no registro (RN-10). A
ausência é modelada pela ausência, e não por um valor sentinela.

### 2.3 Contexto da consulta (em memória)

```
ContextoDaConsulta
  sexo                     : Sexo                      ← reusa `models/puericultura/tipos`
  dataDeNascimento         : DataIso
  dataDaConsulta           : DataIso
  idadeGestacionalAoNascer : IdadeGestacional | ausente
  idades                   : IdadesDerivadas           ← REUSO integral da 017 (RN-05, D-01)
  posicaoDaMedicao         : PosicaoDaMedicao | ausente ← campo AUTORAL (D-09)
```

Nenhum campo identifica a criança (RN-12): sem nome, prontuário, documento ou endereço. O vínculo
com a pessoa é feito pelo prontuário onde o texto será colado.

### 2.4 Registro montado (saída do domínio)

```
RegistroDaConsulta
  tipo            : "registro"
  ficha           : { id, titulo, pagina }
  idadeDeclarada  : { especie: EspecieDeIdade, texto }   ← qual idade governou (RN-05)
  secoes          : SecaoDoRegistro[]                     ← só as que têm item (RN-10)
  notas           : NotaDoRegistro[]                      ← proveniência, autoria do SOAP, supressão
  referencias     : ReferenciaClinica[]                   ← nunca vazia (invariante 3 da família)

SecaoDoRegistro
  secao           : "S" | "O" | "A" | "P"
  titulo          : autoral — "Subjetivo", "Objetivo", "Avaliação", "Plano"
  itens           : ItemDoRegistro[]

ItemDoRegistro
  rotulo          : citação — o rótulo do campo, como a fonte o imprime
  valor           : o que foi preenchido, já em forma de leitura
  origem          : "ficha" | "calculadora-de-crescimento"
```

Os escores z e a classificação nutricional entram como `ItemDoRegistro` de origem
`calculadora-de-crescimento`, carregando a `ReferenciaClinica` que a fachada da 017 já emite
(RF-10). O domínio da 020 **não** recalcula nada: recebe o `ResultadoAvaliacao` pronto.

## 3. Entidades alteradas

Nenhuma. `EntradaAvaliacao`, `IdadesDerivadas`, `ResultadoAvaliacao` e todo o contrato de
`models/puericultura/tipos.ts` são consumidos **como estão**. A feature não acrescenta campo,
não muda cardinalidade e não altera invariante do Domínio 5 já modelado no `erd-complete.md`.

## 4. Constantes textuais novas no domínio

No molde anti-drift de `NOTA_PROVENIENCIA` e `NOTA_CORRECAO_DE_CONCORDANCIA`, a tela não escreve
texto próprio sobre a fonte. Nascem em `models/puericultura/consulta/fonte-clinica.ts`:

| Constante | O que declara | Origem |
|---|---|---|
| `NOTA_ORGANIZACAO_EM_SOAP` | Que a matéria é da caderneta e a organização em quatro seções é do produto | RN-09, RF-12 |
| `NOTA_FICHAS_AUSENTES` | Que as pp. 67, 68 e 75 ficaram fora desta entrega, nomeando-as | RN-03, RF-12 |
| `NOTA_SUPRESSAO_DE_CAMPO` | Que "Criptorquidia" é impressa nas duas tiragens e foi suprimida na ficha feminina | RN-08, `MD-0026` |
| `NOTA_NADA_E_SALVO` | Que recarregar a página descarta o preenchimento | RN-13, RF-13 |
| `REFERENCIAS_DA_CONSULTA` | As páginas 66 a 75 como `ReferenciaClinica`, no molde de `REFERENCIAS` | invariante 3 |

## 5. Migração

n/a. Não há dado antigo, não há dado novo em repouso, não há conversão a fazer. A ordem de
construção que substitui a migração está em `roadmap.md` §8.

## 6. Acervo dev-time (fora do bundle)

O congelamento do oráculo de transcrição (D-12) produz, em `tests/apoio/`, o texto bruto das
páginas 66 a 75 das duas tiragens, em duas extrações. É arquivo de teste versionado, no precedente
de `scripts/congelar-casos-oraculo.mts`: não é importado por código de aplicação, não entra no
bundle e existe para que a suíte julgue a transcrição com um texto que não veio de quem transcreveu
(`MD-0010`).
