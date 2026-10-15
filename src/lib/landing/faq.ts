/**
 * Fuente única del FAQ público, por idioma.
 *
 * Google exige que el contenido del `FAQPage` en JSON-LD sea el mismo que el
 * visible en la página. Por eso vive aquí y lo consumen tanto `LandingPage`
 * (render visible) como `JsonLd` (datos estructurados) — si se duplicara,
 * cualquier edición dejaría uno de los dos desincronizado y Google lo trataría
 * como incumplimiento de sus políticas de datos estructurados.
 */

import type { Locale } from "@/lib/landing/locales";

export type FaqItem = { q: string; a: string };

export const FAQ_LANDING: readonly FaqItem[] = [
  {
    q: "¿En qué se diferencia Mecanu de una grúa?",
    a: "Una grúa mueve coches que no arrancan y cobra por urgencia. Mecanu mueve coches que funcionan, con un conductor al volante, en una ventana horaria acordada y a una fracción del coste. Si el coche no arranca sigues necesitando una grúa.",
  },
  {
    q: "¿Es lo mismo que un mecánico a domicilio?",
    a: "No. El mecánico a domicilio repara en la calle o en el garaje del cliente, con las limitaciones que eso tiene. Mecanu lleva el coche a tu taller, donde tienes elevador, herramienta y diagnóstico. El cliente gana la comodidad sin que tú pierdas las condiciones de trabajo.",
  },
  {
    q: "¿Qué pasa si el conductor daña el coche de mi cliente?",
    a: "El seguro de traslado no va en todos los viajes. Es un añadido: si el taller lo contrata, cubre el trayecto desde las llaves hasta la entrega, conduzca alguien del taller o de la flota de Mecanu.",
  },
  {
    q: "¿Tengo que usar los conductores de Mecanu?",
    a: "No. Con flota propia, tus conductores usan la plataforma logística: rutas, ventana, check-in y check-out. Con flota externa, el traslado lo hace un conductor de Mecanu cuando tú no llegas. Puedes combinar las dos. El seguro de traslado se añade aparte, si lo quieres.",
  },
  {
    q: "¿En qué ciudades funciona Mecanu?",
    a: "Madrid y Barcelona, incluidas sus áreas metropolitanas, con un radio de hasta 40 km desde el taller. En Madrid cubrimos Alcobendas, Pozuelo, Las Rozas, Getafe, Leganés, Alcorcón, Móstoles, Alcalá y Torrejón. En Barcelona, L'Hospitalet, Badalona, Sabadell, Terrassa, Cornellà, Sant Cugat y El Prat.",
  },
  {
    q: "¿Sirve para llevar coches a la ITV?",
    a: "Sí, es uno de los usos más frecuentes. El taller gestiona la cita y Mecanu hace el trayecto de ida y vuelta sin que el cliente pierda la mañana. Lo mismo aplica para llevar un coche a chapa, a un especialista o entre dos naves propias.",
  },
  {
    q: "¿Necesito instalar algún programa en el taller?",
    a: "No. Mecanu es una aplicación web: se abre desde el ordenador de recepción o desde una tablet, sin instalar nada. Los conductores usan su propio móvil para documentar el traslado con fotos.",
  },
  {
    q: "¿Para qué tamaño de taller tiene sentido?",
    a: "Funciona mejor en talleres de 3 a 30 empleados con flujo constante de vehículos de cliente. Si reparas solo flotas propias o eres un concesionario con logística interna, probablemente no lo necesitas.",
  },
  {
    q: "¿Cuánto tarda un traslado?",
    a: "Se acuerda siempre una ventana de una hora, nunca una hora exacta, porque el tráfico de Madrid y Barcelona hace que prometer minutos sea mentir. Si no hay ventana confirmada, la ficha lo dice explícitamente en lugar de inventar una estimación.",
  },
  {
    q: "¿Puedo ver dónde está el coche mientras se mueve?",
    a: "Sí. El panel muestra el estado de cada traslado en tiempo real, con fotos del vehículo al recoger y al entregar, y registro de cada paso. Si un cliente llama preguntando, tienes la respuesta en pantalla.",
  },
  {
    q: "¿Sustituye Mecanu al software de gestión, el tempario o el escáner?",
    a: "No. El DMS, GT Motive, Audatex, Autel, Launch o Bosch siguen siendo tuyos. Mecanu no hace recambios, facturación ni diagnosis: solo mueve el coche entre el cliente y la nave.",
  },
  {
    q: "¿Sirve para clientes de Volkswagen, BMW, Audi o Mercedes?",
    a: "Sí. Mecanu no es taller oficial de ninguna marca. Lleva el coche al taller que elijas — independiente o de marca — igual que el concesionario ofrece recogida como servicio extra.",
  },
  {
    q: "¿Qué hago si el cliente no recoge el coche terminado?",
    a: "Devuélvelo en una ventana acordada en lugar de dejarlo ocupando plaza. Es el uso más frecuente junto con la recogida inicial y el traslado a ITV.",
  },
] as const;

