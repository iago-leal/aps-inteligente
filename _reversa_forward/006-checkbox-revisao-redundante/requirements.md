# Requirements: Dar função ao ritual de revisão — copiar o Plano ao prontuário

> Identificador: `006-checkbox-revisao-redundante`
> Data: `2026-07-22`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

O painel de sucesso da calculadora exige um clique cerimonial — o checkbox "Revisei a dose e a fonte" — que hoje habilita apenas um bloco de texto estático, redundante com o disclaimer permanente de responsabilidade do prescritor. A queixa original era essa redundância; a clarificação revelou a demanda de fundo: o ritual só se justifica se tiver função. A feature ressignifica o ritual em vez de removê-lo: confirmada a revisão com resultado atual, o bloco "Pronto para prescrever" passa a oferecer a ação de copiar o plano da prescrição, pronto para colar no campo Plano do prontuário. A conferência ganha recompensa concreta, a fricção ganha propósito, e a privacidade por arquitetura permanece intacta: a cópia é local, disparada por gesto explícito, sem nenhum tráfego de rede. O motor clínico (`models/`) permanece byte a byte intocado.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/domain.md#2-glossário` | "Ritual de revisão: checkbox 'Revisei a dose e a fonte' que habilita o bloco 'Pronto para prescrever'; qualquer edição o desfaz" — o gate existente é o ponto de acoplamento natural da nova ação | 🟢 |
| `_reversa_sdd/interface-calculadora/requirements.md#requisitos-funcionais` | RF-05 (Must): ritual de revisão + invalidação por edição; RN-02 (edição desmarca a revisão) e RN-03 ("Pronto para prescrever" só com revisão confirmada e resultado atual) — comportamentos preservados e estendidos, não removidos | 🟢 |
| `_reversa_sdd/state-machines.md#1-estadoresultado` | Flags ortogonais `desatualizado` e `revisaoConfirmada`; a sub-máquina da revisão (`não-confirmada ⇄ confirmada`) ganha um efeito novo no estado `confirmada` | 🟢 |
| `_reversa_sdd/architecture.md#1-estilo-arquitetural` | Privacidade por arquitetura (ADR 0002/0007): sem backend, sem fetch, sem telemetria — a ação de cópia é compatível por ser local e por gesto do usuário | 🟢 |
| `_reversa_sdd/addenda/005-redacao-metformina-tfg.md` | As recomendações ao prescritor são exibidas como grupos (redução de metformina como subitem da manutenção); o texto copiado deve preservar essa hierarquia de leitura | 🟢 |
| `_reversa_sdd/addenda/004-estilo-primer-nas-telas.md` | Checkbox e painel migrados ao design system na feature 004; harness e2e com axe na linha de base 0 violações, a manter | 🟢 |
| `interface/calculadora/resultado.tsx` (código vigente) | `revisaoValida = revisaoConfirmada && !desatualizado` já é o predicado exato que deve habilitar a ação de cópia; o estado `desatualizado` tem sinalização própria (banner de aviso + esmaecimento) independente do checkbox | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Prescritor (médico de APS, usuário único) | Transcrever o esquema calculado ao prontuário com o mínimo de redigitação e o máximo de fidelidade | Após conferir dose e fonte, marca a revisão, aciona a cópia e cola o plano diretamente no campo Plano (do registro SOAP) do prontuário eletrônico |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** O ritual de revisão é mantido e ganha consequência funcional: com revisão confirmada e resultado atual (`revisaoValida`), o bloco "Pronto para prescrever" oferece a ação de copiar o plano; sem revisão, a ação não está disponível. 🟢
   - Origem no legado: `_reversa_sdd/interface-calculadora/requirements.md#regras-de-negócio` (RN-03, alterada)
   - Tipo: alterada
2. **RN-02:** A invalidação por edição estende-se à nova ação: editar qualquer campo marca o resultado como desatualizado, desfaz a revisão e retira a ação de cópia — jamais se copia um plano que não corresponde à entrada vigente. 🟢
   - Origem no legado: `_reversa_sdd/interface-calculadora/requirements.md#regras-de-negócio` (RN-02, alterada)
   - Tipo: alterada
