# Medições de bundle — gate D-08 (feature 008)

> Método: soma gzip dos arquivos JS/CSS de cada rota no `.next/build-manifest.json`
> (mesma régua antes/depois; o gate compara o **delta**, limiar +100 kB gzip no first load).

## Linha de base (antes da feature) — 2026-07-23, T001

| Rota | First load (gzip) |
|------|-------------------|
| `/` (home) | 117,9 kB |
| `/dm2/insulina` | 211,9 kB |
| `/pre-natal/idade-gestacional` | 202,4 kB |
| `/_app` (compartilhado) | 157,9 kB |

## Após a feature — T011 (2026-07-23)

| Rota | First load (gzip) | Delta |
|------|-------------------|-------|
| `/` (home) | 121,8 kB | **+3,9 kB** |
| `/dm2/insulina` | 212,5 kB | +0,6 kB |
| `/pre-natal/idade-gestacional` | 202,9 kB | +0,5 kB |
| `/_app` (compartilhado) | 158,5 kB | +0,6 kB |

## Veredito do gate D-08

O maior delta é o da home: **+3,9 kB gzip**, quase todo dos dois octicons (`Beaker`,
`Calendar`, `ArrowRight`) somados ao mapa de ícones. Limiar do gate: +100 kB gzip no
first load. **Folga de ~96 kB — gate respeitado sem necessidade de decisão do usuário.**
O tree-shaking do `@primer/octicons-react` confirmou-se: nenhum efeito de importar o
pacote inteiro (que tem ~1,1 MB unpacked).
