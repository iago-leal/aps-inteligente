# Requirements: Ficha de consulta de puericultura, da caderneta ao SOAP

> Identificador: `020-consulta-puericultura-soap`
> Data: `2026-07-28`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

As páginas verdes da *Caderneta da Criança* (pp. 66 a 75) dizem, consulta a consulta, o que
se investiga em cada idade, e hoje o médico da Atenção Primária à Saúde (APS) as preenche em
papel e depois redige o registro do prontuário à mão, duas vezes o mesmo trabalho. Esta
feature transforma essas páginas em uma tela preenchível: escolhida a idade da criança, o
produto apresenta os campos da consulta correspondente na redação da fonte, aceita marcação,
seleção e texto livre, e devolve, por um comando de cópia, tudo o que foi preenchido já
organizado em SOAP, sigla do registro clínico orientado por problemas que divide a nota em
subjetivo, objetivo, avaliação e plano, pronto para colar no prontuário. As medidas antropométricas da ficha chegam à calculadora de
crescimento da feature 017 sem redigitação, e os escores z voltam para o registro. É a
sexta calculadora e a segunda tela da seção de Puericultura, e a primeira da plataforma cujo
produto é um **texto de registro**, e não um número.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/architecture.md#1` | Nove invariantes da família de domínios: domínio puro, uma fonte clínica por unit, erro como valor, `ReferenciaClinica` em toda saída, coleta total de ofensores, o motor informa e não escolhe, escopo igual ao da fonte, privacidade por construção | 🟢 |
| `_reversa_sdd/architecture.md#2` | Três containers; toda calculadora nova cresce no cliente, sem container novo. Precedente das features 014, 017 e 019 | 🟢 |
| `_reversa_sdd/architecture.md#3` | Nenhum dado clínico é persistido; o único durável do sistema é a preferência de tema | 🟢 |
| `_reversa_sdd/domain.md#7` | Invariantes transversais 1 a 12, entre eles a invalidação por edição (8) e o ritual de revisão restrito à insulina (10) | 🟢 |
| `_reversa_sdd/domain.md#8` | Fronteiras de escopo: o que a fonte não cobre vira recusa declarada, não extrapolação. Orientações ao paciente estão fora | 🟢 |
| `_reversa_sdd/addenda/017-puericultura-crescimento.md` (vigente) | Quinto domínio `models/puericultura`, com `IdadesDerivadas` já separando idade cronológica, corrigida e pós-menstrual; fachada `CalculadoraCrescimentoInfantil.avaliar`; tela `interface/puericultura/`; quarta seção do catálogo da home | 🟢 |
| `_reversa_sdd/addenda/019-contribuicao-voluntaria-pix.md` (a sincronizar) e `interface/contribuicao/painel.tsx` | Precedente de painel modal carregado sob demanda, com comando de cópia parametrizado e confirmação anunciada a leitor de tela | 🟡 |
| `_reversa_sdd/code-analysis.md#Módulo 10 — interface/inicio` | `CATALOGO` congelado é a fonte única de seções e rotas; calculadora nova entra ali primeiro | 🟢 |
| `_reversa_sdd/code-analysis.md#Módulo 6 — interface/calculadora` | `formatar-plano.ts` e `area-de-transferencia.ts` (feature 006): precedente de projetar em texto simples o que a tela exibe e de isolar o clipboard atrás de erro como valor | 🟢 |
| `_reversa_sdd/adrs/0002-privacidade-por-arquitetura-client-side.md` | Sem `fetch` e sem `storage` de dado clínico; introduzir persistência reabre LGPD, autenticação e specs | 🟢 |
| `_reversa_sdd/adrs/0011-uma-fonte-clinica-por-unit-de-dominio.md` | Mescla de fontes proibida; cada unit cobre o que a sua fonte cobre | 🟢 |
| `_reversa_sdd/adrs/0005-motor-nao-escolhe-condutas-equivalentes.md` · `0012` | O motor informa e não escolhe; o ritual de confirmação existe só onde se prescreve dose | 🟢 |
| `.reversa/principles.md#IX` e `docs/redacao.md` §2 | Três classes de texto declaradas: autoral, citação byte a byte e identificador. A exceção de concordância é estreita e inseparável da declaração ao leitor | 🟢 |
| `.harness/decisoes/MD-0001.md` | A *Caderneta da Criança* é a fonte editorial única da unit de puericultura; o que ela imprime é o dado da própria fonte | 🟢 |
| `.harness/decisoes/MD-0011.md` | Duas idades, dois papéis: a cronológica mede o corpo, a corrigida lê a curva | 🟢 |
| `.harness/decisoes/MD-0016.md` · `MD-0020` · `MD-0021` | A superfície textual vira dado gerado por `scripts/inventariar-textos.mts`; literal sem classe declarada faz o gerador parar | 🟢 |
| `referencias/caderneta/caderneta_crianca_{menino,menina}_2ed.pdf`, pp. 66 a 75 | Matéria-prima desta feature, lida nesta sessão. Treze fichas, das quais dez são consultas datadas | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Médico de família na consulta de puericultura | Percorrer o roteiro da caderneta sem esquecer item, e sair da consulta com o registro pronto | Abre a ficha do 4.º mês, marca os achados enquanto examina, aciona a calculadora de crescimento sem redigitar peso e comprimento, copia o SOAP e cola no prontuário eletrônico |
| Enfermeiro da equipe de APS | Fazer a consulta de rotina que lhe cabe (1.ª semana, 1.º mês) com o mesmo roteiro | Preenche a ficha da 1.ª semana, registra as triagens neonatais e copia o texto para o prontuário da unidade |
| Médico em consulta de criança nascida pré-termo | Saber qual ficha aplicar e ver as duas idades declaradas | Informa a idade gestacional ao nascer, o produto exibe as duas idades e a ficha selecionada, e o SOAP registra qual delas governou a escolha |
| Residente ou estudante em campo | Aprender o que a caderneta manda investigar em cada idade | Percorre a ficha como roteiro, sem preencher tudo, e usa o que preencheu |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** A fonte clínica única desta unit é a *Caderneta da Criança* (Ministério da Saúde, 2.ª ed., Brasília, 2020), seção "Acompanhamento da Criança e Consultas Recomendadas", pp. 66 a 75. É a **mesma fonte editorial** da feature 017, em seção diferente, de modo que ADR 0011 permanece intacto e nenhuma segunda fonte entra. 🟢
   - Origem no legado: `_reversa_sdd/adrs/0011-uma-fonte-clinica-por-unit-de-dominio.md`, `.harness/decisoes/MD-0001.md`
   - Tipo: nova
