'use client';

import { TrasladosView } from './TrasladosView';

export function TableroView({ agendarPeticion }: { agendarPeticion: number }) {
  return <TrasladosView agendarPeticion={agendarPeticion} />;
}
