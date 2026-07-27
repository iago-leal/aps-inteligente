---
commit: 533d70fc583d01c0896a3c7cde1b0b238df04465
feature: default_feature
start_time: '2026-07-27T21:33:40.713530+00:00'
status: inactive
---

## O que foi feito
- **A feature 018 fechou: `/reversa-sync`, commit, push e nota do vault.** A sessão encontrou o `/reversa-coding` **já concluído no working tree** — 62/62 ações `[X]`, `progress.jsonl` com 62 linhas todas `done` — sem que nada disso tivesse entrado no histórico. Consolidou-se a entrega: adendo, verificação, commit único **`533d70f`** e push para `aps-inteligente/main`. Havia 69 arquivos pendentes, entre eles todo o aparato de verificação textual.
- **O adendo `018-revisao-linguagem-textos.md` foi criado em `_reversa_sdd/addenda/`**, cenário legado, com **18 impactos** mapeados sobre os artefatos da extração nº 3 — 12 `regra-alterada`, 2 `componente-novo`, 2 `delta-de-contrato-externo`, 2 `delta-de-dados`, 1 `regra-nova`; nenhum `componente-extinto` nem `regra-removida`. Os 24 watch items entraram por ID, sem duplicar conteúdo. Nenhum artefato da extração foi tocado — o `git status` de `_reversa_sdd/` mostrava só o arquivo novo.
- **A verificação antes do commit achou uma cifra errada, e é a mesma espécie de erro que a feature existe para combater.** O `legacy-impact.md` e a `reconciliacao-spec.md` §4 afirmam que a suíte foi "de 52 para 59 arquivos"; a execução mostra **52 arquivos ao final**, não ao início — o número certo é **45 → 52 arquivos** e **642 → 673 testes**. O 52 foi lido depois da entrega e tomado por antes. Como o sync só escreve em `addenda/`, a correção ficou **no adendo**, com a divergência declarada em vez de silenciada.
- **Suíte verde conferida nesta sessão:** 52 arquivos, 673 testes, 6,2 s; `typecheck` e `eslint` limpos. Os três arquivos de `tests/contract/` ficam fora do `vitest run` padrão — daí o `find` contar 55 e o runner, 52.
- **CI verde e produção no SHA novo, confirmados e não deixados como pendência.** O run do `533d70f` concluiu em 2 min 1 s e `/api/v1/status` responde `533d70fc583d…`. Foi a primeira vez em sete sessões que a confirmação de deploy não passou para a retomada seguinte.
- **A nota do vault (`~/Notas/Projetos/aps-inteligente.md`) foi atualizada**, e não só acrescida: o bloco da 017, que ainda a descrevia como "EM CURSO, planejada", passou a **ENTREGUE** com o registro do que se previu preservado abaixo; entrou o bloco da 018; a pendência do PDF da Caderneta foi riscada como resolvida; e a linha de Retomada deixou de apontar `/reversa-to-do` para apontar a re-extração nº 4.
- Encerramento não versionado: o estado de sessão ficou como mudança pendente no working tree.

## Próximos passos
- **A re-extração `/reversa` nº 4 é a candidata mais forte da retomada**, e por acúmulo: quatro adendos vigentes a absorver (**015, 016, 017, 018**), duas dívidas que só ela fecha (**L-07** e **L-11**) e um sistema que cresceu de quatro para **cinco domínios** desde a nº 3, com uma camada dev-time de geradores e sete verificadores de texto que a extração ainda não conhece.
- Alternativa legítima: **`/reversa-forward`** com feature nova. A primeira que trouxer esquema de negócio nasce com migração junto (D-09).
- **Abrir ticket para L-10**, as duas violações axe toleradas em `e2e/axe-baseline.json` (`telaInicial` e `telaComResultado`, herdadas da feature 004). É dívida sem dono há três features.

## Pendências / bloqueios
- **Nada em curso.** O repositório está limpo, a 018 está no histórico e em produção, e não há feature ativa a meio caminho. É um ponto de parada raro neste projeto: as últimas seis retomadas começavam por confirmar um deploy.
- **As cifras erradas continuam nos artefatos da 018.** O `legacy-impact.md` e a `reconciliacao-spec.md` §4 seguem dizendo "52 para 59"; o adendo declara a correção, mas os artefatos da feature são somente leitura para o `/reversa-sync`. A re-extração nº 4 deve ler o adendo, não os dois.
- **Três premissas 🟡 da 017 a validar pelo prescritor**: os 1095 dias da correção de idade, a idade cronológica governando a posição de medida no prematuro, e o escore z com uma casa decimal. Somam-se às 13 da re-extração nº 3.
- **Dívida de higiene alheia à feature:** `npm run format:check` segue acusando centenas de arquivos, quase todos documentação pré-existente do Reversa. Não é gate do CI.
- Rastreamento preventivo por perfil — PAUSADA (26/07/2026), aguardando a chave da API USPSTF, pedida em 23/07/2026 a `uspstfpda@ahrq.gov`, sem resposta em quatro dias. Se o silêncio passar de duas semanas, redigir follow-up na thread.

## Ponteiros
- **A regra que esta sessão confirmou pela terceira vez em dois dias:** número escrito em prosa envelhece, e o dano não é o engano — é o verificador que nasce vermelho sobre texto sem defeito e ensina alguém a afrouxá-lo. A 018 registrou três cifras envelhecidas durante a própria execução; a quarta apareceu no commit dela.
- **Onde a correção da cifra vive:** `_reversa_sdd/addenda/018-revisao-linguagem-textos.md`, linha de `architecture.md #5`, com a divergência nomeada. O sync não corrige artefato alheio: anota.
- **O que a 018 deixou como regra permanente para quem escrever texto novo:** literal sem classe declarada em `scripts/textos/classes/` **para o gerador**. A norma vive em `docs/redacao.md`, apontada pelo `CLAUDE.md` e pelo `README.md`, sob o princípio **IX**.
- **A linha de base da citação (`tests/apoio/citacao-linha-de-base.json`) jamais se regera.** Um segundo commit nesse arquivo transforma a comparação de RF-07 em verde perpétuo e incapaz de reprovar. É o W007 da 018, e o modo de falha mais silencioso da feature.
- Feature 018: **encerrada**. Quinze arquivos em `_reversa_forward/018-revisao-linguagem-textos/`; o ponteiro em `.reversa/active-requirements.json` marca `coding`, e o sync não o avança.
- Microdecisões em `.harness/decisoes/`: `MD-0001` a **`MD-0019`**. `MD-0014` segue `superado-parcialmente`. Índice em `.harness/microdecisoes.md`.
- **Adendos vigentes:** 015, 016, 017 e **018**; os de 001 a 014 foram superados pela re-extração nº 3 (commit `ab075ac`).
- Produção: https://apsinteligente.app · saúde em `/api/v1/status`. SHA **`533d70f`**, confirmado nesta sessão com CI verde.
