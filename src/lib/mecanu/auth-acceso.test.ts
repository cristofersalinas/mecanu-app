import { describe, expect, it } from 'vitest';
import {
  digitosTelefonoES,
  emailValido,
  errorEmail,
  errorOtp,
  errorTelefono,
  formatearOtp,
  formatearTelefonoES,
  normalizarEmail,
  passwordLista,
  reglasPassword,
  telefonoE164,
} from './auth-acceso';

describe('Email de acceso al panel', () => {
  it('acepta un email de taller y lo deja en minúsculas', () => {
    expect(emailValido('Ruben@Taller.es')).toBe(true);
    expect(normalizarEmail('  Ruben@Taller.es ')).toBe('ruben@taller.es');
    expect(errorEmail('ruben@taller.es')).toBeNull();
  });

  it('rechaza formatos rotos', () => {
    expect(emailValido('no')).toBe(false);
    expect(emailValido('a@b')).toBe(false);
    expect(errorEmail('')).toMatch(/email/);
    expect(errorEmail('sin-arroba')).toMatch(/taller\.es/);
  });
});

describe('Teléfono español de 9 dígitos', () => {
  it('formatea de 3 en 3 y saca E.164', () => {
    expect(formatearTelefonoES('600111222')).toBe('600 111 222');
    expect(formatearTelefonoES('+34 600 111 222')).toBe('600 111 222');
    expect(formatearTelefonoES('0034600111222')).toBe('600 111 222');
    expect(telefonoE164('600 111 222')).toBe('+34600111222');
  });

  it('recorta pegados con prefijo y no deja más de 9 dígitos', () => {
    expect(digitosTelefonoES('3460011122299')).toBe('600111222');
    expect(errorTelefono('600 11')).toMatch(/Faltan/);
    expect(errorTelefono('500 111 222')).toMatch(/6, 7, 8 o 9/);
    expect(errorTelefono('', { obligatorio: false })).toBeNull();
  });
});

describe('OTP SMS', () => {
  it('solo 6 dígitos', () => {
    expect(formatearOtp('12a34b567')).toBe('123456');
    expect(errorOtp('12345')).toMatch(/6 dígitos/);
    expect(errorOtp('123456')).toBeNull();
  });
});

describe('Contraseña al crear cuenta', () => {
  it('pide 8 caracteres, una letra y un número', () => {
    const corta = reglasPassword('ab12');
    expect(corta.find((r) => r.id === 'len')?.ok).toBe(false);
    expect(passwordLista('secret12')).toBe(true);
    expect(passwordLista('sinnumero')).toBe(false);
    expect(passwordLista('12345678')).toBe(false);
  });

  it('comprueba que las dos coinciden', () => {
    expect(passwordLista('secret12', 'secret12')).toBe(true);
    expect(passwordLista('secret12', 'otra')).toBe(false);
    expect(reglasPassword('secret12', 'otra').find((r) => r.id === 'match')?.ok).toBe(false);
  });
});
