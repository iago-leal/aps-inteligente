# Requirements: Contribuição voluntária via PIX

> Identificador: `019-contribuicao-voluntaria-pix`
> Data: `2026-07-28`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

A plataforma é gratuita, sem anúncio, sem cadastro e sem coleta, e não tem hoje nenhuma via
por onde quem a usa possa sustentá-la. Esta feature abre essa via na forma mais estreita
possível: um comando de apoio que revela a chave PIX do mantenedor e o BR Code
correspondente, ambos montados no próprio navegador, sem transação, sem confirmação e sem
saber quem contribuiu. O beneficiário direto é o mantenedor único; o beneficiário indireto
é o prescritor, que continua com a ferramenta gratuita e sem contrapartida exigida. O
componente é vitrine de chave, e a redação precisa deixar claro que o valor é doação
voluntária, e não preço de serviço ou produto, porque a caracterização muda a natureza
jurídica do recebimento.

**Vocabulário deste documento.** *PIX estático* é o arranjo em que a chave de recebimento é
publicada uma vez e serve a qualquer contribuição, sem que o site saiba se alguma ocorreu;
opõe-se ao PIX dinâmico, que exige intermediário e devolve confirmação. *BR Code* é a cadeia
de texto que o aplicativo do banco lê ao apontar a câmera para o QR, especificada pelo Banco
Central sobre o padrão internacional EMV (Europay, Mastercard e Visa) na modalidade QRCPS-MPM
(*QR Code Payment Specification, Merchant Presented Mode*). *CRC16* é a verificação cíclica de
redundância de dezesseis bits que fecha a cadeia e permite ao aplicativo recusar um código
corrompido.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/adrs/0002-privacidade-por-arquitetura-client-side.md` | Privacidade resolvida por arquitetura: nenhum `fetch`, único `localStorage` é o tema; rotas de API permitidas apenas sem dado clínico. O componente de contribuição não pode abrir exceção a isso | 🟢 |
| `_reversa_sdd/adrs/0007-telemetria-nula-fase-1.md` | Telemetria nula: nada de rastreio de uso. Rastrear quem clicou em "apoiar" violaria a decisão vigente | 🟢 |
| `_reversa_sdd/architecture.md#1` | Três camadas com dependência unidirecional (`pages` → `interface/*` → `models/*`) e regra de negócio isolada de framework (ADR 0003) | 🟢 |
| `_reversa_sdd/architecture.md#1` | Invariantes da família `models/*`: fonte clínica única (ADR 0001/0011), toda saída com `ReferenciaClinica`, escopo igual ao da fonte. Um domínio de pagamento **não** pertence a essa família | 🟢 |
| `_reversa_sdd/architecture.md#4` | Nenhuma integração de runtime; `next.config.ts` fixa CSP sem terceiros, com `img-src 'self' data:` e `connect-src 'self'` | 🟢 |
| `_reversa_sdd/architecture.md#6` | Sem dívida de dependências: versões pinadas exatas, lockfile commitado; as features 011–014 não introduziram dependência nova | 🟢 |
| `_reversa_sdd/addenda/016-estrutura-cabecalho-home.md` | Contrato da `Moldura`: `titulo`, `subtitulo`, `apresentacao`, `comInicio`, `children`; identidade unificada, barra de ações com os dois IconButtons irmãos (início e tema) | 🟢 |
| `_reversa_sdd/addenda/018-revisao-linguagem-textos.md` | A superfície textual virou dado: 642 literais classificados; literal novo sem classe declarada faz `scripts/inventariar-textos.mts` parar. Princípio **IX** e `docs/redacao.md` regem a prosa nova | 🟢 |
| `_reversa_sdd/code-analysis.md#Módulo 10 — interface/inicio` | `CATALOGO` é fonte única das seções e rotas da home, e desde a 018 é também oráculo da descrição da plataforma | 🟢 |
| `_reversa_sdd/architecture.md#5` | Pirâmide de testes: unidade property-based com fast-check, integração via Testing Library, e2e Playwright com `axe-baseline.json` em 0/0 por rota | 🟢 |
| `_reversa_sdd/permissions.md` | Ausência de autenticação e de perfis: todo visitante vê o mesmo produto. O comando de apoio não pode introduzir estado de usuário | 🟡 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Prescritor da APS que já usa a plataforma | Retribuir a ferramenta que economiza tempo na consulta | Termina um cálculo, volta à home, aciona o comando de apoio, lê o BR Code no aplicativo do banco e transfere o valor que decidir |
| Colega que recebeu o link e está avaliando | Entender que não há paywall nem pegadinha | Abre o painel por curiosidade, lê que a contribuição é voluntária e que nada muda na ferramenta, fecha sem contribuir |
| Prescritor que abre a plataforma **no próprio celular** | Contribuir sem ter uma segunda câmera para ler o código | Não consegue apontar a câmera do aparelho para a tela do mesmo aparelho; copia o código PIX copia e cola, alterna para o aplicativo do banco e cola |
| Prescritor em computador de unidade de saúde, sem celular à mão | Guardar a chave para contribuir depois | Copia a chave em texto pelo botão de cópia e recebe confirmação visível de que copiou |
| Mantenedor único | Receber contribuição sem administrar processo | Publica a chave sem gateway, sem conciliação, sem base de doadores para guardar e sem obrigação de LGPD nova |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** O valor recebido é **contribuição voluntária**, jamais contraprestação. O texto
   exibido declara, em prosa afirmativa, que a plataforma é e continua gratuita, que a
   contribuição não compra funcionalidade, prioridade, suporte nem acesso, e que não contribuir
   não retira nada de quem usa. 🟢
   - Origem no legado: regra nova; nenhuma regra de `_reversa_sdd/domain.md` trata de dinheiro
   - Tipo: nova
