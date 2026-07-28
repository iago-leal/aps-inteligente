---
commit: 7b75a210d08b40acefafa2dae9a255eb4c8dd48f
feature: default_feature
start_time: '2026-07-28T15:33:36.435636+00:00'
status: inactive
---

## O que foi feito
- **A `T033` fechou, e a 019 chegou a 34/34.** O mantenedor leu o QR pela câmera e usou o código copia e cola em aplicativo de banco real; ambos aceitos, sem concluir a transferência. É a primeira ação desta plataforma cuja prova não veio de código nenhum, nosso ou de terceiro, e sim do consumidor real do contrato.
- **O registro do oráculo humano recusou preencher o que não foi ditado.** O aplicativo e o nome exibido na confirmação não foram informados, e a tabela de `oraculo-externo.md` §3 mudou de forma para dizer isso em vez de escondê-lo: a coluna do nome exibido deu lugar a **Via**, o não registrado está marcado como tal, e um parágrafo novo separa o que aquele registro afirma do que não afirma. As duas vias ocupam linhas separadas porque provam coisas diferentes, e coincidirem afasta defeito no envoltório do QR.
- **`MD-0025` nasceu daí**, e é a única decisão desta sessão: ação de verificação humana se fecha pelo que a pessoa afirmou, e o que ela não afirmou permanece escrito como não afirmado, no mesmo lugar onde alguém procuraria por ele. Preencher a coluna com o valor esperado transformaria o oráculo em eco da nossa expectativa; manter a ação aberta por falta de detalhe seria um `[ ]` mentindo sobre o estado do trabalho.
- **Feature 020 aberta por `/reversa-requirements`: a ficha de consulta de puericultura, da caderneta ao SOAP.** Dezoito regras de negócio, dezoito requisitos funcionais, nove não funcionais, nove cenários de aceite e três dúvidas, cada uma com recomendação. A 019 estava fisicamente concluída quando a detecção rodou, de modo que nada foi pausado nem abandonado.
- **O requirements nasceu de leitura direta do PDF, e não de memória.** As pp. 66 a 75 das **duas tiragens** da caderneta foram extraídas e comparadas linha a linha, e a comparação produziu quatro achados que viraram regra: as páginas verdes trazem **treze** fichas e não dez; a caderneta **da menina também imprime "Criptorquidia"** na ficha do 2.º mês, que é desvio de conteúdo e não de concordância, e portanto fora da exceção estreita de `MD-0015`; a classificação do desenvolvimento em três níveis **já está nas dez fichas**, e o que fica para depois é o instrumento das pp. 78 a 84, não o desfecho; e a fonte **se contradiz numa remissão de página** aos gráficos, divergência que fica registrada na spec em vez de propagada à tela.
- **Dois commits na `main`, ainda sem push:** `150b290` (`verify(019)`, fechamento da `T033` mais `MD-0025`) e `7b75a21` (`spec(020)`, o requirements e a troca da feature ativa).
- Encerramento não versionado: o estado de sessão ficou como mudança pendente no working tree.

## Próximos passos
- **`/reversa-clarify` da 020 é o passo indicado**, e as três dúvidas são de natureza diferente: quais das treze fichas entram na primeira entrega (escopo), qual idade governa a ficha no pré-termo (a fonte é **silente**, e a recomendação é a cronológica, com as duas exibidas e a escolhida declarada no SOAP) e o mapa de campo para seção do SOAP, que é **autoral** porque a caderneta não fala em SOAP. Três campos resistem ao arranjo proposto e estão nomeados.
- **`/reversa-sync` da 019 continua devendo**, agora com a `T033` fechada, o que só torna o adendo mais completo.
- **A re-extração `/reversa` nº 4** acumula os quatro adendos vigentes, as duas dívidas herdadas, `MD-0022` a **`MD-0025`**, e o salto de cinco para seis domínios.
- **Push pendente dos dois commits desta sessão**, e a decisão é do usuário.

## Pendências / bloqueios
- **A 019 fecha em 34/34 e ainda não tem adendo.** O código está entregue; a spec segue sem saber o que a feature decidiu.
- **Produção segue no SHA anterior à 019.** O commit `dd628be` toca código de aplicação, e a conferência de `/api/v1/status` não foi feita nem na sessão passada nem nesta.
- **RN-08 da 020 é decisão clínica a arbitrar, não detalhe de transcrição.** Exibir "Criptorquidia" na ficha de uma menina é o que a fonte imprime; suprimir seria reescrevê-la em silêncio, que é o que a norma recusa. A proposta é transcrever com nota de proveniência, e ela precisa do seu aval.
- **`O-19-03`: o comando de fechar do painel tem nome acessível em inglês**, vindo do `Dialog` do Primer, que não é localizado.
- **Três violações vivas de `MD-0020`** seguem no código, invisíveis ao verificador, nomeadas por arquivo e linha em `MD-0021`.
- **As cifras erradas continuam nos artefatos da 018** (`legacy-impact.md` e `reconciliacao-spec.md` §4 dizem "52 para 59"; o certo é 45 → 52).
- **Três premissas 🟡 da 017** a validar pelo prescritor, somadas às 13 da re-extração nº 3.
- **Rastreamento preventivo por perfil** segue PAUSADO, sem resposta da AHRQ em cinco dias. Passando de duas semanas, redigir follow-up na thread.
- **L-10 sem dono há cinco features**: as duas violações axe toleradas em `e2e/axe-baseline.json`.

## Ponteiros
- **A regra desta sessão, e ela vale além do PIX:** o oráculo externo só serve enquanto não repete o que já sabemos. No instante em que se preenche uma coluna com o valor esperado, ele deixa de testemunhar e passa a confirmar, e a diferença entre as duas coisas é toda a razão de o arquivo existir. `MD-0025` a fixa, e a 020 já tem onde aplicá-la: a conferência campo a campo das dez fichas contra o PDF é verificação de mesma natureza.
- **Por que ler o PDF mudou a spec da 020:** quatro das dezoito regras de negócio só existem porque as páginas foram abertas. Uma spec escrita de memória teria dito "dez fichas", teria repetido o número de página errado que a fonte imprime, teria adiado a classificação do desenvolvimento junto com os marcos e não teria visto a criptorquidia na caderneta da menina. Nenhum dos quatro apareceria depois sem custo.
- **Onde está a matéria-prima da 020:** `referencias/caderneta/caderneta_crianca_{menino,menina}_2ed.pdf`, pp. 66 a 75, fora do git por `MD-0008`. O texto extraído desta sessão está no scratchpad e não sobrevive à sessão; reextrair leva segundos com `pdftotext -layout -f 67 -l 77`, lembrando que a página do PDF é a impressa mais um.
- **O que a 020 tem de diferente das cinco calculadoras anteriores:** o produto dela é um **texto de registro**, não um número, e o volume de literais de classe citação é o maior que o projeto já viu de uma vez. O gerador do inventário será o portão mais barulhento da entrega.
- Microdecisões em `.harness/decisoes/`: `MD-0001` a **`MD-0025`**. Índice em `.harness/microdecisoes.md`.
- **Adendos vigentes:** 015, 016, 017 e 018; as emendas `MD-0020` e `MD-0021` e as decisões `MD-0022` a `MD-0025` vivem só como ficha.
- Produção: https://apsinteligente.app · saúde em `/api/v1/status`.