2. **RN-02:** As fichas de consulta datada são **dez**, na nomenclatura da fonte: 1.ª Semana (p. 68), 1.º Mês (p. 69), 2.º Mês (p. 70), 4.º Mês (p. 71), 6.º e 9.º Mês (p. 72), 12.º e 18.º Mês (p. 73), 24.º e 36.º Mês (p. 74). Cada uma cobre o que a sua página imprime, sem campo herdado de vizinha. 🟢
   - Tipo: nova
3. **RN-03:** Fora das dez, a fonte imprime três registros que **não são consultas datadas**: Pré-Natal e Nascimento (p. 67), Triagens Neonatais (p. 68) e Outras Medidas e Consultas Necessárias (p. 75, com a tabela de pressão arterial). Entram ou não conforme a resposta à lacuna 1 da seção 10; enquanto não entrarem, sua ausência é declarada ao usuário, não silenciada. 🔴
   - Tipo: nova
4. **RN-04:** A ficha aplicável se seleciona pela idade da criança na data da consulta, e a seleção **é do usuário**, com sugestão do produto. O motor informa qual ficha a idade indica; quem escolhe é o prescritor, no espírito de ADR 0005. Uma idade entre duas consultas previstas sugere a ficha imediatamente anterior. 🟡
   - Origem no legado: `_reversa_sdd/adrs/0005-motor-nao-escolhe-condutas-equivalentes.md`
   - Tipo: nova
5. **RN-05:** Havendo idade gestacional ao nascer abaixo de 37 semanas, as duas idades são calculadas e **exibidas lado a lado**, com o rótulo de cada uma, reusando `IdadesDerivadas` da feature 017 sem reimplementar aritmética de datas. Qual delas governa a sugestão da ficha é a lacuna 2 da seção 10. 🔴
   - Origem no legado: `.harness/decisoes/MD-0011.md`, addendum 017
   - Tipo: nova
