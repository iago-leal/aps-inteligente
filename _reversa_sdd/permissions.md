# Permissões e Papéis — aps-inteligente

> Regenerado pelo Reversa Detective em 2026-07-23 (**re-extração nº 2**).
> Escala de confiança: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA

## Veredito

🟢 **Não há RBAC, ACL, autenticação nem sessão.** A plataforma é um conjunto de páginas estáticas com cálculo 100% client-side (MD-0003, ADR 0002): não existe usuário identificado nem backend com estado de aplicação. A ausência é **por design** — a privacidade é resolvida por arquitetura (sem coleta, não há acesso a controlar). Vale igualmente para as três calculadoras (insulina, gestação, cardiopatia): nenhuma introduz identidade, papel ou dado durável.

## Papel único

| Papel | Descrição | Acesso |
|---|---|---|
| Prescritor (anônimo) | Médico da APS usando qualquer das três calculadoras no navegador | Tudo que a tela oferece; nenhum dado sai do dispositivo |

🟡 As personas do PRD antigo (recuperável no bundle) são variações do mesmo papel técnico — não há diferenciação de capacidade no código.

## Gates comportamentais (o que existe em vez de permissão)

Controles com papel análogo ao de autorização, todos voltados à **segurança clínica**, não à identidade:

1. 🟢 **Ritual de revisão** (insulina, `resultado.tsx`): "Pronto para prescrever" só se habilita após marcar "Revisei a dose e a fonte"; qualquer edição desfaz. Gate de responsabilização, não de acesso. **Específico da insulina** (ADR 0012) — datar (gestação) e estratificar (cardiopatia) não prescrevem dose e não têm esse gate.
2. 🟢 **Gate de HbA1c na intensificação** (insulina, R-13/R-18): o motor recusa iniciar Regular sem HbA1c > 7% e pré-prandiais aferidas — autorização clínica embutida na regra.
3. 🟢 **Recusa fora do escopo da fonte** (transversal): a insulina recusa insulina fora de NPH/Regular; a cardiopatia recusa idade fora de 30–69 (RN-06); a gestação devolve `sem-parametro-na-fonte` no 3.º trimestre. São "não autorizações" clínicas: o motor prefere calar a extrapolar.

## Superfície de rede (sem controle de acesso, por contrato)

🟢 A única superfície de rede é `GET /api/v1/status` (feature 002, ADR 0008): **público, sem autenticação, sem estado, sem dado clínico** — deliberadamente sem guarda de acesso porque não há o que proteger. Discrimina só o método HTTP (405 + `Allow: GET` para não-GET) e responde `no-store`. O banco (`infra/database.ts`, feature 003) é acessado **exclusivamente** por esse healthcheck e não guarda nada de clínico.

## Vigilância futura

- 🔴 Se uma etapa de persistência de dado clínico vier a existir (gatilho MD-0003/MD-0011), autenticação, papéis e análise LGPD deixam de ser "n/a" e exigem spec própria antes do código. Nada no estado atual aponta para isso.
- 🟢 A guarda de privacidade da API (sem leitura de corpo, sem `Set-Cookie`, sem dado clínico) **foi reconstituída e está viva** na feature 002 — a lacuna 🔴 que a extração 1 registrava (rota vazia) está fechada.
