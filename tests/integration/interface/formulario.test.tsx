// @vitest-environment jsdom
// T013 do motor + T017 da feature 001-integrar-design-claude: formulário com
// entrada de glicemias POR MOMENTO (RF-04/RN-04) e bloco de antidiabéticos orais
// (RF-01/RF-02), com validação espelhada (RF-05) e equivalência clínica (RF-04/RF-06).
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CalculadoraInsulinaDM2 } from "models/insulina/calculadora";
import type { EntradaCalculo } from "models/insulina/tipos";
import { FormularioCalculadora } from "interface/calculadora/formulario";
import { afericao, jejum } from "../../apoio/construtores";

afterEach(cleanup);

function renderizaFormulario() {
  const onCalcular = vi.fn();
  render(<FormularioCalculadora onCalcular={onCalcular} />);
  return { onCalcular };
}

function selecionaTitulacao() {
  fireEvent.click(screen.getByRole("radio", { name: /titulação de dose/i }));
}

function preenchePeso(valor: string) {
  fireEvent.change(screen.getByLabelText(/peso \(kg\)/i), {
    target: { value: valor },
  });
}

function preencheMomento(rotulo: RegExp, valor: string) {
  fireEvent.change(screen.getByLabelText(rotulo), { target: { value: valor } });
}

function calcular() {
  fireEvent.click(screen.getByRole("button", { name: /^calcular$/i }));
}

function entradaEnviada(onCalcular: ReturnType<typeof vi.fn>): EntradaCalculo {
  expect(onCalcular).toHaveBeenCalledTimes(1);
  return onCalcular.mock.calls[0][0] as EntradaCalculo;
}

describe("Campos por modo (RF-06 do requirements; RF-01 da UI)", () => {
  it("no modo início, a seção de esquema atual não aparece", () => {
    renderizaFormulario();
    expect(screen.queryByText(/esquema atual/i)).toBeNull();
  });

  it("na titulação, a seção de esquema atual aparece", () => {
    renderizaFormulario();
    selecionaTitulacao();
    expect(screen.getByText(/esquema atual/i)).toBeTruthy();
  });

  it("a seleção de modo é explícita, com as duas opções nomeadas", () => {
    renderizaFormulario();
    expect(
      screen.getByRole("radio", { name: /início de insulinização/i }),
    ).toBeTruthy();
    expect(
      screen.getByRole("radio", { name: /titulação de dose/i }),
    ).toBeTruthy();
  });
});

describe("Entrada por momento (RF-04/RN-04 da feature 001)", () => {
  it("exibe os quatro campos por momento com a unidade no rótulo", () => {
    renderizaFormulario();
    expect(screen.getByLabelText(/jejum \(mg\/dl\)/i)).toBeTruthy();
    expect(
      screen.getByLabelText(/antes do almoço \(aa\) \(mg\/dl\)/i),
    ).toBeTruthy();
    expect(
      screen.getByLabelText(/antes do jantar \(aj\) \(mg\/dl\)/i),
    ).toBeTruthy();
    expect(screen.getByLabelText(/ao deitar \(ad\) \(mg\/dl\)/i)).toBeTruthy();
  });

  it('"98,5 180 200" no jejum vira três aferições de jejum, com decimal por vírgula', () => {
    const { onCalcular } = renderizaFormulario();
    preenchePeso("80");
    preencheMomento(/jejum \(mg\/dl\)/i, "98,5 180 200");
    calcular();
    const entrada = entradaEnviada(onCalcular);
    expect(entrada.glicemias).toEqual([
      { valorMgDl: 98.5, momento: "jejum" },
      { valorMgDl: 180, momento: "jejum" },
      { valorMgDl: 200, momento: "jejum" },
    ]);
  });

  it("campo vazio equivale a momento não aferido", () => {
    const { onCalcular } = renderizaFormulario();
    preenchePeso("80");
    preencheMomento(/antes do almoço \(aa\) \(mg\/dl\)/i, "150");
    calcular();
    const entrada = entradaEnviada(onCalcular);
    expect(entrada.glicemias).toEqual([
      { valorMgDl: 150, momento: "antes_almoco" },
    ]);
  });

  it("não há máximo de aferições por campo (RN-04)", () => {
    const { onCalcular } = renderizaFormulario();
    preenchePeso("80");
    preencheMomento(/jejum \(mg\/dl\)/i, "100 110 120 130 140 150 160 170");
    calcular();
    expect(entradaEnviada(onCalcular).glicemias).toHaveLength(8);
  });

  it("equivalência clínica: a entrada por momento produz o mesmo resultado que a lista linha a linha (RF-04)", () => {
    const { onCalcular } = renderizaFormulario();
    preenchePeso("80");
    preencheMomento(/jejum \(mg\/dl\)/i, "180 120");
    preencheMomento(/ao deitar \(ad\) \(mg\/dl\)/i, "140");
    calcular();
    const entradaDoFormulario = entradaEnviada(onCalcular);

    const listaLinhaALinha = [
      ...jejum(180, 120),
      ...afericao("ao_deitar", 140),
    ];
    const calculadora = new CalculadoraInsulinaDM2();
    expect(calculadora.calcular(entradaDoFormulario)).toEqual(
      calculadora.calcular({
        ...entradaDoFormulario,
        glicemias: listaLinhaALinha,
      }),
    );
  });
});

