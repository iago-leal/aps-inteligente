# Investigation — 006-checkbox-revisao-redundante

> Data: `2026-07-22`
> Pesquisa de fundo do roadmap; decisões finais em `roadmap.md` §3.

## 1. Ponto de acoplamento no legado

- `interface/calculadora/resultado.tsx` já computa `revisaoValida = revisaoConfirmada && !desatualizado` — exatamente o predicado que o requirements exige para habilitar a cópia (RF-01). Nenhuma mudança em `calculadora-app.tsx` é necessária: o estado de retorno da cópia é local ao painel.
- O estado `desatualizado` tem sinalização própria (banner de aviso + classe de esmaecimento) independente do checkbox; a RN-02 estendida (retirar a cópia ao editar) sai de graça do predicado existente.
- A hierarquia de recomendações da feature 005 (`agruparRecomendacoes`) é função pura exportada — reutilizável diretamente pelo formatador, garantindo o espelhamento exigido pela RN-03.

## 2. Escrita na área de transferência

| Opção | Avaliação |
|-------|-----------|
| API assíncrona de clipboard do navegador (`navigator.clipboard.writeText`) | **Escolhida.** Padrão da plataforma, baseada em promessa, exige contexto seguro (o app roda em HTTPS na produção e em localhost no dev) e gesto do usuário (o clique no botão é um). Suporte universal nos navegadores correntes para escrita de texto simples. |
| Comando de cópia legado do DOM (`document.execCommand("copy")`) | Descartada, inclusive como fallback: API depreciada há anos, comportamento inconsistente; adotá-la contraria o filtro de longevidade do projeto. Em vez de fallback silencioso, falha honesta (RN-05). |
| Biblioteca externa de clipboard | Descartada: dependência nova para encapsular uma chamada de uma linha; viola dependências enxutas (Princípio nº 5 global) sem ganho real. |

Comportamento em falha: a promessa rejeita quando a permissão é negada ou o contexto não é seguro. O adaptador captura e devolve `{ok: false}`; o painel exibe a orientação de transcrição manual. Nenhum estado fica corrompido: o resultado permanece legível na tela.

## 3. Teste de clipboard por camada

- **Unidade (formatador):** função pura, sem DOM — verifica as quatro partes do RF-02, a ordem, a ausência do cabeçalho "Plano:", a hierarquia (subitem da 005 recuado em texto) e a exclusão de alertas/alternativas (D-04).
- **Integração (jsdom):** o ambiente de teste não implementa clipboard — o adaptador é substituído por dublê injetável (sucesso e falha), o que valida RF-01/RF-03/RF-04 sem tocar a API real. O molde de dublê já existe na suíte (`relator-de-erros.test.tsx`).
- **E2E (runner existente):** o projeto chromium concede permissões de clipboard por configuração de contexto; o teste lê o conteúdo copiado de volta e o compara ao painel renderizado. No webkit a leitura programática é instável — a verificação de conteúdo fica no chromium; presença do botão e feedback visual seguem cobertos nos dois viewports, com axe na linha de base 0.

## 4. Padrões do projeto aplicáveis

- **Módulo puro de interface** (`agrupar-recomendacoes.ts`, `validacao-campos.ts`): lógica de apresentação testável fora do componente. O formatador segue o mesmo molde, com cabeçalho citando os RFs (Princípio VI).
- **Adaptador de navegador com degradação graciosa** (`preferencia-de-tema.ts` para storage, `relator-de-erros.ts` para relato): API de plataforma isolada atrás de contrato mínimo, erro como valor (ADR 0004). O adaptador de clipboard é o terceiro exemplar da família.
- **Feature de apresentação com motor intocado** (features 004 e 005): critério de pronto inclui `git diff models/` vazio e textos clínicos byte a byte.

## 5. Fontes

- Extração reversa: `_reversa_sdd/architecture.md` §1–2, `_reversa_sdd/state-machines.md` §1, `_reversa_sdd/interface-calculadora/requirements.md`, adendos 004 e 005.
- Código vigente: `interface/calculadora/resultado.tsx`, `interface/calculadora/agrupar-recomendacoes.ts`, `interface/calculadora/preferencia-de-tema.ts`, `interface/calculadora/relator-de-erros.ts`.
- Plataforma: documentação padrão da API assíncrona de clipboard (contexto seguro + gesto do usuário; escrita de texto amplamente suportada); documentação do runner e2e sobre concessão de permissões de clipboard por contexto.
