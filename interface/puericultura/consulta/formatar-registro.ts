// Projeção do registro em texto (feature 020: RF-06, RF-08; D-03). Molde de
// `interface/calculadora/formatar-plano.ts` da feature 006: uma função pura que projeta em
// texto simples o que o painel exibe.
//
// É A SAÍDA PRINCIPAL DA FEATURE. O produto desta tela é um registro, não um número, e ele
// atravessa para fora da plataforma por colagem num prontuário. A forma tem contrato escrito
// em `_reversa_forward/020-consulta-puericultura-soap/interfaces/registro-soap.md`, e as
// regras do §2 de lá são o que este arquivo realiza — todas menos a 7, revogada pelo adendo
// `bug-BUG-20260728-ZAHV-v001`.
//
// O QUE ESTE TEXTO NÃO CARREGA, E POR QUÊ. Até 28/07 a cadeia fechava com as notas de
// proveniência e a linha da fonte, e num registro de um campo só elas ocupavam 93% do texto
// colado no prontuário do paciente. A decisão `MD-0035` mudou o endereço da declaração, não a
// sua obrigação: quem precisa saber que a organização em SOAP é do produto é o médico que lê
// a tela ANTES de preencher, e é lá que `proveniencia.tsx` a exibe, importando as mesmas
// constantes de `fonte-clinica.ts` que o domínio carrega. Depois de colada num prontuário, a
// mesma informação não instrui ninguém e vira ruído num documento cuja função é outra.
//
// `RegistroDaConsulta` segue carregando `notas` e `referencias`: a estrutura documenta o que
// o registro declara, e é a projeção que decide o que emite. São os dois lados da mesma
// fronteira, e o corte fica deste.
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

export function formatarRegistro(registro: RegistroDaConsulta): string {
  // Contrato §4: sem campo preenchido não há registro a produzir, e entregar cabeçalhos
  // vazios seria pior que entregar nada — afirmaria averiguação que não houve.
  if (registro.secoes.length === 0) return "";

  const cabecalho = `${registro.ficha.titulo} — ${registro.idadeDeclarada.texto}`;

  return [cabecalho, ...registro.secoes.map(parteDaSecao)].join("\n\n");
}
