# Regression Watch — 006-checkbox-revisao-redundante

> Regras que precisam continuar verdadeiras nas próximas re-extrações (`/reversa`).
> Origem: seção "Modificadas" do `legacy-impact.md` desta feature.

## Watch principal

| ID | Origem (arquivo, seção) | Regra esperada após mudança | Tipo de verificação | Sinal de violação |
|----|-------------------------|------------------------------|---------------------|-------------------|
| W001 | `_reversa_sdd/domain.md` §2 (glossário, "Ritual de revisão") | O ritual habilita o bloco "Pronto para prescrever" **e a ação de copiar o plano**; qualquer edição desfaz revisão, ação e retorno | redação | Extração futura descrevendo o checkbox como gate de texto estático apenas, sem a ação de cópia |
| W002 | Unit `interface-calculadora`, RN-03 | Botão "Copiar plano" existe se e somente se `revisaoConfirmada && !desatualizado` | presença | Botão acessível sem revisão confirmada, ou com resultado desatualizado |
| W003 | Unit `interface-calculadora`, RN-02 | Edição de qualquer campo retira a ação de cópia e zera o retorno ("Plano copiado" não sobrevive à invalidação) | presença | Retorno de cópia visível junto do aviso de desatualizado, ou após novo cálculo |
| W004 | `_reversa_sdd/architecture.md` §1 (privacidade por arquitetura, ADR 0002/0007) | A cópia é local: zero requisição de rede e zero storage novo associados à ação; conteúdo derivado apenas da saída exibida | presença | Qualquer fetch, telemetria ou persistência ligada ao fluxo de cópia |
| W005 | Unit `interface-calculadora`, RN-04 (postura de honestidade) + RN-05 da feature | Falha da área de transferência produz mensagem de erro com orientação de transcrição manual; jamais falso sucesso ou silêncio | presença | Cópia que falha sem mensagem, ou mensagem de sucesso sem escrita efetiva |

## Observações (sem peso de regressão — origem 🟡)

- **D-04 (interpretação de "esquema/dose"):** alertas e condutas alternativas ficam fora do texto copiado; o Plano registra a conduta sugerida (ADR 0005). Aguardando validação do prescritor em uso real — se mudar, o ajuste é local a `formatar-plano.ts`.
- **Drift formatador×tela:** o formatador reutiliza `agruparRecomendacoes` e `rotulos.ts`; blocos novos de painel em features futuras exigem decisão explícita de inclusão no texto copiado.
- **Premissa de plataforma:** escrita na área de transferência exige contexto seguro e gesto do usuário; a degradação honesta cobre o resto.

## Histórico de re-extrações

### Re-extração 2026-07-23 14:10

| ID | Veredito | Observação |
|----|----------|------------|
| W001 | 🟢 verde | `domain.md` §2.2: o ritual habilita "Pronto para prescrever" **e o botão Copiar plano**; qualquer edição desfaz revisão, ação e retorno |
| W002 | 🟢 verde | `interface-calculadora` RN-03: "Copiar plano" existe ⟺ `revisaoConfirmada && !desatualizado` |
| W003 | 🟢 verde | RN-02: edição retira a ação de cópia e zera o retorno (não sobrevive à invalidação) |
| W004 | 🟢 verde | cópia local; zero rede e zero storage (invariante de privacidade `domain.md` §6 invariante 7) |
| W005 | 🟢 verde | falha da área de transferência → erro honesto com `{ok:false}` como valor (`design.md`); jamais falso sucesso |

## Arquivadas

<!-- Vazio. -->
