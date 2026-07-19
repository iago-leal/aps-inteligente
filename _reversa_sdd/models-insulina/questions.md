# models-insulina — Questões para validação humana

> Gerado pelo Reversa Writer em 2026-07-19. Lacunas 🔴 que dependem do usuário médico.

## Q-01 — Verificação das constantes contra o PDF do guia 🔴

As constantes de `fonte-clinica.ts` citam página/figura, mas o PDF (`referencias/Livro_GuiaRapido-DiabetesMellitus_PDFDigital_20231113.pdf`) está fora do repo (ADR 0001). **Pergunta:** você pode disponibilizar o PDF para uma conferência página a página das 20 referências e dos limiares? Sem isso, a fidelidade à fonte segue 🟢 por rastreabilidade de comentários, mas sem verificação independente.

## Q-02 — Divergências clínicas 1 e 2 (metformina e TFG) 🔴

Aprovadas no design, dependem de conteúdo do guia ainda não extraído: dose de metformina considerada "otimizada" e regras de ajuste/contraindicação por TFG. **Pergunta:** quais páginas/tabelas do guia fundamentam esses limiares? A extração citada precede a spec (Princípios I/II).

## Q-03 — Divergência 3: `SUSPENDER_SULFONILUREIA` ampliada 🔴

A ampliação cobre dois casos novos: uso "não informado" (redação condicional) e esquema que **já chega** fracionado. **Pergunta:** confirmar a redação condicional desejada para o caso "não informado" (ex.: "se em uso de sulfonilureia, suspender") e se a recomendação deve aparecer em todo cálculo com NPH fracionada ou só quando houver ajuste.

## Q-04 — Cenário HbA1c ausente com retorno silencioso 🟡

`RegraIntensificacao.aplicar` retorna silenciosamente quando HbA1c está ausente e o paciente não está intensificado com pré-prandiais (a validação EC-10 cobre o caso principal). **Pergunta:** esse silêncio é a conduta desejada, ou deveria haver recomendação explícita de dosar HbA1c nesses ramos residuais?

---

Q-01..Q-03 bloqueiam **evolução** (as divergências), não a reimplementação fiel do estado atual. Q-04 é conferência de intenção.
