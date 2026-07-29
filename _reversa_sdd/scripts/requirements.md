# `scripts` — Requisitos

> Unit gerada pelo Reversa Writer na re-extração nº 4 (2026-07-28), a partir das features
> `017`, `018`, `019`, `020` e `022`.
> **Camada nova, que a extração anterior não conhecia de todo:** 5.517 LOC em 23 arquivos
> `.mts`, volume comparável ao de um domínio inteiro. Fundamento em ADR 0018.

## Visão Geral

A camada dev-time fica **acima** das quatro camadas de aplicação: não entra no bundle, não é
importada por `models/`, `interface/` nem `pages/`, e não roda em produção. Ela existe para
produzir e conferir artefatos que o código de aplicação consome como dado — tabelas geradas,
oráculos congelados, inventário textual — e para conferir a produção depois do deploy. 🟢

Roda no Node declarado em `engines`, que executa TypeScript nativamente: sem `npx tsx`, e
**sem dependência nova no manifesto**. 🟢

## Responsabilidades

- Baixar as planilhas da OMS, única leitura de rede de toda a cadeia. 🟢
- Converter as planilhas em 14 módulos TypeScript, conferindo `sha256` contra o manifesto. 🟢
- Congelar os casos-oráculo das duas réguas de crescimento a partir das fontes originais. 🟢
- Congelar os rótulos das dez páginas verdes da caderneta. 🟢
- Inventariar a superfície textual do produto, com arquivo, linha e classe de cada literal. 🟢
- Conferir o SHA publicado e a saúde da produção. 🟢

Fora de escopo: qualquer coisa que rode em produção; qualquer escrita fora dos diretórios de
artefato gerado; qualquer inferência sobre a classe de um texto.

## Regras de Negócio

> As três primeiras são **promessas comuns a todos os geradores**, e são elas que fazem da
> camada um instrumento de auditoria, e não um utilitário.

| ID | Regra | Confiança |
|----|-------|-----------|
| RN-01 | **Nenhuma escrita parcial.** Tudo é lido, verificado e emitido em memória; o primeiro byte só chega ao disco quando o último passou. Uma falha na décima quarta tabela não deixa treze módulos novos ao lado de um antigo. | 🟢 |
| RN-02 | **Falha ruidosa e localizada.** A mensagem diz qual arquivo e em que verificação parou. Avisar e seguir seria o pior modo de falha possível. | 🟢 |
| RN-03 | **Idempotência byte a byte.** Rodar duas vezes sobre as mesmas origens produz arquivos idênticos, e o `git diff` vazio é a prova de que a origem não mudou. | 🟢 |
| RN-04 | Dois artefatos de propósito oposto no tempo: o inventário textual é **regerado** ao fim de toda revisão; a linha de base de citação **jamais** é regerada, porque regerá-la apagaria justamente o que ela existe para comparar. | 🟢 |
| RN-05 | O extrator de literais lê **árvore sintática**, e não expressão regular: regex confundiria literal exibido com a mesma sequência dentro de comentário, e este repositório é denso em comentário longo. | 🟢 |
| RN-06 | O gerador **não infere classe alguma**. Autoral, citação e identificador são decisão declarada em `scripts/textos/classes/`, e candidato sem entrada **faz o gerador parar**, nomeando arquivo e linha. | 🟢 |
| RN-07 | Classificar por diretório erraria nas duas direções e erraria em silêncio, revisando citação por omissão — daí a declaração explícita. | 🟢 |
| RN-08 | O manifesto das tabelas registra `url`, `sha256`, tamanho e data de download de cada origem. | 🟢 |
| RN-09 | O conferidor de produção lê a idade do deploy e o estado do banco, e promove degradado a saída não-zero apenas sob `--exigir-saudavel`. | 🟢 |
| RN-10 | Nenhum script escreve fora dos diretórios de artefato que lhe cabem. | 🟢 |

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|--------------------|
| RF-01 | Baixar as planilhas da OMS para `referencias/`, fora do git. | Must | `scripts/baixar-tabelas-oms.mts`. |
| RF-02 | Gerar os 14 módulos de tabelas com conferência de `sha256`. | Must | Reexecução produz `git diff` vazio. |
| RF-03 | Congelar 356 casos da OMS e 1.596 células do INTERGROWTH-21st. | Must | `tests/apoio/casos-oraculo-puericultura.json`. |
| RF-04 | Congelar cerca de 350 rótulos das dez páginas verdes, em duas passagens e duas tiragens. | Must | `tests/apoio/fichas-caderneta-congeladas.json`. |
| RF-05 | Inventariar 1.187 literais com arquivo, linha e classe. | Must | `tests/apoio/inventario-textual.json`. |
| RF-06 | Parar com erro nomeando arquivo e linha quando houver literal sem classe declarada. | Must | Acrescentar literal novo sem entrada faz `node scripts/inventariar-textos.mts` parar. |
| RF-07 | Conferir o SHA publicado e a saúde da produção. | Must | `npm run status:conferir`. |
| RF-08 | Não introduzir dependência nova no manifesto. | Must | `package.json` sem acréscimo por conta desta camada. |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Reprodutibilidade | Idempotência byte a byte, com `git diff` como prova. | Todos os geradores | 🟢 |
| Integridade | `sha256` de cada origem no manifesto. | `models/puericultura/oms/tabelas/manifesto.json` | 🟢 |
| Atomicidade | Emissão em memória; nada chega ao disco antes de tudo passar. | `scripts/lib/` | 🟢 |
| Isolamento | Nenhum import de `scripts/` a partir do código de aplicação. | Verificado por `invariantes.test.ts` no domínio | 🟢 |
| Manutenibilidade | 🟡 `scripts/textos/classes/interface.mts` em 684 linhas, acima do teto de 400. | `dependencies.md`, dívida | 🟡 |

