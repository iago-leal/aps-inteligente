// ARQUIVO GERADO por `scripts/gerar-tabelas-oms.mts` — não editar à mão.
// Regerar com: node scripts/gerar-tabelas-oms.mts (o `git diff` vazio é a prova de
// que a origem não mudou; contrato §6).
//
// Indicador: IMC-para-idade, sexo masculino.
// Fonte: WHO Growth Reference 2007 (5–19 anos), tabela expandida de escore z.
// URL: https://cdn.who.int/media/docs/default-source/child-growth/growth-reference-5-19-years/bmi-for-age-(5-19-years)/bmi-boys-z-who-2007-exp.xlsx
// Baixado em 2026-07-26 · sha256 0a60849673f34a06b8e2fe4defe5d00348de687b6c9fce0278f1525fff89eb6d
// Aba de origem: "bmi_boys_z_WHO 2007_exp" · coluna de índice: Month
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
// Nome da constante: IMC_IDADE_5_10_MASCULINO

export const IMC_IDADE_5_10_MASCULINO = Object.freeze({
  unidade: "mes",
  inicio: 61,
  fim: 120,
  l: Object.freeze([
    -0.7387, -0.7621, -0.7856, -0.8089, -0.8322, -0.8554, -0.8785, -0.9015,
    -0.9243, -0.9471, -0.9697, -0.9921, -1.0144, -1.0365, -1.0584, -1.0801,
    -1.1017, -1.123, -1.1441, -1.1649, -1.1856, -1.206, -1.2261, -1.246,
    -1.2656, -1.2849, -1.304, -1.3228, -1.3414, -1.3596, -1.3776, -1.3953,
    -1.4126, -1.4297, -1.4464, -1.4629, -1.479, -1.4947, -1.5101, -1.5252,
    -1.5399, -1.5542, -1.5681, -1.5817, -1.5948, -1.6076, -1.6199, -1.6318,
    -1.6433, -1.6544, -1.6651, -1.6753, -1.6851, -1.6944, -1.7032, -1.7116,
    -1.7196, -1.7271, -1.7341, -1.7407,
  ]),
  m: Object.freeze([
    15.2641, 15.2616, 15.2604, 15.2605, 15.2619, 15.2645, 15.2684, 15.2737,
    15.2801, 15.2877, 15.2965, 15.3062, 15.3169, 15.3285, 15.3408, 15.354,
    15.3679, 15.3825, 15.3978, 15.4137, 15.4302, 15.4473, 15.465, 15.4832,
    15.5019, 15.521, 15.5407, 15.5608, 15.5814, 15.6023, 15.6237, 15.6455,
    15.6677, 15.6903, 15.7133, 15.7368, 15.7606, 15.7848, 15.8094, 15.8344,
    15.8597, 15.8855, 15.9116, 15.9381, 15.9651, 15.9925, 16.0205, 16.049,
    16.0781, 16.1078, 16.1381, 16.1692, 16.2009, 16.2333, 16.2665, 16.3004,
    16.3351, 16.3704, 16.4065, 16.4433,
  ]),
  s: Object.freeze([
    0.0839, 0.08414, 0.08439, 0.08464, 0.0849, 0.08516, 0.08543, 0.0857,
    0.08597, 0.08625, 0.08653, 0.08682, 0.08711, 0.08741, 0.08771, 0.08802,
    0.08833, 0.08865, 0.08898, 0.08931, 0.08964, 0.08998, 0.09033, 0.09068,
    0.09103, 0.09139, 0.09176, 0.09213, 0.09251, 0.09289, 0.09327, 0.09366,
    0.09406, 0.09445, 0.09486, 0.09526, 0.09567, 0.09609, 0.09651, 0.09693,
    0.09735, 0.09778, 0.09821, 0.09864, 0.09907, 0.09951, 0.09994, 0.10038,
    0.10082, 0.10126, 0.1017, 0.10214, 0.10259, 0.10303, 0.10347, 0.10391,
    0.10435, 0.10478, 0.10522, 0.10566,
  ]),
});
