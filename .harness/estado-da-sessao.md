---
commit: 1ea35321625de049c1d446ee023e5c73f74d8dfd
feature: default_feature
start_time: '2026-07-26T21:51:17.551243+00:00'
status: inactive
---

## O que foi feito
- `/reversa-to-do` da feature **017-puericultura-crescimento**: o `roadmap.md` virou `actions.md` com **52 ações atômicas** distribuídas nas cinco fases (Preparação 6, Testes 13, Núcleo 20, Integração 9, Polimento 4), **27 marcadas `[//]`**. Estágio `to-do` marcado em `.reversa/active-requirements.json`.
- **Caminho crítico identificado, e ele não é a tela:** a maior cadeia de dependência tem 12 elos e atravessa inteira o gerador de tabelas da OMS (T002 → T029 → T030 → T032 → T033 → T034 → T039 → T043 → T044 → T045 → T048 → T049). Classificação, formulário e painel paralelizam em volta dele.
- **MD-0004 registrada (estado `aberto`):** o `roadmap.md` §5 promete `package.json` intocado e "ferramentas já presentes", ao passo que o `onboarding.md` §3 invoca `npx tsx` — e o projeto não tem `tsx` nem leitor de planilha, sendo `.xlsx` contêiner comprimido. A decomposição **não escolheu** a estratégia: registrou a lacuna como ação bloqueante (T002), pré-requisito de toda a cadeia do dado. Fechar a ficha obriga a reconciliar os dois artefatos do plano.
- Estratégia de testes decomposta com um teste por cenário Gherkin de `requirements.md#7` (T018) mais oráculos separados por família de curvas: tabelas LMS sintéticas para injeção (D-08), o oráculo embutido das colunas `SDn` da própria planilha, e os casos congelados de `gigs`/`anthro` e do INTERGROWTH-21st (T008/T019). As duas pendências de procedência viraram ação com ID: T004 (coeficientes de Villar 2015) e T001 (PDFs da caderneta).
- **Nenhuma linha de código de app tocada** — a sessão foi de decomposição e registro de decisão.

## Próximos passos
- `/reversa-audit`: confirmar com severidade a divergência de MD-0004 entre `roadmap.md` §5 e `onboarding.md` §3, antes de qualquer código.
- Depois, `/reversa-coding` a partir de T001. As ações de preparação T001, T003, T004, T005 e T006 já rodam em paralelo, sem depender do fechamento de MD-0004.
- Fechar MD-0004 em T002 é pré-requisito de todo o bloco do gerador (T029 em diante).

## Pendências / bloqueios
- **MD-0004 aberta** — estratégia de leitura do `.xlsx` pelo gerador em disputa (`devDependency` de parser × ZIP mais XML com built-ins do Node). Bloqueia T029–T034; não bloqueia o restante da preparação.
- **Caderneta da Criança ausente de `referencias/`** — os rótulos literais e as páginas de referência dependem dela; bloqueia T023 (`fonte-clinica.ts`) e, por herança, T038 e T042. É a única ação sem alternativa técnica: o PDF precisa chegar.
- **Coeficientes do INTERGROWTH-21st com procedência indireta** — lidos de `gigs` (rOpenSci), transcrição declarada de Villar 2015; o Lancet devolveu HTTP 403 deste ambiente. Conferência é T004, obrigatória antes de T035 (ver MD-0002, campo ESTADO).
- Rastreamento preventivo por perfil — PAUSADA (26/07/2026), aguardando a chave da API USPSTF (AHRQ Prevention TaskForce), solicitada em 23/07/2026 a `uspstfpda@ahrq.gov`, sem resposta. A feature nunca foi aberta como artefato; retomar por `/reversa-requirements` quando a chave chegar.
- Seis premissas 🟡 do plano da 017 a validar pelo prescritor (§4 do `roadmap.md`), somadas às 13 da re-extração nº 3.

## Ponteiros
- Feature ativa: `_reversa_forward/017-puericultura-crescimento/` · estágio `to-do` em `.reversa/active-requirements.json` · decomposição em `actions.md`.
- Microdecisões da 017: `MD-0001` (fonte editorial × dado tabular), `MD-0002` (equações fechadas do pré-termo), `MD-0003` (leitura sem interpolação e as duas fronteiras dos 5 anos), `MD-0004` (**aberta**: leitura do `.xlsx`, fecha em T002).
- Adendos vigentes: `_reversa_sdd/addenda/` (001–016). Extração Reversa nº 3: commit `ab075ac`.
- Produção: https://apsinteligente.app · saúde em `/api/v1/status` (último código em produção: feature 016, `472cb08`).
