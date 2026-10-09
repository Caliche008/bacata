import { describe, expect, it } from 'vitest';
import {
  CLASS_CODE_MAX_LENGTH,
  CLASS_CODE_MIN_LENGTH,
  isValidClassCode,
  normalizeClassCode,
} from './classCode';

describe('normalizeClassCode', () => {
  it('recorta espacios y pasa a mayúsculas', () => {
    expect(normalizeClassCode('  abc234 ')).toBe('ABC234');
  });
});

describe('isValidClassCode', () => {
  it('acepta un código de 6 caracteres válido', () => {
    expect(isValidClassCode('ABC234')).toBe(true);
  });

  it('acepta un código de 8 caracteres válido', () => {
    expect(isValidClassCode('ABCD2345')).toBe(true);
  });

  it('acepta entrada en minúsculas (insensible a mayúsculas)', () => {
    expect(isValidClassCode('abc234')).toBe(true);
  });

  it('rechaza códigos más cortos que el mínimo', () => {
    expect(isValidClassCode('ABC2')).toBe(false);
    expect(CLASS_CODE_MIN_LENGTH).toBe(6);
  });

  it('rechaza códigos más largos que el máximo', () => {
    expect(isValidClassCode('ABCD23456')).toBe(false);
    expect(CLASS_CODE_MAX_LENGTH).toBe(8);
  });

  it('rechaza caracteres ambiguos (0, O, 1, I, L)', () => {
    expect(isValidClassCode('ABC01I')).toBe(false);
    expect(isValidClassCode('ABCOLI')).toBe(false);
  });

  it('rechaza espacios internos', () => {
    expect(isValidClassCode('ABC 234')).toBe(false);
  });

  it('rechaza símbolos y vacío', () => {
    expect(isValidClassCode('ABC-23')).toBe(false);
    expect(isValidClassCode('')).toBe(false);
  });
});
