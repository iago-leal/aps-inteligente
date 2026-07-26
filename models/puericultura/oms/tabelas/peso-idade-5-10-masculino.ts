// ARQUIVO GERADO por `scripts/gerar-tabelas-oms.mts` — não editar à mão.
// Regerar com: node scripts/gerar-tabelas-oms.mts (o `git diff` vazio é a prova de
// que a origem não mudou; contrato §6).
//
// Indicador: peso-para-idade, sexo masculino.
// Fonte: WHO Growth Reference 2007 (5–19 anos), tabela expandida de escore z.
// URL: https://cdn.who.int/media/docs/default-source/child-growth/growth-reference-5-19-years/weight-for-age-(5-10-years)/hfa-boys-z-who-2007-exp_0ff9c43c-8cc0-4c23-9fc6-81290675e08b.xlsx
// Baixado em 2026-07-26 · sha256 a6ed0d9f3cfa209747afe49f7503b7cc24a1be6b6a8e7222e85a36b7850cb99f
// Aba de origem: "wfa_boys_z_WHO 2007_exp" · coluna de índice: Month
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
// Nome da constante: PESO_IDADE_5_10_MASCULINO

export const PESO_IDADE_5_10_MASCULINO = Object.freeze({
  unidade: "mes",
  inicio: 61,
  fim: 120,
  l: Object.freeze([
    -0.2026, -0.213, -0.2234, -0.2338, -0.2443, -0.2548, -0.2653, -0.2758,
    -0.2864, -0.2969, -0.3075, -0.318, -0.3285, -0.339, -0.3494, -0.3598,
    -0.3701, -0.3804, -0.3906, -0.4007, -0.4107, -0.4207, -0.4305, -0.4402,
    -0.4499, -0.4594, -0.4688, -0.4781, -0.4873, -0.4964, -0.5053, -0.5142,
    -0.5229, -0.5315, -0.5399, -0.5482, -0.5564, -0.5644, -0.5722, -0.5799,
    -0.5873, -0.5946, -0.6017, -0.6085, -0.6152, -0.6216, -0.6278, -0.6337,
    -0.6393, -0.6446, -0.6496, -0.6543, -0.6585, -0.6624, -0.6659, -0.6689,
    -0.6714, -0.6735, -0.6752, -0.6764,
  ]),
  m: Object.freeze([
    18.5057, 18.6802, 18.8563, 19.034, 19.2132, 19.394, 19.5765, 19.7607,
    19.9468, 20.1344, 20.3235, 20.5137, 20.7052, 20.8979, 21.0918, 21.287,
    21.4833, 21.681, 21.8799, 22.08, 22.2813, 22.4837, 22.6872, 22.8915,
    23.0968, 23.3029, 23.5101, 23.7182, 23.9272, 24.1371, 24.3479, 24.5595,
    24.7722, 24.9858, 25.2005, 25.4163, 25.6332, 25.8513, 26.0706, 26.2911,
    26.5128, 26.7358, 26.9602, 27.1861, 27.4137, 27.6432, 27.875, 28.1092,
    28.3459, 28.5854, 28.8277, 29.0731, 29.3217, 29.5736, 29.8289, 30.0877,
    30.3501, 30.616, 30.8854, 31.1586,
  ]),
  s: Object.freeze([
    0.12988, 0.13028, 0.13067, 0.13105, 0.13142, 0.13178, 0.13213, 0.13246,
    0.13279, 0.13311, 0.13342, 0.13372, 0.13402, 0.13432, 0.13462, 0.13493,
    0.13523, 0.13554, 0.13586, 0.13618, 0.13652, 0.13686, 0.13722, 0.13759,
    0.13797, 0.13838, 0.1388, 0.13923, 0.13969, 0.14016, 0.14065, 0.14117,
    0.1417, 0.14226, 0.14284, 0.14344, 0.14407, 0.14472, 0.14539, 0.14608,
    0.14679, 0.14752, 0.14828, 0.14905, 0.14984, 0.15066, 0.15149, 0.15233,
    0.15319, 0.15406, 0.15493, 0.15581, 0.1567, 0.1576, 0.1585, 0.1594, 0.16031,
    0.16122, 0.16213, 0.16305,
  ]),
});
