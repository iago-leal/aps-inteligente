// Feature 008 (RF-01; RN-02/RN-05; roadmap D-03/D-04): mapa de ícones por seção
// da home — apresentação pura, fora do catálogo (que permanece byte a byte).
// Seção futura sem entrada aqui simplesmente não exibe ícone (fallback null);
// os ícones são decorativos (aria-hidden): o nome acessível segue sendo o texto.
import { BeakerIcon, CalendarIcon, type Icon } from "@primer/octicons-react";

const ICONES_POR_SECAO: Readonly<Record<string, Icon>> = {
  dm2: BeakerIcon,
  "pre-natal": CalendarIcon,
};

export function IconeDaSecao({ id }: { readonly id: string }) {
  const Icone = ICONES_POR_SECAO[id];
  if (!Icone) {
    return null;
  }
  return (
    <span className="inicio-secao-icone" aria-hidden="true">
      <Icone size={16} aria-hidden="true" />
    </span>
  );
}
