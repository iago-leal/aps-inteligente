# Contrato: manifesto do aplicativo instalável

> Identificador: `018-revisao-linguagem-textos`
> Tipo: arquivo (`public/manifest.webmanifest`, servido em `/manifest.webmanifest`)
> Consumidores externos: navegador, ao instalar o aplicativo; tela inicial do dispositivo
> Origem no legado: feature 009 (`_reversa_sdd/addenda/009-logo-apsi-no-cabecalho.md`)
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Natureza do contrato

O manifesto é lido uma vez, pelo navegador, no momento da instalação, e o texto que ele declara **persiste no dispositivo do usuário** até a reinstalação. É a prosa de vida mais longa da plataforma: enquanto o `<title>` de uma aba se refaz a cada carga, o `name` do manifesto fica gravado sob o ícone na tela inicial de quem instalou. Daí entrar como contrato próprio, e não como mais três literais do inventário.

É declarado em `pages/_document.tsx` por `<link rel="manifest" href="/manifest.webmanifest" />`, sob a política de segurança de conteúdo vigente — `manifest-src` recai em `default-src 'self'`. Nada disso muda.

## 2. Estado atual, conferido 🟢

| Campo | Valor | Classe | Situação |
|---|---|---|---|
| `name` | `APS Inteligente` | autoral | Íntegro |
| `short_name` | `APSi` | identificador de marca | Fora da revisão |
| `description` | `Calculadoras clínicas para a Atenção Primária à Saúde · cálculo 100% no navegador` | autoral | Sujeita a RF-04 e RF-03 |
| `start_url`, `scope`, `display` | `/`, `/`, `standalone` | identificador | Fora da revisão |
| `theme_color`, `background_color` | `#0969da`, `#ffffff` | identificador | Fora da revisão |
| `icons` | dois tiles, 192 e 512 | identificador | Fora da revisão |

A `description` traz **uma** das vinte e uma posições de ponto médio em literal exibido, e a usa exatamente na função que RN-10 lhe atribui: separar duas unidades de informação de mesma hierarquia, ladeada por espaço simples. Serve de exemplo canônico para o par antes/depois do guia. 🟢

## 3. O que muda

Apenas a `description`, e por dois motivos que se somam:

1. **RF-04, alinhamento ao catálogo.** A descrição atual não enumera seções — diz apenas "Calculadoras clínicas para a Atenção Primária à Saúde" —, e por isso **não carrega o defeito de exatidão da home**. O requisito, ainda assim, a alcança: o critério de aceite de RF-04 fala da descrição de `pages/index.tsx` **e** da do manifesto. A leitura que o plano adota é a estrita: a do manifesto passa pelo mesmo teste de correspondência ao `CATALOGO`, e o passa hoje por não enumerar subconjunto próprio nenhum. 🟡
2. **RF-03, revisão de forma.** É prosa autoral e responde ao guia como qualquer outra: grafia, ponto médio, capitalização depois do separador. A pergunta que o guia terá de responder é se `cálculo 100% no navegador`, hoje em caixa baixa após o `·`, permanece assim.

**Restrição dura.** O manifesto tem um teto prático de comprimento útil: descrição longa é truncada na apresentação de instalação, com corte variável por plataforma. A reescrita deve caber com folga no que hoje existe — 78 caracteres — e não aproveitar a revisão para alongar. 🟡

## 4. O que não muda

- `name` e `short_name`, que são a marca fixada pela feature 009 e não prosa revisável. Alterá-los mudaria o rótulo sob o ícone de quem já instalou.
- Todos os campos de identificador: `start_url`, `scope`, `display`, cores e ícones.
- O `<link rel="manifest">` e a política de segurança de conteúdo.

## 5. Erros, idempotência e propagação

- **Idempotência.** Arquivo estático; a mesma requisição devolve o mesmo conteúdo.
- **Modo de falha.** JSON malformado quebra a instalação silenciosamente — o navegador ignora o manifesto e a instalabilidade desaparece sem erro visível. É o risco específico de editar este arquivo à mão, e a mitigação é o teste de validade que a feature deve garantir.
- **Propagação.** Aqui está a diferença que justifica o cuidado: **quem já instalou não recebe o texto novo** até que o navegador reavalie o manifesto ou o usuário reinstale. O momento e o critério dessa reavaliação variam por plataforma. A revisão, portanto, alcança instalações futuras de imediato e as existentes com atraso indeterminado. 🟡

Consequência prática para o plano: nenhuma. A descrição do manifesto não afirma nada clinicamente relevante, e a defasagem temporária não induz erro. Ficaria diferente se a revisão tivesse alterado `name` — e é mais uma razão para não alterá-lo.

## 6. Verificação

| O que se verifica | Onde |
|---|---|
| O arquivo é JSON válido e conserva os campos obrigatórios | Teste a criar, na leitura do arquivo |
| A `description` não enumera subconjunto próprio das seções de `CATALOGO` | Teste de RF-04, mesmo oráculo da home |
| `name` e `short_name` permanecem `APS Inteligente` e `APSi` | Asserção explícita, para que a revisão não os alcance por descuido |
| A `description` respeita a regra de forma do ponto médio | Teste de norma de RF-05 |
| Os três campos textuais constam do inventário com classe atribuída | Gerador de RF-02 |

Nota de implementação: o manifesto é JSON, não TypeScript, e fica fora do alcance da travessia de árvore sintática de D-03. O gerador precisa de um caminho de leitura próprio para ele — três campos lidos por chave, sem parser especial —, do mesmo modo que precisará para o `README.md`. 🟢

## 7. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-27 | Versão inicial gerada por `/reversa-plan` | reversa |
