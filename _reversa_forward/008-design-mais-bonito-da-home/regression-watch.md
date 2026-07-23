# Regression watch — 008-design-mais-bonito-da-home

> Feature: `008-design-mais-bonito-da-home`
> Data: 2026-07-23

## Watch principal

Nenhuma regra 🟢 de domínio foi alterada ou removida por esta feature (ver
`legacy-impact.md` → "Modificadas"): a mudança é inteiramente de apresentação. Logo, o
watch principal — reservado a regras de negócio confirmadas que mudaram — nasce **vazio**.

| ID | Origem (arquivo, seção) | Regra esperada após mudança | Tipo de verificação | Sinal de violação |
|----|-------------------------|-----------------------------|---------------------|-------------------|
| — | — | — | — | — |

## Observações (sem peso de regressão)

Itens de apresentação a vigiar em uso real; ganham peso só se uma futura extração os
confirmar como regra.

- **O-08-01** — Selo de privacidade e semântica acessível da home devem permanecer
  presentes (`h1`, `main`, selo "Nada é salvo nem enviado", um link por cartão) após
  qualquer futura evolução visual. Sinal: asserções de `inicio.test.tsx`/`moldura.test.tsx`
  ou axe da home saindo de 0.
- **O-08-02** — Seleção de texto da descrição sob o *stretched link* (o `::after` do
  link cobre o cartão). Se atrapalhar o usuário, aplicar `pointer-events` seletivo.
- **O-08-03** — Variante `destaque` da `Moldura` como CSS via `[data-apresentacao]`,
  jamais um segundo componente de moldura (risco de drift entre home e calculadoras).
- **O-08-04** — Gate D-08: novos ícones/assets na home devem manter o first load abaixo
  de +100 kB gzip (folga atual ~96 kB). Sinal: `next build` acusando salto no bundle.
- **O-08-05** — Axe da tela de insulina segue em 1 (herdado da feature 004, não
  introduzido aqui): reduzir quando possível, nunca aumentar.

## Histórico de re-extrações

### Re-extração 2026-07-23 14:10

Watch principal **vazio** (feature de apresentação; nenhuma regra 🟢 de domínio alterada) — nada a verificar contra regressão. As observações O-08-01..05 permanecem 🟡 por decisão do usuário na re-extração 2; a semântica acessível da home (h1, selo, um link por cartão) e a variante `destaque` como CSS seguem representadas na unit `interface-inicio` e em `interface-comum`.

## Arquivadas

<!-- Nenhuma até o momento. -->
