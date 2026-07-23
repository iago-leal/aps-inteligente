"use client";
// Moldura comum das telas da plataforma (feature 007, D-09; RF-05/RF-08):
// cabeçalho com identidade, selo de privacidade e alternador de tema — extraída
// byte a byte de interface/calculadora/tela.tsx (feature 004: componentes Primer;
// data-tema como marcador observável da preferência, RN-04 daquela feature).
// Feature 008 (RF-04/RF-07, D-05): variante de apresentação opcional — "destaque"
// dá ao cabeçalho peso de porta de entrada (usada pela home); "padrao" preserva
// as calculadoras. A variante é só CSS via data-apresentacao: a semântica (h1,
// selo, alternador) é idêntica nas duas (RN-02).
// Feature 009 (RF-01/RF-02/RF-05; RN-02/RN-03/RN-05): a logo APSi entra no
// cabeçalho de todas as telas, com a variante trocada pelo tema já lido aqui
// (D-02). Com logoComoTitulo (só a home, cujo wordmark É o h1), a logo é uma
// imagem DENTRO do h1 com alt igual ao título — o nome acessível do heading não
// muda. Sem a prop (calculadoras, cujo h1 é o nome da calculadora), a logo é
// marca decorativa (aria-hidden, alt vazio) fora do heading: não cria segundo
// h1 nem link novo (D-04). Os PNGs vivem em public/ (same-origin, sob a CSP).
// Nota: preferencia-de-tema.ts permanece em interface/calculadora/ porque o
// provedor de tema e sua suíte apontam para lá; realocação fica para re-extração.
// Feature 011 (RF-01/RF-03/RF-04; RN-01/RN-03): o alternador de tema deixa de ser
// um botão textual e vira IconButton, exibindo o glifo do tema-ALVO — sol quando
// o tema vigente é escuro (acionar clareia), lua quando é claro — com nome
// acessível "Ativar tema claro/escuro" (D-01/D-02). O cabeçalho ganha ainda um
// comando de início (IconButton renderizado por next/link, href="/", casa),
// exibido só quando logoComoTitulo é falso, isto é, nas calculadoras e nunca na
// home, onde seria redundante (D-03/D-04). A logo segue não-link (D-04 da 009):
// o único link do cabeçalho da calculadora é o comando de início.
import { IconButton, Heading, Label, Text } from "@primer/react";
import { HomeIcon, MoonIcon, SunIcon } from "@primer/octicons-react";
import Link from "next/link";
import { useSyncExternalStore, type ReactNode } from "react";
import {
  assinarTema,
  gravarTema,
  lerTema,
  lerTemaNoServidor,
} from "interface/calculadora/preferencia-de-tema";

export interface PropsMoldura {
  readonly titulo: string;
  readonly subtitulo: string;
  readonly apresentacao?: "padrao" | "destaque";
  readonly logoComoTitulo?: boolean;
  readonly children: ReactNode;
}

export function Moldura({
  titulo,
  subtitulo,
  apresentacao = "padrao",
  logoComoTitulo = false,
  children,
}: PropsMoldura) {
  const tema = useSyncExternalStore(assinarTema, lerTema, lerTemaNoServidor);
  const logoSrc = tema === "escuro" ? "/apsi-dark.png" : "/apsi-light.png";

  return (
    <div className="pagina" data-tema={tema} data-apresentacao={apresentacao}>
      <header className="cabecalho">
        <div className="cabecalho-identidade">
          {logoComoTitulo ? (
            <Heading as="h1">
              {/* eslint-disable-next-line @next/next/no-img-element -- ativo estático leve em public/, sem pipeline next/image (roadmap D-02) */}
              <img
                className="cabecalho-logo"
                src={logoSrc}
                alt={titulo}
                width={314}
                height={138}
              />
            </Heading>
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- marca decorativa; ver D-02/D-04 */}
              <img
                className="cabecalho-marca"
                src={logoSrc}
                alt=""
                aria-hidden="true"
                width={314}
                height={138}
              />
              <Heading as="h1">{titulo}</Heading>
            </>
          )}
          <Text as="p" size="small">
            {subtitulo}
          </Text>
        </div>
        <div className="cabecalho-acoes">
          {!logoComoTitulo && (
            <IconButton
              as={Link}
              href="/"
              size="small"
              icon={HomeIcon}
              aria-label="Início"
              className="cabecalho-inicio"
            />
          )}
          <Label variant="success" size="large">
            Nada é salvo nem enviado
          </Label>
          <IconButton
            type="button"
            size="small"
            icon={tema === "escuro" ? SunIcon : MoonIcon}
            aria-label={tema === "escuro" ? "Ativar tema claro" : "Ativar tema escuro"}
            onClick={() => gravarTema(tema === "escuro" ? "claro" : "escuro")}
          />
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