describe("Antidiabéticos orais (RF-01/RF-02 da feature 001)", () => {
  it("dose de metformina e TFG preenchidas chegam à entrada do motor", () => {
    const { onCalcular } = renderizaFormulario();
    preenchePeso("80");
    fireEvent.change(screen.getByLabelText(/dose atual de metformina/i), {
      target: { value: "1500" },
    });
    fireEvent.change(screen.getByLabelText(/tfg \(ml\/min/i), {
      target: { value: "40" },
    });
    calcular();
    const entrada = entradaEnviada(onCalcular);
    expect(entrada.doseMetforminaMgDia).toBe(1500);
    expect(entrada.tfg).toBe(40);
  });

  it("campos vazios ficam ausentes da entrada (opcionais)", () => {
    const { onCalcular } = renderizaFormulario();
    preenchePeso("80");
    calcular();
    const entrada = entradaEnviada(onCalcular);
    expect("doseMetforminaMgDia" in entrada).toBe(false);
    expect("tfg" in entrada).toBe(false);
  });

  it("valida no blur com as faixas do motor (metformina 100–3000)", () => {
    renderizaFormulario();
    const campo = screen.getByLabelText(/dose atual de metformina/i);
    fireEvent.change(campo, { target: { value: "50" } });
    fireEvent.blur(campo);
    expect(
      screen
        .getAllByRole("alert")
        .some((el) => /100 e 3000/.test(el.textContent ?? "")),
    ).toBe(true);
  });

  it("valida no blur com as faixas do motor (TFG 1–200)", () => {
    renderizaFormulario();
    const campo = screen.getByLabelText(/tfg \(ml\/min/i);
    fireEvent.change(campo, { target: { value: "300" } });
    fireEvent.blur(campo);
    expect(
      screen
        .getAllByRole("alert")
        .some((el) => /1 e 200/.test(el.textContent ?? "")),
    ).toBe(true);
  });
});

describe("Vírgula e ponto equivalentes (RF-05 do requirements; RF-03/EC-01 da UI)", () => {
  it("peso '82,5' e '82.5' produzem o mesmo valor na entrada do motor", () => {
    for (const bruto of ["82,5", "82.5"]) {
      const { onCalcular } = renderizaFormulario();
      preenchePeso(bruto);
      calcular();
      expect(onCalcular).toHaveBeenCalledTimes(1);
      expect(onCalcular.mock.calls[0][0].pesoKg).toBe(82.5);
      cleanup();
    }
  });
});

describe("Validação no blur com as faixas do motor (RF-05)", () => {
  it("peso 400 mostra erro localizado no campo ao sair dele", () => {
    renderizaFormulario();
    const campo = screen.getByLabelText(/peso \(kg\)/i);
    fireEvent.change(campo, { target: { value: "400" } });
    fireEvent.blur(campo);
    expect(
      screen
        .getAllByRole("alert")
        .some((el) => /350/.test(el.textContent ?? "")),
    ).toBe(true);
  });

  it("glicemia fora de faixa no campo do momento é apontada no blur", () => {
    renderizaFormulario();
    const campo = screen.getByLabelText(/jejum \(mg\/dl\)/i);
    fireEvent.change(campo, { target: { value: "5" } });
    fireEvent.blur(campo);
    expect(
      screen
        .getAllByRole("alert")
        .some((el) => /10 e 1000/.test(el.textContent ?? "")),
    ).toBe(true);
  });

  it("token não numérico no campo do momento é rejeitado apontando o valor", () => {
    const { onCalcular } = renderizaFormulario();
    preenchePeso("80");
    preencheMomento(/jejum \(mg\/dl\)/i, "abc 120");
    calcular();
    expect(onCalcular).not.toHaveBeenCalled();
    expect(
      screen
        .getAllByRole("alert")
        .some((el) => /"abc"/.test(el.textContent ?? "")),
    ).toBe(true);
  });

  it("com campo inválido, o envio é bloqueado", () => {
    const { onCalcular } = renderizaFormulario();
    preenchePeso("400");
    calcular();
    expect(onCalcular).not.toHaveBeenCalled();
  });
});

describe("Todos os ofensores exibidos juntos (EC da feature 001; RN-03 do motor)", () => {
  it("glicemia '5' no jejum + peso ausente mostram os dois erros, sem parar no primeiro", () => {
    const { onCalcular } = renderizaFormulario();
    preencheMomento(/jejum \(mg\/dl\)/i, "5");
    calcular();
    expect(onCalcular).not.toHaveBeenCalled();
    const textos = screen
      .getAllByRole("alert")
      .map((el) => el.textContent ?? "");
    expect(textos.some((t) => /10 e 1000/.test(t))).toBe(true);
    expect(textos.some((t) => /peso/i.test(t))).toBe(true);
  });
});

describe("Envio incompleto bloqueado (RF-06 do requirements; RF-02 da UI)", () => {
  it("titulação sem peso não chama o motor e aponta o campo", () => {
    const { onCalcular } = renderizaFormulario();
    selecionaTitulacao();
    calcular();
    expect(onCalcular).not.toHaveBeenCalled();
    expect(screen.getAllByRole("alert").length).toBeGreaterThanOrEqual(1);
  });

  it("titulação sem nenhuma glicemia aponta o campo de jejum", () => {
    const { onCalcular } = renderizaFormulario();
    selecionaTitulacao();
    preenchePeso("80");
    fireEvent.change(screen.getByLabelText(/dose \(ui\)/i), {
      target: { value: "20" },
    });
    calcular();
    expect(onCalcular).not.toHaveBeenCalled();
    expect(
      screen
        .getAllByRole("alert")
        .some((el) => /ao menos uma glicemia/i.test(el.textContent ?? "")),
    ).toBe(true);
  });
});

describe("Esquema atual preservado na titulação (RF-11 da UI)", () => {
  it("é possível adicionar e remover aplicações antes do cálculo", () => {
    renderizaFormulario();
    selecionaTitulacao();
    const adicionar = screen.getByRole("button", {
      name: /adicionar aplicação/i,
    });
    fireEvent.click(adicionar);
    expect(screen.getAllByLabelText(/dose \(ui\)/i)).toHaveLength(2);
    fireEvent.click(
      screen.getAllByRole("button", { name: /remover aplicação/i })[0],
    );
    expect(screen.getAllByLabelText(/dose \(ui\)/i)).toHaveLength(1);
  });
});
