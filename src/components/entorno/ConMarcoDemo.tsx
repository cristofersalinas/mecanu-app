import { esModoDemo } from '@/lib/entorno';
import css from './ConMarcoDemo.module.css';

/** Cinta solo con `npm run demo`. En mecanu.com no se pinta. */
export function ConMarcoDemo({ children }: { children: React.ReactNode }) {
  if (!esModoDemo()) return children;
  return (
    <div className={css.marco}>
      <div className={css.barra} role="status">
        Modo demo en tu Mac · no es mecanu.com · para quitar Simular: npm run dev
      </div>
      {children}
    </div>
  );
}