6. **RN-06:** Todo rótulo de campo, título de seção e opção de escolha reproduzido das pp. 66 a 75 é **citação**, permanece byte a byte e se declara como tal em `scripts/textos/classes/`. A exceção de concordância de `MD-0015` continua valendo com o mesmo rigor: alcança só concordância, sobre lista fechada, e é inseparável da declaração ao leitor. 🟢
   - Origem no legado: `.reversa/principles.md#IX`, `docs/redacao.md` §2.2
   - Tipo: nova
7. **RN-07:** A caderneta do menino e a da menina imprimem as **mesmas fichas**, com três diferenças de flexão apuradas nesta sessão: "saúde do seu filho" / "da sua filha" e "interação mãe-filho" / "mãe-filha" (pp. 66, 69, 70 e 71). Não há diferença de campo clínico entre as duas tiragens. O sexo, já necessário à curva de crescimento, governa também qual flexão a tela exibe. 🟢
   - Tipo: nova
8. **RN-08:** A ficha do 2.º Mês imprime **"Criptorquidia"** nas duas tiragens, inclusive na caderneta da menina (p. 70 de ambas, conferido nesta sessão). É desvio de conteúdo da fonte, não de concordância, e portanto **fora** da exceção que `MD-0015` autoriza. Proposta a arbitrar no `/reversa-clarify`: transcrever o campo tal como impresso na ficha do sexo correspondente, com nota de proveniência informando que a fonte o imprime nas duas tiragens. Suprimi-lo seria reescrever a fonte em silêncio, que é exatamente o que a norma recusa. 🟡
   - Origem no legado: `docs/redacao.md` §2.2, `.harness/decisoes/MD-0015.md`
   - Tipo: nova
9. **RN-09:** O texto copiado se organiza nas quatro seções do SOAP, e o mapa campo-para-seção é **estruturação autoral**, não conteúdo da fonte: a caderneta não fala em SOAP. O mapa se declara por escrito e a nota de proveniência informa ao leitor que a organização é do produto e a matéria é da caderneta. Arranjo proposto na lacuna 3 da seção 10. 🟡
   - Tipo: nova
10. **RN-10:** Campo não preenchido **não aparece** no texto copiado. O registro de prontuário afirma o que foi averiguado; linha vazia herdada de formulário afirmaria averiguação que não houve. Seção do SOAP que ficar sem nenhum campo preenchido é omitida inteira. 🟡
    - Tipo: nova
11. **RN-11:** As medidas antropométricas da ficha (peso, comprimento ou estatura, perímetro cefálico) são as mesmas entradas da calculadora de crescimento da feature 017. O produto **não recalcula escore z por conta própria**: quem avalia é a fachada existente, e o resultado volta para o registro com a `ReferenciaClinica` que ela já emite. 🟢
    - Origem no legado: addendum 017, invariante 3 de `_reversa_sdd/domain.md#7`
    - Tipo: nova
12. **RN-12:** Nenhum campo identifica a criança: sem nome, prontuário, documento ou endereço. A ficha registra achado clínico, e o vínculo com a pessoa é feito pelo prontuário onde o texto será colado. Segue a decisão já realizada na feature 017. 🟢
    - Origem no legado: `_reversa_sdd/adrs/0002-privacidade-por-arquitetura-client-side.md`
    - Tipo: nova
13. **RN-13:** Nada do que se preencher é persistido, nem em `localStorage`, nem em `sessionStorage`, nem em rede. A consequência, que é real, se declara ao usuário: recarregar a página descarta o preenchimento. Persistir dado clínico reabre LGPD, autenticação e specs, e é gatilho registrado de decisão nova. 🟢
    - Origem no legado: ADR 0002, `_reversa_sdd/domain.md#8`
    - Tipo: nova
14. **RN-14:** Não há ritual de revisão nesta tela. Preencher ficha de consulta não prescreve dose, e ADR 0012 restringe o ritual à insulina. O comando de cópia fica sempre disponível, como na feature 019, e não atrás de confirmação. 🟢
    - Origem no legado: `_reversa_sdd/adrs/0012-ritual-de-revisao-so-na-prescricao-de-dose.md`, invariante 10
    - Tipo: nova
