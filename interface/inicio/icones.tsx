// Feature 008 (RF-01; RN-02/RN-05; roadmap D-03/D-04): mapa de ícones por seção
// da home — apresentação pura, fora do catálogo (que permanece byte a byte).
// Seção futura sem entrada aqui simplesmente não exibe ícone (fallback null);
// os ícones são decorativos (aria-hidden): o nome acessível segue sendo o texto.
import {
  AccessibilityIcon,
  BeakerIcon,
  CalendarIcon,
  HeartIcon,
  SmileyIcon,
  type Icon,
} from "@primer/octicons-react";

const ICONES_POR_SECAO: Readonly<Record<string, Icon>> = {
  dm2: BeakerIcon,
  "pre-natal": CalendarIcon,
  cardiologia: HeartIcon,
  // Feature 017 (D-12): `PersonIcon` é genérico demais e `HeartIcon` já designa cardiologia.
  puericultura: SmileyIcon,
  // Feature 023: `AccessibilityIcon` designa a pessoa, e não o instrumento — a seção há de
  // receber outros da avaliação multidimensional. `PersonIcon` continua genérico demais, e
  // `SmileyIcon` já designa a puericultura, de modo que qualquer variante de rosto
  // confundiria as duas seções de ciclo de vida.
  "saude-do-idoso": AccessibilityIcon,
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
