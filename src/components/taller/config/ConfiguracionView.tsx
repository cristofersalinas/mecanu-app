'use client';

import { useState } from 'react';
import { Badge } from '@/components/ds/Badge';
import { Button } from '@/components/ds/Button';
import { Icon } from '@/components/ds/Icon';
import { Switch } from '@/components/ds/Switch';
import { Empresa, DIAS_LABEL, Perfil, PlantillaRecepcion, Sucursal, usePanel } from '../store';
import { Dialog, Input, SectionCard, Select } from '../ui/Primitives';
import { TutorialesView } from '../onboarding/OnboardingTaller';
import { SeccionWhatsApp } from '../whatsapp/WhatsAppConfig';
import styles from '../panel.module.css';

const SECCIONES = [
  { id: 'perfil', label: 'Perfil', icon: 'person' },
  { id: 'aprender', label: 'Aprender', icon: 'school' },
  { id: 'empresa', label: 'Empresa', icon: 'domain' },
  { id: 'sucursales', label: 'Sucursales', icon: 'store' },
  { id: 'recepcion', label: 'Recepción', icon: 'checklist' },
  { id: 'whatsapp', label: 'WhatsApp', icon: 'chat' },
];

export function ConfiguracionView() {
  const p = usePanel();
  const seccion = SECCIONES.some((s) => s.id === p.sub) ? p.sub : 'perfil';

  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: 4 }}>
      <div style={{ maxWidth: 980, margin: '0 0 24px' }}>
        <p style={{ margin: '0 0 16px', fontSize: 13, lineHeight: '18px', color: 'var(--mecanu-text-secondary-light)' }}>
          Gestiona tu perfil, los datos del taller y WhatsApp.
        </p>
        <div style={{ display: 'inline-flex', gap: 2, padding: 3, background: 'var(--mecanu-neutral-25)', borderRadius: 10 }}>
          {SECCIONES.map((s) => {
            const activa = seccion === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => p.irA('config', s.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7, height: 34, padding: '0 14px', border: 'none',
                  borderRadius: 8, background: activa ? 'var(--mecanu-neutral-0)' : 'transparent',
                  boxShadow: activa ? '0 1px 3px rgba(22,23,24,.12)' : 'none', font: 'inherit', fontSize: 13,
                  fontWeight: activa ? 700 : 500, color: activa ? 'var(--mecanu-text-primary-light)' : 'var(--mecanu-text-secondary-light)',
                  cursor: 'pointer',
                }}
              >
                <Icon name={s.icon} size="sm" />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {seccion === 'perfil' ? <SeccionPerfil /> : null}
      {seccion === 'aprender' ? <TutorialesView /> : null}
      {seccion === 'empresa' ? <SeccionEmpresa /> : null}
      {seccion === 'sucursales' ? <SeccionSucursales /> : null}
      {seccion === 'recepcion' ? <SeccionRecepcion /> : null}
      {seccion === 'whatsapp' ? <SeccionWhatsApp /> : null}
    </div>
  );
}

/* ------------------------- Perfil ------------------------- */