3. **RN-03:** O conteúdo copiado deriva exclusivamente da saída exibida na tela — nenhum recálculo, nenhuma informação que o prescritor não tenha visto; a hierarquia das recomendações (grupos e subitens) é preservada na forma textual. Única adição não espelhada de um bloco da tela: a linha final de contexto, que declara o apoio da ferramenta e a fonte clínica (mesmo teor do disclaimer) e não contém dado clínico do paciente. 🟢
   - Origem no legado: `_reversa_sdd/architecture.md#1-estilo-arquitetural` (ADR 0005: apoio à decisão) e `_reversa_sdd/addenda/005-redacao-metformina-tfg.md`
   - Tipo: nova
4. **RN-04:** A cópia é integralmente local: o conteúdo vai à área de transferência do dispositivo por gesto explícito do usuário, sem tráfego de rede e sem armazenamento pela página; a promessa "nada é salvo nem enviado por esta página" permanece verdadeira. 🟢
   - Origem no legado: `_reversa_sdd/interface-calculadora/requirements.md#regras-de-negócio` (RN-01 da unit, preservada) e ADR 0002/0007
   - Tipo: nova
5. **RN-05:** Falha na cópia é barulhenta e honesta: se a área de transferência estiver indisponível, o painel informa o erro com clareza e orienta a transcrição manual; nunca falha em silêncio nem finge sucesso. 🟢
   - Origem no legado: `_reversa_sdd/architecture.md#1-estilo-arquitetural` (postura de honestidade: painel honesto, erros como valores)
   - Tipo: nova

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Ao marcar "Revisei a dose e a fonte" com resultado atual, o bloco "Pronto para prescrever" exibe a ação de copiar o plano | Must | Checkbox marcado e resultado atual → ação visível e acionável; caso contrário, ausente ou inerte | 🟢 |
| RF-02 | Acionar a cópia coloca na área de transferência o plano completo em texto simples, nesta ordem: esquema/dose calculado, recomendações ao prescritor com a hierarquia preservada, referência da fonte (página/figura do guia) e linha final de contexto declarando o apoio da ferramenta de decisão e a fonte clínica; sem cabeçalho "Plano:" | Must | Após o acionamento, a área de transferência contém as quatro partes na ordem especificada, em texto colável em campo de prontuário, sem cabeçalho | 🟢 |
| RF-03 | O acionamento dá retorno perceptível de sucesso ou de falha, acessível também a leitores de tela | Must | Sucesso e falha produzem sinal visível e anunciável; falha inclui orientação de transcrição manual | 🟢 |
| RF-04 | Editar qualquer campo após a cópia estar disponível desfaz a revisão e retira a ação, mantendo o comportamento `desatualizado` vigente | Must | Cenário Gherkin de invalidação abaixo; sem regressão nos testes existentes de invalidação | 🟢 |
| RF-05 | Painéis de erro de validação, fora de escopo e falha inesperada, disclaimer, selo de privacidade e textos clínicos permanecem inalterados | Must | Diff nulo de comportamento e texto nesses blocos; asserções existentes seguem passando | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Privacidade | Zero fetch e zero storage novos; a cópia usa exclusivamente a área de transferência do dispositivo, por gesto do usuário | ADR 0002/0007; RN-04 | 🟢 |
| Acessibilidade | Varredura axe do harness e2e permanece na linha de base da feature 004 (0 violações) nos dois viewports; o retorno de cópia é anunciável por tecnologia assistiva | `_reversa_sdd/addenda/004-estilo-primer-nas-telas.md` | 🟢 |
| Robustez | Indisponibilidade da área de transferência degrada com erro claro, sem quebrar o painel nem impedir a leitura do resultado | RN-05; postura "erros barulhentos" do projeto | 🟢 |
| Integridade do domínio | `git diff models/` vazio ao fim da entrega; o texto copiado é formatação de apresentação sobre a saída existente | ADR 0003; precedente das features 004 e 005 | 🟢 |
| Rastreabilidade | A extração (`domain.md`, `state-machines.md`, unit `interface-calculadora`) é reconciliada por adendo via `/reversa-sync`, pois a feature altera regra confirmada do legado | `.reversa/principles.md` (Princípios I e VI) | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Revisão habilita a cópia do plano
  Dado um cálculo bem-sucedido exibido
  Quando o prescritor marca "Revisei a dose e a fonte"
  Então o bloco "Pronto para prescrever" exibe a ação de copiar o plano

