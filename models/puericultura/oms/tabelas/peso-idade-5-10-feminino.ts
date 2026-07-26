// ARQUIVO GERADO por `scripts/gerar-tabelas-oms.mts` — não editar à mão.
// Regerar com: node scripts/gerar-tabelas-oms.mts (o `git diff` vazio é a prova de
// que a origem não mudou; contrato §6).
//
// Indicador: peso-para-idade, sexo feminino.
// Fonte: WHO Growth Reference 2007 (5–19 anos), tabela expandida de escore z.
// URL: https://cdn.who.int/media/docs/default-source/child-growth/growth-reference-5-19-years/weight-for-age-(5-10-years)/hfa-girls-z-who-2007-exp_7ea58763-36a2-436d-bef0-7fcfbadd2820.xlsx
// Baixado em 2026-07-26 · sha256 d747e068fcef4238cbaf1c201dd7788f266d9903685f4495360614eed0153562
// Aba de origem: "wfa_girls_z_WHO 2007_exp" · coluna de índice: Month
// Faixa emitida: Month 61–120 (60 linhas),
// recortada ao escopo da Caderneta da Criança (D-04). A leitura é por
// mês inteiro, sem interpolação (D-06).
// Verificações V1 a V7 do contrato de aquisição aprovadas na geração.
//
// Precisão como publicada: L e M com 4 casas, S com 5.
// RF-02 (escore z pelo LMS) · D-03 (dado embarcado e versionado) · D-04 (recorte)
// da feature 017-puericultura-crescimento.
//
// Busca aritmética: posição = meses − inicio (D-05, D-06).
// Os arrays `l`, `m` e `s` são paralelos e têm 60 posições cada.
// Nome da constante: PESO_IDADE_5_10_FEMININO

export const PESO_IDADE_5_10_FEMININO = Object.freeze({
  unidade: "mes",
  inicio: 61,
  fim: 120,
  l: Object.freeze([
    -0.4681, -0.4711, -0.4742, -0.4773, -0.4803, -0.4834, -0.4864, -0.4894,
    -0.4924, -0.4954, -0.4984, -0.5013, -0.5043, -0.5072, -0.51, -0.5129,
    -0.5157, -0.5185, -0.5213, -0.524, -0.5268, -0.5294, -0.5321, -0.5347,
    -0.5372, -0.5398, -0.5423, -0.5447, -0.5471, -0.5495, -0.5518, -0.5541,
    -0.5563, -0.5585, -0.5606, -0.5627, -0.5647, -0.5667, -0.5686, -0.5704,
    -0.5722, -0.574, -0.5757, -0.5773, -0.5789, -0.5804, -0.5819, -0.5833,
    -0.5847, -0.5859, -0.5872, -0.5883, -0.5895, -0.5905, -0.5915, -0.5925,
    -0.5934, -0.5942, -0.595, -0.5958,
  ]),
  m: Object.freeze([
    18.2579, 18.4329, 18.6073, 18.7811, 18.9545, 19.1276, 19.3004, 19.473,
    19.6455, 19.818, 19.9908, 20.1639, 20.3377, 20.5124, 20.6885, 20.8661,
    21.0457, 21.2274, 21.4113, 21.5979, 21.7872, 21.9795, 22.1751, 22.374,
    22.5762, 22.7816, 22.9904, 23.2025, 23.418, 23.6369, 23.8593, 24.0853,
    24.3149, 24.5482, 24.7853, 25.0262, 25.271, 25.5197, 25.7721, 26.0284,
    26.2883, 26.5519, 26.819, 27.0896, 27.3635, 27.6406, 27.9208, 28.204,
    28.4901, 28.7791, 29.0711, 29.3663, 29.6646, 29.9663, 30.2715, 30.5805,
    30.8934, 31.2105, 31.5319, 31.8578,
  ]),
  s: Object.freeze([
    0.14295, 0.1435, 0.14404, 0.14459, 0.14514, 0.14569, 0.14624, 0.14679,
    0.14735, 0.1479, 0.14845, 0.149, 0.14955, 0.1501, 0.15065, 0.1512, 0.15175,
    0.1523, 0.15284, 0.15339, 0.15393, 0.15448, 0.15502, 0.15556, 0.1561,
    0.15663, 0.15717, 0.1577, 0.15823, 0.15876, 0.15928, 0.1598, 0.16032,
    0.16084, 0.16135, 0.16186, 0.16237, 0.16287, 0.16337, 0.16386, 0.16435,
    0.16483, 0.16532, 0.16579, 0.16626, 0.16673, 0.16719, 0.16764, 0.16809,
    0.16854, 0.16897, 0.16941, 0.16983, 0.17025, 0.17066, 0.17107, 0.17146,
    0.17186, 0.17224, 0.17262,
  ]),
});
