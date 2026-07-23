# interface/estilos — Design Técnico

> `design.md` · Re-extração 2. Quatro folhas CSS, doutrina "só tokens Primer".

## Interface

Não há API de código; a "interface" é o conjunto de classes e atributos que o CSS estiliza, contratados com os componentes de interface:

| Seletor / classe | Origem no JSX | Folha |
|------------------|---------------|-------|
| `.pagina`, `.calc-regioes`, cartões | `moldura.tsx`, apps | `globais.css` |
| `.cabecalho*` (base + `.cabecalho-logo`, `.cabecalho-marca`) | `moldura.tsx:46-90` | `cabecalho.css` |
| `.inicio-secoes`, `.inicio-cartao*`, hero | `inicio/tela.tsx` | `inicio.css` |
| `.campo-radios`, blocos de referência | `cardiologia/formulario.tsx`, `referencias.tsx` | `cardiologia.css` |
| `[data-tema]`, `[data-apresentacao="destaque"]` | `moldura.tsx:47` | `globais.css` / `inicio.css` |

## Fluxo de Carregamento

1. `_app.tsx` importa os primitivos Primer (motion, size, typography, temas). `pages/_app.tsx:7-21` 🟢
2. Depois, na ordem: `globais.css` → `cabecalho.css` → `inicio.css` → `cardiologia.css`. `pages/_app.tsx:22-25` 🟢
3. A cascata resolve pela ordem de import; folhas específicas sobrepõem globais quando necessário. 🟢

## Dependências

- `@primer/primitives` — variáveis funcionais (`var(--*)`). 🟢
- `@primer/react` — componentes cujo layout externo estas folhas complementam. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Só tokens Primer, zero cor própria (RN-01/RN-05) | comentários de cabeçalho das 4 folhas | 🟢 |
| Folha por preocupação para respeitar o teto de 400 linhas; família `.cabecalho*` consolidada em `cabecalho.css` (O-09-04) | `cabecalho.css:1-6`, `inicio.css:1-3`, `cardiologia.css:1-4` | 🟢 |
| Hero e seções na coluna clínica de 720px | `inicio.css:5-8` | 🟢 |
| Logo com altura fixa, largura automática (314×138) | `cabecalho.css:7-14` | 🟢 |

## Estado Interno

Não aplicável (CSS estático). 🟢

## Observabilidade

Não aplicável. 🟢

## Riscos e Lacunas

- 🟢 Dívida do teto de 400 linhas **resolvida** na re-extração 2: o layout do cabeçalho migrou de `globais.css` (que encostara em 400) para `cabecalho.css`; todas as folhas agora < 400 (`globais.css` 364, `cabecalho.css` 72). Suíte 375/375, build e axe intactos após a relocação (regras byte a byte, mesma ordem de cascata).
- 🟢 Ausência de cor própria verificável por inspeção; identidade delegada ao Primer.