const FAQ_CA: readonly FaqItem[] = [
  {
    q: "En què es diferencia Mecanu d'una grua?",
    a: "Una grua mou cotxes que no arrenquen i cobra per urgència. Mecanu mou cotxes que funcionen, amb un conductor al volant, en una finestra horària acordada i a una fracció del cost. Si el cotxe no arrenca continues necessitant una grua.",
  },
  {
    q: "És el mateix que un mecànic a domicili?",
    a: "No. El mecànic a domicili repara al carrer o al garatge del client, amb les limitacions que això té. Mecanu porta el cotxe al teu taller, on tens elevador, eina i diagnòstic. El client guanya la comoditat sense que tu perdis les condicions de treball.",
  },
  {
    q: "Què passa si el conductor fa malbé el cotxe del meu client?",
    a: "L'assegurança de trasllat no va en tots els viatges. És un afegit: si el taller la contracta, cobreix el trajecte des de les claus fins al lliurament, condueixi algú del taller o de la flota de Mecanu.",
  },
  {
    q: "He d'usar els conductors de Mecanu?",
    a: "No. Amb flota pròpia, els teus conductors usen la plataforma logística. Amb flota externa, el trasllat el fa un conductor de Mecanu quan tu no arribes. Pots combinar les dues. L'assegurança de trasllat s'afegeix a part, si la vols.",
  },
  {
    q: "En quines ciutats funciona Mecanu?",
    a: "Madrid i Barcelona, incloses les àrees metropolitanes, amb un radi de fins a 40 km des del taller. A Madrid cobrim Alcobendas, Pozuelo, Las Rozas, Getafe, Leganés, Alcorcón, Móstoles, Alcalá i Torrejón. A Barcelona, l'Hospitalet, Badalona, Sabadell, Terrassa, Cornellà, Sant Cugat i el Prat.",
  },
  {
    q: "Serveix per portar cotxes a la ITV?",
    a: "Sí, és un dels usos més freqüents. El taller gestiona la cita i Mecanu fa el trajecte d'anada i tornada sense que el client perdi el matí. El mateix val per portar un cotxe a planxa, a un especialista o entre dues naus pròpies.",
  },
  {
    q: "Necessito instal·lar cap programa al taller?",
    a: "No. Mecanu és una aplicació web: s'obre des de l'ordinador de recepció o des d'una tauleta, sense instal·lar res. Els conductors fan servir el seu propi mòbil per documentar el trasllat amb fotos.",
  },
  {
    q: "Per a quina mida de taller té sentit?",
    a: "Funciona millor en tallers de 3 a 30 empleats amb flux constant de vehicles de client. Si reparares només flotes pròpies o ets un concessionari amb logística interna, probablement no el necessites.",
  },
  {
    q: "Quant tarda un trasllat?",
    a: "S'acorda sempre una finestra d'una hora, mai una hora exacta, perquè el trànsit de Madrid i Barcelona fa que prometre minuts sigui mentir. Si no hi ha finestra confirmada, la fitxa ho diu explícitament en lloc d'inventar una estimació.",
  },
  {
    q: "Puc veure on és el cotxe mentre es mou?",
    a: "Sí. El panell mostra l'estat de cada trasllat en temps real, amb fotos del vehicle en recollir i en lliurar, i registre de cada pas. Si un client truca preguntant, tens la resposta a la pantalla.",
  },
  {
    q: "Substitueix Mecanu el programari de gestió, el tempari o l'escàner?",
    a: "No. El DMS, GT Motive, Audatex, Autel, Launch o Bosch continuen sent teus. Mecanu no fa recanvis, facturació ni diagnosi: només mou el cotxe entre el client i la nau.",
  },
  {
    q: "Serveix per a clients de Volkswagen, BMW, Audi o Mercedes?",
    a: "Sí. Mecanu no és taller oficial de cap marca. Porta el cotxe al taller que triïs — independent o de marca — igual que el concessionari ofereix la recollida com a servei extra.",
  },
  {
    q: "Què faig si el client no recull el cotxe acabat?",
    a: "Torna-l'hi en una finestra acordada en lloc de deixar-lo ocupant plaça. És l'ús més freqüent juntament amb la recollida inicial i el trasllat a la ITV.",
  },
];

