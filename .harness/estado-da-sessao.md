---
commit: 02b51cf30f838e1d3154da08ff877f20008281a4
feature: default_feature
start_time: '2026-07-26T21:45:39.719971+00:00'
status: inactive
---

## O que foi feito
- `/reversa-plan` da feature **017-puericultura-crescimento** (quinta calculadora: escores z de crescimento infantil pela *Caderneta da Criança*). Cinco artefatos gerados em `_reversa_forward/017-puericultura-crescimento/`: `roadmap.md` (13 decisões técnicas, delta arquitetural, riscos, critério de pronto), `investigation.md`, `data-delta.md`, `onboarding.md` e `interfaces/tabelas-de-referencia.md`. Estágio `plan` marcado em `.reversa/active-requirements.json`.
- **Lacuna 🟡 principal do requirements resolvida:** as curvas INTERGROWTH-21st pós-natais não precisam de tabela — Villar 2015 publica média e desvio-padrão como polinômios fracionários por semana pós-menstrual (log para peso e comprimento, escala natural para o perímetro cefálico). Virou **MD-0002**. Sanidade conferida: mediana de 3,433 kg e faixa de −2 a +2 DP entre 2,593 e 4,545 kg para o menino em 40 semanas.
- **MD-0003** registrada: leitura da tabela da OMS **sem interpolação** (dia inteiro até 5 anos, mês completo depois), divergindo do `anthroplus` oficial, que interpola L/M/S entre meses; e as duas fronteiras dos 5 anos separadas — rótulo aos 1826 dias, tabela aos 1856.
- Aquisição do dado da OMS verificada de ponta a ponta: as 14 URLs das tabelas expandidas responderam 200, o formato das planilhas foi inspecionado (colunas L/M/S mais os valores em ±1 a ±4 DP) e os recortes conferidos (dias 0–1856 e meses 61–120). **Achado de risco:** a OMS publica o arquivo de peso-para-idade de 5 a 10 anos com o prefixo `hfa-`, o do indicador de estatura; daí a regra do contrato de verificar conteúdo e nunca nome.
- Valores-âncora calculados contra as tabelas oficiais e embutidos no `onboarding.md`, de modo que a verificação manual tem números esperados, não só um roteiro.
- Trabalho commitado em `02b51cf` e pushado para `aps-inteligente/main` (que estava três commits atrasado; subiu de `bbb3cf8` a `02b51cf`). Nota do vault `~/Notas/Projetos/aps-inteligente.md` atualizada com o bloco da 017, o próximo passo e as pendências.
- **Nenhuma linha de código de app tocada** — a sessão foi inteiramente de planejamento e apuração.

## Próximos passos
- `/reversa-to-do`: decompor o `roadmap.md` da 017 em ações atômicas; depois `/reversa-coding`.
- Antes de escrever `models/puericultura/fonte-clinica.ts`, obter o PDF da *Caderneta da Criança* (menino e menina) em `referencias/`.
- Conferir os coeficientes do INTERGROWTH-21st contra a tabela impressa do artigo, e não só contra o pacote `gigs`.

## Pendências / bloqueios
- **Caderneta da Criança ausente de `referencias/`** — os rótulos literais e as páginas de referência dependem dela; bloqueia o início do código da 017, não o `/reversa-to-do`.
- **Coeficientes do INTERGROWTH-21st com procedência indireta** — lidos da implementação `gigs` (rOpenSci), que os documenta como transcrição de Villar 2015; o texto integral do Lancet devolveu HTTP 403 deste ambiente. Conferência obrigatória antes de o cálculo ir a produção (ver MD-0002, campo ESTADO).
- Rastreamento preventivo por perfil — PAUSADA (26/07/2026), aguardando a chave da API USPSTF (AHRQ Prevention TaskForce), solicitada em 23/07/2026 a `uspstfpda@ahrq.gov`, sem resposta. A feature nunca foi aberta como artefato; retomar por `/reversa-requirements` quando a chave chegar.
- Seis premissas 🟡 do plano da 017 a validar pelo prescritor (§4 do `roadmap.md`), somadas às 13 da re-extração nº 3.

## Ponteiros
- Feature ativa: `_reversa_forward/017-puericultura-crescimento/` · estágio `plan` em `.reversa/active-requirements.json`.
- Microdecisões da 017: `.harness/decisoes/MD-0001.md` (fonte editorial × dado tabular), `MD-0002.md` (equações fechadas do pré-termo), `MD-0003.md` (leitura sem interpolação e as duas fronteiras dos 5 anos).
- Adendos vigentes: `_reversa_sdd/addenda/` (001–016). Extração Reversa nº 3: commit `ab075ac`.
- Produção: https://apsinteligente.app · saúde em `/api/v1/status` (último código em produção: feature 016, `472cb08`).
