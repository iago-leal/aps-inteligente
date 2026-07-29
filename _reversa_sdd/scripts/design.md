# `scripts` — Design Técnico

> Reversa Writer, re-extração nº 4 (2026-07-28). Camada dev-time, ADR 0018.

## Posição na arquitetura

A plataforma passa a ter **cinco camadas**, e não quatro. A nova fica acima de todas e tem
direção de dependência única: `scripts/` **produz** artefatos que `models/` consome como dado,
e nunca o contrário. Nenhum arquivo de aplicação importa de `scripts/`, e a proibição é
verificada pela varredura de invariantes do domínio de puericultura. 🟢

```
scripts/  (dev-time — não entra no bundle)
   │ produz
   ▼
models/ ─── interface/ ─── pages/ ─── infra/   (aplicação)
```

## Os seis instrumentos

| Script | Entrada | Saída | Feature |
|--------|---------|-------|---------|
| `baixar-tabelas-oms.mts` | rede (cdn.who.int) | `.xlsx` em `referencias/`, fora do git | 017 |
| `gerar-tabelas-oms.mts` | `.xlsx` + manifesto | 14 módulos `.ts` + `manifesto.json` | 017 |
| `congelar-casos-oraculo.mts` | fontes originais | `casos-oraculo-puericultura.json` | 017 |
| `congelar-fichas-caderneta.mts` | PDFs da caderneta | `fichas-caderneta-congeladas.json` | 020 |
| `inventariar-textos.mts` | árvore do código | `inventario-textual.json` | 018 |
| `conferir-producao.mts` | `/api/v1/status` | veredito em saída padrão e código de saída | 022 |

## As três promessas

Cada gerador cumpre as três, e é a combinação delas que transforma a camada em instrumento de
auditoria:

1. **Escrita atômica.** Ler, verificar e emitir em memória; escrever só no fim. Uma falha no
   décimo quarto módulo não deixa treze novos ao lado de um antigo — estado que passaria em
   qualquer teste e mentiria em todos.
2. **Falha ruidosa e localizada.** A mensagem nomeia arquivo e verificação. A alternativa
   comum, avisar e seguir, é o pior modo de falha para um gerador de dado clínico.
3. **Idempotência byte a byte.** A prova não é um teste: é o `git diff` vazio, que significa
   que a origem não mudou.

## Os dois artefatos de propósito oposto

| Artefato | Regime | Por quê |
|----------|--------|---------|
| `inventario-textual.json` | **regerado** ao fim de toda revisão | mede a superfície atual do produto |
| `citacao-linha-de-base.json` | **jamais regerado** | é congelamento; regerá-lo apagaria a referência de comparação |

A distinção é o coração de `MD-0018`: dois arquivos de aparência semelhante, com ciclos de
vida opostos, e confundi-los destruiria em silêncio a única prova de que a citação permanece
fiel. 🟢

## O extrator textual

Lê a árvore sintática e distingue `StringLiteral`, template sem substituição e `JsxText` de
trivia de comentário, sem heurística. A alternativa por expressão regular confundiria literal
exibido com a mesma sequência dentro de comentário, e este repositório é denso em comentário
longo — a escolha é sobre este código, não sobre elegância. 🟢

O gerador **não infere classe**: cada literal precisa de entrada declarada em
`scripts/textos/classes/`, e candidato sem entrada faz o processo parar. Classificar por
diretório erraria nas duas direções, e erraria em silêncio: revisaria citação por omissão,
que é exatamente o que a norma proíbe. 🟢

## Dependências

- Nenhuma nova no manifesto. O Node declarado em `engines` executa TypeScript nativamente.
- Rede apenas em `baixar-tabelas-oms.mts` e em `conferir-producao.mts`.
- Sistema de arquivos, restrito aos diretórios de artefato de cada script.

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Camada dev-time separada, fora do bundle. | ADR 0018 | 🟢 |
| Escrita atômica em todos os geradores. | `scripts/lib/` | 🟢 |
| Idempotência provada por `git diff`, não por teste. | cabeçalho dos artefatos gerados | 🟢 |
| Linha de base congelada, nunca regerada. | `MD-0018` | 🟢 |
| Árvore sintática em vez de regex. | `scripts/textos/` | 🟢 |
| Classe declarada, nunca inferida. | `scripts/textos/classes/` | 🟢 |
| Sem `npx tsx`: o Node de `engines` basta. | `package.json` | 🟢 |

## Riscos e Lacunas

- 🟡 **`scripts/textos/classes/interface.mts` em 684 linhas**, acima do teto de 400 que a
  plataforma se impõe. É mapa de declarações, não lógica, e a exceção que o README concede a
  `models/puericultura/oms/tabelas/` **não o alcança nominalmente**. A saída natural é parti-lo
  por camada de tela. Dívida aberta nesta passagem.
- 🔴 **Limitação declarada do inventário:** literal montado por interpolação em tempo de
  execução — as recusas de `elegibilidade.ts`, o aviso de `medidas.ts` — fica **fora** do
  inventário por desenho do extrator, e o congelamento não o cobre. Quem revisar esses textos
  não terá guarda automática.
- 🟡 **As origens ficam fora do git** (`referencias/`), de modo que reger as tabelas exige
  baixá-las de novo. A mitigação é o `sha256` no manifesto, que prova que a origem usada foi a
  mesma.
- 🟡 **Mudança de layout das planilhas da OMS** quebraria o gerador de forma ruidosa, o que é o
  comportamento desejado, mas exigiria trabalho manual de ajuste.