const FAQ_EN: readonly FaqItem[] = [
  {
    q: "How is Mecanu different from a tow truck?",
    a: "A tow truck moves cars that will not start, and it charges for the emergency. Mecanu moves cars that run, with a driver at the wheel, in an agreed one-hour window, at a fraction of the cost. If the car will not start, you still need a tow truck.",
  },
  {
    q: "Is it the same as a mobile mechanic?",
    a: "No. A mobile mechanic repairs on the street or in the customer's garage, with the limits that implies. Mecanu brings the car to your shop, where you have the lift, the tools and the diagnostics. The customer gets the convenience without you losing your working conditions.",
  },
  {
    q: "What if the driver damages my customer's car?",
    a: "Transfer insurance is not on every trip. It is an add-on: if the shop opts in, it covers the journey from keys to delivery, whether the driver is the shop's or Mecanu's.",
  },
  {
    q: "Do I have to use Mecanu drivers?",
    a: "No. With your own fleet, your drivers use the logistics platform. With Mecanu's fleet, a Mecanu driver runs the transfer when you cannot. You can mix both. Transfer insurance is optional.",
  },
  {
    q: "Which cities does Mecanu cover?",
    a: "Madrid and Barcelona, including their metro areas, within 40 km of the shop. In Madrid that includes Alcobendas, Pozuelo, Las Rozas, Getafe, Leganés, Alcorcón, Móstoles, Alcalá and Torrejón. In Barcelona, L'Hospitalet, Badalona, Sabadell, Terrassa, Cornellà, Sant Cugat and El Prat.",
  },
  {
    q: "Can it take cars to the ITV inspection?",
    a: "Yes. It is one of the most common uses. The shop books the slot and Mecanu does the round trip so the customer does not lose the morning. The same applies to bodywork, a specialist, or a move between two of your own sites.",
  },
  {
    q: "Do I need to install anything in the shop?",
    a: "No. Mecanu is a web app: it opens on the reception computer or a tablet, with nothing to install. Drivers use their own phone to document the run with photos.",
  },
  {
    q: "What size of shop is it for?",
    a: "It fits shops with 3 to 30 people and a steady flow of customer cars. If you only repair your own fleet, or you are a dealer with in-house logistics, you probably do not need it.",
  },
  {
    q: "How long does a run take?",
    a: "It is always agreed as a one-hour window, never an exact time, because traffic in Madrid and Barcelona makes a promise of minutes a lie. If no window is confirmed, the job says so instead of inventing an estimate.",
  },
  {
    q: "Can I see where the car is while it is moving?",
    a: "Yes. The panel shows each run in real time, with photos at pickup and delivery, and a log of every step. If a customer calls, the answer is on screen.",
  },
  {
    q: "Does Mecanu replace the shop software, the labour guide or the scanner?",
    a: "No. The DMS, GT Motive, Audatex, Autel, Launch or Bosch stay yours. Mecanu does not do parts, invoicing or diagnostics: it only moves the car between the customer and the workshop.",
  },
  {
    q: "Does it work for Volkswagen, BMW, Audi or Mercedes customers?",
    a: "Yes. Mecanu is not an official workshop for any brand. It takes the car to the shop you choose — independent or franchised — the same way a dealer offers collection as an extra.",
  },
  {
    q: "What if the customer does not collect the finished car?",
    a: "Send it back in an agreed window instead of leaving it in a bay. That is the most common use, along with the first collection and the ITV run.",
  },
];

