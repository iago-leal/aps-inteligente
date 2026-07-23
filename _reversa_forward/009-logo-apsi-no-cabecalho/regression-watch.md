# Regression Watch — feature 009-logo-apsi-no-cabecalho

> Identificador: `009-logo-apsi-no-cabecalho` · Data: 2026-07-23 · Cenário: legado

## Watch principal

**Vazio.** Nenhuma regra 🟢 do `domain.md` foi alterada ou removida (ver `legacy-impact.md` →
"Modificadas"). A entrega é inteiramente de apresentação/identidade: motor, catálogo, rotas,
textos, nomes acessíveis dos headings, contagem de links e CSP permanecem íntegros.

| ID | Origem (arquivo, seção) | Regra esperada após mudança | Tipo de verificação | Sinal de violação |
|----|--------------------------|------------------------------|---------------------|-------------------|
| — | — | — | — | — |

## Observações (sem peso de regressão)

Confidência 🟡/decisões de apresentação; não bloqueiam re-extração, mas valem atenção:

- **O-09-01 — Flash da variante clara.** Por um frame, a logo clara aparece antes do ajuste ao tema escuro persistido (herdado do alternador, feature 004). Aceito; vira problema só se incomodar em uso real.
- **O-09-02 — Marca decorativa vs. link.** A logo das calculadoras é decorativa (`aria-hidden`, sem link) por decisão D-04. Se virar link para a home, a contagem de links asserida na suíte muda e exige atualização deliberada dos testes.
- **O-09-03 — Manifesto PWA.** `background_color`/`display: standalone` são convencionais; conferir status bar/splash em iOS/Android reais.
- **O-09-04 — CSS do cabeçalho dividido.** Layout base em `globais.css` (no teto de 400 linhas) e camada de logo em `cabecalho.css`. Candidato a consolidação futura da família `.cabecalho*` numa folha só.

## Histórico de re-extrações

_(vazio — a ser preenchido pelo agente reverso quando `/reversa` rodar de novo)_

## Arquivadas

_(vazio)_
