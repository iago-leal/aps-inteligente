<!-- GENERATED, DO NOT EDIT: regenerado por /reversa-debugger-fix em 2026-08-09T19:00:00Z a partir de 3 bugs em 2 contextos -->

# Rastreabilidade BUG↔SPEC — espelho global

Source of truth: `_reversa_bugs/<contexto>/bugs/*/bug.md`. Bugs `restricted` ficam fora deste espelho (nenhum no momento). Mudança de conteúdo de spec é assunto dos adendos em `_reversa_sdd/addenda/`.

## `models-insulina/requirements.md` § 3 Regras de Negócio (RN-H)

- BUG-20260719-RHZ5 (resolved/fixed, P2): Motor silencioso com HbA1c ausente nos ramos residuais da intensificação — `_reversa_bugs/motor-insulina/bugs/BUG-20260719-RHZ5-hba1c-ausente-silencioso/`
  - Leitura efetiva da RN-H regida pelo adendo `_reversa_sdd/addenda/bug-BUG-20260719-RHZ5-v001.md` (veredito `spec-desatualizada`, vigente desde 2026-07-19).

## `domain.md` § 3.3 Intensificação (regra 9)

- BUG-20260719-RHZ5 (resolved/fixed, P2): mesmo defeito, refletido na regra 9 do gate — `_reversa_bugs/motor-insulina/bugs/BUG-20260719-RHZ5-hba1c-ausente-silencioso/`

## `models-puericultura-consulta/contracts.md` § Forma do texto emitido e § Regras da forma (regras 5, 7 e 8)

- BUG-20260728-ZAHV (resolved/fixed, P0): Notas de proveniência e linha da fonte atravessam para o texto copiado do registro — `_reversa_bugs/consulta-puericultura/bugs/BUG-20260728-ZAHV-notas-de-proveniencia-no-texto-copiado/`
  - **A spec descrevia o comportamento reclamado**, e é por isso que o veredito foi `spec-desatualizada` e não uma emenda de código: a regra 7 determinava que as notas fechassem o texto e a linha da fonte fechasse as notas, que era exatamente o que a tela fazia. A decisão `MD-0035`, de 2026-07-28, revogou a regra para o texto emitido e manteve a declaração no bloco de proveniência da tela.
  - Leitura efetiva regida pelo adendo `_reversa_sdd/addenda/bug-BUG-20260728-ZAHV-v001.md` (vigente desde 2026-07-28), que alcança o § Forma do texto emitido, revoga as regras 7 e 8 e emenda a regra 5.
  - ⚠️ **Numeração divergente entre as duas specs.** A regra 8 revogada é a de `contracts.md` (composição da linha da fonte). A regra 8 de `_reversa_forward/020-.../interfaces/registro-soap.md` § 2 é outra coisa — "nenhum identificador da criança" (RN-12) — e **permanece integralmente vigente**, com teste próprio em `tests/unit/interface/formatar-registro.test.ts`.

## `interface-puericultura-consulta/requirements.md` § Requisitos Funcionais

- BUG-20260728-ZAHV (resolved/fixed, P0): por RF-08, que exige identidade byte a byte entre o texto exibido e o copiado. **RF-08 não mudou**: a identidade continua exigida e cumprida, agora sobre a cadeia já cortada — a propriedade é estrutural (uma função, uma variável, dois consumidores) e o corte não a tocou.
- BUG-20260728-C6LN (resolved/fixed, P2): Comando "Avaliar crescimento" fica fora do quadro "1. Medidas" — `_reversa_bugs/consulta-puericultura/bugs/BUG-20260728-C6LN-avaliar-crescimento-fora-do-quadro-medidas/`
  - RF-01 enumerava as partes a compor sem fixar onde o gatilho do painel se ancora, e **continua enumerando**: o adendo não a emenda, acrescenta. A leitura efetiva ganha a ressalva de que a enumeração não é ordem de irmandade — o gatilho vive dentro da ficha, e não ao lado dela.
  - Leitura efetiva regida pelo adendo `_reversa_sdd/addenda/bug-BUG-20260728-C6LN-v001.md` (veredito `spec-gap`, vigente desde 2026-08-09), que cria **RN-13** (o gatilho mora no quadro que contém campos de medida, identificado por natureza do campo e nunca por título) e **RN-14** (cada ficha tem uma e uma só seção assim).

## `interface-puericultura-consulta/requirements.md` § Requisitos Não Funcionais

- BUG-20260728-C6LN (resolved/fixed, P2): a linha de acessibilidade que promete foco preso no painel e retorno ao gatilho era a restrição que a mudança de posição precisava preservar, e **preservou**. A correção põe o gatilho numa árvore que se remonta ao trocar de ficha, de modo que a promessa ganhou guarda própria em `e2e/consulta-puericultura.spec.ts`, além da que já existia.

## Bugs em `spec-gap`

| Bug | Comportamento sem spec |
|---|---|
| BUG-20260728-C6LN | A posição do comando que abre o painel de crescimento nunca fora especificada, em nenhuma das duas pontas: nem na unit `interface-puericultura-consulta`, nem nos requisitos da feature 020. Nenhum teste vigente o localizava por posição, o que confirmou a lacuna. **Fechada em 2026-08-09** pelo adendo aditivo, que a especifica pela primeira vez. A linha permanece aqui como registro do que o bug foi. |

## Adendos de bug vigentes

| Adendo | Spec regida | Bug de origem | Vigência |
|---|---|---|---|
| `bug-BUG-20260719-RHZ5-v001.md` | `models-insulina/requirements.md` RN-H; reflexo em `domain.md` § 3.3 | BUG-20260719-RHZ5 | Desde 2026-07-19 |
| `bug-BUG-20260728-ZAHV-v001.md` | `models-puericultura-consulta/contracts.md` § Forma do texto emitido e regras 5, 7 e 8 | BUG-20260728-ZAHV | Desde 2026-07-28 |
| `bug-BUG-20260728-C6LN-v001.md` | `interface-puericultura-consulta/requirements.md` § Regras de Negócio (RN-13 e RN-14, novas) e leitura de RF-01 | BUG-20260728-C6LN | Desde 2026-08-09 |

Os três são imutáveis, e as specs originais permanecem intocadas: quem quiser a leitura efetiva
precisa lê-las com os adendos sobrepostos. Note-se que os dois primeiros **corrigem** spec que
existia, ao passo que o do C6LN **completa** spec que faltava — a distinção importa a quem for
reconciliar tudo na próxima re-extração, porque só os dois primeiros substituem texto.

**Nenhum bug aberto em nenhum dos dois contextos** a partir de 2026-08-09.

## Demais artefatos de spec

`interface-calculadora/*`, `pages-next/*`, demais seções de `models-insulina`,
`models-puericultura/*`, `models-gestacao/*`, `models-risco-cardiovascular/*`,
`models-cardiopatia-isquemica/*`, `models-contribuicao/*`, `scripts/*` e artefatos globais:
nenhum bug registrado.
