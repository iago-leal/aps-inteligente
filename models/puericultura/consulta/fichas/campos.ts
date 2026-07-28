// Construtores dos campos das fichas (feature 020, T017). Existem para que a página
// impressa e a natureza do campo sejam escritas uma vez por grupo, e não uma vez por campo,
// nos dez módulos de transcrição.
//
// O QUE ELES NÃO FAZEM, e é a razão da forma que têm. Eles não recebem o rótulo por
// argumento posicional: recebem um OBJETO com a propriedade `rotulo` nomeada. A diferença
// não é de estilo. O inventário textual reconhece literal exibido por POSIÇÃO sintática, e
// `rotulo:` está na lista de propriedades de texto; num argumento posicional, o rótulo de
// uma palavra só — "Icterícia", "Criptorquidia", "Vômitos" — cairia fora das duas metades da
// régua e sumiria do guarda da citação, que é a cegueira que `MD-0019` corrigiu.
import type {
  Campo,
  CampoDeEscolha,
  CampoDeMarcacao,
  CampoDeMedida,
  CampoDeTexto,
  SecaoDaFicha,
  UnidadeDeMedida,
  VinculoAntropometrico,
} from "../tipos";
import type { Sexo } from "../../tipos";

type SemNaturezaNemPagina<T extends Campo> = Omit<T, "natureza" | "pagina">;

/**
 * Cada ficha instancia os seus construtores com a página de onde foi transcrita. A página
 * viaja no campo, e não só na ficha, porque é dela que saem duas coisas: a localização da
 * `ReferenciaClinica` e a origem da declaração de classe textual (D-04).
 */
export function camposDaPagina(pagina: number) {
  return {
    marcacao(campo: SemNaturezaNemPagina<CampoDeMarcacao>): CampoDeMarcacao {
      return { ...campo, natureza: "marcacao", pagina };
    },
    escolha(campo: SemNaturezaNemPagina<CampoDeEscolha>): CampoDeEscolha {
      return { ...campo, natureza: "escolha", pagina };
    },
    medida(campo: SemNaturezaNemPagina<CampoDeMedida>): CampoDeMedida {
      return { ...campo, natureza: "medida", pagina };
    },
    texto(campo: SemNaturezaNemPagina<CampoDeTexto>): CampoDeTexto {
      return { ...campo, natureza: "texto", pagina };
    },
    secao(
      numero: number,
      titulo: string,
      campos: readonly Campo[],
    ): SecaoDaFicha {
      return { numero, titulo, campos };
    },
  };
}

/** Só a tiragem do menino imprime o campo, por ser achado do exame da bolsa escrotal. */
export const SO_MASCULINO: readonly Sexo[] = Object.freeze(["masculino"]);

/** As três medidas antropométricas, e a unidade em que a caderneta as pede. */
export const UNIDADE: Readonly<Record<VinculoAntropometrico, UnidadeDeMedida>> =
  Object.freeze({
    peso: "g",
    comprimento: "cm",
    perimetroCefalico: "cm",
  });
