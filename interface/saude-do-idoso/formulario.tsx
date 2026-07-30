"use client";
// Formulário dos quinze itens da escala (feature 023: RF-03, RF-06, RF-09; RN-06; D-08).
//
// NENHUM GRUPO NASCE PRÉ-SELECIONADO, e é a decisão mais importante desta tela. Com um valor
// padrão — "Não", digamos —, o formulário responderia pelo paciente, e a soma sairia
// numericamente válida: o pior desfecho possível, porque não deixa rastro. Sem padrão, "não
// respondido" é estado real, e a coleta total de ofensores do domínio tem o que coletar.
//
// A ACESSIBILIDADE VEM DA ESTRUTURA, e não de atributo acrescentado depois: cada item é um
// `fieldset` cuja `legend` é o próprio enunciado, e os dois botões de opção compartilham o
// `name` do item. É o que faz o leitor de tela anunciar a pergunta antes das respostas, e o
// que permite percorrer a escala inteira pelo teclado na ordem impressa.
//
// NÃO HÁ CAMPO DE IDADE (RN-07). A fonte não publica faixa etária, e inventar uma seria
// inventar fonte. O que a tela faz é dizer, em prosa vinda do domínio, a quem o instrumento
// se dirige — e essa frase carrega sozinha o papel que noutras telas é de uma regra de
// recusa.
import { Button, FormControl, Radio, Text } from "@primer/react";
import { useState } from "react";
import { TEXTO_PUBLICO_DO_INSTRUMENTO } from "models/depressao-geriatrica/fonte-clinica";
import { ITENS } from "models/depressao-geriatrica/itens";
import type {
  RespostaDoItem,
  RespostasDaEscala,
} from "models/depressao-geriatrica/tipos";

export interface PropsFormularioDepressaoGeriatrica {
  onCalcular: (respostas: RespostasDaEscala) => void;
  onAlteracao?: () => void;
}

export function FormularioDepressaoGeriatrica({
  onCalcular,
  onAlteracao,
}: PropsFormularioDepressaoGeriatrica) {
  const [respostas, setRespostas] = useState<Record<string, RespostaDoItem>>(
    {},
  );

  function responder(id: string, resposta: RespostaDoItem) {
    setRespostas((atuais) => ({ ...atuais, [id]: resposta }));
    onAlteracao?.();
  }

  function aoSubmeter(evento: React.FormEvent) {
    evento.preventDefault();
    onCalcular(respostas);
  }

  return (
    <form className="formulario" onSubmit={aoSubmeter} noValidate>
      <Text as="p" className="gds-publico">
        {TEXTO_PUBLICO_DO_INSTRUMENTO}
      </Text>

      <fieldset className="grupo-campos">
        <legend>Itens da escala</legend>
        {ITENS.map((item) => (
          <fieldset key={item.id} className="gds-item">
            {/* Numeração e enunciado num nó só: o ponto que os separa é pontuação, e não
                prosa a revisar, de modo que fragmentá-lo em texto de JSX o faria entrar no
                inventário como se fosse literal exibível. O enunciado continua vindo do
                domínio, onde está declarado como citação. */}
            <legend>{`${item.numero}. ${item.texto}`}</legend>
            <FormControl>
              <Radio
                name={item.id}
                value="sim"
                checked={respostas[item.id] === "sim"}
                onChange={() => responder(item.id, "sim")}
              />
              <FormControl.Label>Sim</FormControl.Label>
            </FormControl>
            <FormControl>
              <Radio
                name={item.id}
                value="nao"
                checked={respostas[item.id] === "nao"}
                onChange={() => responder(item.id, "nao")}
              />
              <FormControl.Label>Não</FormControl.Label>
            </FormControl>
          </fieldset>
        ))}
      </fieldset>

      <Button type="submit" variant="primary">
        Calcular escore
      </Button>
    </form>
  );
}
