# Roadmap: Contribuição voluntária via PIX

> Identificador: `019-contribuicao-voluntaria-pix`
> Data: `2026-07-28`
> Requirements: `_reversa_forward/019-contribuicao-voluntaria-pix/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A feature entra pelas camadas que já existem, sem inventar convenção nova. Um módulo puro em
`models/contribuicao/` monta o BR Code, com a mesma disciplina dos quatro domínios clínicos
(erro como valor, coleta total de ofensores, nenhum import de framework) e com a isenção de
`MD-0022` escrita no cabeçalho: não tem fonte clínica, não emite `ReferenciaClinica`. Uma
camada de apresentação em `interface/contribuicao/` embala o painel sobre o `Dialog` do Primer,
reaproveitando o adaptador de área de transferência da feature 006 e o padrão de `Flash` com
`role="status"` que a calculadora já usa para confirmar cópia. A home ganha um bloco ao pé das
seções, e nenhuma calculadora é tocada. A biblioteca `react-qr-code` fica isolada atrás de um
envoltório de um arquivo, de modo que trocá-la depois seja mudança local. O maior risco da
entrega não está no React e sim no payload: um BR Code sintaticamente válido mas semanticamente
errado só se revela na câmera de quem tenta contribuir, e por isso a verificação se ancora em
oráculo externo, e não apenas na suíte.

## 2. Princípios aplicados

| Princípio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| I. A spec é a fonte de verdade | O `requirements.md` precede o código; a `D-02` remanescente é dado, não decisão, e está declarada como premissa | respeita |
| II. Cadeia de derivação | Todo artefato desta feature deriva de `RF-NN` do requirements, e as decisões abaixo citam a regra que as origina | respeita |
| III. Clarificação precede solução | Quatro perguntas respondidas em 28/07 antes de qualquer desenho; a observação do celular reordenou a tela antes de existir código | respeita |
| IV. Portão G1 | O plano só nasce após as respostas; nenhuma linha foi escrita durante a clarificação | respeita |
| V. Fase 2 proporcional | Categoria **Aplicação**: roadmap, delta de dados, onboarding e um contrato externo. Sem PRD e sem arquitetura nova, que a feature não move | respeita |
| VI. Rastreabilidade bidirecional | Cada decisão abaixo aponta o `RF-NN` que a exige; o `legacy-impact.md` fechará o caminho de volta no `/reversa-coding` | respeita |
| VII. Testes em dois papéis | Validação por `RF-NN` e property-based para as invariantes do payload (comprimento declarado, CRC verificável, determinismo). Sem regressão a escrever: não há bug prévio | respeita |
| VIII. Proporcionalidade | Uma tela, um módulo puro, uma dependência. Não entra Storybook, não entra rota, não entra rodapé | respeita |
| IX. Norma de redação verificável | A feature cria superfície textual nova, e a classe de cada literal se declara em `scripts/textos/classes/interface.mts` e `models-demais.mts`; sem isso o gerador do inventário para | respeita |

Nenhum conflito com princípio ativo. Vale o registro de um ponto de atrito **aparente**, e
resolvido: o princípio V fala em pirâmide proporcional à categoria, e esta feature acrescenta um
nível que as anteriores não usaram, o de contrato externo em `interfaces/`. Não é excesso: o BR
Code é lido por software de terceiros, e um formato consumido fora do nosso código é contrato,
ainda que não trafegue por HTTP.

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | O módulo puro mora em `models/contribuicao/`, com a isenção de `MD-0022` no cabeçalho do arquivo de fachada | É a convenção que existe para domínio puro, e herda de graça o limiar de cobertura de 90% que o `vitest.config.ts` aplica a `models/**`. Um módulo determinístico e sem efeito colateral atinge esse limiar sem esforço | `lib/pix/` e `dominio/`, ambas descartadas por criarem uma segunda convenção de domínio por causa de um módulo, o que envelhece mal em projeto de mantenedor intermitente | 🟢 |
| D-02 | Erro como valor, união discriminada por `tipo`, com **coleta total** dos ofensores | ADR 0004 e a regra 15 de `domain.md`: a validação nunca para no primeiro erro. Aqui a regra vale mais que nos domínios clínicos, porque quem configura errado é o mantenedor sozinho, meses depois, e quer ver os três problemas de uma vez | Exceção lançada, descartada por contrariar ADR 0004; retorno `null`, descartado por não dizer o que está errado | 🟢 |
| D-03 | A montagem TLV é uma função só, `campo(id, valor)`, que calcula o comprimento em dois dígitos, e o payload é a composição ordenada dela | O padrão EMV é uma sequência de triplas; expressá-lo como composição de uma função pura torna cada campo legível ao lado da tabela do Banco Central | Concatenação manual com literais, descartada por tornar o comprimento um número mágico repetido dezena de vezes | 🟢 |
| D-04 | O CRC16 mora em arquivo próprio, `crc16.ts`, e recebe a cadeia já com `6304` no fim | É a parte mais fácil de errar e a mais fácil de testar em isolamento, contra vetor conhecido. Separá-la deixa a fachada legível e o teste específico | Função privada dentro da fachada, descartada por dificultar o teste do vetor conhecido | 🟢 |
| D-05 | `react-qr-code` fica atrás de `interface/contribuicao/codigo-qr.tsx`, envoltório de um arquivo, com a `value` recebendo o payload já montado | Isola a única dependência de runtime nova numa fronteira de um arquivo; trocá-la depois é mudança local, e o resto da árvore não sabe que ela existe. É a mesma disciplina de `area-de-transferencia.ts` e `preferencia-de-tema.ts` | Importar a biblioteca direto no painel, descartada por espalhar a dependência; codificador próprio, descartado na sessão de esclarecimento | 🟢 |
| D-06 | O painel usa `Dialog` de `@primer/react`, e não implementação própria de modal | O `Dialog` do Primer já entrega foco preso, retorno de foco ao gatilho, fechamento por `Esc` e por clique fora, e a baseline `axe` de 0/0 por rota depende de a semântica estar correta. Reimplementar seria assumir manutenção de acessibilidade que a dependência já resolve | Modal próprio com `<dialog>` nativo, descartado por exigir refazer o gerenciamento de foco que o Primer já mantém | 🟢 |
| D-07 | Os **dois** comandos de cópia compartilham um só componente de ação, parametrizado por rótulo, texto a copiar e recado de confirmação | RF-07 e RF-15 têm a mesma mecânica e diferem só nos três dados acima. Um componente com três props evita duplicar o estado de cópia e as duas variantes de `Flash` | Dois componentes irmãos quase idênticos, descartada por duplicação; um só botão que copia o copia e cola, descartada porque RF-07 pede a chave visível e copiável | 🟢 |
| D-08 | A função de cópia entra por **prop com valor padrão**, no molde exato de `AcaoCopiarPlano` em `interface/calculadora/resultado.tsx:57` | É o padrão de injeção que a suíte de integração da feature 006 já usa para dublar a área de transferência sem tocar em `navigator` | Mock global de `navigator.clipboard`, descartado por ser mais frágil e por divergir do que já existe | 🟢 |
| D-09 | Os parâmetros do beneficiário vivem em `interface/contribuicao/beneficiario.ts`, congelados por `Object.freeze`, no molde do `CATALOGO` | RN-09. A camada é de apresentação porque é configuração de exibição, e não regra: o módulo puro recebe os valores por parâmetro e não conhece a constante | Constante dentro de `models/contribuicao/`, descartada por acoplar o domínio a um dado de instalação; variável `NEXT_PUBLIC_*`, descartada na sessão de esclarecimento | 🟢 |
| D-10 | Folha própria `interface/estilos/contribuicao.css`, importada em `pages/_app.tsx` ao lado das outras seis | É a convenção vigente desde a feature 013, quando a consolidação do cabeçalho encerrou a dívida do `globais.css` no teto de 400 linhas. Folha nova evita reabri-la | Acrescentar as regras a `inicio.css`, descartada por misturar o bloco de apoio com a tipografia da home e por empurrar uma folha para perto do teto | 🟢 |
| D-11 | Em telas estreitas, os dois comandos de cópia precedem o QR na **ordem do DOM**, e a mudança de disposição em telas largas é feita por CSS, sem duplicar marcação | RF-16. Ordem de DOM correta serve leitor de tela e telefone ao mesmo tempo; resolver por `order` do flexbox mudaria o visual sem mudar a leitura, que é exatamente o que não se quer | Renderização condicional por largura, descartada por exigir JavaScript de layout e por quebrar o SSR | 🟡 |
| D-12 | O bloco de apoio entra em `interface/inicio/tela.tsx` **fora** do `map` do `CATALOGO`, depois do `<div className="inicio-secoes">` | O catálogo é fonte única de calculadoras (D-07 da feature 007), e um item que não calcula nada dentro dele corromperia o que ele significa, inclusive para o verificador de descrição da plataforma que a feature 018 ancorou nele | Entrada nova no `CATALOGO`, descartada pela razão acima | 🟢 |
| D-13 | Os literais novos são declarados em duas frentes: os do painel em `scripts/textos/classes/interface.mts`, os das mensagens de validação do módulo em `scripts/textos/classes/models-demais.mts` | Princípio IX. A classe vem da origem: prosa do painel é autoral; chave, nome e cidade são identificadores; o rótulo `PIX` é identificador de marca de arranjo, não prosa a revisar | Declarar tudo como autoral, descartada porque submeteria a chave à revisão de linguagem | 🟢 |
| D-14 | O verificador de exatidão da home **não** é estendido ao bloco de apoio | A feature 018 fez a `description` da raiz ser verificada contra o `CATALOGO` porque ela enumera seções. O texto de apoio não enumera nada e não tem oráculo a que se ancorar; inventar um seria verificação decorativa | Estender a verificação, descartada por não haver o que verificar | 🟡 |

## 4. Premissas

| Premissa | Origem (`requirements.md` seção) | Risco se errada |
|----------|----------------------------------|-----------------|
| Os três valores literais do beneficiário chegam antes do `/reversa-coding` escrever `beneficiario.ts`; até lá, testes e desenvolvimento usam valores de exemplo **declarados como tais** no próprio arquivo | §10, `[DÚVIDA] D-02` | Baixo para o plano e alto para a entrega: se a feature for a produção com valor de exemplo, o QR aponta para chave inexistente e a contribuição falha em silêncio no aplicativo de quem tenta. Mitigado por guarda no critério de pronto, que exige o valor real conferido pelo mantenedor |
| O nome civil cabe em 25 caracteres e a cidade em 15, limites do padrão para os campos `59` e `60` | §5, RF-03 | Médio: nome mais longo obriga a decidir entre abreviar e usar outra forma do nome, o que é decisão do mantenedor e não do código. A validação recusa em vez de truncar, de modo que o erro aparece no desenvolvimento, e não na câmera |
| A disposição de RF-16 resolve-se por ordem de DOM mais CSS, sem JavaScript de layout | §5, RF-16; D-11 | Baixo: se a disposição em tela larga exigir marcação distinta, a alternativa é `grid-template-areas`, que preserva a ordem do DOM |

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| `models/contribuicao` | `_reversa_sdd/architecture.md#1` (família de domínios) | componente-novo | Primeiro unit de domínio **não clínico**, isento por escrito dos invariantes de fonte clínica e `ReferenciaClinica` (`MD-0022`); montagem do BR Code, CRC16 e validação |
| `interface/contribuicao` | `_reversa_sdd/architecture.md#1` (camada de interface) | componente-novo | Painel `Dialog`, envoltório do QR, componente de cópia parametrizado e a constante congelada do beneficiário |
| `interface/inicio/tela.tsx` | `_reversa_sdd/code-analysis.md#Módulo 10 — interface/inicio` | regra-alterada | Bloco de apoio ao pé das seções, fora do `map` do `CATALOGO` (D-12). O catálogo permanece intocado |
| `interface/estilos` | `_reversa_sdd/interface-estilos/requirements.md` | componente-novo | Sétima folha, `contribuicao.css`, importada em `pages/_app.tsx` |
| `interface/calculadora/area-de-transferencia.ts` | `_reversa_sdd/code-analysis.md#Módulo 6` | regra-preservada (reuso) | Reaproveitado sem alteração de assinatura. Se a realocação da dívida técnica 2 de `architecture.md#6` acontecer um dia, este passa a ser o segundo consumidor a mover |
| `pages/index.tsx` | `_reversa_sdd/code-analysis.md#Módulo 12 — pages` | regra-preservada | `<title>` e `description` da raiz **não mudam**: a feature não acrescenta seção ao catálogo, e a descrição continua verdadeira |
| `package.json` e lockfile | `_reversa_sdd/dependencies.md` | contrato-alterado | Entra `react-qr-code` em versão pinada exata, primeira dependência de runtime desde a feature 010 |
| `tests/unit/dominio-contribuicao`, `tests/integration/interface/contribuicao.test.tsx`, `e2e/contribuicao.spec.ts` | `_reversa_sdd/architecture.md#5` | componente-novo (teste) | Três níveis da pirâmide; a suíte cresce e a cifra de `architecture.md#5`, já defasada pela dívida L-11, segue a corrigir na re-extração |
| `scripts/textos/classes/interface.mts`, `scripts/textos/classes/models-demais.mts` | `_reversa_sdd/addenda/018-revisao-linguagem-textos.md` | regra-alterada | Entradas novas para os literais do painel e das mensagens de validação; `tests/apoio/inventario-textual.json` regerado |
| `tests/apoio/citacao-linha-de-base.json` | `_reversa_sdd/addenda/018-revisao-linguagem-textos.md` | regra-preservada (escopo negativo) | **Intocado**. A feature não cria nem move citação de fonte clínica; qualquer alteração aqui é defeito, não entrega |

Sem delta em `_reversa_sdd/domain.md`: nenhuma regra clínica muda, nenhum motor é tocado,
nenhuma rota nasce ou morre. `/api/v1/status` segue idêntico.

## 6. Delta no modelo de dados

- Resumo das mudanças: nenhuma persistência nasce e nenhuma entidade clínica muda. O que entra
  são duas estruturas em memória, `ParametrosPix` e `SaidaBrCode`, e uma constante congelada de
  configuração. Nenhum campo é gravado, transmitido ou lido de disco em tempo de execução, e o
  único durável do sistema segue sendo a preferência de tema.
- Detalhe completo em: `_reversa_forward/019-contribuicao-voluntaria-pix/data-delta.md`

## 7. Delta de contratos externos

| Contrato | Tipo | Arquivo de detalhe |
|----------|------|--------------------|
| BR Code (EMV/QRCPS-MPM, PIX estático) | arquivo, cadeia de texto lida por aplicativo de terceiro | `_reversa_forward/019-contribuicao-voluntaria-pix/interfaces/br-code.md` |

`/api/v1/status` não é tocado, e por isso não ganha arquivo aqui. O BR Code ganha, e a razão
merece registro: é o único artefato desta plataforma que sai do nosso controle e é interpretado
por software que não escrevemos. Se estiver errado, o erro aparece na mão de quem tentou
contribuir, e não na nossa suíte.

## 8. Plano de migração

Não há migração de dados, porque não há dado a migrar. O que existe é uma ordem de execução que
importa, e ela é esta:

1. Módulo puro primeiro, com os testes de unidade e o oráculo externo do payload. Nenhuma linha
   de React antes de o BR Code estar provado.
2. Envoltório do QR e o painel, com a dependência entrando no `package.json` neste passo e não
   antes, para que a microdecisão do filtro de longevidade registre a versão pinada real.
3. Bloco na home, folha de estilo e ordem de DOM de RF-16.
4. Classes textuais declaradas e inventário regerado. É aqui que o gerador para se algum literal
   ficou órfão, e a ação não se dá por concluída antes disso.
5. Testes de integração e roteiro e2e, incluindo o negativo que percorre as cinco rotas de
   calculadora e afirma a ausência do comando.
6. Valores reais do beneficiário, conferidos pelo mantenedor, substituindo os de exemplo.
7. Medição de bundle e `README.md`.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Payload sintaticamente válido e semanticamente errado: passa na suíte, falha na câmera | alto | médio | Oráculo externo obrigatório, não opcional: o payload de exemplo é conferido contra decodificador independente e contra um aplicativo de banco real antes do encerramento. Está no critério de pronto |
| Feature vai a produção com a chave de exemplo | alto | baixo | Guarda no critério de pronto e uma verificação que reprova se a constante ainda contiver o valor de exemplo |
| A dependência nova quebra o build por conta de `prop-types` sob React 19 | médio | baixo | O envoltório de D-05 confina o problema a um arquivo; a verificação acontece no passo 2 do plano, antes de qualquer investimento em tela |
| `Dialog` do Primer introduz violação `axe` nova | médio | baixo | `e2e/axe-baseline.json` é conferido intocado no critério de pronto; violação nova reprova a entrega em vez de ser absorvida na baseline |
| O bloco de apoio destoa da home desenhada na feature 008 | baixo | médio | Tokens do Primer e nenhuma direção estética própria (RNF de estética); conferência visual antes do encerramento |
| Leitura de conflito de interesse por parte de quem usa | médio | baixo | RN-08 mantém o pedido fora de toda tela de decisão clínica, e o texto declara que a plataforma segue gratuita e que a contribuição não compra nada |
| A cifra de testes de `architecture.md#5` fica mais defasada | baixo | alto | Já é a dívida L-11, herdada da feature 018; registrada de novo aqui para a re-extração nº 4 |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] `cross-check.md` (se executado) sem CRITICAL nem HIGH
- [ ] `regression-watch.md` gerado
- [ ] Payload conferido contra **decodificador independente** e lido com sucesso por um
      aplicativo de banco real, com o resultado registrado
- [ ] `beneficiario.ts` com os valores reais, e nenhum valor de exemplo remanescente
- [ ] `node scripts/inventariar-textos.mts --gerar` conclui sem órfão, e a segunda execução
      deixa `git diff` vazio
- [ ] `tests/apoio/citacao-linha-de-base.json` e `e2e/axe-baseline.json` intocados, conferido
      por `git status` e não presumido
- [ ] Vitest, Playwright, `typecheck` e `eslint` verdes
- [ ] Acréscimo de bundle medido e registrado
- [ ] Microdecisão da dependência `react-qr-code` escrita, com versão pinada e medição reais
- [ ] Re-extração reversa executada e sem regressão vermelha (recomendado, não obrigatório)

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-28 | Versão inicial gerada por `/reversa-plan` | reversa |
