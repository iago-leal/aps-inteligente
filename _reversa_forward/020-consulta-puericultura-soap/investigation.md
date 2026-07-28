# Investigação: ficha de consulta de puericultura

> Feature: `020-consulta-puericultura-soap`
> Data: `2026-07-28`

## 1. O que foi examinado, e no quê

Esta investigação não consultou memória nem literatura secundária: examinou o **real**, no
sentido do Princípio III. Quatro objetos:

1. **As páginas 66 a 75 das duas tiragens da caderneta**, reextraídas nesta sessão com
   `pdftotext -layout -f 67 -l 77` sobre `referencias/caderneta/caderneta_crianca_{menino,menina}_2ed.pdf`.
   A página do PDF é a impressa mais um.
2. **O motor e a tela da feature 017** (`models/puericultura/**`, `interface/puericultura/**`),
   que a 020 estende e consome.
3. **A cadeia textual da feature 018** (`scripts/inventariar-textos.mts`,
   `scripts/textos/classificacao.mts`, `scripts/textos/classes/**`), que é o portão por onde a
   feature inteira precisa passar.
4. **O precedente de painel e cópia da 019** (`interface/contribuicao/**`) e o de projeção em
   texto da 006 (`interface/calculadora/formatar-plano.ts`, `area-de-transferencia.ts`).

## 2. Achados que mudaram o plano

### 2.1 A ficha não tem dois dados que o motor da 017 exige

A ficha imprime `1. Medidas: PC*: ____ cm Peso*: ______ g Comprimento*: _____ cm`. Duas
consequências que só aparecem quando se lê a página e o contrato do motor lado a lado:

- **O peso está em gramas**, e `EntradaAvaliacao.pesoKg` está em quilos. A conversão é do produto.
- **A caderneta não pergunta a posição da medição**, e `models/puericultura` a exige quando há
  comprimento (`POSICAO_DA_MEDICAO_AUSENTE` entre os `CodigoOfensor`). A 017 recusou o default
  silencioso com uma razão registrada — supor "deitado" erra 0,7 cm na medida que alimenta o
  escore. A 020 não pode desfazer essa decisão por conveniência de tela.

Daí D-09: os dois entram declarados, e o campo de posição é **autoral**, porque nasce do produto e
não da página. Classificá-lo como citação seria mentir sobre a origem, que é o defeito exato que
`MD-0014` combate.

### 2.2 A remissão de página se contradiz mais de uma vez

`RN-17` do requirements registrou a divergência entre "pág. 87 à 90" e "88, 89 e 90". A releitura
desta sessão encontrou uma segunda: a ficha do 12.º Mês manda "classifique pelo instrumento da
**pág. 76**", onde as demais dizem 78. Como a tela substitui o "anotar nos gráficos" pelo acesso à
calculadora, nenhuma das duas remissões é transcrita, e ambas ficam registradas aqui em vez de
propagadas ao produto.

### 2.3 O inventário textual é o gargalo, e por um motivo estrutural

`PROPRIEDADES_DE_TEXTO` inclui `rotulo`. Logo, **todo** `rotulo: "..."` das fichas entra como
candidato por posição, mesmo com uma palavra — que é precisamente o que `MD-0019` quis ao unir os
dois critérios da régua. O mapa de `classificacao.mts` é chaveado por `arquivo + texto` e para
ruidosamente diante de literal não declarado. Com dez fichas, isso são centenas de declarações.

Três caminhos foram examinados no código, não em tese:

- `UNIFORMES`, em `pages-e-arquivos.mts`, declara classe por arquivo — e a própria docstring fecha
  a porta: *"Arquivo de código não se qualifica, e é bom que não se qualifique — foi exatamente ali
  que a inferência por diretório erraria."*
- `EXCLUSOES`, em `inventariar-textos.mts`, tira `models/puericultura/oms/tabelas` da travessia,
  com a razão declarada de ser **dado numérico gerado**. A razão não se transporta: as fichas são
  citação clínica escrita à mão, o oposto do caso.
- O gerador só percorre `.ts` e `.tsx`. Pôr as fichas em JSON as tiraria do inventário sem decisão
  nenhuma — contornar o guarda em vez de declarar, o que a 018 nomeia como o pior modo de falha.

