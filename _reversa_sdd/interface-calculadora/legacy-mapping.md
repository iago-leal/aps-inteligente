# Legacy Mapping — unit `interface-calculadora`

> Arquivos do legado que compõem este módulo. Gerado pelo Archaeologist em 2026-07-19.

| Arquivo | LOC | Conteúdo relevante |
|---|---|---|
| `interface/calculadora/tela.tsx` | 43 | Moldura: cabeçalho, selo de privacidade, alternador de tema via `useSyncExternalStore` |
| `interface/calculadora/calculadora-app.tsx` | 80 | Estado `EstadoResultado`, `aoCalcular` com captura de exceção EC-07 (l. 31–48), invalidação por edição (l. 50–55), remontagem do formulário (l. 57–62) |
| `interface/calculadora/formulario.tsx` | 532 | `interpretaDecimal` (l. 57), validadores por campo (l. 66–112), linhas dinâmicas de glicemia (l. 308–396) e aplicação (l. 398–516), `derivaTipoEsquema` (l. 527) ⚠️ > 400 LOC |
| `interface/calculadora/resultado.tsx` | 291 | `EstadoResultado` (l. 16), ordem fixa do painel (l. 235–246), ritual de revisão (l. 248–271), painel de falha (l. 203–212) |
| `interface/calculadora/preferencia-de-tema.ts` | 39 | Store externo do tema; chave `aps-inteligente:tema`; degradação para claro |
| `interface/calculadora/relator-de-erros.ts` | 20 | Contrato `RelatorDeErros` + `relatorNulo` (MD-0010) |
| `interface/estilos/globais.css` | 699 | Tokens e estilos globais (tema claro/escuro via `data-tema`) ⚠️ > 400 LOC |

**Testes associados:** `tests/integration/interface/` (formulario, resultado, relator-de-erros).
