// Fachada RegistroDeConsultaPuericultura — API pública do submódulo (feature 020: RF-03,
// RF-06, RF-10; D-01). É a SEGUNDA fachada de `models/puericultura`, ao lado de
// `CalculadoraCrescimentoInfantil.avaliar`, e a primeira vez que uma unit da plataforma tem
// duas: a fonte editorial é a mesma caderneta, e o que muda é a seção que cada motor lê.
//
// Fluxo: sugerir a ficha pela idade cronológica → montar o registro do que foi preenchido.
// Pura e determinística. O motor apenas INFORMA — a ficha é sugestão, e a escolha continua
// do prescritor (ADR 0005, RN-04); erro esperado é valor (ADR 0004); exceção só para bug
// interno (`ErroDeInvariante`).
//
// O QUE ESTA FACHADA NÃO FAZ, e é o ponto de D-08: ela não avalia crescimento. O
// `ResultadoAvaliacao` chega pronto de `CalculadoraCrescimentoInfantil`, com os escores e as
// referências que aquele motor já emitiu. Recalcular aqui criaria uma segunda fonte de
// escore z na mesma unit, que é exatamente o defeito que a invariante 3 da família previne.
import { FICHAS } from "./fichas/indice";
import { montarRegistro } from "./registro";
import { sugerirFicha } from "./selecao";
import type { IdadesDerivadas } from "../tipos";
import type {
  EntradaDoRegistro,
  Ficha,
  RegistroDaConsulta,
  SugestaoDeFicha,
} from "./tipos";

export class RegistroDeConsultaPuericultura {
  /** Acervo injetável, com o real por omissão — a tela instancia sem argumento (D-08/017). */
  constructor(private readonly fichas: readonly Ficha[] = FICHAS) {}

  /** As dez consultas datadas, na ordem da fonte: a lista que a tela oferece para troca. */
  catalogo(): readonly Ficha[] {
    return this.fichas;
  }

  /** RF-03: qual ficha a idade indica, e qual idade governou a indicação (RN-04, RN-05). */
  sugerir(idades: IdadesDerivadas): SugestaoDeFicha {
    return sugerirFicha(idades, this.fichas);
  }

  /** RF-06: o preenchimento vira registro estruturado, sem campo em branco (RN-10). */
  montar(entrada: EntradaDoRegistro): RegistroDaConsulta {
    return montarRegistro(entrada);
  }
}
