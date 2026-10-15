export type NumeroKapsoVista = {
  phoneNumberId: string;
  kind: string;
  displayPhoneNumber: string | null;
  sandbox: boolean;
};

export function clasificarNumeroKapso(raw: {
  id?: unknown;
  phone_number_id?: unknown;
  kind?: unknown;
  display_phone_number?: unknown;
}): NumeroKapsoVista | null {
  const phoneNumberId =
    typeof raw.phone_number_id === "string"
      ? raw.phone_number_id
      : typeof raw.id === "string"
        ? raw.id
        : "";
  if (!phoneNumberId) return null;
  const kind = typeof raw.kind === "string" ? raw.kind : "unknown";
  const display =
    typeof raw.display_phone_number === "string" ? raw.display_phone_number : null;
  return {
    phoneNumberId,
    kind,
    displayPhoneNumber: display,
    sandbox: kind === "sandbox",
  };
}

export function tallerWhatsappConectado(numeros: NumeroKapsoVista[]): boolean {
  return numeros.some((n) => !n.sandbox);
}
