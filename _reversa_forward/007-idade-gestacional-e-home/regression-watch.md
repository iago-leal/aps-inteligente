# Regression Watch: 007-idade-gestacional-e-home

> Regras que precisam continuar verdadeiras nas próximas extrações reversas.
> Gerado por `/reversa-coding` em 2026-07-23.

## Watch principal

| ID | Origem (arquivo, seção) | Regra esperada após mudança | Tipo de verificação | Sinal de violação |
|----|--------------------------|------------------------------|---------------------|-------------------|
| W001 | `code-analysis.md#módulo-3`; decisão do usuário 2026-07-23 | A raiz (`/`) serve a home com as seções "Diabetes Mellitus tipo 2" e "Pré-natal"; a calculadora de insulina vive em `/dm2/insulina` com comportamento e metadados preservados | presença | Raiz voltando a montar calculadora, rota da insulina quebrada ou seção sumida da home |
| W002 | `code-analysis.md#módulo-2` (tela/moldura); `state-machines.md#3` | Moldura única em `interface/comum/moldura.tsx` (selo "Nada é salvo nem enviado" + alternador de tema) usada pelas três telas; chave `aps-inteligente:tema` e degradação inalteradas | presença | Selo/tema divergindo entre telas; segunda moldura paralela; chave de storage renomeada |
| W003 | `e2e/calculadora.spec.ts` (adendo 004) | O spec da insulina roda contra `/dm2/insulina` com as MESMAS asserções de comportamento (ritual, cópia, tema, privacidade, axe) | redação | Asserção comportamental alterada ou removida junto com mudança de rota |
| W004 | `e2e/axe-baseline.json` (adendo 004, estendido) | Chaves antigas byte a byte (`telaInicial: 1`, `telaComResultado: 1`); chaves novas em zero (`home`, `telaIdadeGestacional`, `telaIdadeGestacionalComResultado`) — reduzir pode, aumentar nunca | presença | Qualquer valor aumentado sem decisão registrada |
| W005 | `domain.md#3.5` regra 21 (RN-02/MD-0003) | Privacidade por construção vale na plataforma inteira: home e calculadora de IG sem fetch e sem storage de dado clínico (único storage: tema) | presença | Requisição de rede ou storage novo nascendo em qualquer tela |
| W006 | `domain.md#6` (padrão ADR 0001); `models/gestacao/fonte-clinica.ts` | Toda saída do motor de gestação carrega `ReferenciaClinica` do Guia Rápido Pré-Natal (4.ª ed., 2025) com página; uma fonte por unit — sem mescla com o catálogo do guia de diabetes | presença | Saída sem referência; referência de outra fonte dentro da unit |

## Observações (sem peso de regressão — origem 🟡, ganham peso quando a re-extração as confirmar 🟢)

- O-01: Fórmulas do motor de gestação (RN-01..RN-04, RN-11) nasceram nesta feature e ainda não foram confirmadas por extração; a re-extração deve promovê-las a 🟢 lendo `models/gestacao/` contra o adendo 007.
- O-02: Premissas clínicas declaradas aguardando validação do prescritor em uso real: cortes de trimestre 13+6/27+6; limites de validação (DUM ≤ 44 semanas; laudo 0–42 semanas); ausência do ritual de revisão na IG; USG de 3.º trimestre sem veredito de margem (a fonte não parametriza).
- O-03: `preferencia-de-tema.ts`, `relator-de-erros.ts` e `erro-de-campo.tsx` seguem em `interface/calculadora/` mas são consumidos por `comum/`, `gestacao/` e `inicio/` — candidatos à realocação para `interface/comum/` na re-extração (imports cruzados documentados).
- O-04: O harness e2e tem um único viewport (Desktop Chrome); o roadmap presumiu dois. Se cobertura mobile virar requisito, é decisão nova, não regressão.

## Histórico de re-extrações


### Re-extração 2026-07-23 21:40 (nº 3 — absorve features 011–014)

| ID | Veredito | Observação |
|----|----------|------------|
| W001 | 🟢 verde | re-confirmada; código da área intocado nesta 3ª passagem (features 011–014 não tocaram este módulo) |
| W002 | 🟢 verde | re-confirmada; código da área intocado nesta 3ª passagem (features 011–014 não tocaram este módulo) |
| W003 | 🟢 verde | re-confirmada; código da área intocado nesta 3ª passagem (features 011–014 não tocaram este módulo) |
| W004 | 🟢 verde | re-confirmada; código da área intocado nesta 3ª passagem (features 011–014 não tocaram este módulo) |
| W005 | 🟢 verde | re-confirmada; código da área intocado nesta 3ª passagem (features 011–014 não tocaram este módulo) |
| W006 | 🟢 verde | re-confirmada; código da área intocado nesta 3ª passagem (features 011–014 não tocaram este módulo) |
### Re-extração 2026-07-23 14:10

| ID | Veredito | Observação |
|----|----------|------------|
| W001 | 🟢 verde | raiz (`/`) serve a home por seções; insulina em `/dm2/insulina`; seções no `catalogo.ts` (verificado em `pages/` + unit `interface-inicio`) |
| W002 | 🟢 verde | Moldura única em `interface/comum/moldura.tsx` usada pelas telas; selo e chave `aps-inteligente:tema` inalterados |
| W003 | 🟢 verde | `e2e/calculadora.spec.ts` aponta para `/dm2/insulina` com as mesmas asserções (`interface-calculadora/design.md`) |
| W004 | 🟢 verde | `axe-baseline`: chaves antigas 1/1 byte a byte, chaves novas (home, IG) em zero |
| W005 | 🟢 verde | privacidade por construção na plataforma inteira (`domain.md` §6 invariante 7): sem fetch/storage de dado clínico |
| W006 | 🟢 verde | toda saída de `models/gestacao` carrega `ReferenciaClinica` do Guia Pré-Natal; uma fonte por unit. **O-01 cumprido:** as fórmulas do motor (RN-01..04, RN-11) foram promovidas a 🟢 CONFIRMADO nesta re-extração (verificadas por property-based) |

## Arquivadas

_(vazio)_
