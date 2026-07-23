"use client";
// Página inicial da plataforma (feature 007: RF-05/RF-06; RN-08): seções temáticas
// e cartões de navegação renderizados a partir do catálogo tipado (D-07 — fonte
// única anti-drift), sobre a moldura comum (D-09). Nenhuma seção nasce vazia.
import { Heading, Text } from "@primer/react";
import Link from "next/link";
import { Moldura } from "interface/comum/moldura";
import { CATALOGO } from "./catalogo";

export function TelaInicio() {
  return (
    <Moldura
      titulo="APS Inteligente"
      subtitulo="Calculadoras clínicas para a Atenção Primária à Saúde · cálculo 100% no navegador"
    >
      <div className="inicio-secoes">
        {CATALOGO.map((secao) => (
          <section
            key={secao.id}
            className="inicio-secao"
            aria-labelledby={`secao-${secao.id}`}
          >
            <Heading as="h2" id={`secao-${secao.id}`}>
              {secao.titulo}
            </Heading>
            <ul className="inicio-cartoes">
              {secao.calculadoras.map((calculadora) => (
                <li key={calculadora.rota} className="inicio-cartao">
                  <Link href={calculadora.rota}>{calculadora.titulo}</Link>
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
