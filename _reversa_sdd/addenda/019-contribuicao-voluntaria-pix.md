# Adendo 019 — Contribuição voluntária via PIX

> Feature: `019-contribuicao-voluntaria-pix`
> Data: `2026-07-28`
> Cenário: `legado`

## Vigência

Vigente desde 2026-07-28.

## Resumo da entrega

A plataforma é gratuita, sem anúncio, sem cadastro e sem coleta, e não tinha via alguma por onde
quem a usa pudesse sustentá-la. A feature abre essa via na forma mais estreita possível: um comando
de apoio na home revela a chave PIX do mantenedor e o BR Code correspondente, ambos montados no
próprio navegador, sem transação, sem confirmação e sem que a plataforma saiba se alguém
contribuiu. O componente é vitrine de chave, e a redação distingue doação voluntária de preço de
serviço, porque a caracterização muda a natureza jurídica do recebimento.

O que a entrega tem de estrutural, e que a próxima re-extração precisa absorver, é a **fronteira
nova dentro de `models/`**. `models/contribuicao` é o primeiro unit de domínio não clínico da
plataforma: segue a disciplina de todos os outros, com erro como valor, coleta total de ofensores,
nenhum import de framework e nenhuma leitura de relógio, e difere no que **não** tem, isto é, fonte
clínica única, `ReferenciaClinica` e lugar no catálogo congelado. A isenção está escrita em
`MD-0022` e repetida no cabeçalho da fachada, justamente para que a passagem seguinte do Reversa
não leia três violações onde há uma decisão.

A entrega traz também o primeiro contrato externo que a plataforma **emite** sem canal de erro: o
BR Code é lido por software de terceiros sob especificação do Banco Central que não controlamos, e
um payload malformado falha na mão de quem contribui, sem retorno para nós. Daí a verificação em
duas pontas, uma automatizada contra decodificador independente e outra humana, com o consumidor
real do contrato.

**34 de 34 ações concluídas.** A última, `T033`, fechou em sessão posterior à execução: o mantenedor
leu o QR pelo aplicativo do banco e usou também o código copia e cola, e ambos funcionaram. A suíte
passa de 711 para **733** testes de unidade e integração e de 36 para **47** roteiros de ponta a
ponta, com a baseline `axe` em zero por rota preservada.

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|---|---|---|---|
| `_reversa_sdd/architecture.md` | §1, tabela de invariantes da família `models/*` | regra-alterada | A tabela generaliza para todo módulo de `models/`; leia-se que ela vale para todo módulo **clínico** de `models/`. `models/contribuicao` é isento por escrito de fonte clínica única, de `ReferenciaClinica` e do catálogo congelado (`MD-0022`), e conserva os demais invariantes da família: domínio puro, erro como valor, coleta total de ofensores |
| `_reversa_sdd/architecture.md` | §1, camadas | componente-novo | Nasce o quinto unit de `models/` (`tipos`, `campo`, `crc16`, `validacao`, `br-code`) e a pasta `interface/contribuicao` (beneficiário congelado, envoltório do QR, comando de cópia parametrizado, painel e bloco de apoio). A dependência segue unidirecional |
| `_reversa_sdd/architecture.md` | §5, Qualidade e testes | regra-alterada | Três níveis da pirâmide acrescidos de uma vez: unidade sobre o motor do BR Code com `fast-check`, integração do painel e roteiro de ponta a ponta. As cifras da seção ficam mais defasadas, dívida **L-11** herdada da feature 018 e não criada aqui |
| `_reversa_sdd/architecture.md` | §6, Dívidas técnicas | delta-de-contrato-externo | A afirmação "sem dívida de dependências, as features 011–014 não introduziram dependência nova" deixa de valer: entra `react-qr-code@2.2.0`, pinada exata, com lockfile commitado e ficha `MD-0024`. É a primeira dependência de runtime desde a feature 010 |
| `_reversa_sdd/dependencies.md` | Dependências de runtime | delta-de-contrato-externo | Mesmo delta, na fonte que enumera. Registre-se o efeito colateral: `prop-types` entra na árvore de runtime por arrasto da biblioteca, resíduo inútil sob React 19, tolerado por já existir na árvore de desenvolvimento |
| `_reversa_sdd/code-analysis.md` | Módulo 10, `interface/inicio` | regra-alterada | A home ganha um bloco de apoio ao pé das seções, **fora** do `map` do `CATALOGO`. O catálogo permanece byte a byte, e o teste de integração passou a afirmar isso: ele é fonte única de calculadoras e, desde a 018, oráculo da descrição da plataforma, de modo que um item de apoio ali dentro corromperia os dois papéis |
| `_reversa_sdd/code-analysis.md` | Módulo 12, `pages` | regra-alterada | `pages/_app.tsx` ganha uma linha, o import da folha nova |
| `_reversa_sdd/interface-estilos/requirements.md` | Folhas de estilo | componente-novo | Sétima folha, `contribuicao.css`. Nenhuma folha existente foi tocada, e `globais.css` segue nas 364 linhas que a re-extração nº 3 registrou |
| `_reversa_sdd/domain.md` | §2, Glossário | regra-nova | Entra vocabulário que não é clínico: *PIX estático* (chave publicada uma vez, sem que o site saiba de contribuição alguma), *BR Code* (cadeia EMV/QRCPS-MPM lida pelo aplicativo do banco) e *CRC16* (verificação que fecha a cadeia e permite ao aplicativo recusar código corrompido) |
| `_reversa_sdd/domain.md` | §7, Invariantes transversais aos quatro domínios | regra-alterada | O título e a leitura da seção pressupõem que todo unit de `models/` é clínico. Leia-se que os invariantes de fonte e referência são dos **quatro domínios clínicos**, e que os invariantes de disciplina (pureza, erro como valor, coleta total) alcançam também o unit não clínico. É a mesma emenda do W001, vista pelo lado do domínio |
| `_reversa_sdd/domain.md` | §8, Fronteiras de escopo | regra-nova | Fronteira nova e declarada: a contribuição é **estática**, sem transação, sem confirmação e sem saber quem contribuiu. Não é limitação a contornar, e sim propriedade do arranjo escolhido, coerente com a telemetria nula da ADR 0007 |
| `_reversa_sdd/adrs/0002` | Privacidade por arquitetura | — | Preservada e verificada, não presumida: abrir e fechar o painel não faz requisição externa, não busca dado e não cria durável novo, e o roteiro de ponta a ponta afere ausência de chave nova em `localStorage` e `sessionStorage` |
| `_reversa_sdd/adrs/0007` | Telemetria nula | — | Preservada. Nada foi instrumentado: a plataforma não sabe quem abriu o painel |
| — | Contrato externo emitido (`interfaces/br-code.md`) | delta-de-contrato-externo | Não há artefato da extração que o cubra hoje. O BR Code é o primeiro formato que a plataforma **emite** para consumo de terceiro sob especificação alheia e sem canal de erro; conferido contra decodificador independente (`oraculo-externo.md` §2, verificação `DBD8`) e, depois, pelo aplicativo de banco real. A re-extração nº 4 há de lhe dar lugar próprio |

