# Adendo 021 — A ficha de consulta encaixa na coluna do corpo

> Feature: `021-coluna-da-ficha-de-consulta`
> Data: `2026-07-28`
> Cenário: `legado`

## Vigência

Vigente desde 2026-07-28.

Superado pela re-extração de 2026-07-28.

## Resumo da entrega

A tela `/puericultura/consulta`, entregue pela feature 020, apresentava o corpo colado nas duas
bordas da janela, enquanto o cabeçalho logo acima respeitava a coluna centrada das outras cinco
telas. A 021 corrige o enquadramento — e só ele: nenhuma regra clínica, nenhum campo, nenhum
texto e nenhuma rota mudam.

O que a entrega tem de estrutural não é a correção, e sim o **lugar** dela. Até aqui a coluna do
corpo não existia como enunciado: existia como coincidência de nome de classe, herdada por as
cinco primeiras telas reusarem `.calc-regioes`. A sexta precisou de outro arranjo interno,
escreveu classe própria e não herdou nada. A coluna passa a morar no `<main>` da `Moldura`,
governada pelo atributo `data-apresentacao` que o componente já emitia e pelo qual o cabeçalho já
era calibrado desde a feature 013. A sétima tela nasce enquadrada por construção.

A entrega fecha também a razão de o defeito ter passado: a guarda geométrica que existe desde a
013 para exatamente este problema media uma rota fixa, e a rota nova nasceu fora do alcance dela.

**24 de 24 ações concluídas**, nenhuma falha. Cinco portões verdes: `typecheck`, `lint`, 808
testes de unidade e integração, 56 roteiros e2e e o inventário textual idempotente. Custo de
bundle **negativo**, −409 B gzip.

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|---|---|---|---|
| `_reversa_sdd/architecture.md` | §2, Containers e componentes | componente-novo | `interface/estilos` passa a ter **nove** folhas, e não oito: nasce `moldura.css`, sede única da coluna do corpo nas duas variantes de `apresentacao` |
| `_reversa_sdd/architecture.md` | §2, Containers e componentes | regra-alterada | Onde se lê "a `Moldura` comum que embala home e telas", leia-se que ela é agora **dona do enquadramento horizontal** de toda tela, e não só da estrutura. O componente `.tsx` não mudou: a regra alcança o `<main>` pelo seletor `.pagina[data-apresentacao="…"] > main`, sem classe nova no JSX |
| `_reversa_sdd/architecture.md` | §5, Qualidade e testes | regra-alterada | Onde se lê "guardas geométricas de cabeçalho (features 011/013)", leia-se que a guarda de enquadramento deixou de medir uma rota nomeada e passou a percorrer as rotas que `interface/inicio/catalogo.ts` declarar, mais a home, medindo o `<main>` e lendo o recuo do estilo computado. São **sete casos**, e calculadora nova cai sob a guarda ao entrar no catálogo. A contagem sobe para 38 arquivos de teste |
| `_reversa_sdd/architecture.md` | §6, Dívidas técnicas | regra-alterada | A dívida 3 (`globais.css` no teto de 400 linhas), já marcada RESOLVIDA na re-extração 3, folga mais: a folha **encolhe** ao ceder as três propriedades horizontais, e a regra nova nasceu em folha própria justamente para não a reabrir |
| `_reversa_sdd/domain.md` | §7.2, Regras da interface com força de navegação | regra-nova | Entra a invariante que faltava enunciar: **o corpo de toda tela ocupa a coluna calibrada contra o cabeçalho**, 1180px na variante `padrao` e 720px na `destaque`, com recuo de 32px que cai para 16px em 900px e em 544px respectivamente. Não é preferência estética: é a referência contra a qual o cabeçalho foi calibrado na 013, e tela cujo corpo saia dela desalinha o próprio cabeçalho. O corolário é obrigação: quem declarava a coluna deixa de declará-la, sob pena de coluna aninhada |

Nenhum impacto em `erd-complete.md`, `data-dictionary.md` ou `openapi/status.yaml`: a feature não
toca dado nem contrato externo, e `git diff` vazio em `models/`, `interface/inicio/catalogo.ts` e
`pages/api/` é critério de aceite verificado (RF-09).

Registre-se, por ser leitura que a próxima re-extração há de corrigir e que **não** foi causada por
esta feature: `domain.md` §7.2, item 11, descreve a `Moldura` governada pela prop
`logoComoTitulo`, que o componente não tem mais — hoje é `comInicio`. A 021 apoia-se no mesmo
componente e não depende da prop.

## Regras sob vigilância

Oito watch items nascem desta entrega: **W001** a **W008**, em
`_reversa_forward/021-coluna-da-ficha-de-consulta/regression-watch.md`.

Os de maior valor são W002, W003 e W007, porque vigiam a própria rede: esta feature existe
porque uma guarda de regressão falhou em regredir, por estar presa a uma rota.

Oito observações sem peso de regressão acompanham a lista, entre elas duas que interessam à
próxima re-extração: os adendos das features **019** e **020** continuam pendentes de
`/reversa-sync` (`O-21-04`), de modo que a extração registra esta correção sem registrar o que
foi corrigido.

## Fontes

- `_reversa_forward/021-coluna-da-ficha-de-consulta/requirements.md`
- `_reversa_forward/021-coluna-da-ficha-de-consulta/roadmap.md`
- `_reversa_forward/021-coluna-da-ficha-de-consulta/legacy-impact.md`
- `_reversa_forward/021-coluna-da-ficha-de-consulta/regression-watch.md`
- `_reversa_forward/021-coluna-da-ficha-de-consulta/actions.md`
- `_reversa_forward/021-coluna-da-ficha-de-consulta/progress.jsonl`
- `_reversa_forward/021-coluna-da-ficha-de-consulta/audit/cross-check.md`
- `.harness/decisoes/MD-0029.md`