const FAQ_PT: readonly FaqItem[] = [
  {
    q: "Em que é que a Mecanu difere de um reboque?",
    a: "Um reboque move carros que não pegam e cobra pela urgência. A Mecanu move carros que circulam, com um condutor ao volante, numa janela de uma hora combinada e por uma fração do custo. Se o carro não pega, continuas a precisar de um reboque.",
  },
  {
    q: "É o mesmo que um mecânico ao domicílio?",
    a: "Não. O mecânico ao domicílio repara na rua ou na garagem do cliente, com os limites que isso tem. A Mecanu leva o carro à tua oficina, onde tens elevador, ferramenta e diagnóstico. O cliente ganha o conforto sem tu perderes as condições de trabalho.",
  },
  {
    q: "O que acontece se o condutor danificar o carro do meu cliente?",
    a: "O seguro de traslado não vai em todas as viagens. É um extra: se a oficina o contratar, cobre o percurso desde as chaves até à entrega, conduza alguém da oficina ou da frota Mecanu.",
  },
  {
    q: "Tenho de usar os condutores da Mecanu?",
    a: "Não. Com frota própria, os teus condutores usam a plataforma logística. Com frota externa, um condutor da Mecanu faz o traslado quando não chegas. Podes combinar as duas. O seguro de traslado é opcional.",
  },
  {
    q: "Em que cidades funciona a Mecanu?",
    a: "Madrid e Barcelona, incluindo as áreas metropolitanas, num raio de até 40 km da oficina. Em Madrid cobrimos Alcobendas, Pozuelo, Las Rozas, Getafe, Leganés, Alcorcón, Móstoles, Alcalá e Torrejón. Em Barcelona, L'Hospitalet, Badalona, Sabadell, Terrassa, Cornellà, Sant Cugat e El Prat.",
  },
  {
    q: "Serve para levar carros à inspeção (ITV)?",
    a: "Sim, é um dos usos mais frequentes. A oficina marca a inspeção e a Mecanu faz a ida e a volta sem o cliente perder a manhã. O mesmo vale para chapa, um especialista ou entre duas naves tuas.",
  },
  {
    q: "Preciso de instalar algum programa na oficina?",
    a: "Não. A Mecanu é uma aplicação web: abre-se no computador da receção ou num tablet, sem instalar nada. Os condutores usam o próprio telemóvel para documentar a recolha com fotos.",
  },
  {
    q: "Para que tamanho de oficina faz sentido?",
    a: "Funciona melhor em oficinas de 3 a 30 pessoas com fluxo constante de carros de cliente. Se só reparas frotas próprias ou és um concessionário com logística interna, provavelmente não precisas.",
  },
  {
    q: "Quanto tempo demora uma recolha?",
    a: "Combina-se sempre uma janela de uma hora, nunca uma hora exata, porque o trânsito de Madrid e Barcelona faz com que prometer minutos seja mentir. Se não há janela confirmada, a ficha diz isso em vez de inventar uma estimativa.",
  },
  {
    q: "Posso ver onde está o carro enquanto se move?",
    a: "Sim. O painel mostra o estado de cada recolha em tempo real, com fotos do veículo na recolha e na entrega, e um registo de cada passo. Se um cliente liga, a resposta está no ecrã.",
  },
  {
    q: "A Mecanu substitui o software de gestão, o tempario ou o scanner?",
    a: "Não. O DMS, GT Motive, Audatex, Autel, Launch ou Bosch continuam a ser teus. A Mecanu não faz peças, faturação nem diagnóstico: só move o carro entre o cliente e a nave.",
  },
  {
    q: "Serve para clientes Volkswagen, BMW, Audi ou Mercedes?",
    a: "Sim. A Mecanu não é oficina oficial de nenhuma marca. Leva o carro à oficina que escolheres — independente ou de marca — tal como o concessionário oferece a recolha como serviço extra.",
  },
  {
    q: "O que faço se o cliente não levantar o carro pronto?",
    a: "Devolve-o numa janela combinada em vez de o deixar a ocupar lugar. É o uso mais frequente, a par da recolha inicial e da ida à inspeção.",
  },
];

const FAQ_POR_IDIOMA: Record<Locale, readonly FaqItem[]> = {
  es: FAQ_LANDING,
  ca: FAQ_CA,
  en: FAQ_EN,
  pt: FAQ_PT,
};

export function faqFor(locale: Locale): readonly FaqItem[] {
  return FAQ_POR_IDIOMA[locale];
}
