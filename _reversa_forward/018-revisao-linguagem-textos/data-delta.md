# Delta de dados: Revisão da linguagem dos textos da plataforma

> Identificador: `018-revisao-linguagem-textos`
> Data: `2026-07-27`
> Base de comparação: `_reversa_sdd/erd-complete.md` (re-extração nº 3, 2026-07-23) e `_reversa_sdd/data-dictionary.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. O que não muda, e por que dizê-lo

🟢 **Nenhuma alteração no modelo relacional.** Não há tabela criada, coluna acrescentada, índice, constraint nem migração. O registro é curto porque a base já é curta: `_reversa_sdd/erd-complete.md` declara que **não há persistência de dado clínico** (ADR 0002), e o PostgreSQL da feature 003 responde apenas `SELECT 1`, sem esquema clínico. Uma feature de linguagem não teria como tocá-lo, e a conferência confirma que não toca.

🟢 **Nenhuma alteração nas entidades em memória.** Os ERDs dos quatro domínios extraídos — mais o quinto, da puericultura, que vive no adendo 017 — modelam tipos de `models/*/tipos.ts`. Nenhum campo nasce, morre ou muda de tipo. O que muda é o **valor** de duas constantes de texto, o que é delta de conteúdo congelado, não de estrutura.

Esta seção existe por disciplina do Princípio V: a coleção SDD é proporcional, e um molde dispensado é registrado como dispensa, jamais simulado com conteúdo vazio.

## 2. Delta nas constantes congeladas do domínio

O projeto trata as constantes de `fonte-clinica.ts` como dado, não como código: são congeladas por `Object.freeze` (invariante 5 de `domain.md` §7), versionadas, e servem de fonte única a tudo que a tela exibe. Alterá-las é alteração de dado, e é aqui que ela se registra.

### 2.1 `models/puericultura/fonte-clinica.ts` — dois rótulos de classificação

| Campo | Antes | Depois | Autorização |
|---|---|---|---|
| `CORTES_COMPRIMENTO[…].rotulo` (linha 77) | `Comprimento adequada para idade` | `Comprimento adequado para idade` | RN-09 + §2.4 do `requirements.md` |
| `CORTES_COMPRIMENTO[…].rotulo` (linha 82) | `Baixa comprimento para idade` | `Baixo comprimento para idade` | RN-09 + §2.4 |

Alcance da mudança: **concordância nominal de gênero, e nada mais.** Nenhum corte de escore z se move, nenhuma faixa muda de fronteira, nenhuma ordem de classificação se altera. O rótulo é o texto que acompanha a faixa; a faixa é intocada.

Os vinte e três rótulos restantes do arquivo permanecem byte a byte, incluindo os dois que a análise poderia confundir com estes: `Muito baixo comprimento para idade`, gramaticalmente correto na fonte, e a elipse do artigo em `para idade`, uniforme em vinte e quatro dos vinte e cinco rótulos. 🟢

### 2.2 `models/puericultura/fonte-clinica.ts` — constante nova

| Constante | Natureza | Papel |
|---|---|---|
| `NOTA_CORRECAO_DE_CONCORDANCIA` | `string` congelada, exportada | Declara ao leitor o afastamento autorizado por RN-09, nomeando as formas impressas originais (RF-10) |

Mora ao lado de `NOTA_PROVENIENCIA` e é lida por `interface/puericultura/proveniencia.tsx` pelo mesmo caminho. Constante separada, e não emenda na existente, por D-06: são dois assuntos, e a `NOTA_PROVENIENCIA` já opera no teto de travessões de RN-03.

### 2.3 `models/puericultura/fonte-clinica.ts` — a `NOTA_PROVENIENCIA`

Classe **autoral**, e portanto revisável em forma por RF-03. O texto atual, de cerca de 500 caracteres, carrega **dois pares de travessão** num único bloco, contra o teto de um par fixado em RN-03. A reescrita é de pontuação e de encadeamento; RN-04 protege integralmente o conteúdo, que precisa continuar afirmando, sem perda: a leitura por tendência de medidas sucessivas, as curvas da OMS de 2006 e a referência de 2007, a faixa INTERGROWTH-21st de 27 a 64 semanas pós-menstruais reproduzida na p. 87, e a leitura na linha publicada sem interpolação. 🟢

### 2.4 O que não é tocado nas outras fontes clínicas

`models/insulina/fonte-clinica.ts`, `models/gestacao/fonte-clinica.ts`, `models/cardiopatia-isquemica/fonte-clinica.ts` e `models/risco-cardiovascular/fonte-clinica.ts` têm seus literais **classificados** pelo inventário, e os autorais entre eles são revisáveis em forma; nenhum tem desvio de concordância na classe citação, e a exceção de RN-09 não os alcança. A comparação de RF-07 cobre os cinco arquivos e reprova qualquer delta de citação fora dos dois de §2.4.

## 3. Artefato de dado novo: o inventário textual

Único arquivo de dado que a feature cria, e o eixo técnico do plano (D-02).

- **Caminho:** `tests/apoio/inventario-textual.json`
- **Gerado por:** `scripts/inventariar-textos.mts`
- **Versionado:** sim, e o `git diff` vazio na segunda execução é a prova de idempotência
- **Editado à mão:** nunca — o aviso no próprio arquivo o declara, no molde de `casos-oraculo-puericultura.json`

### 3.1 Esquema proposto

Segue a forma já estabelecida em `tests/apoio/casos-oraculo-puericultura.json`: metadados de proveniência no topo, dado abaixo, consumidores nomeados. 🟡 — proposta do plano, a fixar na execução.

| Campo | Tipo | Papel |
|---|---|---|
| `esquema` | `string` | `inventario-textual/1`, para versionar o formato |
| `feature` | `string` | `018-revisao-linguagem-textos` |
| `geradoPor` | `string` | `scripts/inventariar-textos.mts` |
| `aviso` | `string` | Arquivo gerado; não editar à mão |
| `porQueExiste` | `string` | Lista fechada de RF-02, oráculo de RF-06, entrada de RF-05, linha de base de RF-07 |
| `consumidores` | `string[]` | Os arquivos de teste que o leem |
| `totais` | `objeto` | Contagem por classe e por camada, que substitui a heurística de §2.1 |
| `literais` | `objeto[]` | O inventário propriamente dito |

Cada entrada de `literais`:

| Campo | Tipo | Papel |
|---|---|---|
| `arquivo` | `string` | Caminho relativo à raiz do repositório |
| `linha` | `number` | Posição no arquivo, para navegação |
| `classe` | `"autoral" \| "citacao" \| "identificador"` | Declarada no mapa de D-04, jamais inferida |
| `texto` | `string` | O literal, que é o que fica congelado |
| `origem` | `string` (opcional) | Para a classe citação, a fonte e a localização que a sustentam |
| `excecao` | `string` (opcional) | Presente apenas nos dois rótulos de §2.4, apontando `MD-0015` |

### 3.2 O mapa de classificação

Artefato de acompanhamento, não gerado: `scripts/textos/classificacao.mts` 🟡. Chaveado por arquivo e pelo texto do literal — não pela linha, que se move a cada edição e produziria falso desalinhamento. Literal candidato ausente do mapa faz o gerador parar, nomeando arquivo e linha, com a mensagem que ensina onde declarar.

## 4. Dados que a feature deliberadamente não reprocessa

🟢 `tests/apoio/casos-oraculo-puericultura.json` **não é regerado.** A conferência desta sessão mostra que ele guarda apenas valores numéricos da OMS e do INTERGROWTH-21st — chaves `oms` e `intergrowth` — e nenhum rótulo de classificação. Seu regenerador exige as fontes clínicas de `referencias/`, pasta que o `.gitignore` exclui; se os rótulos estivessem ali, a feature dependeria de ter os PDFs em mãos. Não estão, e não depende.

🟢 Os módulos de tabela da OMS em `models/puericultura/oms/tabelas/` também ficam intactos. Seus cabeçalhos usam ponto médio como separador de metadado de proveniência, mas são **comentários de arquivo gerado**, fora da fronteira fixada em L-01, e o gerador os reescreveria na primeira execução seguinte.

## 5. Migração

Não aplicável. Não há dado persistido a migrar, e as constantes alteradas são compiladas junto com o código: quem carrega a página nova recebe o texto novo, sem estado intermediário. Não há cache de texto, não há armazenamento local de resultado e não há versão de dado a coexistir.

## 6. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-27 | Versão inicial gerada por `/reversa-plan` | reversa |
