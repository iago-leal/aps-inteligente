# Legacy impact — feature 010-dor-toracica-pre-teste

> Data: 2026-07-23 · Cenário: legado · Âncora: `_reversa_sdd/architecture.md` + `domain.md`

Feature puramente **aditiva**, no molde da 007: nova unit de domínio e nova tela, sem tocar
os motores existentes. Nenhuma regra 🟢 do `domain.md` foi alterada ou removida.

## Arquivos afetados

| Arquivo | Componente (`_reversa_sdd/`) | Tipo | Severidade | Justificativa |
|---|---|---|---|---|
| `models/cardiopatia-isquemica/{tipos,fonte-clinica,classificacao,probabilidade,conduta,validacao,calculadora}.ts` | `architecture.md#1` (domínio puro) | componente-novo | LOW | Terceira unit de domínio, isolada; sem dependência dos motores |
| `interface/cardiologia/{app,formulario,resultado,referencias,tela}.tsx` | `architecture.md#2` (interface) | componente-novo | LOW | Tela nova reusando `Moldura`, `relator-de-erros`, `erro-de-campo` |
| `interface/inicio/catalogo.ts` | `addenda/007` (catálogo, fonte única) | regra-alterada | LOW | Nova seção `cardiologia` acrescentada (aditiva; entradas antigas byte a byte) |
| `interface/inicio/icones.tsx` | `addenda/008` (ícones da home) | regra-alterada | LOW | Mapa ganha `cardiologia → HeartIcon`; fallback null preservado |
| `pages/cardiologia/dor-toracica.tsx` | `code-analysis.md#módulo-3` (pages) | componente-novo | LOW | Rota nova, molde de `pages/pre-natal/idade-gestacional.tsx` |
| `pages/_app.tsx` | `architecture.md#2` (shell) | regra-alterada | LOW | Um import de CSS acrescentado após os globais; ordem preservada |
| `interface/estilos/cardiologia.css` | `addenda/009` (camada de estilo) | componente-novo | LOW | Folha própria (globais.css no teto de 400 linhas); só tokens Primer |
| `tests/unit/dominio-cardiopatia/*` · `tests/integration/interface/cardiologia.test.tsx` | `architecture.md#5` (testes) | componente-novo | LOW | +81 unidade (property-based), +9 integração |
| `tests/integration/interface/inicio.test.tsx` | `architecture.md#5` | regra-alterada | LOW | +1 caso da seção nova; asserções antigas byte a byte |
| `e2e/plataforma.spec.ts` · `e2e/axe-baseline.json` | `addenda/007` (harness e2e) | regra-alterada | LOW | +6 casos aditivos; baseline ganha 2 chaves em zero; chaves antigas intocadas |
| `README.md` | `addenda/007` (diretriz de telas) | regra-alterada | LOW | +1 linha na tabela de calculadoras |
| `referencias/telecondutas-*.pdf` | MD-0008 | delta-de-dados | LOW | PDF da terceira fonte, fora do versionamento (`.gitignore` já cobre) |

Contratos externos: **nenhum delta** — `GET /api/v1/status`, CSP e cabeçalhos byte a byte
(contrato 16/16). Zero requisição de rede nova.

## Diff conceitual

- **Domínio.** Nasce `models/cardiopatia-isquemica/`: a fonte (Quadro 2 congelado como matriz de
  24 células), a classificação da dor (RN-01), a probabilidade com ajuste por fatores de risco
  (RN-02/RN-03), a conduta por estrato (RN-04/RN-05), a advertência de instabilidade (RN-07), a
  validação de coleta total (RN-09) e a fachada. Erros e fora-de-escopo são valores de união; a
  exceção `ErroDeInvariante` só sinaliza bug (ADR 0004). Toda saída carrega `ReferenciaClinica`.
- **Interface.** `interface/cardiologia/` compõe a `Moldura` comum com formulário, painel de
  resultado (4 variantes), advertência em destaque e os blocos de referência (RF-10). Sem ritual
  de revisão (D-08). Navegação pela fonte única `catalogo.ts`.
- **Navegação.** A home ganha a seção "Cardiologia" e a rota `/cardiologia/dor-toracica`; a raiz
  e as rotas existentes permanecem inalteradas.

## Preservadas (regras 🟢 do `domain.md` intactas)

- §3.5 (RN-02/MD-0003) **Privacidade por construção**: a tela nova não faz fetch nem storage de
  dado clínico; `EventoDeErro` só transporta o nome da classe. Estendida, não alterada.
- §3.5 (RN-06/EC-03) **Invalidação por edição**: aplicada à tela nova.
- §3.4 (regra 15) **Coleta total de ofensores**: replicada em `validacao.ts` da unit nova.
- §3.4 (regra 20 / ADR 0004) **Erros como valores; toda saída referenciada**: invariante verificado
  por property-based na unit nova.
- ADR 0001/0005/0009 **Escopo = fonte; apoio à decisão, não decisão; fora do escopo é honesto**:
  idade fora de 30–69 → `ForaDoEscopoDaFonte`; a probabilidade e a conduta seguem o guia sem escolher
  pelo prescritor.
- Motores `models/insulina/` e `models/gestacao/` **byte a byte** (`git diff` vazio).

## Modificadas (regras 🟢 alteradas ou removidas)

Nenhuma. A alteração no catálogo e no harness e2e é **extensão aditiva** das regras introduzidas
pelas features 007/008, não modificação de regra 🟢 do `domain.md`.
