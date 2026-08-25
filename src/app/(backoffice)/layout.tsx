import { ConMarcoDemo } from '@/components/entorno/ConMarcoDemo';

/** Cinta demo en todo `/backoffice/*`. */
export default function BackofficeLayout({ children }: { children: React.ReactNode }) {
  return <ConMarcoDemo>{children}</ConMarcoDemo>;
}