Cenário: Cópia coloca o plano completo na área de transferência
  Dado a revisão confirmada com resultado atual
  Quando o prescritor aciona a cópia
  Então a área de transferência contém, em texto simples e nesta ordem: esquema/dose, recomendações com hierarquia preservada, referência da fonte e linha final de contexto
  E o texto não abre com cabeçalho "Plano:"
  E um retorno de sucesso perceptível é exibido

Cenário: Edição invalida resultado, revisão e cópia
  Dado a ação de cópia disponível
  Quando qualquer campo do formulário é editado
  Então o resultado é marcado como desatualizado
  E a revisão é desfeita
  E a ação de cópia deixa de estar disponível

Cenário: Área de transferência indisponível (caso negativo)
  Dado a revisão confirmada com resultado atual
  Quando o prescritor aciona a cópia e a área de transferência está indisponível
  Então o painel informa a falha com clareza e orienta a transcrição manual
  E nenhum erro silencioso ocorre

Cenário: Sem revisão não há cópia (caso negativo)
  Dado um cálculo bem-sucedido exibido sem revisão confirmada
  Então a ação de copiar o plano não está disponível

Cenário: Motor intocado (caso negativo de escopo)
  Dado a entrega concluída
  Quando se inspeciona o diff da feature
  Então nenhum arquivo de models/ foi alterado
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 | Must | É a ressignificação que resolve a queixa: o ritual ganha a função que lhe faltava |
| RF-02 | Must | Sem o conteúdo copiado correto e colável, a ação não cumpre o propósito clínico |
| RF-03 | Must | Cópia sem retorno perceptível é falha silenciosa — vetada pela postura do projeto |
| RF-04 | Must | Copiar plano desatualizado seria risco clínico direto; a garantia real do ritual permanece |
| RF-05 | Must | A feature é aditiva e cirúrgica: tudo fora do bloco de revisão permanece byte a byte |

## 9. Esclarecimentos

### Sessão 2026-07-22

- **Q:** Qual o destino do bloco "Pronto para prescrever" sem o checkbox (sempre visível, fundido ao disclaimer, removido ou sem título)?
  **R:** Nenhuma das opções de remoção: o prescritor propôs dar função ao checkbox — ao marcá-lo, aparece a ação de copiar todas as recomendações ao prescritor para colar como Plano no prontuário. O bloco permanece como área da ação de cópia.
- **Q:** O legado classifica o ritual como Must ("sem formulário e ritual não há produto seguro"); confirma a remoção total?
  **R:** Não há remoção: o ritual é mantido e ressignificado como gate da ação de cópia. O conflito com a spec do legado se dissolve — o Must é preservado e fortalecido (a conferência passa a condicionar uma ação concreta); a alteração de RN-02/RN-03 será reconciliada por adendo.
- **Q:** O que compõe o texto copiado para colar no prontuário?
  **R:** Opção (d): plano completo — esquema/dose + recomendações (com a hierarquia da feature 005) + referência da fonte (página/figura) — acrescido de linha final de contexto declarando o apoio da ferramenta de decisão e a fonte clínica.
- **Q:** O texto copiado abre com o cabeçalho "Plano:"?
  **R:** Não: o campo do prontuário já se chama Plano; o cabeçalho duplicaria.

## 10. Lacunas

- Nenhuma lacuna pendente. A redação exata da linha final de contexto é decisão de apresentação, delegada ao plano técnico (deve apenas cumprir a RN-03: mesmo teor do disclaimer, sem dado clínico do paciente).

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-22 | Versão inicial gerada por `/reversa-requirements` (direção: remoção do checkbox) | reversa |
| 2026-07-22 | Sessão de esclarecimentos: feature redirecionada da remoção para a funcionalização do ritual (cópia do Plano); RFs, RNs e cenários reescritos | reversa |
| 2026-07-22 | Segunda rodada de esclarecimentos: escopo do texto copiado fechado (plano completo + linha de contexto, sem cabeçalho); RF-02 promovido a 🟢, lacunas zeradas | reversa |
