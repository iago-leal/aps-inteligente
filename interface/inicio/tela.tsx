"use client";
// Página inicial da plataforma (feature 007: RF-05/RF-06; RN-08): seções temáticas
// e cartões de navegação renderizados a partir do catálogo tipado (D-07 — fonte
// única anti-drift), sobre a moldura comum (D-09). Nenhuma seção nasce vazia.
// Feature 008 (RF-01/RF-04/RF-05; roadmap D-02/D-03/D-05): moldura na variante
// "destaque" (área introdutória), ícone decorativo por seção e cartão inteiro
// clicável via stretched link — um único <a> por cartão, sem JavaScript.
//
// OPP-20260730-P2WH: a projeção do catálogo saiu do JSX da tela e virou duas funções
// nomeadas, `SecaoDaHome` e `CartaoDaCalculadora`. O DOM emitido é idêntico, e a
// extração é o que dá nome, no TypeScript, às duas unidades que o CSS já descrevia em
// `inicio.css`. `TelaInicio` volta a ter uma responsabilidade só: compor a moldura, a
// lista de seções e o bloco de apoio.
import { ArrowRightIcon } from "@primer/octicons-react";
import { Heading, Text } from "@primer/react";
import Link from "next/link";
import { Moldura } from "interface/comum/moldura";
import { BlocoDeApoio } from "interface/contribuicao/bloco-de-apoio";
import {
  CATALOGO,
  type FichaCalculadora,
  type SecaoDaPlataforma,
} from "./catalogo";
import { IconeDaSecao } from "./icones";

/**
 * Um cartão de calculadora. O `<a>` é único de propósito: é ele que o stretched link de
 * `inicio.css` expande à área inteira do cartão, e duplicar âncoras aqui quebraria tanto
 * a navegação por teclado quanto o `:focus-within` que desenha o foco (RF-05).
 */
function CartaoDaCalculadora({
  calculadora,
}: {
  readonly calculadora: FichaCalculadora;
}) {
  return (
    <li className="inicio-cartao">
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
  );
}

/**
 * Uma seção temática. O `aria-labelledby` aponta para o próprio `<h2>`, e é o que faz da
 * `<section>` uma região de nome acessível — o ícone ao lado é decorativo e não participa
 * do nome (RN-03).
 */
function SecaoDaHome({ secao }: { readonly secao: SecaoDaPlataforma }) {
  return (
    <section className="inicio-secao" aria-labelledby={`secao-${secao.id}`}>
      <div className="inicio-secao-cabecalho">
        <IconeDaSecao id={secao.id} />
        <Heading as="h2" id={`secao-${secao.id}`}>
          {secao.titulo}
        </Heading>
      </div>
      <ul className="inicio-cartoes">
        {secao.calculadoras.map((calculadora) => (
          <CartaoDaCalculadora
            key={calculadora.rota}
            calculadora={calculadora}
          />
        ))}
      </ul>
    </section>
  );
}

export function TelaInicio() {
  return (
    <Moldura
      titulo="APS Inteligente"
      subtitulo="Calculadoras clínicas para a Atenção Primária à Saúde · Cálculo 100% no navegador"
      apresentacao="destaque"
    >
      <div className="inicio-secoes">
        {CATALOGO.map((secao) => (
          <SecaoDaHome key={secao.id} secao={secao} />
        ))}
      </div>
      {/* Feature 019 (RF-05/RF-11; D-12): o bloco de apoio entra FORA do map do
          CATALOGO, que é fonte única de calculadoras e desde a 018 é também
          oráculo da descrição da plataforma. Um item que não calcula nada dentro
          dele corromperia o que ele significa. */}
      <BlocoDeApoio />
    </Moldura>
  );
}