## Critérios de Aceitação

```gherkin
Cenário: idempotência
  Dado as mesmas planilhas de origem
  Quando o gerador de tabelas roda duas vezes
  Então os 14 módulos são idênticos byte a byte, e o git diff fica vazio

Cenário: origem alterada
  Dado uma planilha cujo sha256 difere do manifesto
  Quando o gerador roda
  Então ele para, nomeia o arquivo e a verificação que falhou, e nada é escrito

Cenário: literal sem classe
  Dado um literal novo em interface/ sem entrada em scripts/textos/classes/
  Quando o inventário roda
  Então ele para, dizendo arquivo e linha

Cenário: linha de base de citação
  Dado a linha de base congelada
  Quando qualquer script roda
  Então ela permanece intocada, porque regerá-la apagaria a referência de comparação
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Idempotência e escrita atômica | Must | Sem elas a camada deixaria de ser auditável. |
| Parada por literal sem classe | Must | É o que impede a revisão silenciosa de citação. |
| Conferência de `sha256` | Must | Detecta mudança de origem que o olho não veria. |
| Árvore sintática no extrator | Must | Regex erraria neste repositório em particular. |
| Conferidor de produção | Should | Útil, mas o deploy funciona sem ele. |
| Download das planilhas | Should | Manual seria possível; automatizado é reproduzível. |

## Rastreabilidade de Código

| Arquivo | Papel | Cobertura |
|---------|-------|-----------|
| `scripts/baixar-tabelas-oms.mts` | Única leitura de rede da cadeia | 🟢 |
| `scripts/gerar-tabelas-oms.mts` + `scripts/oms/` | Planilhas → 14 módulos | 🟢 |
| `scripts/congelar-casos-oraculo.mts` + `scripts/oraculo/` | Oráculo das duas réguas | 🟢 |
| `scripts/congelar-fichas-caderneta.mts` | Congelamento das dez fichas | 🟢 |
| `scripts/inventariar-textos.mts` + `scripts/textos/` | Inventário textual e classes | 🟢 |
| `scripts/conferir-producao.mts` | Conferência de SHA e saúde | 🟢 |
| `scripts/lib/` | Emissão atômica e utilidades comuns | 🟢 |