2. **RN-02:** Nenhuma transação é processada, iniciada ou confirmada pela plataforma. O PIX
   estático não gera retorno ao site, e o componente **não** afirma, sugere nem simula
   confirmação de recebimento. Não há estado de "pago", "obrigado pela doação" disparado por
   evento de pagamento, nem contador de arrecadação. 🟢
   - Tipo: nova
3. **RN-03:** Nenhum dado de quem contribui é coletado, transmitido ou persistido: sem
   formulário, sem nome, sem e-mail, sem valor informado à plataforma, sem cookie, sem
   `localStorage`, sem evento analítico. A abertura do painel não sai do navegador. Isto
   preserva ADR 0002 e ADR 0007 na letra, e mantém verdadeiro o selo `Nada é salvo nem
   enviado` da `Moldura`. 🟢
   - Origem no legado: `_reversa_sdd/adrs/0002-privacidade-por-arquitetura-client-side.md`, `_reversa_sdd/adrs/0007-telemetria-nula-fase-1.md`
   - Tipo: nova, por derivação de regra confirmada
4. **RN-04:** A montagem do BR Code é **determinística, pura e local**: dado o mesmo conjunto de
   parâmetros, o payload emitido é byte a byte o mesmo, e nenhuma requisição de rede participa
   da geração, nem para montar o payload nem para desenhar o QR. 🟢
   - Tipo: nova
5. **RN-05:** O payload segue o padrão do Banco Central para o BR Code, com os campos
   obrigatórios do PIX estático: Payload Format Indicator (`00`), Merchant Account Information
   (`26`) com GUI `br.gov.bcb.pix` e a chave, Merchant Category Code (`52`), Transaction
   Currency `986` (`53`), Country Code `BR` (`58`), Merchant Name (`59`), Merchant City (`60`),
   Additional Data Field Template (`62`) com o txid, e CRC16-CCITT/FALSE ao final (`63`). Campo
   de valor (`54`) só aparece quando há valor sugerido. 🟢
   - Tipo: nova
6. **RN-06:** O módulo que monta o payload é **lógica pura fora do framework**, na disciplina do
   ADR 0003, mas é o **primeiro unit de domínio não clínico** do projeto e, por isso, fica
   explicitamente **isento** dos invariantes da família clínica: não tem fonte clínica única
   (ADR 0001/0011), não emite `ReferenciaClinica` e não participa do catálogo de referências
   congelado. A isenção é declarada no código e na spec, para que a re-extração não a leia como
   violação. 🟡
   - Origem no legado: `_reversa_sdd/architecture.md#1` (tabela de invariantes da família `models/*`)
   - Tipo: nova
