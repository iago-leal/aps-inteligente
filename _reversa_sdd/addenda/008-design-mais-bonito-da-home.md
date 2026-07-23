# Adendo 008 — Design da página inicial (apresentação sobre a home por seções)

> Feature: `008-design-mais-bonito-da-home`
> Data: 2026-07-23
> Cenário: legado

## Vigência

Vigente desde 2026-07-23.

## Resumo da entrega

A home nascida na feature 007 organizava as calculadoras em seções, mas nunca recebera tratamento visual: as classes `inicio-secoes`, `inicio-secao`, `inicio-cartoes` e `inicio-cartao` do JSX de `interface/inicio/tela.tsx` não tinham um único seletor em `globais.css` — a raiz era uma lista crua de links sob a moldura comum. Esta feature dá à home uma apresentação de porta de entrada da plataforma: área introdutória de destaque, seções com ícone e hierarquia, cartões delimitados e clicáveis por inteiro (*stretched link*), grade responsiva e coerência nos dois temas, com refino leve da moldura comum que propaga às telas das calculadoras. Tudo estritamente dentro da identidade Primer vigente (RN-01/RN-06), conduzido pela skill `frontend-design` como método de projeto, e sem tocar catálogo, rotas, textos, semântica acessível ou o motor de nenhuma calculadora — mudança inteiramente de apresentação. O domínio permanece byte a byte intocado (`git diff models/` e `catalogo.ts` vazios).

Ações concluídas: **13/13** (T001–T013), incluindo medição de base e delta de bundle, TDD dos casos aditivos de interface (4 vermelhos novos que passam a verde, 8 verdes antigos byte a byte), suíte 281 unidade/integração, contrato 16/16, e2e 12/12 e lint+typecheck verdes; delta de first load na home de +3,9 kB gzip, muito abaixo do gate D-08 (100 kB).

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|---|---|---|---|
| `_reversa_sdd/architecture.md` | `#1-estilo-arquitetural` (camada interface) | componente-novo | Nasce `interface/estilos/inicio.css`: estilos da home (hero, chip de ícone, grade `auto-fit` com coluna ~720, hover/focus, `prefers-reduced-motion`), inexistentes até aqui; 100% sobre tokens `var(--*)` do Primer, sem cor própria; importado por `pages/_app.tsx` após `globais.css` |
| `_reversa_sdd/architecture.md` | `#1-estilo-arquitetural` (camada interface) | componente-novo | Nasce `interface/inicio/icones.tsx`: mapa `id→Octicon` (`Beaker`/`Calendar`), apresentação pura, `aria-hidden`, fallback `null`; o catálogo (`catalogo.ts`) segue byte a byte |
| `_reversa_sdd/addenda/007-idade-gestacional-e-home.md` | módulo `interface/inicio` (`tela.tsx`) | regra-alterada | `tela.tsx` ganha variante `destaque`, ícone por seção, seta e *stretched link*; papéis, nomes acessíveis e contagem de links preservados (um `<a>` por cartão); catálogo como fonte única (RN-08) intacto |
| `_reversa_sdd/addenda/007-idade-gestacional-e-home.md` | módulo `interface/comum` (D-09, `moldura.tsx`) | regra-alterada | `Moldura` ganha prop opcional `apresentacao` (default `padrao`, variante `destaque`) via `data-apresentacao`, puramente visual; semântica (h1, selo de privacidade, alternador de tema) idêntica; as calculadoras não mudam de props (O-08-03: variante como CSS, jamais segundo componente) |
| `_reversa_sdd/addenda/004-estilo-primer-nas-telas.md` | `globais.css` (dívida 4) | regra-alterada | Refino leve do cabeçalho (RF-07); permanece em 400 linhas, sem cor própria, resíduo de layout sobre tokens Primer |
| `_reversa_sdd/code-analysis.md` | `#módulo-3` (shell `pages/_app.tsx`) | regra-alterada | Um import de CSS a mais (`inicio.css`) após `globais.css`; sem outra mudança de shell |
| `_reversa_sdd/dependencies.md` | `#runtime` | componente-novo | `@primer/octicons-react@19.29.2` pinada (`--save-exact`), peer React satisfeita, tree-shaken; coerente com a base Primer da feature 004 e sujeita ao gate D-08 (delta +3,9 kB gzip na home) |
| `_reversa_sdd/architecture.md` | `#5` (testes) | componente-novo/regra-alterada | `tests/integration/interface/moldura.test.tsx` (novo) e casos aditivos em `inicio.test.tsx`; asserções existentes byte a byte |
| `_reversa_sdd/addenda/007-idade-gestacional-e-home.md` | harness e2e (`e2e/plataforma.spec.ts`) | regra-alterada | Dois testes aditivos (clique na descrição sob o *stretched link*, viewport móvel); asserções antigas e `axe-baseline` da home (0 nos dois viewports) intactos |
| `_reversa_sdd/addenda/004-estilo-primer-nas-telas.md` | diretriz de telas (README) | regra-alterada | README documenta `inicio.css` e a diretriz do ícone de seção opcional via catálogo |

Contratos externos: nenhum delta — CSP e cabeçalhos byte a byte, zero requisição de rede nova, zero recurso externo (ícones inline no bundle; ADR 0002/0007; contrato 16/16). Regras 🟢 do `domain.md` preservadas: privacidade por arquitetura (§3.1), rastreabilidade clínica e determinismo (`models/**` intocado, ADR 0001/0003/0004/0005), catálogo como fonte única de navegação (RN-08 da feature 007).

## Regras sob vigilância

Watch principal **vazio**: nenhuma regra 🟢 de domínio foi alterada ou removida — a mudança é inteiramente de apresentação (ver `legacy-impact.md` → "Modificadas").

Observações sem peso de regressão: O-08-01, O-08-02, O-08-03, O-08-04, O-08-05 — ver `_reversa_forward/008-design-mais-bonito-da-home/regression-watch.md` (semântica acessível e selo da home; seleção de texto sob o *stretched link*; variante `destaque` como CSS e nunca segundo componente; gate D-08 do first load; axe da tela de insulina em 1, herdado da 004, a reduzir e nunca aumentar).

## Fontes

- `_reversa_forward/008-design-mais-bonito-da-home/legacy-impact.md`
- `_reversa_forward/008-design-mais-bonito-da-home/regression-watch.md`
- `_reversa_forward/008-design-mais-bonito-da-home/requirements.md`
- `_reversa_forward/008-design-mais-bonito-da-home/progress.jsonl`
