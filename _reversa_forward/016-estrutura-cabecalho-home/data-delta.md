# Data-delta: estrutura do cabeçalho da home

> Feature `016-estrutura-cabecalho-home` · 2026-07-23

## Modelo de dados de domínio

**n/a.** A feature não toca nenhum modelo de domínio (`models/insulina`, `models/gestacao`, `models/cardiopatia-isquemica`, `models/risco-cardiovascular`), nenhum campo, índice, migração ou persistência. Não há banco envolvido: a plataforma calcula 100% no navegador e o único dado persistido é a preferência de tema (fora do escopo desta feature).

## Contrato do componente `Moldura` (delta de UI, não de dados)

Único "esquema" alterado é a interface de props `PropsMoldura` em `interface/comum/moldura.tsx`. Registrado aqui por rastreabilidade.

| Prop | Antes | Depois | Nota |
|------|-------|--------|------|
| `titulo: string` | obrigatória | inalterada | Na home passa a preencher o `h1` textual (era só o `alt` da logo) |
| `subtitulo: string` | obrigatória | inalterada | — |
| `apresentacao?: "padrao" \| "destaque"` | opcional, default `"padrao"` | inalterada | `destaque` reduz-se à coluna de 720px (hero tipográfico removido) |
| `logoComoTitulo?: boolean` | opcional, default `false` | **removida** | Ficou órfã: a logo é decorativa em toda tela |
| `comInicio?: boolean` | — | **nova**, opcional, default `false` | Governa a presença do comando de início (⌂); calculadoras `true`, home ausente |
| `children: ReactNode` | obrigatória | inalterada | — |

### Pontos de uso afetados (call sites)

| Arquivo | Antes | Depois |
|---------|-------|--------|
| `interface/inicio/tela.tsx` (home) | `logoComoTitulo` | sem `logoComoTitulo`, sem `comInicio` |
| `interface/calculadora/tela.tsx` | (default) | `comInicio` |
| `interface/cardiologia/tela.tsx` | (default) | `comInicio` |
| `interface/gestacao/tela.tsx` | (default) | `comInicio` |
| `interface/risco-cardiovascular/tela.tsx` | (default) | `comInicio` |

## Migração

n/a — troca de contrato de componente resolvida no mesmo commit, sem estado intermediário nem dado a converter.