7. **RN-07:** Todo literal novo exibido é **texto autoral** na acepção de `docs/redacao.md` §2.1,
   e obedece à norma: nenhum travessão na prosa, nenhuma reticência, nenhuma exclamação, caixa
   de frase nos títulos, ponto médio só como recurso tipográfico. A classe de cada literal novo
   é **declarada** em `scripts/textos/classes/`, sem o quê `node scripts/inventariar-textos.mts`
   para. A chave PIX, o nome do beneficiário e a cidade são **identificadores** (§2.3), fora do
   alcance da revisão de linguagem. 🟢
   - Origem no legado: `_reversa_sdd/addenda/018-revisao-linguagem-textos.md`, princípio IX de `.reversa/principles.md`
   - Tipo: nova
8. **RN-08:** O comando de apoio não aparece dentro do fluxo de decisão clínica de nenhuma
   calculadora, para que pedido de dinheiro e recomendação de conduta jamais dividam a mesma
   tela de resultado. A separação é editorial antes de ser estética: conduta exibida ao lado de
   pedido de contribuição convida à leitura de conflito de interesse. 🟡
   - Tipo: nova
9. **RN-09:** Os parâmetros do beneficiário (chave, nome, cidade, valor sugerido e identificação)
   são **configuração**, não literal espalhado pela árvore: vivem em um ponto único, tipado e
   **congelado por `Object.freeze`**, no molde do `CATALOGO`, e o componente os recebe por
   contrato explícito. Ficam no repositório, e não em variável de ambiente: a chave é pública
   por natureza, já que existe para ser exibida, e `NEXT_PUBLIC_*` terminaria no mesmo bundle
   sem proteger nada, ao custo de três ambientes a manter em dia. 🟢
   - Origem no legado: `_reversa_sdd/code-analysis.md#Módulo 10 — interface/inicio` (o `CATALOGO` como precedente de fonte única congelada)
   - Tipo: nova
