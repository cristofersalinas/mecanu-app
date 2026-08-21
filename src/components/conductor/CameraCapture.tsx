'use client';

import type { ReactNode } from 'react';
import { Icon } from '@/components/ds/Icon';
import { esModoDemo } from '@/lib/entorno';
import { FOTO_LADO, VIDEO_MAX_S } from './constants';
import type { AccionesConductor } from './useConductor';
import type { CamState } from './types';
import css from './conductor.module.css';

const ROTULO: Record<CamState['modo'], string> = {
  foto: 'Encuadra el coche entero. Se sella con hora, GPS y matrícula.',
  extra: 'Foto extra: detalle o daño concreto.',
  video: 'Da una vuelta completa al coche, sin prisa.',
  ent: 'Deja constancia de cómo entregas el coche.',
};

/**
 * Cámara de la app. La evidencia solo puede venir de aquí: nunca de la galería,
 * nunca de `<input type="file">`.
 * R10: si falla, la salida es reintentar la misma captura, no empezar de cero.
 */
export function CameraCapture({ cam, acciones }: { cam: CamState; acciones: AccionesConductor }) {
  /* `videoRef` es una ref callback: se desestructura para no leer propiedades
     del objeto de acciones durante el render. */
  const {
    videoRef,
    cerrarCam,
    reintentarCam,
    dispararFoto,
    grabarVideo,
    simularFoto,
    simularVideo,
  } = acciones;
  const esVideo = cam.modo === 'video';

  if (cam.error) {
    return (
      <Marco>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            padding: '32px 24px',
            textAlign: 'center',
          }}
        >
          <Icon
            name={cam.error === 'permiso' ? 'no_photography' : 'videocam_off'}
            size="xl"
            color="var(--mecanu-neutral-300)"
            style={{ fontSize: 44 }}
          />
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--mecanu-neutral-0)' }}>
            {cam.error === 'permiso' ? 'Sin permiso de cámara' : 'Cámara no disponible'}
          </div>
          <div style={{ fontSize: 13, lineHeight: '19px', color: 'var(--mecanu-neutral-200)', maxWidth: 270 }}>
            {cam.error === 'permiso'
              ? 'El check-in solo admite fotos hechas aquí, nunca de la galería. Da permiso a la cámara para continuar.'
              : 'Este dispositivo no expone ninguna cámara. Avisa al taller si no puedes hacer el check-in.'}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <button
              type="button"
              onClick={reintentarCam}
              style={{
                minHeight: 52,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                border: 'none',
                borderRadius: 9,
                background: 'var(--mecanu-brand-primary-dark)',
                color: 'var(--mecanu-neutral-900)',
                font: 'inherit',
                fontSize: 14,
                fontWeight: 700,
                padding: '0 18px',
                cursor: 'pointer',
              }}
            >
              <Icon name="refresh" size="md" />
              Reintentar
            </button>
            <button
              type="button"
              onClick={cerrarCam}
              style={{
                minHeight: 52,
                border: '1px solid var(--mecanu-neutral-700)',
                borderRadius: 9,
                background: 'none',
                color: 'var(--mecanu-neutral-0)',
                font: 'inherit',
                fontSize: 14,
                fontWeight: 700,
                padding: '0 18px',
                cursor: 'pointer',
              }}
            >
              Volver
            </button>
          </div>
          {esModoDemo() ? (
          <button
            type="button"
            onClick={esVideo ? simularVideo : simularFoto}
            style={{
              marginTop: 10,
              minHeight: 44,
              border: 'none',
              background: 'none',
              color: 'var(--mecanu-neutral-300)',
              font: 'inherit',
              fontSize: 12,
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            Simular captura (solo prototipo)
          </button>
          ) : null}
        </div>
      </Marco>
    );
  }

  return (
    <Marco>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <video
          ref={videoRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            background: '#000',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 52,
            left: 14,
            right: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: 12,
              lineHeight: '16px',
              fontWeight: 700,
              color: '#fff',
              textShadow: '0 1px 3px rgba(0,0,0,.7)',
            }}
          >
            {ROTULO[cam.modo]}
          </span>
          {cam.grabando ? (
            <span
              style={{
                flex: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(168,24,35,.9)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 800,
                padding: '5px 11px',
                borderRadius: 999,
              }}
            >
              <span
                className={css.rec}
                style={{ width: 9, height: 9, borderRadius: 999, background: '#fff' }}
              />
              0:{String(cam.seg).padStart(2, '0')} / 0:{VIDEO_MAX_S}
            </span>
          ) : null}
        </div>
      </div>
      <div
        style={{
          flex: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '16px 20px 30px',
          background: '#000',
        }}
      >
        <button
          type="button"
          onClick={cerrarCam}
          style={{
            flex: 1,
            minHeight: 52,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            font: 'inherit',
            fontSize: 14,
            fontWeight: 700,
            color: '#fff',
            textAlign: 'left',
          }}
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={esVideo ? grabarVideo : dispararFoto}
          aria-label={
            esVideo ? (cam.grabando ? 'Detener grabación' : 'Empezar a grabar') : 'Hacer la foto'
          }
          style={{
            flex: 'none',
            width: 76,
            height: 76,
            borderRadius: 999,
            border: '4px solid rgba(255,255,255,.35)',
            background: esVideo ? '#A81823' : 'var(--mecanu-neutral-0)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon
            name={esVideo ? (cam.grabando ? 'stop' : 'fiber_manual_record') : 'photo_camera'}
            size="xl"
            filled
            color={esVideo ? '#fff' : 'var(--mecanu-neutral-900)'}
          />
        </button>
        <span
          style={{
            flex: 1,
            fontSize: 11,
            lineHeight: '15px',
            color: 'var(--mecanu-neutral-300)',
            textAlign: 'right',
          }}
        >
          {esVideo ? 'Máx. ' + VIDEO_MAX_S + ' s · 720p' : 'JPEG ' + FOTO_LADO + ' px'}
        </span>
      </div>
    </Marco>
  );
}

function Marco({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 88,
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </div>
  );
}
