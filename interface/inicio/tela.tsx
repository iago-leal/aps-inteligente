"use client";
// Página inicial da plataforma (feature 007: RF-05/RF-06; RN-08): seções temáticas
// e cartões de navegação renderizados a partir do catálogo tipado (D-07 — fonte
// única anti-drift), sobre a moldura comum (D-09). Nenhuma seção nasce vazia.
// Feature 008 (RF-01/RF-04/RF-05; roadmap D-02/D-03/D-05): moldura na variante
// "destaque" (área introdutória), ícone decorativo por seção e cartão inteiro
// clicável via stretched link — um único <a> por cartão, sem JavaScript.
import { ArrowRightIcon } from "@primer/octicons-react";
import { Heading, Text } from "@primer/react";
import Link from "next/link";
import { Moldura } from "interface/comum/moldura";
import { CATALOGO } from "./catalogo";
import { IconeDaSecao } from "./icones";

export function TelaInicio() {
  return (
    <Moldura
      titulo="APS Inteligente"
      subtitulo="Calculadoras clínicas para a Atenção Primária à Saúde · cálculo 100% no navegador"
      apresentacao="destaque"
      logoComoTitulo
    >
      <div className="inicio-secoes">
        {CATALOGO.map((secao) => (
          <section
            key={secao.id}
            className="inicio-secao"
            aria-labelledby={`secao-${secao.id}`}
          >
            <div className="inicio-secao-cabecalho">
              <IconeDaSecao id={secao.id} />
              <Heading as="h2" id={`secao-${secao.id}`}>
                {secao.titulo}
              </Heading>
            </div>
            <ul className="inicio-cartoes">
              {secao.calculadoras.map((calculadora) => (
                <li key={calculadora.rota} className="inicio-cartao">
                  <div className="inicio-cartao-titulo">
                    <Link href={calculadora.rota}>{calculadora.titulo}</Link>
                    <span className="inicio-cartao-seta" aria-hidden="true">
                      <ArrowRightIcon size={16} aria-hidden="true" />
                    </span>
                  </div>
                  <Text as="p" size="small">
                    {calculadora.descricao}
                  </Text>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Moldura>
  );
}