function SeccionPerfil() {
  const p = usePanel();
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState<Perfil>(p.perfil);
  const [invitarEmail, setInvitarEmail] = useState('');
  const [invitarNombre, setInvitarNombre] = useState('');

  const emailError = form.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email) ? 'Email no válido' : undefined;

  const campos: [string, string][] = [
    ['Nombre', `${p.perfil.nombre} ${p.perfil.apellidos}`],
    ['Cargo', p.perfil.cargo],
    ['Email', p.perfil.email],
    ['Teléfono', p.perfil.telefono],
    ['Idioma', p.perfil.idioma],
    ['Zona horaria', p.perfil.zona],
  ];

  return (
    <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 24 }}>
      <div className={styles.panelBox} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20 }}>
        <div
          style={{
            flex: 'none', width: 60, height: 60, borderRadius: '50%', background: 'var(--mecanu-brand-primary-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800,
            color: 'var(--mecanu-neutral-0)',
          }}
        >
          {(p.perfil.nombre[0] ?? '') + (p.perfil.apellidos[0] ?? '')}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 700 }}>{p.perfil.nombre} {p.perfil.apellidos}</div>
          <div style={{ fontSize: 13, color: 'var(--mecanu-text-secondary-light)' }}>{p.perfil.cargo}</div>
          <div style={{ fontSize: 12, color: 'var(--mecanu-neutral-300)' }}>{p.perfil.email}</div>
        </div>
        {!editando ? (
          <Button kind="secondary" size="compact" icon="edit" onClick={() => { setForm(p.perfil); setEditando(true); }}>
            Editar perfil
          </Button>
        ) : null}
      </div>

      {!editando ? (
        <SectionCard title="Datos personales">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '0 32px' }}>
            {campos.map(([k, v]) => (
              <div key={k} className={styles.rowKV}>
                <span>{k}</span>
                <span>{v}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : (
        <SectionCard title="Editar datos personales">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
            <Input label="Nombre" value={form.nombre} onChange={(v) => setForm({ ...form, nombre: v })} fullWidth />
            <Input label="Apellidos" value={form.apellidos} onChange={(v) => setForm({ ...form, apellidos: v })} fullWidth />
            <div style={{ gridColumn: '1 / -1' }}>
              <Input label="Cargo" value={form.cargo} onChange={(v) => setForm({ ...form, cargo: v })} fullWidth />
            </div>
            <Input label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} error={emailError} fullWidth />
            <Input label="Teléfono" value={form.telefono} onChange={(v) => setForm({ ...form, telefono: v })} fullWidth />
            <Select
              label="Idioma"
              options={[{ value: 'Español (es-ES)', label: 'Español (es-ES)' }, { value: 'Català', label: 'Català' }]}
              value={form.idioma}
              onChange={(v) => setForm({ ...form, idioma: v })}
              fullWidth
            />
            <Select
              label="Zona horaria"
              options={[{ value: 'Europe/Madrid', label: 'Europe/Madrid' }, { value: 'Atlantic/Canary', label: 'Atlantic/Canary' }]}
              value={form.zona}
              onChange={(v) => setForm({ ...form, zona: v })}
              fullWidth
            />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--mecanu-border-subtle)' }}>
            <Button kind="tertiary" size="compact" onClick={() => setEditando(false)}>Cancelar</Button>
            <Button
              kind="primary"
              size="compact"
              disabled={!!emailError || !form.nombre.trim()}
              onClick={() => { p.setPerfil(form); setEditando(false); p.toast('Perfil actualizado.'); }}
            >
              Guardar cambios
            </Button>
          </div>
        </SectionCard>
      )}

      <SectionCard title="Equipo" description="2 asientos incluidos: tú y un colaborador. Mismos roles salvo pagos y cancelar. La invitación se queda en bandeja hasta que Auth esté conectado.">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, alignItems: 'end' }}>
          <Input label="Nombre" value={invitarNombre} onChange={setInvitarNombre} fullWidth />
          <Input label="Email" value={invitarEmail} onChange={setInvitarEmail} fullWidth />
          <Button
            kind="secondary"
            size="compact"
            disabled={!invitarNombre.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(invitarEmail)}
            onClick={() => {
              p.toast(`Invitación para ${invitarEmail} guardada en bandeja (aún no se envía).`);
              setInvitarEmail('');
              setInvitarNombre('');
            }}
          >
            Invitar
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Notificaciones" description="Avisos de traslados, presupuestos y campañas dirigidos a tu cuenta.">
        {[
          ['email', 'Avisos por email', 'Resumen diario y alertas al correo.'],
          ['whatsapp', 'Avisos por WhatsApp', 'Notificaciones al número asociado a tu cuenta.'],
        ].map(([k, t, d]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: '1px solid var(--mecanu-border-subtle)' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{t}</div>
              <div style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>{d}</div>
            </div>
            <Switch
              checked={p.prefs[k as 'email' | 'whatsapp']}
              onChange={(v) => p.setPref(k as 'email' | 'whatsapp', v)}
            />
          </div>
        ))}
      </SectionCard>

      <SectionCard title="Seguridad">
        <p style={{ margin: '0 0 12px', fontSize: 12, lineHeight: '16px', color: 'var(--mecanu-text-secondary-light)' }}>
          El acceso con cuenta aún no está conectado. Cuando lo esté, cambiarás la contraseña y el doble paso aquí. Ahora
          los toggles no envían nada fuera del panel.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: '1px solid var(--mecanu-border-subtle)' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Contraseña</div>
            <div style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>Pendiente de Auth. No se guarda en el servidor.</div>
          </div>
          <Button kind="secondary" size="compact" icon="lock" disabled onClick={() => undefined}>Aún no conectado</Button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Verificación en dos pasos</span>
              <Badge kind="neutral">Sin Auth</Badge>
            </div>
            <div style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>Llegará con el acceso real. El interruptor de abajo es solo local.</div>
          </div>
          <Switch checked={p.prefs.doblePaso} onChange={(v) => p.setPref('doblePaso', v)} />
        </div>
      </SectionCard>
    </div>
  );
}

