# User Story — Registro de consulta de puericultura em SOAP

> Reversa Writer, re-extração nº 4 (2026-07-28). Feature `020-consulta-puericultura-soap`.
> Units: `models/puericultura/consulta`, `interface/puericultura/consulta`, `pages/`.
> **A primeira história da plataforma cujo produto não é um número.**

## História

**Como** médico de família em consulta de puericultura,
**quero** preencher a ficha da consulta correspondente à idade da criança e receber o registro
já organizado em SOAP,
**para** colar no prontuário eletrônico sem redigitar o que acabei de averiguar.

## Contexto de uso

As páginas verdes da caderneta trazem dez consultas datadas, cada uma com os itens a averiguar
naquela idade. Na prática, o médico percorre a lista impressa e depois redige o registro no
prontuário — duas passagens sobre a mesma matéria, e a segunda feita de memória.

A tela junta as duas: a lista é a ficha preenchível, e o registro se forma enquanto se preenche.
Não há botão de gerar, porque não há o que gerar: o texto é derivação do que está marcado.

## Fluxo principal

1. O prescritor informa sexo, data de nascimento e data da consulta.
2. A tela sugere a ficha correspondente à idade cronológica, e permite trocá-la.
3. O prescritor percorre os campos da ficha, marcando e escrevendo o que couber.
4. O registro em SOAP aparece ao lado, atualizado a cada resposta.
5. Se quiser, abre o painel de crescimento, informa as medidas e incorpora os escores.
6. Copia o texto e cola no prontuário.

## Fluxos alternativos

- **Identificação incompleta.** Sem sexo, nascimento ou data, a ficha não é oferecida, e a tela
  segue utilizável.
- **Seção sem nenhum item respondido.** Ela some inteira, cabeçalho incluído — cabeçalho solto
  afirmaria averiguação que não houve.
- **Ficha entre duas consultas previstas.** Cai na anterior, e a troca é de um clique.
- **Sexo feminino na ficha do 2.º mês.** O campo de criptorquidia não é oferecido, e o registro
  declara a supressão, porque a caderneta imprime o campo nas duas tiragens.
- **Sem avaliação de crescimento.** O registro sai só com o que a ficha coletou.

## Critérios de aceitação

```gherkin
Dado três campos respondidos numa ficha
Quando o registro é lido
Então ele traz esses três itens nas seções corretas, e nada mais

Dado o registro em tela
Quando o prescritor aciona a cópia
Então o texto entregue é idêntico ao exibido

Dado que nenhum campo do Plano foi respondido
Então a seção Plano não aparece no registro

Dado escores de crescimento incorporados
Então eles ocupam a seção Objetivo, e a classificação nutricional ocupa a Avaliação
```

## Valor entregue

O registro sai com a matéria que a fonte prescreve, na ordem em que o prontuário espera, e com
a proveniência dita. O que se colou pode ser conferido contra a página da caderneta, porque o
próprio texto diz de qual página veio.

## O que a história **não** cobre

- **Persistência.** Nada é salvo, e o preenchimento some ao recarregar a página. A tela avisa
  isso antes do primeiro campo.
- **As páginas verdes inteiras.** Três registros ficaram de fora — pré-natal e nascimento,
  triagens neonatais, e outras medidas —, e o registro declara a lacuna.
- **Conduta.** A organização em SOAP é do produto; o juízo clínico continua sendo de quem
  atende, e a nota de organização diz exatamente isso.
