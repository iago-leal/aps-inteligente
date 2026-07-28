// Projeção do registro em texto (feature 020: RF-06, RF-08; D-03). Molde de
// `interface/calculadora/formatar-plano.ts` da feature 006: uma função pura que projeta em
// texto simples o que o painel exibe.
//
// É A SAÍDA PRINCIPAL DA FEATURE. O produto desta tela é um registro, não um número, e ele
// atravessa para fora da plataforma por colagem num prontuário. A forma tem contrato escrito
// em `_reversa_forward/020-consulta-puericultura-soap/interfaces/registro-soap.md`, e as oito
// regras do §2 de lá são o que este arquivo realiza.
//
// UMA FUNÇÃO, UMA VARIÁVEL, DOIS CONSUMIDORES. A tela exibe o retorno desta função e o
// comando de cópia entrega o mesmo valor. A identidade que RF-08 exige é assim propriedade da
// construção, e não coincidência a verificar — o teste de T013 guarda a estrutura, não o
// acaso.
import type {
  RegistroDaConsulta,
  SecaoDoRegistro,
} from "models/puericultura/consulta/tipos";

/** Regra 1 do contrato: o cabeçalho da seção é a letra, e a ordem vem do domínio. */
function parteDaSecao(secao: SecaoDoRegistro): string {
  const linhas = secao.itens.map((item) => `- ${item.rotulo}: ${item.valor}`);
  return [secao.secao, ...linhas].join("\n");
}

/** Regra 7: as notas fecham o texto, e a linha da fonte fecha as notas. */
function parteDaFonte(registro: RegistroDaConsulta): string {
  const localizacoes = registro.referencias
    .map((referencia) => referencia.localizacao)
    .join("; ");
  const edicao = registro.referencias[0]?.versaoEdicao ?? "";
  return `Fonte: ${edicao}: ${localizacoes}.`;
}

export function formatarRegistro(registro: RegistroDaConsulta): string {
  // Contrato §4: sem campo preenchido não há registro a produzir, e entregar cabeçalhos
  // vazios seria pior que entregar nada — afirmaria averiguação que não houve.
  if (registro.secoes.length === 0) return "";

  const cabecalho = `${registro.ficha.titulo} — ${registro.idadeDeclarada.texto}`;
  const notas = registro.notas.map((nota) => nota.mensagem).join("\n\n");

  return [
    cabecalho,
    ...registro.secoes.map(parteDaSecao),
    notas,
    parteDaFonte(registro),
  ].join("\n\n");
}
