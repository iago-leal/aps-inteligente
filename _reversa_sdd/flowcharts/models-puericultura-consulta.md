# Fluxograma — `models/puericultura/consulta` (feature 020)

> Gerado pelo Reversa Archaeologist na re-extração nº 4 (2026-07-28).
> **Segunda fachada** de `models/puericultura`: `RegistroDeConsultaPuericultura`, com `catalogo()`, `sugerir()` e `montar()`.

## Duas fachadas sob uma unit

```mermaid
flowchart TD
    subgraph unit["models/puericultura — uma FONTE, duas fachadas"]
        F1["CalculadoraCrescimentoInfantil.avaliar<br/>(feature 017)<br/>caderneta, pp. 85–97"]
        F2["RegistroDeConsultaPuericultura.montar<br/>(feature 020)<br/>caderneta, pp. 66–75"]
        C["núcleo compartilhado<br/>idades.ts · datas.ts · tipos.ts"]
        F1 --> C
        F2 --> C
    end
    F1 -.->|ResultadoAvaliacao<br/>PRONTO, nunca recalculado| F2
```

> A ADR 0011 diz **uma fonte por unit**, e não uma fachada por unit: é a mesma caderneta, em outra seção. A alternativa examinada — uma sexta unit — exigiria importar de outra unit, sem precedente na família, ou uma terceira cópia da aritmética de datas.

## Sugestão da ficha

```mermaid
flowchart TD
    A[sugerirFicha idades] --> B[diasDeVida<br/>idade CRONOLÓGICA]
    B --> C{alguma ficha cobre<br/>essa faixa em dias?}
    C -->|não| C1[["ErroDeInvariante<br/>as faixas cobrem de zero ao infinito<br/>por construção: chegar aqui é bug"]]
    C -->|sim| D[["SugestaoDeFicha<br/>ficha · especieDeIdade: cronologica · diasDeVida"]]

    style C1 fill:#ffe6e6
    style D fill:#e6ffe6
```

> **Por que a cronológica, e não a corrigida:** é ela que rege o calendário de acompanhamento e o vacinal, ao passo que a corrigida rege a leitura da curva. Não contradiz `MD-0011` — aquela ficha repartiu papéis entre *medir o corpo* e *ler a curva*, e escolher a ficha não é nenhum dos dois.
> 🟡 Idade entre duas consultas previstas cai na ficha imediatamente **anterior**: a fonte não diz o que fazer com a criança de sete meses, e o custo de errar é um clique, porque a troca é livre.

## Montagem do registro

```mermaid
flowchart TD
    A[montarRegistro entrada] --> B[itensDaFicha]
    A --> C[itensDaCalculadora]

    B --> B1[para cada seção, na ordem impressa]
    B1 --> B2[camposAplicaveis<br/>filtra por Campo.sexos]
    B2 --> B3{há resposta<br/>para o campo?}
    B3 -->|não| B4[descarta — RN-10]
    B3 -->|sim| B5{valor legível?<br/>medida/texto em branco = null}
    B5 -->|não| B4
    B5 -->|sim| B6[item com rótulo na flexão do sexo]

    C --> C1{avaliação presente?}
    C1 -->|não| C2[nenhum item]
    C1 -->|sim| C3[índices calculados → seção O<br/>escore z e classificação]
    C3 --> C4[estado nutricional → seção A<br/>IMC/I, ou peso/I na falta dele]

    B6 --> D[agrupar em S · O · A · P]
    C4 --> D
    D --> E{seção ficou sem item?}
    E -->|sim| E1[some INTEIRA, cabeçalho incluído]
    E -->|não| F[seção entra]

    F --> G[["RegistroDaConsulta<br/>ficha · idadeDeclarada · secoes<br/>notas · referencias"]]
    E1 --> G

    style B4 fill:#f4f4f4
    style E1 fill:#fff4e6
    style G fill:#e6ffe6
```

> **A regra que governa tudo:** o registro de prontuário afirma o que foi averiguado. Cabeçalho solto afirmaria averiguação que não houve, que é pior que a omissão — é a diferença entre *não ter olhado* e *ter registrado que olhou*.
> **Onde cada coisa entra:** os escores ocupam a objetiva, que é onde a medida mora; a classificação nutricional ocupa a avaliação, porque é juízo da própria fonte, e não conclusão que este produto tenha formado.

## Uma cadeia, dois consumidores

```mermaid
flowchart LR
    A[RegistroDaConsulta<br/>ESTRUTURA] --> B["formatarRegistro()<br/>projeção pura, na interface"]
    B --> C[texto único]
    C --> D["&lt;pre&gt; que a tela exibe"]
    C --> E[comando de cópia]
```

> A identidade entre o que se vê e o que se copia passa a ser propriedade da **construção**, e não coincidência a verificar.
