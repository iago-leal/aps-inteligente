# Contrato: o texto do registro entregue à área de transferência

> Feature: `020-consulta-puericultura-soap`
> Tipo: saída de texto para consumo externo (prontuário eletrônico, por colagem)
> Data: `2026-07-28`

## 1. Por que isto é um contrato

A plataforma não integra com prontuário eletrônico, e `architecture.md#4` registra por quê: nenhuma
integração de runtime toca dado clínico. A ponte é a área de transferência, e o texto que atravessa
essa ponte é a **saída principal** desta feature — o produto dela é um texto de registro, não um
número. Um formato que mude sem aviso quebra o hábito de quem cola o texto todo dia num campo de
prontuário. Daí o contrato.

## 2. Forma

```
<Título da ficha> — <idade declarada>

S
- <rótulo>: <valor>
- <rótulo>: <valor>

O
- <rótulo>: <valor>
- Peso/idade: escore z <n>, <classificação>
- <rótulo>: <valor>

A
- <rótulo>: <valor>

P
- <rótulo>: <valor>

<notas de proveniência>
Fonte: Caderneta da Criança, <edição>: <páginas>.
```

Regras da forma, cada uma verificável:

1. **Ordem fixa** — S, O, A, P, nesta ordem, sempre.
2. **Seção vazia é omitida inteira**, cabeçalho incluído (RN-10). O registro afirma o que foi
   averiguado; um cabeçalho solto afirmaria averiguação que não houve.
3. **Campo não preenchido não aparece** (RN-10). Não há linha em branco, não há "não informado".
4. **O rótulo é o da fonte**, byte a byte, na flexão do sexo informado.
5. **A idade declarada nomeia a espécie** que governou a escolha da ficha — no nascido pré-termo,
   "idade cronológica", por RN-05.
6. **Os itens vindos da calculadora de crescimento** entram na seção O, com a classificação
   nutricional em A, e carregam a localização bibliográfica que a fachada da 017 emite (RF-10).
7. **As notas de proveniência fecham o texto**: a organização em SOAP é do produto, a matéria é da
   caderneta, e o que ficou de fora está nomeado.
8. **Nenhum identificador da criança** em nenhuma linha (RN-12).

## 3. O que o contrato não promete

- **Não é formato de intercâmbio.** Não há JSON, HL7, FHIR nem CSV. É texto para leitura humana,
  colado por humano.
- **Não é estável entre edições da caderneta.** Se a fonte mudar os rótulos, o texto muda com ela:
  a fidelidade à fonte tem precedência sobre a estabilidade do formato.
- **Não carrega dado que a ficha não tenha.** O que o produto acrescenta — a organização em seções
  e a posição da medição — vai declarado como acréscimo.

## 4. Erros e recusas

| Situação | Comportamento |
|---|---|
| Área de transferência indisponível ou negada | `copiarParaAreaDeTransferencia` devolve `{ok: false}` (erro como valor, ADR 0004); a tela exibe recado nomeado e assertivo, e **o texto permanece visível** para cópia manual (RF-07 com RF-08 promovido a *Must*) |
| Nenhum campo preenchido | Não há texto a copiar; o comando informa que não há registro a produzir, em vez de entregar cabeçalhos vazios |
| Exceção fora do contrato | Painel honesto, com `EventoDeErro` transportando só o nome da classe (ADR 0004 e 0007) |

## 5. Idempotência, tempo limite e concorrência

- **Idempotência:** copiar duas vezes produz a mesma cadeia, dado o mesmo preenchimento. O texto é
  função pura do estado da tela (D-03).
- **Tempo limite e retentativa:** não se aplicam. A única operação assíncrona é a escrita na área de
  transferência, que devolve recusa como valor e não se repete por conta própria.
- **Concorrência:** não se aplica. Todo o resto é cálculo síncrono no cliente.

## 6. Verificação

- Teste de unidade sobre o formatador: ordem das seções, omissão do vazio, ausência do não
  preenchido, presença das notas.
- Teste de integração afirmando que **a cadeia exibida e a entregue à área de transferência são a
  mesma** (D-03 torna isso estrutural; o teste guarda a estrutura).
- Teste e2e cobrindo o caminho de recusa, com o texto permanecendo em tela.
