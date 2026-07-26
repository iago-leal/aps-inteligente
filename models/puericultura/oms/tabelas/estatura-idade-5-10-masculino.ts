// ARQUIVO GERADO por `scripts/gerar-tabelas-oms.mts` — não editar à mão.
// Regerar com: node scripts/gerar-tabelas-oms.mts (o `git diff` vazio é a prova de
// que a origem não mudou; contrato §6).
//
// Indicador: comprimento/estatura-para-idade, sexo masculino.
// Fonte: WHO Growth Reference 2007 (5–19 anos), tabela expandida de escore z.
// URL: https://cdn.who.int/media/docs/default-source/child-growth/growth-reference-5-19-years/height-for-age-(5-19-years)/hfa-boys-z-who-2007-exp.xlsx
// Baixado em 2026-07-26 · sha256 d78fa8cafcab77dcb5f03d71506d92bdcb28f89c642816b6bb0eef466b007466
// Aba de origem: "hfa_boys_z_WHO 2007_exp" · coluna de índice: Month
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
// Nome da constante: ESTATURA_IDADE_5_10_MASCULINO

export const ESTATURA_IDADE_5_10_MASCULINO = Object.freeze({
  unidade: "mes",
  inicio: 61,
  fim: 120,
  l: Object.freeze([
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  ]),
  m: Object.freeze([
    110.2647, 110.8006, 111.3338, 111.8636, 112.3895, 112.911, 113.428, 113.941,
    114.45, 114.9547, 115.4549, 115.9509, 116.4432, 116.9325, 117.4196,
    117.9046, 118.388, 118.87, 119.3508, 119.8303, 120.3085, 120.7853, 121.2604,
    121.7338, 122.2053, 122.675, 123.1429, 123.6092, 124.0736, 124.5361,
    124.9964, 125.4545, 125.9104, 126.364, 126.8156, 127.2651, 127.7129,
    128.159, 128.6034, 129.0466, 129.4887, 129.93, 130.3705, 130.8103, 131.2495,
    131.6884, 132.1269, 132.5652, 133.0031, 133.4404, 133.877, 134.313,
    134.7483, 135.1829, 135.6168, 136.0501, 136.4829, 136.9153, 137.3474,
    137.7795,
  ]),
  s: Object.freeze([
    0.04164, 0.04172, 0.0418, 0.04187, 0.04195, 0.04203, 0.04211, 0.04218,
    0.04226, 0.04234, 0.04241, 0.04249, 0.04257, 0.04264, 0.04272, 0.0428,
    0.04287, 0.04295, 0.04303, 0.04311, 0.04318, 0.04326, 0.04334, 0.04342,
    0.0435, 0.04358, 0.04366, 0.04374, 0.04382, 0.0439, 0.04398, 0.04406,
    0.04414, 0.04422, 0.0443, 0.04438, 0.04446, 0.04454, 0.04462, 0.0447,
    0.04478, 0.04487, 0.04495, 0.04503, 0.04511, 0.04519, 0.04527, 0.04535,
    0.04543, 0.04551, 0.04559, 0.04566, 0.04574, 0.04582, 0.04589, 0.04597,
    0.04604, 0.04612, 0.04619, 0.04626,
  ]),
});
