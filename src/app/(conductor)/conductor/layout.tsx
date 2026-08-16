import type { Metadata, Viewport } from 'next';

/**
 * Metadata de PWA acotada a `/conductor`. Deliberadamente NO va en
 * `src/app/layout.tsx`: el manifest, los meta de "apple-mobile-web-app" y el
 * theme-color solo deben aparecer en el HTML de la app del conductor — el
 * panel del taller (`/panel`) es una web de escritorio normal y no debe
 * ofrecerse como "instalable".
 *
 * Colores tomados de `src/styles/ds/tokens/colors.css`:
 *  - background_color: --mecanu-neutral-900 (#161718)
 *  - theme_color:      --mecanu-electric-300 (#78FAAE)
 */
export const metadata: Metadata = {
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Mecanu',
    statusBarStyle: 'black-translucent',
  },
};

export const viewport: Viewport = {
  themeColor: '#78FAAE',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function ConductorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