10. **RN-10:** O painel oferece **duas cópias, e não uma**: a **chave** em texto, para quem quer
    guardá-la ou digitá-la no aplicativo do banco, e o **código PIX copia e cola**, que é o
    próprio BR Code em forma textual. O segundo é o caminho principal em telefone, onde ler o QR
    é impossível por falta de segunda câmera, e é o mais seguro dos dois: colado no aplicativo,
    chega com o beneficiário já identificado, sem risco de a chave ser colada em campo errado.
    A cópia do código copia e cola usa exatamente a cadeia que gera o QR, e não uma segunda
    montagem. 🟢
    - Tipo: nova

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Módulo puro que monta o payload BR Code a partir de `chavePix`, `nomeBeneficiario`, `cidade`, `valorSugerido?` e `identificacao?`, emitindo cadeia EMV completa com CRC16 | Must | Teste de unidade compara o payload emitido com oráculo congelado e confere o CRC recalculado; segunda execução com as mesmas entradas produz cadeia idêntica | 🟢 |
| RF-02 | Cálculo do CRC16-CCITT/FALSE (polinômio `0x1021`, valor inicial `0xFFFF`) sobre a cadeia acrescida de `6304`, em quatro dígitos hexadecimais maiúsculos | Must | Vetor de teste conhecido do padrão confere; propriedade `fast-check`: qualquer payload gerado é aceito pela verificação do próprio CRC | 🟢 |
| RF-03 | Validação de entrada do módulo: comprimento máximo dos campos (`59` até 25, `60` até 15, txid até 25), recusa de campo vazio obrigatório e normalização de caracteres fora do conjunto aceito | Must | Entradas inválidas devolvem erro **como valor** (união discriminada por `tipo`, na disciplina do ADR 0004), nunca exceção nem payload silenciosamente truncado | 🟢 |
| RF-04 | Ausência de valor gera QR sem o campo `54`, deixando o valor à escolha de quem contribui; presença de `valorSugerido` embute o valor fixo formatado com duas casas decimais | Must | Dois testes de unidade, um por caminho, verificam presença e ausência do campo `54` | 🟢 |
| RF-05 | Comando visível de apoio, com rótulo autoral conforme a norma, que abre um painel modal | Must | Teste de integração aciona o comando e observa o painel aberto; o rótulo consta do inventário textual com classe declarada | 🟢 |
| RF-06 | O painel exibe o BR Code renderizado no cliente, sem requisição de rede, com alternativa textual acessível | Must | Teste de integração confirma o desenho presente; o e2e observa zero requisição externa na abertura do painel | 🟢 |
| RF-07 | O painel exibe a chave PIX em texto legível e um comando de cópia com confirmação visível de sucesso | Must | Teste de integração aciona a cópia com a área de transferência dublada e observa a confirmação; falha da API de cópia mostra recado honesto em vez de silêncio | 🟢 |
| RF-15 | O painel oferece um segundo comando de cópia, do **código PIX copia e cola**, sobre a mesma cadeia que gera o QR (RN-10) | Must | Teste de integração compara o texto copiado com o payload emitido pelo módulo de RF-01, exigindo igualdade byte a byte | 🟢 |
| RF-16 | Em telas estreitas, os dois comandos de cópia aparecem **antes** ou com o mesmo peso do QR, porque ler o código é impossível no aparelho que o exibe | Must | Roteiro e2e em viewport de telefone observa a ordem de leitura e a visibilidade dos dois comandos sem rolagem adicional | 🟡 |
| RF-08 | O painel declara em texto que a contribuição é voluntária, que a plataforma permanece gratuita e que nada é processado nem confirmado no site (RN-01, RN-02) | Must | Teste de integração afirma a presença dos três enunciados; a redação passa nos verificadores de `tests/unit/textos/` | 🟢 |
| RF-09 | O painel fecha por `Esc`, por clique fora e por comando explícito de fechar, devolvendo o foco ao comando que o abriu | Must | Teste de integração cobre os três caminhos e a devolução do foco; roteiro e2e repete por teclado | 🟢 |
| RF-10 | Os parâmetros do beneficiário vivem em ponto único de configuração, tipado e congelado (RN-09) | Must | Busca por literal da chave fora do arquivo de configuração não retorna ocorrência | 🟢 |
| RF-11 | O comando de apoio aparece **só na home**, ao pé das seções do catálogo, e em nenhuma calculadora (RN-08) | Must | Teste de integração observa o comando na home; roteiro e2e percorre as cinco rotas de calculadora e afirma a ausência do comando em todas | 🟢 |
| RF-12 | Reaproveitamento do adaptador de área de transferência já existente em `interface/calculadora/area-de-transferencia.ts`, em vez de segundo adaptador | Should | O componente importa o adaptador existente; se a assinatura não servir, a generalização é registrada como delta de contrato | 🟡 |
| RF-13 | Documentação no `README.md` do ponto de configuração e do que muda ao trocar a chave | Should | Seção nova no molde das que já documentam os geradores dev-time | 🟢 |
| RF-14 | Classificação dos literais novos em `scripts/textos/classes/` e regeneração de `tests/apoio/inventario-textual.json` (RN-07) | Must | `node scripts/inventariar-textos.mts --gerar` conclui sem candidato órfão; segunda execução deixa `git diff` vazio | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Privacidade | Zero requisição de rede acrescentada, zero durável novo, zero identificador de visitante. A CSP de `next.config.ts` permanece sem terceiros | ADR 0002, ADR 0007; `_reversa_sdd/architecture.md#4` | 🟢 |
| Segurança | O QR desenha-se por marcação da própria origem ou por `data:` URI, ambos já admitidos pela CSP (`img-src 'self' data:`); nenhum `dangerouslySetInnerHTML` com cadeia montada em tempo de execução | `next.config.ts` | 🟢 |
| Acessibilidade | O painel entra na árvore de acessibilidade como diálogo modal nomeado, com foco preso, retorno de foco e `axe` sem violação nova; `e2e/axe-baseline.json` permanece intocado | `_reversa_sdd/architecture.md#5` (baseline 0/0 por rota) | 🟢 |
| Manutenibilidade | Entra **uma** dependência de runtime, `react-qr-code`, a primeira desde a feature 010: versão pinada exata, lockfile commitado e microdecisão registrando o filtro de longevidade. Nenhuma outra dependência acompanha a feature | `_reversa_sdd/architecture.md#6`; Princípio nº 3 do mantenedor | 🟢 |
| Desempenho | Acréscimo de bundle declarado por rota em `medicao-bundle.md`, no molde da feature 018; o custo do desenho do QR fica fora do caminho crítico da primeira pintura, carregado só quando o painel abre | `_reversa_forward/018-revisao-linguagem-textos/medicao-bundle.md` | 🟡 |
| Observabilidade | Falha ao copiar ou ao montar o payload aparece ao usuário como recado nomeado, jamais como silêncio; nenhum evento sai da máquina | ADR 0004 (erros como valores); Princípio "erros barulhentos" | 🟢 |
| Estética | Identidade Primer integral, sem direção visual própria: o painel usa `Dialog` de `@primer/react` e os tokens já vigentes | Feature 004; `_reversa_sdd/interface-estilos/requirements.md` | 🟢 |
| Jurídico | A prosa caracteriza doação de pessoa física a pessoa física, sem promessa de recibo, de dedução fiscal ou de contrapartida; a plataforma não emite documento fiscal | RN-01 | 🟡 |
| Resiliência | Retentativa, tempo limite e concorrência **não se aplicam**: nenhuma operação de rede participa da feature, e a montagem do payload é síncrona e determinística. A única falha possível é a recusa da área de transferência pelo navegador, tratada em RF-07 | RN-04; ADR 0002 | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Payload estático sem valor definido
  Dado a chave, o nome do beneficiário e a cidade configurados
  E nenhum valor sugerido
  Quando o módulo monta o BR Code
  Então a cadeia começa por "000201", contém "br.gov.bcb.pix", "5303986" e "5802BR"
  E não contém o campo de valor "54"
  E termina por "6304" seguido de quatro dígitos hexadecimais que conferem com o CRC recalculado