15. **RN-15:** A classificação do desenvolvimento em três níveis ("Adequado para idade", "Alerta para o desenvolvimento", "Provável atraso no desenvolvimento") **está impressa em todas as dez fichas** e entra nesta feature como campo de escolha. O que fica para depois é o **instrumento** que produz essa classificação, isto é, os marcos das pp. 78 a 84. A ficha pede o desfecho; a apuração do desfecho é outra feature. 🟢
    - Tipo: nova
16. **RN-16:** As fichas remetem a quadros que vivem fora das páginas verdes: vacinação (pp. 101 a 103), suplementação (p. 100) e acompanhamento odontológico (pp. 98 e 99). Nas fichas, esses itens são apenas marcação de sim ou não, e é só isso que entra. Reproduzir os quadros remetidos está fora do escopo. 🟢
    - Tipo: nova
17. **RN-17:** As fichas da 1.ª Semana ao 6.º Mês remetem a "gráficos para Prematuros pág. 86 e para criança a termo pág. 87 à 90", ao passo que as do 9.º Mês em diante remetem a 88, 89 e 90, que é o que o sumário confirma. A fonte se contradiz em uma página. Como a nossa tela substitui o "anotar nos gráficos" pelo acesso à calculadora, a remissão de página **não é transcrita**, e a divergência fica registrada aqui em vez de propagada à tela. 🟢
    - Tipo: nova