Nenhum impacto em `erd-complete.md`, `data-dictionary.md` ou `openapi/status.yaml`: a feature não
persiste nada, não toca dado clínico e não altera `/api/v1/status`. Os quatro motores clínicos ficam
intactos, nenhuma dose, escore ou datação muda, e nenhuma rota nasce ou morre.

## Regras sob vigilância

Dez watch items nascem desta entrega: **W001** a **W010**, em
`_reversa_forward/019-contribuicao-voluntaria-pix/regression-watch.md`.

O **W001** é o de maior consequência para a leitura da extração, e é curioso por natureza: ele
vigia o **texto** da extração, e não o código. Se a re-extração reportar `models/contribuicao` como
violação de fonte clínica única, o defeito está na generalização de `architecture.md` §1, e não no
que foi entregue. Perto dele estão o **W003**, que guarda o catálogo como fonte única de
calculadoras, e o **W009**, que confina o comando de apoio à home, longe de qualquer tela de
resultado clínico. Os dois de contrato externo, **W007** e **W008**, guardam o cálculo do CRC16
sobre a cadeia que já contém `6304` e a recusa por comprimento, que nunca pode virar truncamento.

Nove observações sem peso de regressão acompanham a lista. Duas mereciam nota: `O-19-02` foi
**resolvida** depois de escrita, com o fechamento de `T033`, e `O-19-03` registra que o nome
acessível do comando de fechar é "Close", em inglês, por vir do `Dialog` do Primer, único texto
exibido da feature que não passa pelo inventário.

## Fontes

- `_reversa_forward/019-contribuicao-voluntaria-pix/requirements.md`
- `_reversa_forward/019-contribuicao-voluntaria-pix/roadmap.md`
- `_reversa_forward/019-contribuicao-voluntaria-pix/legacy-impact.md`
- `_reversa_forward/019-contribuicao-voluntaria-pix/regression-watch.md`
- `_reversa_forward/019-contribuicao-voluntaria-pix/actions.md`
- `_reversa_forward/019-contribuicao-voluntaria-pix/progress.jsonl`
- `_reversa_forward/019-contribuicao-voluntaria-pix/oraculo-externo.md`
- `_reversa_forward/019-contribuicao-voluntaria-pix/medicao-bundle.md`
- `_reversa_forward/019-contribuicao-voluntaria-pix/interfaces/br-code.md`
- `.harness/decisoes/MD-0022.md`, `MD-0024.md`

## Nota de sincronização tardia

Este adendo foi gerado em 2026-07-28, na mesma data da entrega, porém em sessão posterior à das
features 020 e 021, que o precederam na fila de `/reversa-sync`. A dívida está registrada em
`O-21-04`, e a ordem de leitura correta dos adendos é a numérica, não a cronológica de escrita.
