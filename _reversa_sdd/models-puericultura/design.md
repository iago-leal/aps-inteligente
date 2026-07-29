# `models/puericultura` — Design Técnico

> Reversa Writer, re-extração nº 4 (2026-07-28). Feature `017-puericultura-crescimento`.
> Motor puro, sem dependência de framework (ADR 0003) e sem I/O.

## Interface

Fachada única, no molde dos quatro domínios anteriores.

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `CalculadoraCrescimentoInfantil` | `new (repositorio?: RepositorioDeTabelasOms)` | — | Acervo injetável, com `REPOSITORIO_OMS` por omissão: a tela instancia sem argumento. |
| `.avaliar` | `(entrada: EntradaAvaliacao)` | `SaidaAvaliacao` | Único método público. Puro e determinístico. |
| `validarEntrada` | `(entrada: EntradaAvaliacao)` | `Ofensor[]` | Coleta total; lista vazia significa entrada válida. |
| `derivarIdades` | `(entrada: EntradaAvaliacao)` | `IdadesDerivadas` | Lança `ErroDeInvariante` se as datas vierem fora de ordem, o que a validação já barrou. |
| `escolherPadrao` | `(idades: IdadesDerivadas)` | `EscolhaDePadrao` | Ponto único de fronteira entre as duas réguas. |
| `lerLms` | `(indice, sexo, diasDeVida, repositorio?)` | `LeituraLms` | Devolve `lida` com `parametros`, `unidade` e `chave`, ou `sem-tabela` com motivo. |
| `escoreZ` | `(medida, parametros, aplicaCauda)` | `number` | LMS com correção de cauda condicional. |
| `escoreZPreTermo` | `(medida, valor, sexo, semanasPosMenstruais)` | `number` | Curvas INTERGROWTH-21st como equações fechadas. |
| `classificar` | `(indice, escoreZ, diasParaRotulo)` | `string` | Rótulo literal da caderneta. |
| `converterPosicao` | `(comprimentoCm, posicaoInformada, diasDeVida)` | `ComprimentoParaAvaliar` | Valor convertido mais aviso, ou aviso nulo. |

### Entrada

`EntradaAvaliacao` traz sexo, as duas datas em ISO `AAAA-MM-DD`, as três medidas opcionais,
a posição da medição e a idade gestacional ao nascer, também opcional. Nenhum campo
identifica a criança. A data da medição é injetada pela interface: o motor não lê o relógio.

### Saída

`SaidaAvaliacao` é união discriminada por `tipo`:

- `resultado` — `idades`, `indices`, `notas`, `notaProveniencia` e `referencias`;
- `fora-do-escopo` — recusa global, com `motivo`, `mensagem` e `referencia`;
- `erro-validacao` — lista de `Ofensor`.

Dentro do resultado, cada índice é união discriminada por `estado`, e não por `tipo`. A
escolha é deliberada: um resultado com quatro índices teria cinco campos `tipo` de
significados distintos, e o leitor não saberia qual deles governa o quê. 🟢

| `estado` | Campos | Quando ocorre |
|----------|--------|---------------|
| `calculado` | `escoreZ`, `classificacao`, `padrao`, `idadeUsada`, `avisos`, `referencia` | Medida presente e índice dentro do escopo. |
| `ausente` | `motivo` (`MEDIDA_NAO_INFORMADA` ou `IMC_INEXISTENTE_NO_PRETERMO`) | Medida não informada, ou índice que a régua do pré-termo não publica. |
| `fora-do-escopo` | `motivo` (`PC_ACIMA_DE_2_ANOS`), `mensagem`, `referencia` | Recusa **parcial**, que não derruba os demais índices. |

O escore z sai sem arredondamento; exibi-lo com uma casa decimal é responsabilidade da tela.

## Fluxo Principal

1. **Validar** (`validacao.ts`). Coleta total dos ofensores. Havendo algum, retorna
   `erro-validacao` e nada mais é computado.
2. **Datar** (`idades.ts`). Deriva `diasDeVida` por subtração em dias epoch UTC, o desconto
   de prematuridade, `diasCorrigidos`, o sinalizador `correcaoAtiva` e as semanas
   pós-menstruais, nulas quando a criança é a termo.
3. **Escopo global** (`elegibilidade.ts`). Recusa abaixo de 27 semanas pós-menstruais e acima
   de 3.682 dias corrigidos.
4. **Medidas** (`medidas.ts`). Converte a posição quando ela difere da esperada para a idade
   **cronológica** e calcula o IMC sobre a medida **já convertida**.
5. **Escolher a régua** (`padrao.ts`). Entre 27 e 64 semanas pós-menstruais, INTERGROWTH-21st;
   nos demais casos, OMS indexada por `diasCorrigidos`.
6. **Avaliar cada índice**, na ordem da caderneta. O escopo da fonte é testado **antes** do
   preenchimento: dizer "medida não informada" numa criança de três anos sugeriria que o
   perímetro cefálico deveria ter sido informado, quando a caderneta simplesmente não o
   classifica nessa idade.
7. **Montar o resultado**, com as notas sobre a correção que houve ou não houve, a nota de
   proveniência e a lista de referências.

```
avaliar → validar → datar → escopo global → medidas → régua → [4 × índice] → resultado
```

### Dentro de um índice