18. **RN-18:** A ficha de p. 75 imprime que a aferição da pressão arterial é obrigatória a partir dos 3 anos de idade. Se a p. 75 entrar no escopo (lacuna 1 da seção 10), essa regra entra com ela, como texto da fonte, sem que o produto avalie o valor aferido: classificar pressão arterial pediátrica exige tabela por percentil de estatura que a caderneta não imprime. 🟢
    - Origem no legado: `_reversa_sdd/domain.md#8`, escopo igual ao da fonte
    - Tipo: nova

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Rota nova em `/puericultura/consulta`, sétima do catálogo, na seção de Puericultura já existente, sem alterar as fichas atuais do `CATALOGO` | Must | A home lista duas calculadoras em Puericultura; teste de integração da home afirma que as entradas anteriores continuam idênticas | 🟢 |
| RF-02 | Informar sexo, data de nascimento, data da consulta e, quando houver, idade gestacional ao nascer | Must | Com data de nascimento e data da consulta, a tela exibe a idade em dias e meses; com idade gestacional abaixo de 37 semanas, exibe também a corrigida, cada uma rotulada | 🟢 |
| RF-03 | Sugerir a ficha aplicável à idade e permitir que o usuário a troque por qualquer outra das dez | Must | Idade de 4 meses e 10 dias sugere a ficha do 4.º Mês; trocar para a do 6.º Mês substitui os campos exibidos sem recarregar a página | 🟡 |
| RF-04 | Apresentar os campos da ficha escolhida na redação e na ordem da fonte, com a natureza que a fonte lhes dá: marcação de sim ou não, escolha entre opções, número com unidade e texto livre | Must | Para cada uma das dez fichas, o conjunto de campos exibidos corresponde ao da página, conferido campo a campo contra o PDF | 🟢 |
| RF-05 | Acomodar as diferenças de flexão entre as duas tiragens conforme o sexo informado | Should | Selecionado o sexo feminino, a tela exibe "interação mãe-filha"; masculino exibe "mãe-filho" | 🟢 |
| RF-06 | Comando único que copia para a área de transferência tudo o que foi preenchido, organizado em SOAP | Must | Acionado o comando, o conteúdo da área de transferência contém as quatro seções na ordem S, O, A, P, omitidas as que ficarem vazias, e nenhum campo não preenchido | 🟡 |
| RF-07 | Confirmar visivelmente o resultado da cópia, com recado nomeado quando a área de transferência recusar | Must | Sucesso é anunciado a leitor de tela de modo não intrusivo; recusa é anunciada de modo assertivo, no molde da feature 019 | 🟢 |
| RF-08 | Exibir o texto SOAP na tela antes de copiar, para conferência | Should | O texto visível e o texto copiado são idênticos byte a byte, verificado por teste | 🟡 |
| RF-09 | Abrir a calculadora de crescimento em painel sobre a mesma tela, já com sexo, datas e medidas preenchidos a partir da ficha | Must | Preenchidos peso, comprimento e perímetro cefálico na ficha, o painel abre sem exigir nenhuma redigitação | 🟡 |
| RF-10 | Trazer os escores z e a classificação nutricional da calculadora de volta para o registro, com a referência clínica que a fachada emite | Must | Fechado o painel, a seção objetiva do SOAP passa a conter os escores z e a classificação, com a localização bibliográfica | 🟡 |
| RF-11 | O painel da calculadora carrega sob demanda, sem custo para quem não o abre | Should | A medição de bundle mostra que a rota nova não paga as tabelas antropométricas no primeiro carregamento, no molde de `medicao-bundle.md` da 019 | 🟢 |
| RF-12 | Declarar a proveniência fora do painel de resultado e visível desde o primeiro carregamento: a fonte, as páginas, o que a organização em SOAP tem de autoral e o que a caderneta imprime | Must | A tela exibe o bloco de proveniência antes de qualquer preenchimento, no molde de `interface/puericultura/proveniencia.tsx` | 🟢 |
| RF-13 | Avisar que nada é salvo e que recarregar descarta o preenchimento | Must | O aviso é visível sem rolagem na primeira dobra em viewport de telefone | 🟢 |
| RF-14 | Declarar a classe de todo literal novo em `scripts/textos/classes/`, com os rótulos da caderneta como citação | Must | `node scripts/inventariar-textos.mts --gerar` conclui sem candidato órfão, e a segunda execução deixa `git diff` vazio | 🟢 |
| RF-15 | Preservar `tests/apoio/citacao-linha-de-base.json` sem modificação | Must | `git status` mostra o arquivo intocado ao fim da entrega | 🟢 |
| RF-16 | Nenhuma requisição de rede e nenhuma chave nova de armazenamento ao preencher, avaliar ou copiar | Must | Roteiro de ponta a ponta afere zero requisição externa e ausência de chave nova em `localStorage` e `sessionStorage` | 🟢 |
| RF-17 | A tela responde a teclado e passa no `axe` sem violação nova, com a ficha longa navegável por marcos e regiões | Must | `e2e/axe-baseline.json` permanece intocado; a ficha expõe cabeçalhos de seção na hierarquia correta | 🟢 |
| RF-18 | Nenhum dos cinco domínios existentes muda de comportamento | Must | A suíte anterior permanece verde sem alteração de asserção; o único arquivo de motor tocado, se houver, é o da feature 017, e só para receber valores iniciais | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Privacidade | Zero persistência e zero transmissão de dado clínico; nenhum campo identifica a criança | ADR 0002; invariante 7 de `_reversa_sdd/domain.md#7`; precedente da feature 017 | 🟢 |
| Privacidade | O aviso de não persistência é requisito de produto, não cortesia: o usuário precisa saber que perde o preenchimento ao recarregar antes de investir dez minutos preenchendo | Consequência direta de ADR 0002 numa tela muito mais longa que as cinco anteriores | 🟢 |
| Desempenho | As sete rotas existentes não pagam nada pela feature; a rota nova carrega a calculadora de crescimento só ao abrir o painel | Achado da feature 019, em que o `import` estático custava 14 923 B gzip à home por uma tela que a maioria nunca abre | 🟢 |
| Manutenibilidade | O conteúdo das dez fichas é **dado declarado**, não marcação escrita à mão dez vezes. Ficha nova ou edição nova da caderneta se absorve editando dado | Princípio 5.1; a alternativa multiplicaria por dez o custo de qualquer correção de transcrição | 🟡 |
| Manutenibilidade | Nenhum arquivo acima de 400 linhas e nenhuma função acima de 50, sob o volume textual desta feature | Sinais de dívida do Princípio 5.6; a dívida 3 da re-extração 2 nasceu exatamente assim | 🟢 |
| Rastreabilidade | Toda saída do domínio novo carrega `ReferenciaClinica` com a página da caderneta de onde o campo veio | Invariante 3 de `_reversa_sdd/domain.md#7` | 🟢 |
| Verificabilidade | A transcrição das dez fichas se confere contra o PDF por oráculo escrito, e não por leitura de quem transcreveu | `MD-0010`: o oráculo é a fonte primária, não uma segunda implementação dela | 🟡 |
| Acessibilidade | A ficha longa é percorrível por teclado e por leitor de tela, com regiões nomeadas e sem armadilha de foco no painel | `e2e/axe-baseline.json` em 0/0 desde a feature 017 | 🟢 |
| Observabilidade | Exceção fora do contrato vira painel honesto, com `EventoDeErro` transportando só o nome da classe | ADR 0004 e ADR 0007 | 🟢 |
| Resiliência | Retentativa, tempo limite e concorrência não se aplicam: a única operação assíncrona da feature é o acesso à área de transferência, que devolve recusa como valor e não se repete por conta própria. Todo o resto é cálculo síncrono no cliente | `interface/calculadora/area-de-transferencia.ts` (feature 006); ausência de rede por ADR 0002 | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: a ficha aplicável é sugerida pela idade
  Dado que informo sexo masculino, nascimento em 2026-03-10 e consulta em 2026-07-20
  Quando a tela calcula a idade
  Então ela exibe a idade em meses e dias
  E sugere a ficha da Consulta do 4º Mês
  E me permite trocar para qualquer uma das dez fichas

