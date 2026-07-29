---
commit: 48d44e123cef0cc91a67362866c6a98217ae32de
feature: default_feature
start_time: '2026-07-28T23:30:10.381409+00:00'
status: inactive
---

## O que foi feito
- **A re-extração nº 4 fechou numa sessão, e a extração alcançou o código.** As seis fases correram — as três primeiras vinham da sessão anterior, e aqui rodaram Geração, Revisão e Regressão. A extração passou de **14 para 21 units**. O `/reversa` foi retomado em modo normal e, a partir da unit 3, seguiu em `/reversa-autonomous` até o fim do plano.
- **Sete units novas, e três delas nomeiam coisas que a plataforma não tinha:** o quinto domínio clínico `models/puericultura`; o submódulo `consulta`, que é a **segunda fachada sob uma unit**; e `models/contribuicao`, o primeiro unit **não clínico**. Somam-se as três telas correspondentes e `scripts/`, a **camada dev-time** com 5.517 LOC em 23 arquivos que a passagem anterior não conhecia de todo.
- **Dois `contracts.md` documentam a espécie de artefato que nenhuma passagem anterior cobria: o contrato que a plataforma EMITE.** Tudo o que ela consumia até aqui era contrato de entrada — tabelas, equações, rótulos. O BR Code e o registro SOAP saem do produto para software de terceiros, **sem canal de erro**: se a forma quebrar, quem descobre é quem usa. A assimetria mudou o modo de verificar, e está escrita.
- **A geração foi de 42 arquivos**, com aval explícito do usuário para reescrever os 15 já existentes e cadência de pausa por unit — decisão dele entre três opções apresentadas.
- **O Revisor aferiu por conta própria em vez de copiar do Arqueólogo.** Dez cifras foram medidas na sessão: 816 testes em 67 arquivos (duas execuções), 201 e 54 testes de puericultura e consulta, 12.964 posições L/M/S, 356 casos de oráculo, 1.596 células do INTERGROWTH-21st (228 semanas × 7 desvios), 1.187 literais, nove folhas com a maior em 367 linhas, o vetor `29B1` do CRC e a varredura de invariantes. **As quatro âncoras de valor das tabelas da OMS foram conferidas valor a valor** e bateram exatamente.
- **A revisão achou uma omissão própria e a corrigiu:** as três telas novas citavam só o teste de integração e omitiam o e2e correspondente. Nenhuma afirmação 🟢 precisou ser rebaixada.
- **Regressão sobre 179 watch items em 21 features: 169 🟢, 9 🟡, 1 🔴.** É a maior verificação já feita no projeto — a nº 3 cobriu 60 itens.
- **Duas dívidas herdadas foram encerradas:** **L-07** (`logoComoTitulo`, prop que a `Moldura` não tem desde a 016) e **L-11** (a cifra de testes, defasada desde a 018).
- **Três commits e dois pushes:** `d280c8e` (a `MD-0034`, da fase de interpretação, que estava fora do histórico), `48d44e1` (a re-extração inteira) e `8ff26df` no `notas-obsidian`. **Nenhum código de aplicação foi tocado.**
- Encerramento não versionado: o estado de sessão ficou como mudança pendente no working tree.

## Próximos passos
- **Triar `018/W021`**, o único vermelho, e é o primeiro gesto porque é barato. O item proíbe localização bibliográfica em mensagem de validação; `models/insulina/validacao.ts:179` traz `(p. 59)`. Ou a mensagem perde a página, ou o item declara a exceção da insulina.
- **Escolher a próxima feature.** Por ordem de maturidade: fechar a cegueira do extrator a `TemplateExpression` (259 fragmentos fora do inventário, três violações vivas de `MD-0020`, uma no plano copiável); partir `scripts/textos/classes/interface.mts`, em 684 linhas; ou a primeira feature com esquema de negócio, que nasce com migração junto.
- **Chancelar as onze premissas 🟡 novas.** As duas que mais mudam resultado em tela são **Q-P1** (limite estendido da correção de idade) e **Q-P3** (a idade cronológica governando a posição de medida); **Q-P4** é a que mais incomoda em uso.
- **Aval estético da 021** e a premissa 🟡 do piso de `22rem`, herdados sem movimento.

## Pendências / bloqueios
- **O 🔴 da regressão não é regressão, e essa distinção é o achado da sessão.** O `git log -S` mostra que a mensagem com `(p. 59)` vem do commit de refundação `04e0493`, **anterior à feature 018** que declarou o watch. O item nasceu afirmando um estado que o repositório nunca teve. Chamar isso de regressão seria errar o diagnóstico e procurar culpa numa mudança que não houve.
- **Cinco dos nove amarelos são verificações que eu não pude executar**, não divergências: a idempotência dos geradores exige as fontes de `referencias/`, que ficam fora do git. Registrei como evidência parcial em vez de dar verde por conveniência.
- **Duas lacunas 🔴 em `gaps.md`:** literal interpolado fora do inventário textual, e as duas provas de ponta do BR Code fora do CI.
- **Sem revisão cruzada** — o Codex segue indisponível, como na nº 3. A verificação independente das premissas clínicas continua dependendo de chancela humana.
- Herdados e sem movimento: `MD-0027` a arbitrar, `README.md` reprovando `prettier --check`, `interface.mts` em 684 linhas, **L-10** sem dono há nove features, e o rastreamento preventivo pausado sem resposta da AHRQ em cinco dias.

## Ponteiros
- **A regra desta sessão, e vale para toda re-extração futura:** um watch item que não bate pode ter nascido impreciso, e não ter sido ferido. Antes de chamar de regressão, `git log -S` na condição declarada — se a divergência é anterior ao próprio watch, o defeito está no item, não no código. Foi o que separou o único vermelho de um falso alarme.
- **Por que 🟡 e não 🟢 quando não dá para reexecutar:** `git status` limpo num artefato gerado mostra ausência de divergência, e não idempotência. São coisas diferentes, e a segunda exige rodar o gerador.
- **Onde ler o resultado:** `_reversa_sdd/confidence-report.md` (por unit, com a tabela do que foi aferido nesta sessão), `_reversa_sdd/questions.md` (24 premissas, 11 novas) e `_reversa_sdd/gaps.md` (2 lacunas 🔴, 8 dívidas, 4 encerradas).
- **A distinção que mais confunde na retomada:** `logoComoTitulo` **não existe mais**. Quem ler a base da re-extração 3 vai encontrá-la; a identidade foi unificada na 016, e o que distingue a home das calculadoras hoje é a ausência de `comInicio`, não o tratamento da logo.
- **`MD-0034` fixa quando uma feature vira ADR:** vira ADR o que invalidou uma afirmação estrutural da extração; o resto é regra de domínio. O corolário é que o tamanho da entrega não prediz o ADR — a 017, a maior da história do projeto, não ganhou nenhum.
- Microdecisões em `.harness/decisoes/`: `MD-0001` a **`MD-0034`**.
- **Adendos 015 a 022 marcados como superados.** Não há adendo vigente.
- Produção: https://apsinteligente.app · saúde em `/api/v1/status` · SHA `a422b60`, conferido em 28/07.
