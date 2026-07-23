# Legacy impact — 008-design-mais-bonito-da-home

> Data: 2026-07-23
> Âncora: legado (`_reversa_sdd/architecture.md` + `domain.md`)
> Natureza: camada de apresentação; nenhum motor, contrato ou dado tocado.

## Arquivos afetados

| Arquivo afetado | Componente (extração) | Tipo | Severidade | Justificativa |
|---|---|---|---|---|
| `interface/estilos/inicio.css` | `architecture.md#1` (camada interface) | componente-novo | LOW | Estilos da home, inexistentes até aqui; sobre tokens Primer, sem cor própria |
| `interface/inicio/icones.tsx` | `addenda/007` (módulo `interface/inicio`) | componente-novo | LOW | Mapa `id→Octicon`, apresentação pura; catálogo intocado |
| `interface/comum/moldura.tsx` | `addenda/007` (D-09) | regra-alterada | LOW | Prop `apresentacao` opcional (default `padrao`); semântica idêntica; calculadoras sem mudança de props |
| `interface/inicio/tela.tsx` | `addenda/007` (módulo `interface/inicio`) | regra-alterada | LOW | Variante `destaque`, ícone e stretched link; papéis, nomes e contagem de links preservados |
| `interface/estilos/globais.css` | `addenda/004` (dívida 4) | regra-alterada | LOW | Refino do cabeçalho (RF-07); permanece 400 linhas, sem cor própria |
| `pages/_app.tsx` | `code-analysis.md#módulo-3` (shell) | regra-alterada | LOW | Um import de CSS (`inicio.css`) após `globais.css` |
| `package.json` / `package-lock.json` | `dependencies.md#runtime` | componente-novo | LOW | `@primer/octicons-react@19.29.2` pinada; peer React satisfeita; +3,9 kB gzip na home |
| `tests/integration/interface/{moldura,inicio}.test.tsx` | `architecture.md#5` (testes) | componente-novo/regra-alterada | LOW | Casos aditivos; asserções existentes byte a byte |
| `e2e/plataforma.spec.ts` | `addenda/007` (harness e2e) | regra-alterada | LOW | Dois testes aditivos (clique estendido, viewport móvel); asserções antigas intactas |
| `README.md` | doc do projeto | regra-alterada | LOW | `inicio.css` e diretriz do ícone de seção opcional |

## Diff conceitual

- **Home:** de lista crua (classes sem CSS) para porta de entrada com hero, seções com
  ícone, cartões delimitados e clicáveis por inteiro, grade responsiva. Só apresentação:
  o catálogo tipado segue a fonte única de navegação (`catalogo.ts` byte a byte).
- **Moldura comum:** ganhou um eixo de apresentação (`padrao`/`destaque`) puramente
  visual. As três telas continuam com o mesmo `h1`, selo e alternador — a variante muda
  espaçamento e escala tipográfica, não a estrutura acessível.
- **Dependência:** entra a família de ícones oficial do Primer, tree-shaken (delta
  desprezível), coerente com a base de estilo da feature 004.

## Preservadas (regras 🟢 do `domain.md` intactas)

- §3.1 Privacidade por arquitetura: zero rede nova, zero storage novo, CSP byte a byte
  (contrato 16/16); ícones inline no bundle, nenhum recurso externo (ADR 0002/0007).
- §3.x Rastreabilidade clínica: toda saída dos motores segue carregando `ReferenciaClinica`;
  `models/**` intocado (`git diff models/` vazio) — ADR 0001/0003.
- Catálogo como fonte única de navegação (RN-08 da feature 007): `catalogo.ts` byte a byte.
- Determinismo e erros como valores: nenhuma mudança no domínio (ADR 0004/0005).

## Modificadas (regras 🟢 alteradas ou removidas)

Nenhuma regra 🟢 de domínio foi alterada ou removida. As mudanças são exclusivamente de
apresentação na camada de interface; nenhuma regra de negócio confirmada mudou.