Cenário: as duas idades aparecem no pré-termo
  Dado que informo idade gestacional ao nascer de 32 semanas e 3 dias
  Quando a tela calcula as idades
  Então ela exibe a idade cronológica e a corrigida, cada uma rotulada
  E declara qual delas governou a ficha sugerida

Cenário: o texto copiado registra só o que foi preenchido
  Dado que na ficha do 4º Mês marco "Diarreia/Constipação: Sim" e deixo o exame ocular em branco
  Quando aciono o comando de cópia
  Então o texto copiado contém a diarreia na seção subjetiva
  E não contém nenhuma menção ao exame ocular
  E omite por inteiro qualquer seção do SOAP que tenha ficado vazia

Cenário: a calculadora de crescimento não pede redigitação
  Dado que preenchi peso, comprimento e perímetro cefálico na ficha
  Quando abro o painel da calculadora de crescimento
  Então os campos chegam preenchidos com o que digitei na ficha
  E ao fechar o painel os escores z e a classificação constam da seção objetiva do SOAP
  E constam com a localização bibliográfica que a fachada emite

Cenário: a área de transferência recusa
  Dado que o navegador nega acesso à área de transferência
  Quando aciono o comando de cópia
  Então vejo um recado nomeado que diz que a cópia não foi possível
  E o texto permanece visível na tela para cópia manual

Cenário: nada sobrevive ao recarregamento, e isso foi avisado
  Dado que preenchi metade da ficha
  Quando recarrego a página
  Então o formulário volta vazio
  E o aviso de que nada é salvo estava visível desde antes de eu começar
  E nenhuma chave nova existe em localStorage ou sessionStorage

Cenário: a flexão acompanha o sexo informado
  Dado que informo sexo feminino
  Quando abro a ficha do 1º Mês
  Então o campo de observação da interação aparece na flexão feminina
  E nenhum campo clínico difere do que a outra tiragem imprime

Cenário: o que se confere é o que se copia
  Dado que preenchi campos em três seções da ficha
  Quando leio o texto exibido para conferência
  Então ele é idêntico, byte a byte, ao que o comando de cópia entrega
  E o bloco de proveniência já estava visível antes do primeiro preenchimento
  E declara a fonte, as páginas e o que a organização em SOAP tem de autoral