```
perímetro cefálico acima de 730 dias? → fora-do-escopo (parcial)
medida ausente? → ausente (com o motivo certo entre os dois)
régua INTERGROWTH-21st? → z = (observado − μ)/σ, escala log no peso e no comprimento
régua OMS?           → lerLms → escoreLms → correção de cauda quando cabe
                     → classificar → calculado
```

## Fluxos Alternativos

- **Idade gestacional ausente.** A criança é tratada como a termo, e o resultado traz a nota
  `PREMISSA_DE_TERMO`, que diz ao prescritor o que foi suposto e o que muda se a suposição
  estiver errada. 🟢
- **Nascida a termo com IG informada.** Nota `NASCIDO_A_TERMO_SEM_CORRECAO`, que registra a IG
  lida e a razão de não haver correção. 🟢
- **Pré-termo fora do período de correção.** Mesma nota, com redação distinta: a partir dali
  a leitura passa a usar a idade cronológica. 🟢
- **Entre 1.826 e 1.856 dias.** A tabela ainda é a de 0–5 anos, mas os rótulos já são os de
  5–10. É a única faixa em que as duas fronteiras discordam, e discordam de propósito. 🟢
- **Sem linha na tabela após a elegibilidade ter passado.** `ErroDeInvariante`: a recusa
  cabia à elegibilidade, e chegar aqui é bug interno. 🟢

## Dependências

- `models/puericultura/oms/tabelas/*` — 14 módulos gerados (12.964 linhas L/M/S) mais
  `manifesto.json` com o `sha256` de cada planilha de origem. Gerados por
  `scripts/gerar-tabelas-oms.mts`, que **não** entra no bundle (ADR 0018).
- Nenhuma dependência externa de runtime. A unit não importa framework, biblioteca de datas
  nem cliente HTTP.
- `models/gestacao/datas.ts` é **gêmeo declarado**, não dependência: as duas units mantêm
  cópias da mesma aritmética de dias epoch. A duplicação é dívida registrada nesta passagem.

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| A escolha da régua é por criança, e mora num arquivo só. | `padrao.ts:escolherPadrao` | 🟢 |
| A lista de índices que recebem correção de cauda é dado, não `if`. | `oms/lms.ts:INDICES_COM_CORRECAO_DE_CAUDA` | 🟢 |
| Os cortes de classificação são modelados (`acimaDe`, `aPartirDe`, `abaixoDeTudo`) em vez de encadeados, de modo que a borda `> +2` contra `≥ −2` fique visível. | `fonte-clinica.ts:CorteDeClassificacao` | 🟢 |
| O acervo de tabelas é porta injetável, não `import` chumbado no cálculo. | `oms/leitura.ts:RepositorioDeTabelasOms` | 🟢 |
| A leitura devolve `sem-tabela` com motivo, e a política clínica de recusa fica em `elegibilidade.ts`. | `oms/leitura.ts:MotivoSemTabela` | 🟢 |
| A conferência de coerência do dado gerado (`conferirTabela`) roda na montagem do acervo, porque unidade trocada produziria escore silenciosamente errado. | `oms/leitura.ts:conferirTabela` | 🟢 |
| As curvas de pré-termo entraram como equações fechadas, sem tabela. | `intergrowth/equacoes.ts`; `MD-0002` | 🟢 |
| A correção de concordância de dois rótulos vive em constante própria, e não emendada na nota de proveniência. | `fonte-clinica.ts:NOTA_CORRECAO_DE_CONCORDANCIA`; `MD-0015` | 🟢 |
| O IMC é calculado sobre o comprimento já convertido, e o aviso da conversão acompanha os dois índices. | `medidas.ts:derivarMedidas`; `calculadora.ts:avisosDoIndice` | 🟢 |

## Estado Interno

Nenhum entre chamadas. A única coisa que a instância guarda é o repositório de tabelas
recebido no construtor, e ele é somente-leitura. Duas chamadas com a mesma entrada devolvem
resultados iguais em qualquer ordem. 🟢

## Observabilidade

Não emite log, métrica nem trace: é domínio puro, e a plataforma tem telemetria nula por
decisão (ADR 0007). A auditabilidade vem do próprio retorno — `idadeUsada`, `padrao` e
`referencia` por índice, mais `notas` e `referencias` no resultado. 🟢

## Riscos e Lacunas

- 🟡 **A correção de cauda tem meia prova no dado real.** Nas 14 tabelas, comprimento/estatura
  e perímetro cefálico trazem `L = 1`, e com `L = 1` a LMS já é linear: corrigir e não
  corrigir diferem em 1e-14. A prova de que a cauda **não** se aplica a esses dois vive em
  acervo sintético com `L ≠ 1`. O dado real é silencioso sobre essa metade.
- 🟡 **As faixas de plausibilidade são bom senso clínico**, não da fonte. Peso de 0 a 150 kg,
  comprimento de 20 a 200 cm, perímetro cefálico de 20 a 70 cm, IG de 22 a 42 semanas.
- 🟡 **A fronteira da correção estendida usa o ano de 365 dias corridos**, não a data civil de
  aniversário, para que as duas fronteiras da mesma regra se meçam na mesma unidade.
- 🟢 **`ULTIMO_DIA_COBERTO = 3682`** vem de o mês 120 cobrir os dias 3.653 a 3.682; o dia
  3.683 já seria o mês 121, que a fonte não publica.
- 🔴 Nenhuma lacuna que impeça reimplementação. As premissas clínicas em aberto estão em
  `questions.md`.
