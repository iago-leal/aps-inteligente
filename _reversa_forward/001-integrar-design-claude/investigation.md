# Investigation: Integração do design aprovado da calculadora

> Identificador: `001-integrar-design-claude`
> Data: `2026-07-19`
> Papel deste documento: registrar a **extração citada do guia** (pré-condição do plano, decidida na sessão de esclarecimentos) e as alternativas técnicas avaliadas.

## 1. Extração citada do Guia Rápido DM (SMS-Rio, 2.ª ed. 2023)

Fonte: PDF fornecido pelo usuário em 2026-07-19 (`/Users/iagoleal/Downloads/Livro_GuiaRapido-DiabetesMellitus_PDFDigital_20231113.pdf`, fora do versionamento por MD-0008). Método: extração de texto página a página (poppler/pdftotext 26.01.0), com número de página impressa conferido pelo rodapé. Cada citação abaixo alimenta as constantes novas de `fonte-clinica.ts`.

### 1.1 Metformina — posologia e dose otimizada

- **p. 58** (tabela "Fármacos orais", Biguanidas): posologia **1000–2550 mg/dia em 2 a 3 tomadas** após as refeições; iniciar com doses baixas (500 mg ou meio comprimido de 850 mg); após 5–7 dias sem efeitos adversos, aumentar para 850–1000 mg/dia; intolerância → metformina XR 500 mg.
- **p. 28** (Etapa 2, monitoramento de pessoas fora do alvo): "Se já prescrito, otimizá-lo trabalhando a adesão e/ou aumentando dosagem (**máx. 2.000–2.550 mg/dia**)"; "Se ausência de controle após **três meses de dose otimizada** de metformina, adicionar segundo antidiabético oral".
- Leitura operacional para RN-01: **dose otimizada = dose máxima tolerada na faixa de 2000–2550 mg/dia**; abaixo disso, o alerta de otimização se aplica antes de iniciar ou intensificar insulina. A redação final do alerta será fixada na spec durante o `/reversa-coding`, citando p. 28 e p. 58.

### 1.2 TFG — ajuste e contraindicação da metformina

- **p. 58** (mesma tabela): "A dose deverá ser **reduzida em 50%** quando a TFG estimada estiver **entre 30 e 45 mL/min/1,73 m²**, e o tratamento deverá ser **interrompido se a TFG estimada estiver abaixo de 30 mL/min/1,73 m²**, devido ao risco de acidose lática."
- **p. 28**: "Se função renal < 30 mL/min/1,73 m²: suspender metformina e iniciar insulina."
- **p. 61**: insuficiência renal (filtração glomerular < 30 mL/min/1,73 m²) listada entre as situações de evolução para necessidade de insulina.
- Leitura operacional para RN-02: TFG 30–45 → recomendação de reduzir a dose de metformina em 50%; TFG < 30 → recomendação de suspender a metformina (a indicação concomitante de insulina já é coberta pelo alerta existente só em parte — ver §3, achados adjacentes).

### 1.3 Sulfonilureia — convergência com a redação aprovada

- **p. 59** (tabela): sulfonilureias "podem ser utilizadas com TFG > 30 mL/min/1,73 m²".
- **p. 62** (texto da insulinização plena): "Ao fracionar a dose da insulina, deve-se **suspender a sulfonilureia, se estiver em uso**, e manter a metformina."
- **Figura 4 (p. 62–63)**: "Se dose noturna maior que 30 UI, fracionar (metade antes do café e metade antes de deitar) — suspender a sulfonilureia e manter a metformina."
- Achado que fortalece a RN-03: o guia **já usa a forma condicional** ("se estiver em uso") no texto da p. 62 — a redação aprovada na sessão de esclarecimentos (opção 3b) é, portanto, fiel à fonte, não uma extrapolação.

## 2. Alternativas técnicas avaliadas

| Questão | Alternativas | Escolhida | Porquê |
|---|---|---|---|
| Onde vive a regra de metformina/TFG | (a) espalhar em `regra-inicio.ts` e `regra-titulacao-basal.ts`; (b) módulo novo transversal chamado pela fachada | (b) | A regra vale para os dois modos ("antes de iniciar ou titular"); duplicá-la viola SRP e alta coesão (Princípio nº 5 global) |
| Onde vive o parsing da entrada por momento | (a) domínio ganha parser de string; (b) UI converte para `GlicemiaAferida[]` existente | (b) | A Spec Impact Matrix §4 confirma que o contrato do domínio já comporta; parser de string no domínio acoplaria regra clínica a formato de tela |
| Constantes novas | (a) literais nas regras; (b) grupos novos em `CONSTANTES`/`REFERENCIAS` congelados | (b) | Catálogo único é invariante do sistema (ADR 0001); literais espalhados quebrariam a rastreabilidade clínica |
| Tamanho do formulário | (a) editar `formulario.tsx` in-place; (b) extrair subcomponentes (campo de glicemias por momento, campos de antidiabéticos) | (b) | O arquivo já está em 532 linhas (dívida 4); in-place agravaria o sinal 5.6 do CLAUDE.md global |

## 3. Achados adjacentes, fora do escopo desta feature

Registrados para não se perderem (cadeia de derivação, Princípio II — nenhum entra sem RF próprio em feature futura):

1. **TFG < 30 é indicação de insulina** (p. 28 e 61): o alerta `INDICACAO_INSULINA` atual só cobre HbA1c ≥ 10% e jejum ≥ 300 mg/dL; estendê-lo à TFG exigiria RF novo.
2. **Dapagliflozina** (p. 57–59): segunda intensificação para ≥ 40 anos com alto risco cardiovascular — inteiramente fora do escopo NPH/Regular da fase 1 (MD-0009).
3. **Vitamina B12 anual após 5 anos de metformina** (p. 40, tabela de exames): candidata a recomendação de acompanhamento em feature futura.
4. **Metformina XR** (p. 51 e 58): alternativa à intolerância; a captura atual de "dose de metformina" não distingue apresentação — irrelevante para o alerta de otimização, registrado por completude.

## 4. Fontes externas

- Guia Rápido — Diabetes Mellitus, SMS-Rio, 2.ª edição atualizada, 2023 (PDF local, caminho acima). Única fonte clínica admitida (ADR 0001/NG-04).
- Projeto de design "Tela de calculadora de insulina" (Claude Design), arquivo `CLAUDE.md` — registro das divergências aprovadas, lido em 2026-07-19.
- Nenhuma dependência nova de software: a feature usa apenas a stack pinada existente (`_reversa_sdd/dependencies.md`).
