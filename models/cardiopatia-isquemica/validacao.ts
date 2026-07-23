// Validação de entrada com coleta de TODOS os ofensores (RN-09) — padrão da
// regra 15 do domain.md: nunca parar no primeiro. O motor revalida tudo, sem
// confiar na UI (EC-08). Idade plausível fora de 30–69 NÃO é ofensor: é
// fora-do-escopo (RN-06), decidido na fachada. Feature 010-dor-toracica-pre-teste.
import { CONSTANTES } from "./fonte-clinica";
import type { CodigoOfensor, EntradaAvaliacao, FatorDeRisco, Ofensor } from "./tipos";

const { idadePlausivel } = CONSTANTES;

const SEXOS: readonly string[] = ["masculino", "feminino"];
const FATORES: readonly FatorDeRisco[] = [
  "diabetes",
  "tabagismo",
  "hipertensao",
  "dislipidemia",
];

function ofensor(
  campo: string,
  codigo: CodigoOfensor,
  mensagem: string,
): Ofensor {
  return { campo, codigo, mensagem };
}

export function validarEntrada(entrada: EntradaAvaliacao): Ofensor[] {
  const ofensores: Ofensor[] = [];

  const idade = entrada.idadeAnos;
  if (
    !Number.isInteger(idade) ||
    idade < idadePlausivel.min ||
    idade > idadePlausivel.max
  ) {
    ofensores.push(
      ofensor(
        "idadeAnos",
        "IDADE_INVALIDA",
        `Idade inválida: informe um número inteiro de anos entre ${idadePlausivel.min} e ${idadePlausivel.max}.`,
      ),
    );
  }

  if (!SEXOS.includes(entrada.sexo)) {
    ofensores.push(
      ofensor(
        "sexo",
        "SEXO_INVALIDO",
        "Sexo inválido: informe masculino ou feminino (eixo do Quadro 2).",
      ),
    );
  }

  for (const fator of entrada.fatoresDeRisco) {
    if (!FATORES.includes(fator)) {
      ofensores.push(
        ofensor(
          "fatoresDeRisco",
          "FATOR_DE_RISCO_INVALIDO",
          `Fator de risco desconhecido: "${fator}". Use diabetes, tabagismo, hipertensão ou dislipidemia.`,
        ),
      );
    }
  }

  return ofensores;
}