Cenário: Payload com valor sugerido
  Dado os mesmos parâmetros e um valor sugerido de 25
  Quando o módulo monta o BR Code
  Então a cadeia contém "54" com o comprimento e o valor "25.00"
  E o CRC final difere do payload sem valor

Cenário: Determinismo
  Dado o mesmo conjunto de parâmetros
  Quando o módulo monta o BR Code duas vezes
  Então as duas cadeias são idênticas byte a byte

Cenário: Abrir e ler a chave
  Dado o visitante na tela onde o comando de apoio aparece
  Quando aciona o comando
  Então o painel abre com o BR Code, a chave em texto e o enunciado de contribuição voluntária
  E nenhuma requisição de rede parte da página

Cenário: Copiar a chave
  Dado o painel aberto
  Quando o visitante aciona o comando de cópia da chave
  Então a chave vai para a área de transferência
  E uma confirmação visível de sucesso aparece

Cenário: Copiar o código PIX copia e cola
  Dado o painel aberto
  Quando o visitante aciona o comando de cópia do código copia e cola
  Então o texto copiado é idêntico, byte a byte, ao payload que gerou o QR
  E uma confirmação visível de sucesso aparece

Cenário: Contribuir pelo próprio telefone
  Dado o visitante na home em viewport de telefone
  Quando abre o painel de apoio
  Então os dois comandos de cópia estão visíveis sem rolagem adicional
  E o texto explica que o código copia e cola serve para colar no aplicativo do banco

Cenário: Comando ausente das calculadoras
  Dado o visitante em qualquer uma das cinco rotas de calculadora
  Quando a tela termina de carregar
  Então nenhum comando de apoio aparece na página

Cenário: Falha na área de transferência
  Dado o painel aberto num navegador que recusa a permissão de cópia
  Quando o visitante aciona o comando de cópia
  Então um recado nomeado informa que a cópia não foi possível
  E a chave permanece visível em texto para cópia manual

Cenário: Fechar por teclado
  Dado o painel aberto
  Quando o visitante pressiona Esc
  Então o painel fecha
  E o foco volta ao comando que o abriu

Cenário: Campo obrigatório ausente
  Dado uma configuração sem cidade
  Quando o módulo monta o BR Code
  Então devolve erro como valor, nomeando o campo faltante
  E nenhuma cadeia parcial é emitida

