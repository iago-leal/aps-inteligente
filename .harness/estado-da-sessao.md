---
commit: dd628be8ee9c018bc14397f863912bd8e0af6a89
feature: default_feature
start_time: '2026-07-28T14:23:54.948526+00:00'
status: inactive
---

## O que foi feito
- **Feature 019 levada do plano ao código na mesma sessão, e entregue.** `/reversa-to-do` decompôs o roadmap em **34 ações** e `/reversa-coding` executou **33**; a que resta é a única que não se automatiza. Dois commits pushados para `aps-inteligente/main`: **`c9b9e00`** (decomposição mais `MD-0023`) e **`dd628be`** (a feature inteira mais `MD-0024`).
- **O que existe agora, em uma frase por peça.** Domínio `models/contribuicao/` com cinco arquivos, montando o BR Code do PIX estático com CRC16-CCITT/FALSE, erro como valor e coleta total dos ofensores; camada `interface/contribuicao/` com painel `Dialog`, envoltório do QR, comando de cópia parametrizado e a constante congelada do beneficiário; bloco de apoio ao pé da home, **fora** do `map` do `CATALOGO`; sétima folha de estilo; três níveis de teste. Suíte em **733** de unidade e integração e **47** de ponta a ponta, cobertura **100%** no domínio novo.
- **A medição de bundle mudou o código, e é o achado prático da entrega.** O painel já era montado só quando aberto, mas o `import` estático arrastava o `Dialog` do Primer e a biblioteca do QR para o primeiro carregamento da home: **14 923 B gzip** cobrados de toda visita por uma tela que a maioria nunca abre. Com `next/dynamic`, **+2 534 B**. A suíte inteira já estava verde antes disso: sem medir, o número passaria despercebido.
- **Duas correções vieram de ferramenta, e não de leitura humana.** O `axe` apontou `heading-order`, porque os subtítulos do painel nasceram `h3` e o `Dialog` publica o próprio título como `h1`; viraram `h2`. E o gerador do inventário fez ver que as mensagens de validação, montadas por template interpolado, escapariam ao extrator e à norma, criando três violações novas de `MD-0020` no mesmo movimento em que a feature declara respeitá-la; viraram literais completos, com limite e observado no dado estruturado do ofensor.
- **`MD-0023` nasceu da decomposição, e `MD-0024` da entrada da dependência.** A primeira fixa que a fase de uma ação vem da ordem que o plano impõe, e não do rótulo da categoria, e que verificação com etapa humana se parte em duas ações. A segunda registra `react-qr-code@2.2.0` pinada atrás de envoltório de um arquivo, com a leitura de por que silêncio de release em codificador de norma congelada não é sinal de abandono.
- **O oráculo externo rodou, e a verificação foi severa.** `pix-utils@2.8.2`, instalada **fora do repositório** para não sujar o `package.json`, leu os dez campos corretamente e recusou tanto o payload com os quatro dígitos finais trocados quanto o com uma letra alterada no nome sem recálculo. A aceitação do nosso código não é complacência dela.
- **A lacuna `D-02` fechou na própria sessão.** Chegaram a chave aleatória, `Iago Leal` e `Goiânia`, esta chegando ao payload como `Goiania` porque o padrão só admite ASCII. A guarda contra publicar o valor de exemplo saiu de `it.todo` e passou a valer.
- **Nota do vault atualizada** com a entrega da 019, o próximo passo trocado para `/reversa-sync`, os três valores marcados como resolvidos em AGUARDANDO e a `T033` entrando no lugar deles.

## Próximos passos
- **`/reversa-sync` é o que resta do ciclo da 019.** O código está entregue e pushado; falta o adendo em `_reversa_sdd/addenda/`, e sem ele a próxima re-extração terá de reconstruir de memória o que a feature decidiu.
- **`T033`, e é do usuário:** abrir a home, acionar o comando de apoio e ler o QR com o aplicativo do banco em outro aparelho, conferindo que a confirmação exibe **Iago Leal**, e **sem concluir a transferência**. Procedimento e tabela em branco em `oraculo-externo.md` §3.
- **A re-extração `/reversa` nº 4 acumulou mais matéria.** Além dos quatro adendos vigentes e das duas dívidas herdadas, precisa absorver `MD-0022`, `MD-0023` e `MD-0024`, e reconhecer que o sistema passou de cinco para **seis domínios**, o sexto sendo o primeiro não clínico.
- **A cegueira do extrator a `TemplateExpression`** segue como candidata a feature nova de maior consequência clínica, e esta sessão acrescentou evidência a favor: foi por saber dela que as mensagens novas nasceram como literais completos.