Cenário: a entrega não afrouxa nenhuma obrigação da plataforma
  Dado que a feature está pronta para commit
  Quando rodo o gerador do inventário textual e a suíte inteira
  Então nenhum literal novo fica sem classe declarada
  E a linha de base das citações e a linha de base de acessibilidade continuam intocadas
  E as cinco calculadoras anteriores passam sem alteração de asserção
  E a rota nova não cobra ao primeiro carregamento o custo do painel de crescimento
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01, RF-02, RF-04, RF-06 | Must | São a feature: a ficha da fonte, preenchível, virando texto |
| RF-03 | Must | Sem seleção por idade, o usuário procura a ficha em uma lista de dez, que é o trabalho que a feature promete poupar |
| RF-07, RF-12, RF-13, RF-14, RF-15, RF-16, RF-17, RF-18 | Must | Obrigações que a plataforma já assumiu e que nenhuma feature nova pode revogar |
| RF-09, RF-10 | Must | O pedido é explícito, e sem eles a tela obriga a redigitar as medidas em outra rota, que é o inverso de "tudo em uma única tela" |
| RF-05, RF-08, RF-11 | Should | Melhoram fidelidade, conferência e custo, sem os quais a feature ainda entrega o essencial |
| RNF de desempenho | Should | O custo só se conhece medindo, e a medição é da fase de polimento |
| Marcos do desenvolvimento, pp. 78 a 84 | Won't | Declarado pelo usuário como etapa futura; RN-15 separa o desfecho, que entra, do instrumento, que não |
| Persistência do preenchimento | Won't | ADR 0002; salvar rascunho de dado clínico é decisão de arquitetura, não conveniência de tela |
| Quadros de vacina, suplementação e odontologia | Won't | RN-16: vivem fora das páginas verdes; nas fichas são apenas marcação |
| Envio a prontuário eletrônico por integração | Won't | Nenhuma integração de runtime toca dado clínico (`_reversa_sdd/architecture.md#4`); a ponte é a área de transferência |

## 9. Esclarecimentos

> Nenhuma sessão de dúvidas registrada ainda. Rode `/reversa-clarify` quando houver `[DÚVIDA]` pendente.

## 10. Lacunas

- 🔴 [DÚVIDA] 1 — **Quais fichas entram na primeira entrega.** As dez consultas datadas são o núcleo e entram. Faltam decidir as três restantes das páginas verdes: Pré-Natal e Nascimento (p. 67), que é registro retrospectivo com sorologias, Apgar e dados de parto; Triagens Neonatais (p. 68), que se sobrepõe em parte ao quadro de triagem impresso na ficha do 1.º Mês; e Outras Medidas e Consultas Necessárias (p. 75), que é tabela livre mais a regra de pressão arterial de RN-18. Cada uma acrescenta superfície de transcrição sem acrescentar o mesmo tanto de uso na consulta de rotina. Recomendação: entregar as dez e deixar as três para uma segunda passagem, com a ausência declarada na proveniência. Afeta RN-03 e RN-18.
- 🔴 [DÚVIDA] 2 — **Qual idade governa a ficha na criança nascida pré-termo.** A fonte é silente: as pp. 66 a 75 nomeiam as consultas por mês de vida e não dizem se, no prematuro, o mês é o cronológico ou o corrigido, ao passo que a p. 87 é explícita quanto às curvas. `MD-0011` fixou que a cronológica mede o corpo e a corrigida lê a curva, mas a escolha da ficha não é nenhuma das duas coisas: é calendário de acompanhamento. Recomendação: sugerir pela cronológica, porque é ela que rege o calendário vacinal e as consultas de rotina, exibir as duas e declarar no SOAP qual governou, deixando a troca ao prescritor por RN-04. Afeta RN-04, RN-05, RF-03 e o segundo cenário de aceite.
- 🔴 [DÚVIDA] 3 — **O mapa de campo para seção do SOAP.** A caderneta não fala em SOAP, de modo que o mapa é autoral e precisa ser validado por quem usa. Arranjo proposto: **S** recebe aleitamento e alimentação, sinais de alerta relatados, sono, funcionamento intestinal e o que os cuidadores relatam; **O** recebe medidas, escores z, exame ocular, resultado de triagens e demais achados de exame; **A** recebe a classificação nutricional vinda da calculadora e a classificação do desenvolvimento em três níveis; **P** recebe vacinas, suplementação, encaminhamentos, acompanhamento odontológico e as orientações da seção "Atenção e cuidados especiais nesta fase". Três campos resistem ao arranjo e precisam de decisão explícita: "Laços de afeto", que é observação do profissional e cabe em O ou em A; "Sinais de violências/negligências", que pode ser achado ou plano conforme haja conduta; e "Acidentes domésticos", que é orientação preventiva com cara de plano mas nasce como pergunta. Afeta RN-09, RN-10, RF-06 e RF-08.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-28 | Versão inicial gerada por `/reversa-requirements`, com leitura direta das pp. 66 a 75 das duas tiragens da caderneta | reversa |
