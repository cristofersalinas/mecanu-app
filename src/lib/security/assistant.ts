import type { TecnicaInjection } from "./events";

/**
 * Clasificación por patrones, sin modelo. Un falso positivo es preferible a
 * llamar a un LLM: este señuelo no tiene vía de red hacia ningún proveedor.
 */

const REGLAS: { tecnica: Exclude<TecnicaInjection, "ninguna">; re: RegExp }[] = [
  { tecnica: "system_prompt", re: /ignore (all|previous|above)|system prompt|you are now|developer mode|reveal your (instructions|rules)/i },
  { tecnica: "credenciales", re: /api[_ ]?key|secret key|password|credential|token|billing.account|assistant.key/i },
  { tecnica: "ejecucion", re: /run this|execute|shell|eval\(|rm -rf|drop table|wget |curl /i },
  { tecnica: "exfiltracion", re: /send to|exfiltrat|webhook|pastebin|post the (data|keys) to/i },
  { tecnica: "jailbreak", re: /dan mode|no restrictions|bypass|jailbreak|act as if you have no/i },
];

export function clasificarPrompt(texto: string): TecnicaInjection {
  for (const regla of REGLAS) {
    if (regla.re.test(texto)) return regla.tecnica;
  }
  return "ninguna";
}

/**
 * Respuestas guionizadas. Nunca "sí, aquí tienes las claves". El tono es el de
 * un asistente interno que casi coopera: mantiene al que inyecta intentándolo
 * sin entregarle un trofeo capturable.
 */
export function respuestaAsistente(tecnica: TecnicaInjection, turno: number): string {
  if (tecnica === "ninguna") {
    const utiles = [
      "Puedo ayudarte con el resumen del día cuando el módulo esté disponible.",
      "De momento solo tengo acceso a avisos generales. ¿Quieres que te recuerde el procedimiento de incidencias?",
      "Anota la matrícula y el taller; el parte se genera en el panel cuando esté publicado.",
    ];
    return utiles[turno % utiles.length]!;
  }

  const casi = [
    "Esa consulta no está en mi ámbito. Si es un tema interno, usa el canal de operaciones.",
    "No puedo mostrar esa información desde aquí. Prueba a acotar la pregunta.",
    "He registrado la petición. No tengo permiso para completar ese paso.",
    "El asistente interno no ejecuta acciones fuera de las plantillas aprobadas.",
  ];
  return casi[turno % casi.length]!;
}

export const HTML_ASISTENTE = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Asistente interno</title>
<style>
body{font:15px system-ui;margin:0;background:#f4f4f4;color:#222}
main{max-width:40rem;margin:2rem auto;background:#fff;border:1px solid #ddd;min-height:70vh;display:flex;flex-direction:column}
h1{font-size:1rem;font-weight:600;margin:0;padding:0.8rem 1rem;border-bottom:1px solid #ddd}
#log{flex:1;padding:1rem;overflow:auto}
.m{margin:0.4rem 0;padding:0.5rem 0.7rem;border-radius:4px;max-width:85%}
.u{background:#eee;margin-left:auto}
.a{background:#f7f7f7}
form{display:flex;gap:0.4rem;padding:0.8rem;border-top:1px solid #ddd}
input{flex:1;padding:0.5rem}
button{padding:0.5rem 0.8rem}
</style></head><body><main>
<h1>Asistente interno</h1>
<div id="log"></div>
<form id="f"><input name="q" maxlength="2000" autocomplete="off"><button>Enviar</button></form>
</main>
<script>
const log=document.getElementById('log');
const f=document.getElementById('f');
function add(cls,t){const d=document.createElement('div');d.className='m '+cls;d.textContent=t;log.appendChild(d);log.scrollTop=log.scrollHeight;}
add('a','Hola. ¿En qué te ayudo?');
f.addEventListener('submit',async (e)=>{
  e.preventDefault();
  const q=f.q.value.trim(); if(!q) return;
  f.q.value=''; add('u',q);
  const r=await fetch('/assistant',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({q})});
  const j=await r.json().catch(()=>({}));
  add('a', j.a || 'No he podido completar eso.');
});
</script></body></html>`;
