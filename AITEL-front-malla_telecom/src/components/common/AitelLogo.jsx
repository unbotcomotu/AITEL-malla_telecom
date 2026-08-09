import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

// El isotipo tiene dos versiones que solo se diferencian en la "cola" inferior:
// navy para fondos claros, blanca para fondos oscuros. El degradado azul es el
// mismo en ambas, asi que la marca se ve igual en los tres temas y solo se
// adapta la parte que si necesitaba contraste.
//
// "light" / "dark" describen el FONDO sobre el que se apoya, no el color del
// logo: isotipo-light.png es el que va sobre fondo claro.
const TEMAS_OSCUROS = new Set(['bitacora']);

const ARCHIVOS = {
  isotipo: { light: '/marca/isotipo-light.png', dark: '/marca/isotipo-dark.png' },
  lockup: { light: '/marca/lockup-light.png', dark: '/marca/lockup-dark.png' },
};

/**
 * @param {'isotipo'|'lockup'} variant  isotipo = solo el domo; lockup = domo + AITEL + bajada
 * @param {boolean} forceDark           forzar la version para fondo oscuro, util cuando el
 *                                      logo va sobre una foto o un panel oscuro fijo que no
 *                                      sigue el tema
 */
const AitelLogo = ({ variant = 'isotipo', forceDark = false, className = '', alt = 'AITEL' }) => {
  const { theme } = useTheme();
  const sobreFondoOscuro = forceDark || TEMAS_OSCUROS.has(theme);
  const src = ARCHIVOS[variant][sobreFondoOscuro ? 'dark' : 'light'];

  return (
    <img
      src={src}
      alt={alt}
      draggable="false"
      className={`select-none object-contain ${className}`}
    />
  );
};

export default AitelLogo;