Cenário: Nome de beneficiário acima do limite do padrão
  Dado um nome com mais de 25 caracteres
  Quando o módulo monta o BR Code
  Então devolve erro como valor, em vez de truncar em silêncio

Cenário: Nada de rastreio
  Dado o painel aberto e fechado
  Quando se inspeciona o armazenamento do navegador
  Então nenhuma chave nova existe em localStorage ou sessionStorage além da preferência de tema

Cenário: Configuração em ponto único
  Dado o repositório inteiro
  Quando se procura a chave PIX publicada fora do arquivo de configuração
  Então nenhuma ocorrência é encontrada

Cenário: Literal novo sem classe declarada
  Dado um literal exibido acrescentado sem entrada em scripts/textos/classes/
  Quando o gerador do inventário textual roda
  Então ele para, nomeando arquivo e linha do literal órfão
  E nenhuma entrega passa com o inventário desatualizado

Cenário: Cópia sem segundo adaptador
  Dado o comando de cópia do painel
  Quando se inspeciona a origem da função de cópia
  Então ela vem do adaptador de área de transferência já existente na plataforma
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01, RF-02, RF-03 | Must | Sem payload correto e verificável, o QR não abre no aplicativo do banco, e o erro só aparece nas mãos de quem tenta contribuir |
| RF-04 | Must | O caminho sem valor é o padrão pedido; o caminho com valor é a variação parametrizada |
| RF-05, RF-06, RF-07 | Must | São a feature vista de fora |
| RF-15, RF-16 | Must | Em telefone, que é onde o prescritor mais abre a plataforma, o QR não tem como ser lido pelo aparelho que o exibe: sem as duas cópias em posição legível, a feature simplesmente não funciona nesse contexto |
| RF-08 | Must | É o requisito de caracterização jurídica, e o único cuja ausência muda a natureza do recebimento |
| RF-09 | Must | Acessibilidade de modal é linha de base do projeto, não refinamento |
| RF-10, RF-14 | Must | Guardas do projeto: configuração fora do código e classe declarada de literal novo |
| RF-11 | Must | Sem a colocação decidida, o componente não tem onde existir |
| RF-12 | Should | Evita segundo adaptador de área de transferência; se a assinatura não servir, o duplicado é aceitável nesta entrega |
| RF-13 | Should | Documentação que o mantenedor intermitente vai querer daqui a doze meses, sem a qual a feature ainda funciona |
| RNF de desempenho | Should | O painel é raro e sob demanda; a medição existe para não crescer o bundle sem que se perceba |

## 9. Esclarecimentos

### Sessão 2026-07-28

- **Q:** Onde o comando de apoio deve aparecer na plataforma?
  **R:** Só na home, ao pé das seções do catálogo. As calculadoras ficam intocadas, o contrato
  da `Moldura` não muda e as guardas geométricas de cabeçalho das features 013, 015 e 016
  seguem válidas. Confirma RN-08 e a metade editorial de `MD-0022`, que fica sem necessidade
  de emenda. Resolve `D-01`; RF-11 passa de 🔴 a 🟢.
- **Q:** Quem é o beneficiário que aparecerá no aplicativo do banco de quem contribui?
  **R:** Pessoa física, o próprio mantenedor. A caracterização de RN-01 é doação de pessoa
  física a pessoa física, sem emissão de documento fiscal, sem recibo e sem dedução; o texto
  exibido diz que a contribuição vai ao mantenedor. Nenhuma das empresas médicas entra, o que
  evita a leitura de receita de atividade.
- **Q:** Qual o tipo da chave PIX?
  **R:** Chave **aleatória** (EVP). Não expõe CPF, telefone nem e-mail do mantenedor, e é a
  única cujo valor pode ser trocado sem que nada da vida civil precise mudar junto.
- **Q:** Onde ficam a chave, o nome e a cidade do beneficiário?
  **R:** Constante congelada no repositório, no molde do `CATALOGO`, e não em variável de
  ambiente. A chave existe para ser exibida, de modo que `NEXT_PUBLIC_*` não protegeria nada
  num produto client-side: terminaria no mesmo bundle, ao custo de três ambientes a manter em
  dia. Fixado em RN-09.
