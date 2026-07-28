# Onboarding — como verificar a contribuição voluntária via PIX

> Identificador: `019-contribuicao-voluntaria-pix` · Data: 2026-07-28
> Para quem vai testar a feature pela primeira vez, inclusive o você de daqui a doze meses.

## 1. Subir o ambiente

```bash
cd ~/dev/aps-inteligente
npm ci
npm run dev
```

A home fica em `http://localhost:3000`. O banco **não** é necessário: ele serve apenas ao
healthcheck de `/api/v1/status`, e nada nesta feature o toca. Se quiser subi-lo mesmo assim,
`npm run db:up`.

## 2. Ver a feature funcionando

1. Abra `http://localhost:3000`.
2. Role até o pé da página, abaixo das quatro seções de calculadoras.
3. Acione o comando de apoio. O painel abre com o QR, a chave em texto e os dois comandos de
   cópia.
4. Acione a cópia da chave. A confirmação aparece logo abaixo do comando.
5. Acione a cópia do código copia e cola e verifique que o texto colado começa por `000201` e
   termina por `6304` seguido de quatro dígitos hexadecimais.

## 3. Verificar o que a feature promete não fazer

Estes três passos valem mais que os anteriores, porque testam a ausência, e ausência não se vê
por acaso.

**Nenhuma requisição de rede.** Abra o painel de rede das ferramentas do navegador, limpe o
registro e acione o comando de apoio. Nenhuma requisição deve aparecer: nem para montar o
payload, nem para desenhar o QR.

**Nenhum durável novo.** No painel de armazenamento, confira `localStorage` antes e depois de
abrir e fechar o painel. A única chave deve ser a da preferência de tema.

**Nenhuma calculadora tocada.** Visite as cinco rotas e confirme que o comando de apoio não
aparece em nenhuma delas:

```
/dm2/insulina
/pre-natal/idade-gestacional
/cardiologia/dor-toracica
/cardiologia/risco-cardiovascular
/puericultura/crescimento
```

## 4. Verificar o caminho do telefone

É o caminho principal da feature, e o que mais facilmente se quebra sem que ninguém note.

1. Reduza a janela à largura de um telefone, ou use a emulação de dispositivo do navegador.
2. Abra o painel e confira que **os dois comandos de cópia estão visíveis sem rolagem
   adicional**, e que aparecem antes do QR na ordem de leitura.
3. Navegue pelo teclado, com `Tab`, e confirme que a ordem de foco acompanha a ordem visual.
4. Pressione `Esc` e confirme que o painel fecha e que o foco volta ao comando que o abriu.

## 5. Provar o payload contra o mundo, e não só contra nós

A suíte prova que o payload obedece à nossa leitura da especificação. Estes dois passos provam
que a leitura estava certa, e são obrigatórios antes de encerrar a feature.

1. **Decodificador independente.** Copie o código copia e cola e decodifique-o em um leitor de
   BR Code que não seja o nosso código. Confira, campo a campo, que o beneficiário, a cidade e a
   chave são os esperados, e que o CRC confere.
2. **Aplicativo de banco real.** Com o painel aberto em um computador, aponte a câmera de um
   telefone com o aplicativo do banco. A tela de confirmação deve exibir o nome do beneficiário
   correto. **Não conclua a transferência para testar**; ver o beneficiário certo já prova o que
   precisa ser provado.

Se algum dos dois falhar, o defeito está no módulo puro, e não na tela. Comece por
`models/contribuicao/crc16.ts` e pelo comprimento declarado dos campos.

## 6. Rodar a suíte

```bash
npm run test          # unidade e integração
npm run test:e2e      # roteiros de ponta a ponta, inclui axe
npm run typecheck
npm run lint
```

E, depois de qualquer mudança em texto exibido:

```bash
node scripts/inventariar-textos.mts --gerar
git diff --stat tests/apoio/inventario-textual.json
```

A segunda execução seguida deve deixar `git diff` vazio. Se o gerador **parar** nomeando arquivo
e linha, é porque um literal novo entrou sem classe declarada: vá a `scripts/textos/classes/` e
declare-a. O gerador parar é o comportamento correto, não uma falha da ferramenta.

## 7. Conferir o que não pode ter mudado

```bash
git status tests/apoio/citacao-linha-de-base.json e2e/axe-baseline.json
```

Os dois precisam aparecer **sem modificação**. A linha de base da citação não se regera por
desenho (`MD-0018`), e a baseline do axe só cresce por decisão explícita, jamais por absorção
silenciosa de violação nova.

## 8. Antes de considerar pronto

- [ ] `interface/contribuicao/beneficiario.ts` tem os valores reais, e nenhum de exemplo
- [ ] O QR foi lido por um aplicativo de banco real, com o beneficiário correto na tela
- [ ] O acréscimo de bundle foi medido e registrado
- [ ] A microdecisão da dependência `react-qr-code` foi escrita, com a versão pinada real
