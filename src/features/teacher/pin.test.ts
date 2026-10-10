import { describe, expect, it } from 'vitest';
import {
  PIN_MAX_LENGTH,
  PIN_MIN_LENGTH,
  hashPin,
  isValidPin,
  verifyPin,
} from './pin';

/**
 * Pruebas del hashing del PIN docente (R8.6): el PIN nunca se guarda en claro,
 * el hash lleva salt aleatorio, y la verificación acepta el correcto y rechaza
 * el incorrecto.
 */

describe('isValidPin', () => {
  it('acepta PIN de 4 a 8 dígitos', () => {
    expect(isValidPin('1234')).toBe(true);
    expect(isValidPin('12345678')).toBe(true);
  });

  it('rechaza longitudes fuera de rango', () => {
    expect(isValidPin('123')).toBe(false);
    expect(isValidPin('123456789')).toBe(false);
    expect(PIN_MIN_LENGTH).toBe(4);
    expect(PIN_MAX_LENGTH).toBe(8);
  });

  it('rechaza caracteres no numéricos', () => {
    expect(isValidPin('12a4')).toBe(false);
    expect(isValidPin('12 4')).toBe(false);
    expect(isValidPin('')).toBe(false);
  });
});

describe('hashPin / verifyPin', () => {
  it('nunca devuelve el PIN en claro', async () => {
    const hash = await hashPin('1234');
    expect(hash).not.toContain('1234');
    expect(hash).toContain(':');
  });

  it('produce hashes distintos para el mismo PIN (salt aleatorio)', async () => {
    const a = await hashPin('1234');
    const b = await hashPin('1234');
    expect(a).not.toBe(b);
  });

  it('verifica el PIN correcto', async () => {
    const hash = await hashPin('4321');
    expect(await verifyPin('4321', hash)).toBe(true);
  });

  it('rechaza un PIN incorrecto', async () => {
    const hash = await hashPin('4321');
    expect(await verifyPin('0000', hash)).toBe(false);
  });

  it('rechaza un valor almacenado malformado sin lanzar', async () => {
    expect(await verifyPin('1234', 'malformado')).toBe(false);
    expect(await verifyPin('1234', '')).toBe(false);
  });
});
