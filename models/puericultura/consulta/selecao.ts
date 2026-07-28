// O que da fonte se aplica a esta consulta (feature 020: RF-03, RF-05; RN-04, RN-05,
// RN-07, RN-08; D-05, D-07). Duas seleções, e é de propósito que morem juntas: uma escolhe a
// FICHA pela idade, a outra escolhe os CAMPOS pelo sexo. Ambas respondem à mesma pergunta —
// o que desta caderneta vale para a criança que está na minha frente — e nenhuma decide
// conduta: o motor informa, e quem escolhe é o prescritor (ADR 0005, RN-04).
import { FICHAS } from "./fichas/indice";
import { ErroDeInvariante, type IdadesDerivadas, type Sexo } from "../tipos";
import type { Campo, Ficha, SecaoDaFicha, SugestaoDeFicha } from "./tipos";

/**
 * RN-04 e RN-05: a sugestão se faz pela idade CRONOLÓGICA, inclusive na criança nascida
 * pré-termo, porque é ela que rege o calendário de acompanhamento e o vacinal, ao passo que
 * a corrigida rege a leitura da curva. Não há contradição com `MD-0011`: aquela ficha
 * repartiu papéis entre medir o corpo e ler a curva, e escolher a ficha não é nenhum dos
 * dois. A espécie volta declarada para que o registro a diga sem a tela reescrever a regra.
 *
 * Idade entre duas consultas previstas cai na ficha imediatamente ANTERIOR (premissa 🟡 do
 * roadmap §4): a fonte não diz o que fazer com a criança de sete meses, e o custo de errar é
 * um clique, porque a troca é livre.
 */
export function sugerirFicha(
  idades: IdadesDerivadas,
  fichas: readonly Ficha[] = FICHAS,
): SugestaoDeFicha {
  const diasDeVida = idades.diasDeVida;
  const ficha = fichas.find(
    (f) => diasDeVida >= f.faixaEmDias.de && diasDeVida <= f.faixaEmDias.ate,
  );

  if (ficha === undefined) {
    // As faixas cobrem de zero ao infinito por construção (T027, conferido em T008):
    // chegar aqui é buraco no índice, que é bug interno e não fluxo esperado (ADR 0004).
    throw new ErroDeInvariante(
      `Nenhuma ficha cobre ${diasDeVida} dias de vida: as faixas do índice deixaram de cobrir a idade`,
    );
  }

  return { ficha, especieDeIdade: "cronologica", diasDeVida };
}

/**
 * RN-08 e `MD-0026`: a aplicabilidade mora no DADO, e não em condicional de tela. Campo sem
 * `sexos` declarado vale para os dois — a restrição é a exceção, e por isso é ela que se
 * escreve. Hoje a lista tem um item só, "Criptorquidia", e a supressão é inseparável da
 * declaração ao leitor em `NOTA_SUPRESSAO_DE_CAMPO`.
 */
export function camposAplicaveis(
  secao: SecaoDaFicha,
  sexo: Sexo,
): readonly Campo[] {
  return secao.campos.filter(
    (campo) => campo.sexos === undefined || campo.sexos.includes(sexo),
  );
}

/**
 * RN-07 e D-06: a flexão vem do PAR de rótulos declarado, jamais de interpolação. O
 * inventário textual ignora crase com substituição de propósito, porque o texto montado em
 * tempo de execução não existe como literal único — e uma citação clínica que o guarda não
 * enxerga é pior que citação nenhuma, porque parece protegida.
 */
export function rotuloDoCampo(campo: Campo, sexo: Sexo): string {
  return sexo === "feminino" && campo.rotuloFeminino !== undefined
    ? campo.rotuloFeminino
    : campo.rotulo;
}
