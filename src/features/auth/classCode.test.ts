import { describe, expect, it } from 'vitest';
import {
  CLASS_CODE_ALPHABET,
  CLASS_CODE_DEFAULT_LENGTH,
  CLASS_CODE_MAX_LENGTH,
  CLASS_CODE_MIN_LENGTH,
  generateClassCode,
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

describe('generateClassCode', () => {
  it('genera un código con la longitud por defecto válida', () => {
    const codigo = generateClassCode();
    expect(codigo).toHaveLength(CLASS_CODE_DEFAULT_LENGTH);
    expect(isValidClassCode(codigo)).toBe(true);
  });

  it('respeta una longitud dentro del rango', () => {
    expect(generateClassCode(CLASS_CODE_MIN_LENGTH)).toHaveLength(CLASS_CODE_MIN_LENGTH);
    expect(generateClassCode(CLASS_CODE_MAX_LENGTH)).toHaveLength(CLASS_CODE_MAX_LENGTH);
  });

  it('acota longitudes fuera de rango a los límites válidos', () => {
    expect(generateClassCode(1)).toHaveLength(CLASS_CODE_MIN_LENGTH);
    expect(generateClassCode(99)).toHaveLength(CLASS_CODE_MAX_LENGTH);
  });

  it('solo usa caracteres del alfabeto y evita ambiguos en 1000 generaciones', () => {
    const permitidos = new Set(CLASS_CODE_ALPHABET.split(''));
    for (let i = 0; i < 1000; i += 1) {
      const codigo = generateClassCode();
      expect(isValidClassCode(codigo)).toBe(true);
      for (const caracter of codigo) {
        expect(permitidos.has(caracter)).toBe(true);
      }
      // Sin caracteres ambiguos (0, O, 1, I, L).
      expect(/[01OIL]/.test(codigo)).toBe(false);
    }
  });
});
