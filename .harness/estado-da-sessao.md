---
commit: 29cce7113f5c4fe5b7ed1720daed0f5444f9bc42
feature: default_feature
start_time: '2026-07-28T15:47:55.944483+00:00'
status: inactive
---

## O que foi feito
- **O ciclo forward da 020 avançou três estágios numa sessão: `/reversa-clarify`, `/reversa-plan` e `/reversa-to-do`.** A feature entra na próxima sessão com requirements sem dúvida, roadmap de treze decisões e `actions.md` fechado em 46 ações, nenhuma iniciada. Nenhuma linha de código de aplicação foi tocada.
- **Cinco perguntas, cinco arbitragens.** As três `[DÚVIDA]` da seção 10 mais duas que a leitura do documento encontrou: a proposta que RN-08 remetia expressamente ao clarify, e a tensão entre RF-07 e RF-08 — o cenário de recusa da área de transferência prometia o texto na tela para cópia manual, o que fazia de um *Should* pré-requisito de um *Must*. RF-08 subiu a *Must*, e RF-05 subiu junto por passar a carregar obrigação de norma.
- **O escopo fechou nas dez consultas datadas.** As pp. 67, 68 e 75 ficam para uma segunda passagem, e a ausência vai declarada na proveniência, nomeando as três: quem abre a tela com a caderneta ao lado precisa saber que ela cobre as consultas datadas e só elas.
- **A ficha se sugere pela idade cronológica também no pré-termo**, porque é ela que rege o calendário de acompanhamento e o vacinal, ao passo que a corrigida rege a curva. Não há contradição com `MD-0011`: aquela ficha repartiu papéis entre medir o corpo e ler a curva, e escolher a ficha não é nenhum dos dois.
- **A emenda do prescritor ao SOAP virou duas regras, não uma.** RN-09 recebeu o mapa com a avaliação reunindo crescimento, desenvolvimento, situação vacinal e alimentação; e nasceu **RN-09b**, que diz como isso se cumpre sem violar a invariante de que o motor informa e não escolhe: **A** recebe apenas campo que a própria ficha imprime como juízo. Alimentação e vacinação comparecem em duas seções com naturezas distintas — relato e conduta de um lado, juízo do outro — sem que campo algum apareça duas vezes.
- **`MD-0026` é a única decisão de arquitetura da sessão, e reverte a recomendação do requirements.** "Criptorquidia" é suprimida na ficha feminina do 2.º Mês, com a supressão declarada ao leitor. A ficha estende `MD-0015` de concordância para conteúdo, sobre lista fechada de um item e inseparável da declaração: o que a decisão autoriza não é a omissão, e sim a omissão declarada.
- **Um commit, `29cce71`, pushado**, com o requirements esclarecido, os cinco artefatos do plano, o `actions.md` e a ficha `MD-0026`. **Descoberta ao conferir o remoto:** os dois commits que a narrativa anterior dava como pendentes de push já estavam publicados; o `git fetch` mostrou zero commits à frente e zero atrás antes deste.
- **A nota do vault foi atualizada** com as duas últimas sessões, que ela ainda não conhecia: o fechamento da `T033` com `MD-0025` e a 020 inteira até o `actions.md`.
- **Da sessão anterior, e que a narrativa preserva: a `T033` fechou, e a 019 chegou a 34/34.** O mantenedor leu o QR pela câmera e usou o código copia e cola em aplicativo de banco real; ambos aceitos, sem concluir a transferência. É a primeira ação desta plataforma cuja prova não veio de código nenhum, nosso ou de terceiro, e sim do consumidor real do contrato.

## Próximos passos
- **`/reversa-coding` da 020 é o passo indicado.** O `actions.md` está fechado, a primeira ação não depende de nada, e duas advertências ficaram escritas nas notas de execução: **`T007` antes de `T017`**, porque o oráculo de transcrição precede a primeira ficha; e a lista de exceções de layout do oráculo é **fechada** — passando de dez itens, parar e reabrir a decisão D-12 em vez de crescer a exceção em silêncio.
- **`/reversa-sync` da 019 continua devendo**, agora com a `T033` fechada, o que só torna o adendo mais completo.
- **A re-extração `/reversa` nº 4** acumula os quatro adendos vigentes, as duas dívidas herdadas, `MD-0022` a **`MD-0026`**, e o salto de cinco para seis domínios.
- **Conferir produção**, que segue no SHA anterior à 019.

