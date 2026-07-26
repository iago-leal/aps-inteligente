// ARQUIVO GERADO por `scripts/gerar-tabelas-oms.mts` — não editar à mão.
// Regerar com: node scripts/gerar-tabelas-oms.mts (o `git diff` vazio é a prova de
// que a origem não mudou; contrato §6).
//
// Indicador: IMC-para-idade, sexo feminino.
// Fonte: WHO Growth Reference 2007 (5–19 anos), tabela expandida de escore z.
// URL: https://cdn.who.int/media/docs/default-source/child-growth/growth-reference-5-19-years/bmi-for-age-(5-19-years)/bmi-girls-z-who-2007-exp.xlsx
// Baixado em 2026-07-26 · sha256 66f5c6284b44579ad6135fc639f22c09e36fe5a695b04390377113f6a00deb72
// Aba de origem: "bmi_girls_z_WHO 2007_exp" · coluna de índice: Month
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
// Nome da constante: IMC_IDADE_5_10_FEMININO

export const IMC_IDADE_5_10_FEMININO = Object.freeze({
  unidade: "mes",
  inicio: 61,
  fim: 120,
  l: Object.freeze([
    -0.8886, -0.9068, -0.9248, -0.9427, -0.9605, -0.978, -0.9954, -1.0126,
    -1.0296, -1.0464, -1.063, -1.0794, -1.0956, -1.1115, -1.1272, -1.1427,
    -1.1579, -1.1728, -1.1875, -1.2019, -1.216, -1.2298, -1.2433, -1.2565,
    -1.2693, -1.2819, -1.2941, -1.306, -1.3175, -1.3287, -1.3395, -1.3499,
    -1.36, -1.3697, -1.379, -1.388, -1.3966, -1.4047, -1.4125, -1.4199, -1.427,
    -1.4336, -1.4398, -1.4456, -1.4511, -1.4561, -1.4607, -1.465, -1.4688,
    -1.4723, -1.4753, -1.478, -1.4803, -1.4823, -1.4838, -1.485, -1.4859,
    -1.4864, -1.4866, -1.4864,
  ]),
  m: Object.freeze([
    15.2441, 15.2434, 15.2433, 15.2438, 15.2448, 15.2464, 15.2487, 15.2516,
    15.2551, 15.2592, 15.2641, 15.2697, 15.276, 15.2831, 15.2911, 15.2998,
    15.3095, 15.32, 15.3314, 15.3439, 15.3572, 15.3717, 15.3871, 15.4036,
    15.4211, 15.4397, 15.4593, 15.4798, 15.5014, 15.524, 15.5476, 15.5723,
    15.5979, 15.6246, 15.6523, 15.681, 15.7107, 15.7415, 15.7732, 15.8058,
    15.8394, 15.8738, 15.909, 15.9451, 15.9818, 16.0194, 16.0575, 16.0964,
    16.1358, 16.1759, 16.2166, 16.258, 16.2999, 16.3425, 16.3858, 16.4298,
    16.4746, 16.52, 16.5663, 16.6133,
  ]),
  s: Object.freeze([
    0.09692, 0.09738, 0.09783, 0.09829, 0.09875, 0.0992, 0.09966, 0.10012,
    0.10058, 0.10104, 0.10149, 0.10195, 0.10241, 0.10287, 0.10333, 0.10379,
    0.10425, 0.10471, 0.10517, 0.10562, 0.10608, 0.10654, 0.107, 0.10746,
    0.10792, 0.10837, 0.10883, 0.10929, 0.10974, 0.1102, 0.11065, 0.1111,
    0.11156, 0.11201, 0.11246, 0.11291, 0.11335, 0.1138, 0.11424, 0.11469,
    0.11513, 0.11557, 0.11601, 0.11644, 0.11688, 0.11731, 0.11774, 0.11816,
    0.11859, 0.11901, 0.11943, 0.11985, 0.12026, 0.12067, 0.12108, 0.12148,
    0.12188, 0.12228, 0.12268, 0.12307,
  ]),
});