Sobra a saída de D-04: derivar as declarações da **origem que o dado já carrega**. Cada campo
precisa declarar sua página de qualquer forma, porque o invariante 3 da família exige
`ReferenciaClinica` em toda saída. A declaração de classe passa a ser consequência escrita de um
dado que existe por outra razão, e a decisão continua sendo uma só, tomada por quem transcreveu.

### 2.4 O gerador ignora crase com interpolação, e isso decide a flexão

`coletarDeArquivoTs` registra `StringLiteral`, `NoSubstitutionTemplateLiteral` e `JsxText` — a
crase **com** interpolação fica de fora de propósito, porque o texto montado em runtime não existe
como literal único. Uma flexão feita por template (`` `interação mãe-${sufixo}` ``) produziria texto
exibido invisível ao inventário. Daí D-06: par de rótulos declarados, nunca interpolação.

### 2.5 O painel da 019 resolve mais do que parece

`PainelContribuicao` usa o `Dialog` do Primer e `bloco-de-apoio.tsx` o carrega por `next/dynamic`.
Foco preso, retorno ao gatilho, `Esc` e clique fora vêm resolvidos, e a baseline `axe` de 0/0
depende disso. `AcaoCopiar` já parametriza rótulo, texto e confirmação, com a função de cópia
injetável por prop com valor padrão — é o molde que a suíte usa para dublar o clipboard sem tocar
`navigator`. A 020 reaproveita os dois sem alteração de assinatura.

Uma observação registrada da 019 continua valendo e não se resolve aqui: `O-19-03`, o comando de
fechar do `Dialog` tem nome acessível em inglês, porque o componente do Primer não é localizado. A
020 herda o mesmo painel e o mesmo defeito.

## 3. Alternativas de arquitetura consideradas e por que caíram

| Alternativa | Por que foi descartada |
|---|---|
| Sexta unit de domínio `models/consulta-puericultura` | Ou importa de `models/puericultura`, criando acoplamento entre units que a família nunca teve, ou duplica pela terceira vez a aritmética de datas (`models/gestacao` → `models/puericultura`, dívida D-07 da 017) |
| Motor devolvendo o texto SOAP pronto | Amarra formato de apresentação ao domínio, e torna impossível exibir de um jeito e copiar de outro sem duas implementações — que é o que RF-08 teme |
| Ficha renderizada por marcação escrita à mão, dez vezes | Multiplica por dez o custo de qualquer correção de transcrição, num acervo em que a correção de transcrição é o evento mais provável |
| Rascunho salvo em `sessionStorage` para sobreviver ao recarregamento | ADR 0002 e gatilho registrado: persistir dado clínico reabre LGPD, autenticação e specs. É decisão de arquitetura, não conveniência de tela |
| Integração com prontuário eletrônico | `architecture.md#4`: nenhuma integração de runtime toca dado clínico. A ponte é, e continua sendo, a área de transferência |

## 4. Fontes

- `referencias/caderneta/caderneta_crianca_menino_2ed.pdf` e `…_menina_2ed.pdf`, pp. 66 a 75 (fora do git por `MD-0008`).
- `_reversa_sdd/architecture.md`, `domain.md`, `adrs/0002`, `0003`, `0004`, `0005`, `0011`, `0012`, `0013`.
- `_reversa_sdd/addenda/017-puericultura-crescimento.md` (vigente) e `018-revisao-linguagem-textos.md` (vigente).
- `.harness/decisoes/MD-0001`, `MD-0008`, `MD-0010`, `MD-0011`, `MD-0014`, `MD-0015`, `MD-0016`, `MD-0019`, `MD-0025`, `MD-0026`.
- `.reversa/principles.md`, princípios III, VI, VII, VIII e IX; `docs/redacao.md`.
- Código: `models/puericultura/**`, `interface/puericultura/**`, `interface/contribuicao/**`, `interface/calculadora/{formatar-plano,area-de-transferencia}.ts`, `interface/inicio/catalogo.ts`, `scripts/inventariar-textos.mts`, `scripts/textos/**`.

Nenhuma fonte externa à máquina foi consultada: a matéria clínica desta feature é a caderneta, que
está no disco, e as decisões de engenharia se apoiam no código deste repositório.
