import { ConMarcoDemo } from '@/components/entorno/ConMarcoDemo';

/** Cinta demo en todo `/panel/*` (app + login/registro). */
export default function TallerLayout({ children }: { children: React.ReactNode }) {
  return <ConMarcoDemo>{children}</ConMarcoDemo>;
}
