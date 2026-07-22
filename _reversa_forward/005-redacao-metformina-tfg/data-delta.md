# Data delta: Leitura coerente das recomendações de metformina sob ajuste renal

> Identificador: `005-redacao-metformina-tfg`
> Data: `2026-07-22`
> Modelo de referência: `_reversa_sdd/erd-complete.md`

## 1. Resumo

**Sem delta de dados.** A feature é de apresentação: nenhuma entidade, campo, constante clínica ou persistência muda.

## 2. Verificação item a item

| Aspecto | Situação |
|---------|----------|
| `EntradaCalculo` | Intocada — nenhum campo novo; `doseMetforminaMgDia` e `tfg` (feature 001) seguem como estão |
| `Recomendacao` e o union `TipoRecomendacao` | Intocados — RF-03 proíbe mudança de contrato; nenhum campo de hierarquia é adicionado |
| `SaidaCalculo` / `ResultadoInicio` / `ResultadoTitulacao` | Intocados — ordem e conteúdo de `recomendacoesAoPrescritor` preservados |
| Constantes e referências clínicas (`fonte-clinica.ts`) | Intocadas — nenhum texto ou citação muda |
| Persistência | Inexistente no fluxo (ADR 0002, client-side); o banco da feature 003 não participa |
| Migração | n/a |

## 3. Tipo novo, interno à interface

Único tipo introduzido, **fora do modelo de domínio** (vive na camada de interface, não entra no ERD):

```
GrupoDeRecomendacoes = {
  principal: Recomendacao
  subitens: readonly Recomendacao[]   // vazio na quase totalidade dos casos
}
```

É estrutura efêmera de renderização, derivada por função pura a cada render; não é serializada, persistida nem exposta em contrato.
