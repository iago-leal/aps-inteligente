# Permissões e Papéis — aps-inteligente

> Gerado pelo Reversa Detective em 2026-07-19.
> Escala de confiança: 🟢 CONFIRMADO · 🟡 INFERIDO · 🔴 LACUNA

## Veredito

🟢 **Não há RBAC, ACL, autenticação nem sessão.** O sistema é uma página estática com cálculo 100% client-side (MD-0003): não existe usuário identificado, banco de dados nem backend com estado. A ausência é **por design**, não lacuna — a privacidade é resolvida por arquitetura (sem coleta, não há acesso a controlar).

## Papel único

| Papel | Descrição | Acesso |
|---|---|---|
| Prescritor (anônimo) | Médico da APS usando a calculadora no navegador | Tudo que a tela oferece; nenhum dado sai do dispositivo |

🟡 As três personas do PRD antigo (recuperável no bundle) são variações do mesmo papel técnico — não há diferenciação de capacidade no código.

## Gates comportamentais (o que existe em vez de permissão)

O sistema tem dois controles que cumprem papel análogo ao de autorização, ambos voltados à segurança clínica, não à identidade:

1. 🟢 **Ritual de revisão** (`resultado.tsx`): o bloco "Pronto para prescrever" só se habilita após o prescritor marcar "Revisei a dose e a fonte"; qualquer edição posterior desfaz a confirmação. É um gate de responsabilização, não de acesso.
2. 🟢 **Gate de HbA1c na intensificação** (R-13/R-18): o motor recusa-se a iniciar Regular sem HbA1c > 7% e pré-prandiais aferidas — autorização clínica embutida na regra, não no usuário.

## Vigilância futura

- 🔴 Se a etapa do banco de dados prevista (gatilho MD-0003/MD-0011) se concretizar, autenticação, papéis e análise LGPD deixam de ser "n/a" e exigem spec própria antes do código.
- 🔴 A rota vazia `pages/api/v1/` não tem handler nem middleware; quando a API renascer, a guarda de privacidade comportamental da feature 002 (sem leitura de corpo, sem `Set-Cookie`) precisa ser reconstituída junto.
