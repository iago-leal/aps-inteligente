# Rede de segurança — OPP-20260730-P2WH

A promessa da transformação é DOM idêntico, de modo que a prova direta dela é a
comparação do DOM emitido, e não a leitura do diff. A caracterização renderizou
`TelaInicio` em jsdom e gravou `container.innerHTML` antes e depois.

```
diff dom-antes.html dom-depois.html   ->  vazio
14712 dom-antes.html
14712 dom-depois.html
```

O teste de caracterização foi TEMPORÁRIO e não ficou no repositório: um snapshot
do DOM inteiro da home reprovaria a cada feature que a mudasse de propósito, e
isso é ruído de suíte, não rede. Ele serviu ao passo e saiu com ele.

## Rede existente, verde antes e depois
```
vitest run                          920/920 em 73 arquivos
playwright plataforma + cabecalho    26/26
tsc --noEmit / eslint / prettier     0 / 0 / limpo
```

## Efeito colateral declarado, e por que ele não é mudança de comportamento

`tests/apoio/inventario-textual.json` mudou em duas linhas: os dois literais de
`tela.tsx` passaram das linhas 19 e 20 para 80 e 81. Arquivo, texto e classe são
os mesmos, e a contagem segue em 1245. O campo `linha` existe só para nomear o
lugar na mensagem de erro; a chave do mapa é arquivo + texto, nunca a linha, e
`classificacao.mts` diz por quê no próprio cabeçalho. Nenhum teste o afirma.
