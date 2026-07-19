# Flowchart — módulo `interface/calculadora`

> Gerado pelo Reversa Archaeologist em 2026-07-19.

## Máquina de estados do resultado (CalculadoraApp)

```mermaid
stateDiagram-v2
    [*] --> vazio
    vazio --> sucesso: calcular → resultado
    vazio --> erro: calcular → erro-validacao | fora-do-escopo
    vazio --> falha_inesperada: exceção do motor (EC-07)
    sucesso --> sucesso: recalcular
    sucesso --> erro: recalcular com entrada inválida
    erro --> sucesso: recalcular corrigido
    sucesso --> vazio: Novo cálculo (remonta formulário)
    erro --> vazio: Novo cálculo
    falha_inesperada --> vazio: Novo cálculo

    note right of sucesso
        Flags ortogonais:
        desatualizado — qualquer edição invalida (RN-06/EC-03)
        revisaoConfirmada — checkbox habilita
        "Pronto para prescrever"; edição desmarca
    end note
```

## Ciclo calcular → revisar → prescrever

```mermaid
flowchart TD
    A[Médico preenche formulário] --> B["Validação no blur\n(mesmas faixas do motor, vírgula/ponto)"]
    B --> C{Submit: validaTudo passa?}
    C -- não --> D[Erros exibidos com role=alert\nnada é calculado]
    C -- sim --> E[Monta EntradaCalculo\nderivaTipoEsquema: 0 Regular=basal,\n1=basal-plus, ≥2=basal-bolus]
    E --> F{motor.calcular}
    F -- resultado --> G[Painel: alertas → dose →\nfonte → revisão → disclaimer]
    F -- erro como valor --> H[Bloco de erros do motor]
    F -- exceção --> I[Painel honesto: NÃO prescreva\nrelator.reportar - só o nome do erro]
    G --> J{Checkbox Revisei a dose e a fonte}
    J -- marcado --> K[Bloco Pronto para prescrever habilitado\naria-disabled=false]
    K --> L[Transcrever ao prontuário\nnada é salvo nem enviado]
    G -. qualquer edição .-> M[desatualizado = true\nRecalcule antes de prescrever\ncheckbox desmarcado e desabilitado]
```

## Preferência de tema

```mermaid
flowchart LR
    A[useSyncExternalStore] --> B[lerTema:\nlocalStorage aps-inteligente:tema]
    B -- bloqueado/ausente --> C[claro - padrão]
    D[botão Tema claro/escuro] --> E[gravarTema]
    E --> F[localStorage.setItem\n+ notifica ouvintes]
    G[evento storage - outra aba] --> A
    H[SSR: lerTemaNoServidor] --> C
```