## Pendências / bloqueios
- **A 019 fecha em 34/34 e ainda não tem adendo.** O código está entregue; a spec segue sem saber o que a feature decidiu.
- **Produção segue no SHA anterior à 019.** O commit `dd628be` toca código de aplicação, e a conferência de `/api/v1/status` não foi feita nem na sessão passada nem nesta.
- **Duas premissas 🟡 da 020 que só o uso arbitra**, ambas de correção barata: a ficha sugerida entre duas consultas previstas, e a colocação dos três campos resistentes do mapa SOAP.
- **Uma premissa 🟡 de engenharia, esta com risco médio:** a decisão D-12 supõe que o `pdftotext` preserve os rótulos de forma contígua na maioria dos casos. Se a fração partida pelo layout em duas colunas for grande, a lista de exceções deixa de ser fechada e o oráculo perde valor. O sinal de alerta está escrito, e o limiar é dez itens.
- **D-04 do roadmap da 020 tem tensão declarada com D-04 da feature 018**, e a arbitragem pode ser sua. Declarar a classe literal a literal em 350 rótulos satisfaria a letra daquela decisão e derrotaria o propósito, porque o mapa passaria a ser mantido no automático. A saída proposta deriva a declaração da origem que o próprio dado carrega — a página impressa —, e não do diretório.
- **`O-19-03`: o comando de fechar do painel tem nome acessível em inglês**, vindo do `Dialog` do Primer, que não é localizado.
- **Três violações vivas de `MD-0020`** seguem no código, invisíveis ao verificador, nomeadas por arquivo e linha em `MD-0021`.
- **As cifras erradas continuam nos artefatos da 018** (`legacy-impact.md` e `reconciliacao-spec.md` §4 dizem "52 para 59"; o certo é 45 → 52).
- **Três premissas 🟡 da 017** a validar pelo prescritor, somadas às 13 da re-extração nº 3.
- **Rastreamento preventivo por perfil** segue PAUSADO, sem resposta da AHRQ em cinco dias. Passando de duas semanas, redigir follow-up na thread.
- **L-10 sem dono há cinco features**: as duas violações axe toleradas em `e2e/axe-baseline.json`.

## Ponteiros
- **A regra que o plano da 020 fixou, e que vale para qualquer transcrição futura:** o guarda vem antes do que ele guarda. `T007` precede `T017` porque transcrever 350 rótulos e conferir depois transforma a conferência numa auditoria única no fim, que é o modo mais caro e menos confiável de encontrar um erro de digitação. É a mesma família de `MD-0010`: o oráculo é a fonte primária, não uma segunda leitura nossa.
- **Três achados de plano que só a leitura conjunta do PDF e do código produz.** A ficha imprime o peso em **gramas** e **não pergunta a posição da medição**, que o motor da 017 se recusa a supor porque supor erra 0,7 cm na medida que alimenta o escore — ambos entram declarados, e o campo de posição é **autoral**, não citação. O gerador do inventário **ignora crase com interpolação**, de propósito, o que obriga a flexão por sexo a entrar como par de rótulos declarados; interpolada, a citação sairia do guarda. E o portão textual é o gargalo da entrega, com cerca de 350 rótulos de classe citação.
- **Onde está a matéria-prima da 020:** `referencias/caderneta/caderneta_crianca_{menino,menina}_2ed.pdf`, pp. 66 a 75, fora do git por `MD-0008`. O texto extraído não sobrevive à sessão; reextrair leva segundos com `pdftotext -layout -f 67 -l 77`, lembrando que a página do PDF é a impressa mais um. A partir de `T005`, o congelado passa a viver em `tests/apoio/`.
- **Uma segunda contradição de página na fonte**, achada nesta sessão e registrada em `investigation.md` §2.2: a ficha do 12.º Mês manda "classifique pelo instrumento da **pág. 76**", onde as demais dizem 78. Como a primeira, fica na spec e não chega à tela.
- **O que a 020 tem de diferente das cinco calculadoras anteriores:** o produto dela é um **texto de registro**, não um número. O contrato desse texto está em `interfaces/registro-soap.md`, e é a única saída da plataforma que atravessa para fora por colagem.
- Microdecisões em `.harness/decisoes/`: `MD-0001` a **`MD-0026`**. Índice em `.harness/microdecisoes.md`.
- **Adendos vigentes:** 015, 016, 017 e 018; as emendas `MD-0020` e `MD-0021` e as decisões `MD-0022` a `MD-0026` vivem só como ficha.
- Produção: https://apsinteligente.app · saúde em `/api/v1/status`.