- **Q:** Como o QR Code é desenhado no navegador?
  **R:** Pela biblioteca `react-qr-code`, que emite SVG e dispensa `canvas`. É a primeira
  dependência de runtime desde a feature 010, entra com versão pinada exata e exige
  microdecisão registrando o filtro de longevidade. A montagem do payload continua sendo
  código nosso, com testes próprios. Resolve `D-03`.
- **Q:** E quem abre a plataforma no próprio celular, sem uma segunda câmera para ler o QR?
  **R:** Levantado pelo mantenedor nesta sessão, e muda a hierarquia da tela. A cópia deixa de
  ser conveniência e passa a ser o caminho principal em telefone. Entram RN-10, RF-15 e RF-16:
  duas cópias, a da chave e a do **código PIX copia e cola**, esta última sobre a mesma cadeia
  que gera o QR e em posição legível sem rolagem em telas estreitas. O copia e cola é o mais
  seguro dos dois, porque chega ao aplicativo com o beneficiário já identificado.

## 10. Lacunas

- 🔴 **[DÚVIDA] D-02 (dados obrigatórios, RN-09): os três valores literais do beneficiário.** A
  sessão de esclarecimento fixou a natureza (pessoa física), o tipo da chave (aleatória) e o
  lugar da configuração (constante congelada no repositório). **Restam os valores**: a chave
  aleatória a publicar, o nome civil como aparecerá no campo `59`, respeitado o limite de 25
  caracteres, e a cidade do campo `60`, no limite de 15. São dado, não decisão: o plano e a
  decomposição em ações podem seguir sem eles, e o `/reversa-coding` os pede antes de escrever
  o arquivo de configuração. Enquanto faltarem, os testes usam valores de exemplo declarados
  como tais.

Resolvidas na sessão de 2026-07-28, registradas em `## 9. Esclarecimentos`: **D-01** (colocação:
só na home) e **D-03** (desenho do QR: `react-qr-code`), além da natureza do beneficiário, do
tipo da chave e do lugar da configuração, que eram as três partes decidíveis de **D-02**.

Decisões assumidas sem `[DÚVIDA]`, por terem resposta clara no legado ou no pedido, e
registradas aqui para que o `/reversa-clarify` possa contestá-las:

- **Sem Storybook.** O pedido original admite "storybook ou página de demo simples". O projeto
  não tem Storybook, e introduzi-lo seria dependência de peso desproporcional ao escopo. O
  isolamento do componente prova-se pelos testes de unidade do módulo puro e pelos testes de
  integração com Testing Library, que já são a prática das quatro telas.
- **Sem rota nova.** Um `/apoiar` acrescentaria `<title>`, `description` e entrada no catálogo,
  e o catálogo é fonte única de **calculadoras**. O painel modal resolve sem tocar nessa
  estrutura.
- **Sem valor sugerido no primeiro corte.** O parâmetro existe no contrato do módulo (RF-04),
  mas a configuração publicada nasce sem valor, que é o que respeita a escolha de quem
  contribui e o que o pedido chama de padrão.

## Pendências de Qualidade

Duas ressalvas da auto-validação ficam declaradas em vez de corrigidas, porque corrigi-las
custaria mais do que valem:

- **Nomes de biblioteca no documento.** A checklist de qualidade pede requirements sem nome de
  produto. Aqui eles aparecem em dois lugares, e por razões distintas: na §6, onde a
  identidade visual e o aparato de testes são decisão **já vigente** do legado, e não escolha
  desta feature; e na §10, dentro de `D-03`, onde a candidata é nomeada com a evidência que
  sustenta o filtro de longevidade, que é exatamente o que a dúvida existe para decidir. A
  alternativa, descrever a biblioteca sem nomeá-la, tornaria a dúvida indecidível.
- **RF-13 sem cenário Gherkin.** É requisito de documentação, verificável por leitura e não por
  execução. Fica sem cenário por natureza, e não por esquecimento.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-28 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-07-28 | Sessão de esclarecimento por `/reversa-clarify`: D-01 e D-03 resolvidas, D-02 reduzida a dado faltante; entram RN-10, RF-15 e RF-16 (duas cópias e hierarquia em telefone) por observação do mantenedor | reversa |
