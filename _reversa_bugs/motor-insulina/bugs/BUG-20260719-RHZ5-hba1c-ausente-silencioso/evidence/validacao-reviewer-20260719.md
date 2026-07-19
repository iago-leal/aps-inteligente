# Evidência — Validação humana na revisão da extração (2026-07-19)

Pergunta 4 de `_reversa_sdd/questions.md` (Reversa Reviewer), respondida pelo usuário no chat:

**Pergunta:** "Na intensificação, quando HbA1c está ausente nos ramos residuais (fora do EC-10),
o motor retorna silenciosamente. É a conduta desejada?"

**Resposta do usuário médico:** "Não, deveria recomendar dosar HbA1c."

Registro espelhado em:
- `_reversa_sdd/questions.md` (Pergunta 4, ✅ Respondida)
- `_reversa_sdd/models-insulina/requirements.md` (nota ⚠️ na RN-H)
- `_reversa_sdd/gaps.md` (ação A-01)

Trecho de código no momento do registro (`models/insulina/regra-intensificacao.ts:98-99`):

```ts
} else if (hba1c === undefined) {
  if (!temRegular || prePrandiais.length === 0) return;
```
