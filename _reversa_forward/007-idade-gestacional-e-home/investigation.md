# Investigation: 007-idade-gestacional-e-home

> Data: 2026-07-23 · Pesquisa de fundo que sustenta as decisões do `roadmap.md`.

## 1. Fonte clínica — *Guia Rápido Pré-Natal* (SMS-Rio, 4.ª ed., 2025)

Arquivo: `referencias/guia-rapido-pre-natal-sms-rio-4ed-2025.pdf` (fora do versionamento, padrão MD-0008). Trechos que ancoram o domínio:

- **p. 31 — "Como calcular a IG e a DPP?"**: "Datação manual da IG pela DUM: somar todos os dias decorridos desde a data da última menstruação até a presente data e dividir o total por 7 — o resultado é apresentado em semanas e dias. A datação pela DUM pode ser considerada confiável se o primeiro dia da última menstruação for conhecido e se os ciclos eram regulares." Também: correlacionar a IG com parâmetros clínicos (fundo uterino, BCF a partir da 12.ª semana, movimentos fetais 18–20 semanas) — fica como texto de apoio, não como regra do motor.
- **p. 32 — USG e divergência**: não há indicação de USG de 1.º trimestre de rotina para obter a IG; solicitar se houver discrepância com o exame físico ou DUM desconhecida/incerta. "A USG confirma a DUM se esta cair dentro da margem de erro do exame. A DUM deve ser desconsiderada se cair fora das margens de erro da USG (uma semana no primeiro trimestre e duas semanas no segundo trimestre)."
- **p. 32 — DPP**: "Definição de DPP com base na DUM (regra de Neagele [sic]): definir o primeiro dia e o mês da última menstruação, acrescentar 7 dias e somar 9 meses (p.ex.: DUM: 03/02/2020; DPP: 10/11/2020)."
- **p. 113 — indicações de USG (1.º trimestre)**: incerteza sobre a IG (DUM incerta); em 20–30% das grávidas a IG não pode ser calculada pela DUM (imprecisão de registro, ciclos irregulares, amenorreia pós-parto/pós-anovulatórios) — nesses casos só a USG permite estimar com precisão.

## 2. Naegele × 280 dias — análise numérica

A regra calendárica (+7 dias, +9 meses) e a soma fixa de 280 dias (40 semanas) coincidem na maioria dos casos, mas divergem conforme o comprimento dos meses atravessados. Exemplo da própria fonte: DUM 03/02/2020 → Naegele 10/11/2020, que dista **281** dias da DUM (2020 é bissexto). Consequência de projeto (D-03 do roadmap): a DPP exibida segue Naegele literal, e a tela não deriva "IG na DPP", evitando afirmar 40+0 numa data que pode ser 40+1. Os property tests fixam a regra calendárica (soma de meses com estouro de ano), não a soma de dias.

## 3. Referência funcional — calculadora FetalMed

`https://www.fetalmed.net/calculadora/calculadora-idade-gestacional/` (indicada pelo usuário). Confirma o formato de saída consagrado (semanas + dias, trimestre, DPP, modo DUM e modo USG com IG do laudo) e oferece dois modos extras — FIV/FET e DPP inversa — deliberadamente fora do escopo (RN-10). Divergência relevante: o site trata os modos como exclusivos; a decisão do usuário (entrada dupla com divergência explicitada) é **superior** clinicamente porque a regra de arbitragem existe na fonte (p. 32) e o cenário "gestante com DUM e USG em mãos" é o cotidiano do pré-natal.

## 4. Aritmética de datas em JavaScript (D-02)

- Padrão adotado: converter `AAAA-MM-DD` em número de dias epoch via `Date.UTC(ano, mes-1, dia) / 86_400_000`; diferenças e somas de dias são aritmética inteira; volta com `new Date(ms)` em UTC apenas para formatar. Sem `Date` em fuso local no domínio (fusos e horário de verão tornam "diferença de dias" ambígua perto da meia-noite).
- Soma de meses (Naegele): aritmética própria `(mes + 9)` com estouro de ano; dia 31 não ocorre porque +7 dias sobre dia ≤ 31 nunca produz dia > 31 em mês seguinte inválido? — ocorre sim (ex.: DUM 24/05 → +7d = 31/05 → +9m = 31/02, inválido). Regra de normalização a fixar no teste: transbordar para o dia válido seguinte (comportamento de `Date.UTC` com dia excedente) e registrar o caso no relatório da feature. Edge case documentado para o `/reversa-to-do`.
- Alternativas descartadas: `Temporal` (suporte desigual nos navegadores em 2026), bibliotecas de data (dependência de runtime nova contra `_reversa_sdd/dependencies.md#observações`).

## 5. Padrões do legado reaproveitados

| Padrão | Origem | Uso aqui |
|---|---|---|
| Unit de domínio puro com fachada + erros como valores | `models/insulina/` (ADR 0003/0004) | `models/gestacao/` inteira |
| Catálogo congelado de referências/constantes | `fonte-clinica.ts` (ADR 0001) | `models/gestacao/fonte-clinica.ts` com pp. 31–32/113 |
| Coleta total de ofensores | `validacao.ts` (regra 15 do domain.md) | `models/gestacao/validacao.ts` |
| Motor informa, não decide | ADR 0005 (condutas alternativas) | Comparação DUM×USG sem escolha automática (D-04) |
| Espelhamento de faixas UI↔motor via `CONSTANTES` | `formulario.tsx` | `interface/gestacao/formulario.tsx` |
| Fonte única anti-drift | `rotulos.ts` (feature 006) | `interface/inicio/catalogo.ts` (D-07) |
| Extração byte a byte com suíte como oráculo | feature 006 (T001) | Moldura comum (D-09) |

## 6. O que foi deliberadamente não pesquisado

Regras de redatação de outras fontes (ACOG e afins): o princípio "escopo = fonte" (MD-0009) veta importar parametrização que o guia adotado não traz. A margem de 3.º trimestre fica sem veredito (D-05) até que a fonte — ou o prescritor, em sessão futura — a defina.
