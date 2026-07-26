// ARQUIVO GERADO por `scripts/gerar-tabelas-oms.mts` — não editar à mão.
// Regerar com: node scripts/gerar-tabelas-oms.mts (o `git diff` vazio é a prova de
// que a origem não mudou; contrato §6).
//
// Indicador: comprimento/estatura-para-idade, sexo feminino.
// Fonte: WHO Growth Reference 2007 (5–19 anos), tabela expandida de escore z.
// URL: https://cdn.who.int/media/docs/default-source/child-growth/growth-reference-5-19-years/height-for-age-(5-19-years)/hfa-girls-z-who-2007-exp.xlsx
// Baixado em 2026-07-26 · sha256 df07ee16d3d2916569f1d869b7c874d7b880a41321d871215ed0254cb16679b3
// Aba de origem: "hfa_girls_z_WHO 2007_exp" · coluna de índice: Month
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
// Nome da constante: ESTATURA_IDADE_5_10_FEMININO

export const ESTATURA_IDADE_5_10_FEMININO = Object.freeze({
  unidade: "mes",
  inicio: 61,
  fim: 120,
  l: Object.freeze([
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  ]),
  m: Object.freeze([
    109.6016, 110.1258, 110.6451, 111.1596, 111.6696, 112.1753, 112.6767,
    113.174, 113.6672, 114.1565, 114.6421, 115.1244, 115.6039, 116.0812,
    116.5568, 117.0311, 117.5044, 117.9769, 118.4489, 118.9208, 119.3926,
    119.8648, 120.3374, 120.8105, 121.2843, 121.7587, 122.2338, 122.7098,
    123.1868, 123.6646, 124.1435, 124.6234, 125.1045, 125.5869, 126.0706,
    126.5558, 127.0424, 127.5304, 128.0199, 128.5109, 129.0035, 129.4975,
    129.9932, 130.4904, 130.9891, 131.4895, 131.9912, 132.4944, 132.9989,
    133.5046, 134.0118, 134.5202, 135.0299, 135.541, 136.0533, 136.567,
    137.0821, 137.5987, 138.1167, 138.6363,
  ]),
  s: Object.freeze([
    0.04355, 0.04364, 0.04373, 0.04382, 0.0439, 0.04399, 0.04407, 0.04415,
    0.04423, 0.04431, 0.04439, 0.04447, 0.04454, 0.04461, 0.04469, 0.04475,
    0.04482, 0.04489, 0.04495, 0.04502, 0.04508, 0.04514, 0.0452, 0.04525,
    0.04531, 0.04536, 0.04542, 0.04547, 0.04551, 0.04556, 0.04561, 0.04565,
    0.04569, 0.04573, 0.04577, 0.04581, 0.04585, 0.04588, 0.04591, 0.04594,
    0.04597, 0.046, 0.04602, 0.04604, 0.04607, 0.04608, 0.0461, 0.04612,
    0.04613, 0.04614, 0.04615, 0.04616, 0.04616, 0.04617, 0.04617, 0.04616,
    0.04616, 0.04616, 0.04615, 0.04614,
  ]),
});