/* ------------------------- Empresa ------------------------- */

function SeccionEmpresa() {
  const p = usePanel();
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState<Empresa>(p.empresa);

  const grupos: { titulo: string; campos: { key: keyof Empresa; label: string; editable: boolean }[] }[] = [
    {
      titulo: 'Identificación',
      campos: [
        { key: 'razonSocial', label: 'Razón social', editable: true },
        { key: 'nombreComercial', label: 'Nombre comercial', editable: true },
        { key: 'cif', label: 'CIF', editable: false },
      ],
    },
    {
      titulo: 'Contacto',
      campos: [
        { key: 'direccion', label: 'Dirección fiscal', editable: true },
        { key: 'telefono', label: 'Teléfono', editable: true },
        { key: 'email', label: 'Email', editable: true },
        { key: 'web', label: 'Web', editable: true },
      ],
    },
    {
      titulo: 'Facturación',
      campos: [
        { key: 'iban', label: 'IBAN', editable: true },
        { key: 'regimenIva', label: 'Régimen de IVA', editable: false },
      ],
    },
    {
      titulo: 'Mecanu',
      campos: [{ key: 'altaMecanu', label: 'Alta en Mecanu', editable: false }],
    },
  ];

  return (
    <div style={{ maxWidth: 880, paddingBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <h2 style={{ margin: 0, fontSize: 16, lineHeight: '22px', fontWeight: 700 }}>Detalles de la empresa</h2>
        {!editando ? (
          <button type="button" className={styles.iconBtn} style={{ width: 26, height: 26 }} aria-label="Editar empresa" onClick={() => { setForm(p.empresa); setEditando(true); }}>
            <Icon name="edit" size="sm" />
          </button>
        ) : null}
      </div>
      <p style={{ margin: '0 0 18px', fontSize: 13, lineHeight: '18px', color: 'var(--mecanu-text-secondary-light)' }}>
        Datos del taller que se usan en presupuestos, comunicaciones al cliente y documentos.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(360px,1fr))', gap: '24px 40px' }}>
        {grupos.map((g) => (
          <div key={g.titulo}>
            <div className={styles.eyebrow} style={{ marginBottom: 8 }}>{g.titulo}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: editando ? 8 : 0 }}>
              {g.campos.map((c) => (
                editando && c.editable ? (
                  <Input
                    key={c.key}
                    label={c.label}
                    value={form[c.key]}
                    onChange={(v) => setForm({ ...form, [c.key]: v })}
                    fullWidth
                  />
                ) : (
                  <div key={c.key} className={styles.rowKV}>
                    <span>{c.label}</span>
                    <span>{(editando ? form : p.empresa)[c.key]}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        ))}
      </div>

      {editando ? (
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--mecanu-border)' }}>
          <Button kind="tertiary" size="compact" onClick={() => setEditando(false)}>Cancelar</Button>
          <Button kind="primary" size="compact" onClick={() => { p.setEmpresa(form); setEditando(false); p.toast('Datos de la empresa guardados.'); }}>
            Guardar cambios
          </Button>
        </div>
      ) : null}
    </div>
  );
}

/* ------------------------- Sucursales ------------------------- */

const SUC_VACIA = (): Sucursal => ({
  id: `SUC-${Date.now()}`, nombre: '', codigo: '', direccion: '', ubicacion: '', telefono: '', email: '',
  responsable: '', plazas: 0, elevadores: 0, principal: false, activa: true,
  horario: DIAS_LABEL.map((_, i) => ({ abre: i < 5, de: '08:00', a: '19:00' })),
});

function SeccionSucursales() {
  const p = usePanel();
  const [editor, setEditor] = useState<Sucursal | null>(null);
  const [eliminar, setEliminar] = useState<Sucursal | null>(null);

  return (
    <div style={{ maxWidth: 960, paddingBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 18 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ margin: 0, fontSize: 16, lineHeight: '22px', fontWeight: 700 }}>Sucursales</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, lineHeight: '18px', color: 'var(--mecanu-text-secondary-light)' }}>
            {p.sucursales.length} sucursales · {p.sucursales.filter((s) => s.activa).length} activas. Cada sucursal tiene
            su dirección, contacto, capacidad y horario de atención.
          </p>
        </div>
        <Button kind="primary" size="compact" icon="add" onClick={() => setEditor(SUC_VACIA())}>Añadir sucursal</Button>
      </div>

      {p.sucursales.length === 0 ? (
        <div className={styles.panelBox} style={{ padding: 28, textAlign: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Todavía no hay sucursales</div>
          <div style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>
            Añade tu primera sucursal para gestionar direcciones, contactos y horarios.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {p.sucursales.map((s) => (
            <div key={s.id} className={styles.panelBox} style={{ padding: '18px 20px', opacity: s.activa ? 1 : 0.6 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 15, fontWeight: 700 }}>{s.nombre}</span>
                    {s.principal ? <Badge kind="brand" icon="star">Principal</Badge> : null}
                    <Badge kind={s.activa ? 'positive' : 'neutral'}>{s.activa ? 'Activa' : 'Inactiva'}</Badge>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)', marginTop: 3 }}>Código {s.codigo}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                  {!s.principal ? (
                    <button type="button" className={styles.linkBtn} onClick={() => p.hacerPrincipal(s.id)}>Hacer principal</button>
                  ) : null}
                  <button
                    type="button"
                    className={styles.iconBtn}
                    aria-label={s.activa ? 'Desactivar sucursal' : 'Activar sucursal'}
                    onClick={() => p.toggleSucursalActiva(s.id)}
                  >
                    <Icon name={s.activa ? 'visibility' : 'visibility_off'} size="sm" />
                  </button>
                  <button type="button" className={styles.iconBtn} aria-label="Editar sucursal" onClick={() => setEditor(s)}>
                    <Icon name="edit" size="sm" />
                  </button>
                  {!s.principal ? (
                    <button type="button" className={styles.iconBtn} aria-label="Eliminar sucursal" onClick={() => setEliminar(s)}>
                      <Icon name="delete" size="sm" />
                    </button>
                  ) : null}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: '14px 24px', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--mecanu-border-subtle)' }}>
                {[
                  ['Dirección', s.direccion, s.ubicacion],
                  ['Contacto', s.telefono, s.email],
                  ['Responsable', s.responsable, ''],
                  ['Capacidad', `${s.plazas} plazas`, `${s.elevadores} elevadores`],
                  ['Horario', s.horario.filter((h) => h.abre).length ? `${s.horario.find((h) => h.abre)?.de}–${s.horario.find((h) => h.abre)?.a}` : 'Cerrado', `${s.horario.filter((h) => h.abre).length} días a la semana`],
                ].map(([t, a, b]) => (
                  <div key={t}>
                    <div className={styles.eyebrow} style={{ marginBottom: 4 }}>{t}</div>
                    <div style={{ fontSize: 13 }}>{a || '—'}</div>
                    {b ? <div style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>{b}</div> : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {editor ? <EditorSucursal sucursal={editor} onClose={() => setEditor(null)} /> : null}

      <Dialog
        open={!!eliminar}
        onClose={() => setEliminar(null)}
        title="Eliminar sucursal"
        role="alertdialog"
        width={440}
        footer={
          <>
            <Button kind="tertiary" size="compact" onClick={() => setEliminar(null)}>Cancelar</Button>
            <Button kind="negative" size="compact" icon="delete" onClick={() => { if (eliminar) p.eliminarSucursal(eliminar.id); setEliminar(null); }}>
              Eliminar
            </Button>
          </>
        }
      >
        <p style={{ margin: 0, fontSize: 13 }}>
          Vas a eliminar «{eliminar?.nombre}». Esta acción no se puede deshacer.
        </p>
      </Dialog>
    </div>
  );
}

function EditorSucursal({ sucursal, onClose }: { sucursal: Sucursal; onClose: () => void }) {
  const p = usePanel();
  const [s, setS] = useState<Sucursal>({ ...sucursal, horario: sucursal.horario.map((h) => ({ ...h })) });
  const puedeGuardar = s.nombre.trim().length > 2 && s.direccion.trim().length > 5;

  const campos: [keyof Sucursal, string, string][] = [
    ['nombre', 'Nombre de la sucursal', 'Talleres Rodríguez · Centro'],
    ['codigo', 'Código', 'BCN-03'],
    ['direccion', 'Dirección', 'Calle, número, código postal, ciudad'],
    ['ubicacion', 'Barrio o zona', 'Les Corts, Barcelona'],
    ['telefono', 'Teléfono', '934 000 000'],
    ['email', 'Email', 'sucursal@taller.es'],
    ['responsable', 'Responsable', 'Nombre y apellidos'],
  ];

  return (
    <Dialog
      open
      onClose={onClose}
      title={sucursal.nombre ? 'Editar sucursal' : 'Nueva sucursal'}
      subtitle="Dirección, contacto, capacidad y horario de atención de la sucursal."
      width={760}
      footer={
        <>
          <Button kind="tertiary" size="compact" onClick={onClose}>Cancelar</Button>
          <Button
            kind="primary"
            size="compact"
            disabled={!puedeGuardar}
            onClick={() => { p.guardarSucursal(s); onClose(); p.toast('Sucursal guardada.'); }}
          >
            Guardar sucursal
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {campos.map(([k, label, ph]) => (
            <Input
              key={k}
              label={label}
              placeholder={ph}
              value={String(s[k] ?? '')}
              onChange={(v) => setS({ ...s, [k]: v })}
              fullWidth
            />
          ))}
        </div>

        <section>
          <h3 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 700 }}>Capacidad</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Input label="Plazas de trabajo" type="number" value={String(s.plazas)} onChange={(v) => setS({ ...s, plazas: Number(v) || 0 })} fullWidth />
            <Input label="Elevadores" type="number" value={String(s.elevadores)} onChange={(v) => setS({ ...s, elevadores: Number(v) || 0 })} fullWidth />
          </div>
        </section>

        <section className={styles.panelBox} style={{ padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--mecanu-border-subtle)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Sucursal principal</div>
              <div style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>
                Se usa por defecto en presupuestos y documentos. Solo puede haber una.
              </div>
            </div>
            <Switch checked={s.principal} onChange={(v) => setS({ ...s, principal: v })} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Sucursal activa</div>
              <div style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>Las inactivas no aparecen al crear traslados.</div>
            </div>
            <Switch checked={s.activa} onChange={(v) => setS({ ...s, activa: v })} />
          </div>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <h3 style={{ margin: 0, flex: 1, fontSize: 13, fontWeight: 700 }}>Horario de atención</h3>
            <button
              type="button"
              className={styles.ghostBtn}
              onClick={() => setS((x) => ({ ...x, horario: x.horario.map((h, i) => (i < 5 ? { ...x.horario[0] } : h)) }))}
            >
              <Icon name="content_copy" size="sm" />Copiar lunes a L–V
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {s.horario.map((h, i) => (
              <div key={DIAS_LABEL[i]} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--mecanu-border-subtle)' }}>
                <span style={{ width: 90, fontSize: 13 }}>{DIAS_LABEL[i]}</span>
                <Switch
                  checked={h.abre}
                  onChange={(v) => setS((x) => ({ ...x, horario: x.horario.map((y, j) => (j === i ? { ...y, abre: v } : y)) }))}
                />
                {h.abre ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      type="time"
                      value={h.de}
                      aria-label={`${DIAS_LABEL[i]} desde`}
                      onChange={(e) => setS((x) => ({ ...x, horario: x.horario.map((y, j) => (j === i ? { ...y, de: e.target.value } : y)) }))}
                    />
                    <span>a</span>
                    <input
                      type="time"
                      value={h.a}
                      aria-label={`${DIAS_LABEL[i]} hasta`}
                      onChange={(e) => setS((x) => ({ ...x, horario: x.horario.map((y, j) => (j === i ? { ...y, a: e.target.value } : y)) }))}
                    />
                  </div>
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--mecanu-neutral-300)' }}>Cerrado todo el día</span>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </Dialog>
  );
}

/* ------------------------- Recepción ------------------------- */

const PUNTOS_BASE = [
  'Carrocería y cristales', 'Neumáticos', 'Nivel de combustible', 'Kilometraje', 'Luces',
  'Documentación', 'Extintor', 'Kit de emergencia', 'Rueda de repuesto', 'Estado interior',
];

function SeccionRecepcion() {
  const p = usePanel();
  const [editor, setEditor] = useState<PlantillaRecepcion | null>(null);
  const [ver, setVer] = useState<PlantillaRecepcion | null>(null);

  return (
    <div style={{ maxWidth: 880, paddingBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 18 }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 16, lineHeight: '22px', fontWeight: 700 }}>Plantillas de recepción personalizada</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, lineHeight: '18px', color: 'var(--mecanu-text-secondary-light)' }}>
            Define qué se revisa al recibir un vehículo. Cada plantilla genera el formulario de recepción que rellena el taller.
          </p>
        </div>
        <Button
          kind="primary"
          size="compact"
          icon="add"
          onClick={() => setEditor({ id: `PL-${Date.now()}`, nombre: '', puntos: [], campos: [] })}
        >
          Crear plantilla
        </Button>
      </div>

      <div className={styles.panelBox}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid var(--mecanu-border-subtle)' }}>
          <span className={styles.eyebrow} style={{ flex: 1 }}>Plantilla</span>
          <span className={styles.eyebrow}>Acciones</span>
        </div>
        {p.plantillas.map((pl) => (
          <div key={pl.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--mecanu-border-subtle)' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{pl.nombre}</div>
              <div style={{ fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>
                {pl.puntos.length} puntos · {pl.campos.length} campos personalizados
              </div>
            </div>
            <button type="button" className={styles.ghostBtn} onClick={() => setVer(pl)}>Ver</button>
            <button type="button" className={styles.ghostBtn} onClick={() => setEditor(pl)}>Editar</button>
            <button
              type="button"
              className={styles.iconBtn}
              aria-label="Duplicar plantilla"
              onClick={() => p.guardarPlantilla({ ...pl, id: `PL-${Date.now()}`, nombre: `${pl.nombre} (copia)` })}
            >
              <Icon name="content_copy" size="sm" />
            </button>
            <button type="button" className={styles.iconBtn} aria-label="Eliminar plantilla" onClick={() => p.eliminarPlantilla(pl.id)}>
              <Icon name="delete" size="sm" />
            </button>
          </div>
        ))}
        {p.plantillas.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', fontSize: 13, color: 'var(--mecanu-text-secondary-light)' }}>
            Todavía no hay plantillas. Crea la primera para empezar a recibir vehículos.
          </div>
        ) : null}
      </div>

      <Dialog
        open={!!ver}
        onClose={() => setVer(null)}
        title={ver?.nombre ?? ''}
        subtitle="Vista previa del formulario que rellena el taller al recibir el vehículo."
        width={560}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {ver?.puntos.map((pt) => (
            <div key={pt} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--mecanu-border-subtle)' }}>
              <span style={{ flex: 1, fontSize: 13 }}>{pt}</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {['Bien', 'Dañado', 'No tiene'].map((op) => (
                  <span key={op} style={{ padding: '2px 8px', borderRadius: 999, background: 'var(--mecanu-neutral-25)', fontSize: 11 }}>{op}</span>
                ))}
              </div>
            </div>
          ))}
          {ver?.campos.map((c) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--mecanu-border-subtle)' }}>
              <span style={{ flex: 1, fontSize: 13 }}>{c.label}</span>
              <span style={{ fontSize: 11, color: 'var(--mecanu-neutral-300)' }}>{c.formato} · {c.detalle}</span>
            </div>
          ))}
        </div>
      </Dialog>

      {editor ? <EditorPlantilla plantilla={editor} onClose={() => setEditor(null)} /> : null}
    </div>
  );
}

function EditorPlantilla({ plantilla, onClose }: { plantilla: PlantillaRecepcion; onClose: () => void }) {
  const p = usePanel();
  const [pl, setPl] = useState<PlantillaRecepcion>({ ...plantilla, puntos: [...plantilla.puntos], campos: [...plantilla.campos] });
  const [campoNombre, setCampoNombre] = useState('');
  const [campoFormato, setCampoFormato] = useState('semaforo');
  const [campoDetalle, setCampoDetalle] = useState('');

  const togglePunto = (pt: string) =>
    setPl((x) => ({ ...x, puntos: x.puntos.includes(pt) ? x.puntos.filter((y) => y !== pt) : [...x.puntos, pt] }));

  return (
    <Dialog
      open
      onClose={onClose}
      title={plantilla.nombre ? 'Editar plantilla' : 'Nueva plantilla de recepción'}
      subtitle="Elige qué puntos revisa el taller. Cada punto se rellena con Bien, Dañado o No tiene."
      width={680}
      footer={
        <>
          <Button kind="tertiary" size="compact" onClick={onClose}>Cancelar</Button>
          <Button
            kind="primary"
            size="compact"
            disabled={pl.nombre.trim().length < 3 || (!pl.puntos.length && !pl.campos.length)}
            onClick={() => { p.guardarPlantilla(pl); onClose(); p.toast('Plantilla guardada.'); }}
          >
            Guardar plantilla
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input label="Nombre de la plantilla" placeholder="Recepción estándar" value={pl.nombre} onChange={(v) => setPl({ ...pl, nombre: v })} fullWidth />

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={pl.puntos.length === PUNTOS_BASE.length}
                onChange={(e) => setPl({ ...pl, puntos: e.target.checked ? [...PUNTOS_BASE] : [] })}
              />
              Todos
            </label>
            <span style={{ flex: 1 }} />
            <span style={{ fontSize: 12, color: 'var(--mecanu-neutral-300)' }}>{pl.puntos.length} puntos seleccionados</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 6 }}>
            {PUNTOS_BASE.map((pt) => (
              <label key={pt} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', border: '1px solid var(--mecanu-border)', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                <input type="checkbox" checked={pl.puntos.includes(pt)} onChange={() => togglePunto(pt)} />
                {pt}
              </label>
            ))}
          </div>
        </section>

        <section className={styles.panelBox} style={{ padding: 14 }}>
          <h3 style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 700 }}>Campos personalizados</h3>
          <p style={{ margin: '0 0 10px', fontSize: 12, color: 'var(--mecanu-text-secondary-light)' }}>
            Opcional. Añade puntos propios del taller: define el nombre y cómo se responde.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr auto', gap: 8, alignItems: 'flex-end' }}>
            <Input label="Nombre del punto" placeholder="Pastillas de freno delanteras" value={campoNombre} onChange={setCampoNombre} fullWidth />
            <Select
              label="Formato"
              options={[
                { value: 'semaforo', label: 'Semáforo (3 opciones)' },
                { value: 'medida', label: 'Medida numérica' },
                { value: 'fecha', label: 'Fecha' },
                { value: 'km', label: 'Kilometraje' },
              ]}
              value={campoFormato}
              onChange={setCampoFormato}
              fullWidth
            />
            <Input label="Detalle" placeholder="mm · mínimo 3" value={campoDetalle} onChange={setCampoDetalle} fullWidth />
            <Button
              kind="secondary"
              size="compact"
              icon="add"
              disabled={campoNombre.trim().length < 3}
              onClick={() => {
                setPl((x) => ({
                  ...x,
                  campos: [...x.campos, { id: `CF-${Date.now()}`, label: campoNombre.trim(), formato: campoFormato, detalle: campoDetalle }],
                }));
                setCampoNombre('');
                setCampoDetalle('');
              }}
            >
              Crear campo
            </Button>
          </div>

          {pl.campos.length ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
              {pl.campos.map((c) => (
                <span key={c.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px', border: '1px solid var(--mecanu-border)', borderRadius: 999, fontSize: 12 }}>
                  {c.label}
                  <span style={{ color: 'var(--mecanu-neutral-300)' }}>{c.formato}</span>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    style={{ width: 20, height: 20 }}
                    aria-label={`Quitar ${c.label}`}
                    onClick={() => setPl((x) => ({ ...x, campos: x.campos.filter((y) => y.id !== c.id) }))}
                  >
                    <Icon name="close" size="sm" />
                  </button>
                </span>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </Dialog>
  );
}