## Pendências / bloqueios
- **`T033` é a única ação aberta da 019**, e não é bloqueio de código: o payload já foi aceito por decodificador independente. O que falta é o consumidor real do contrato se manifestar.
- **A 019 ainda não passou por `/reversa-sync`.** É a primeira vez em várias sessões que uma feature termina codada e sem adendo.
- **`O-19-03`: o comando de fechar do painel tem nome acessível em inglês** (`Close`), vindo do `Dialog` do Primer, que não é localizado. É o único texto exibido da feature fora do inventário, porque não é literal nosso; corrigi-lo exigiria `renderHeader` próprio.
- **Três violações vivas de `MD-0020`** seguem no código, invisíveis ao verificador, nomeadas por arquivo e linha na ficha `MD-0021`.
- **As cifras erradas continuam nos artefatos da 018** (`legacy-impact.md` e `reconciliacao-spec.md` §4 dizem "52 para 59"; o certo é 45 → 52). A re-extração deve ler o adendo, não os dois.
- **Três premissas 🟡 da 017** a validar pelo prescritor, somadas às 13 da re-extração nº 3.
- **Rastreamento preventivo por perfil** segue PAUSADO, aguardando a chave da API USPSTF pedida em 23/07 à AHRQ, sem resposta em cinco dias. Passando de duas semanas, redigir follow-up na thread.
- **L-10 sem dono há cinco features**: as duas violações axe toleradas em `e2e/axe-baseline.json`.
- **Produção segue no SHA anterior à 019 até o deploy correr.** O commit `dd628be` toca código de aplicação, e a conferência de `/api/v1/status` não foi feita nesta sessão.

## Ponteiros
- **A regra que esta sessão produziu, e vale além dela:** **o que a suíte não mede, alguém precisa medir de fora.** Duas vezes a entrega mudou por causa de instrumento e não de leitura: o `axe` achou o pulo de nível de título, e a medição de bundle achou 15 kB cobrados de quem nunca abre o painel. Nos dois casos a suíte estava verde, e nos dois o defeito era real.
- **Por que o oráculo externo importa aqui mais que em qualquer outra feature:** um payload sintaticamente válido e semanticamente errado passa em todo teste escrito a partir da nossa leitura da especificação, e falha só na câmera de quem tenta contribuir. O decodificador de terceiro prova implementação; só o aplicativo de banco prova interpretação.
- **Onde a fronteira do domínio não clínico está escrita, e por quê:** no cabeçalho de `models/contribuicao/br-code.ts`, porque a re-extração confere a tabela de invariantes de `architecture.md#1` linha a linha, e ali ausência silenciosa e violação são indistinguíveis.
- **O que os valores de exemplo fazem no código depois de substituídos:** são oráculo da guarda de `tests/unit/interface/beneficiario-sem-exemplo.test.ts`, que reprova a suíte se algum deles voltar a ocupar a configuração publicada.
- **Desvios declarados da execução**, todos em `actions.md` e no `regression-watch.md`: o construtor de teste foi para `tests/apoio/contribuicao.ts` e não para `construtores.ts`, que é de insulina; e o polyfill de `ResizeObserver` entrou no setup jsdom porque o `Dialog` o exige por `useOverflow`.
- Microdecisões em `.harness/decisoes/`: `MD-0001` a **`MD-0024`**. Índice em `.harness/microdecisoes.md`.
- **Adendos vigentes:** 015, 016, 017 e 018; as emendas `MD-0020` e `MD-0021` e as decisões `MD-0022`, `MD-0023` e `MD-0024` vivem só como ficha.
- Produção: https://apsinteligente.app · saúde em `/api/v1/status`.
