import { describe, expect, it } from 'vitest';
import {
  isValidNicknameLength,
  nicknameComparisonKey,
  nicknamesMatch,
  normalizeNickname,
} from './nickname';

describe('normalizeNickname', () => {
  it('recorta y colapsa espacios internos', () => {
    expect(normalizeNickname('  el   quijote  ')).toBe('el quijote');
  });
});

describe('isValidNicknameLength', () => {
  it('rechaza apodos demasiado cortos', () => {
    expect(isValidNicknameLength('a')).toBe(false);
  });

  it('acepta la longitud mínima', () => {
    expect(isValidNicknameLength('ab')).toBe(true);
  });

  it('acepta la longitud máxima (20)', () => {
    expect(isValidNicknameLength('a'.repeat(20))).toBe(true);
  });

  it('rechaza apodos demasiado largos', () => {
    expect(isValidNicknameLength('a'.repeat(21))).toBe(false);
  });

  it('rechaza apodos de solo espacios', () => {
    expect(isValidNicknameLength('   ')).toBe(false);
  });
});

describe('nicknameComparisonKey / nicknamesMatch', () => {
  it('ignora mayúsculas y tildes', () => {
    expect(nicknameComparisonKey('José')).toBe('jose');
    expect(nicknamesMatch('José', 'jose')).toBe(true);
  });

  it('ignora espacios para la comparación', () => {
    expect(nicknamesMatch('El Quijote', 'elquijote')).toBe(true);
  });

  it('distingue apodos diferentes', () => {
    expect(nicknamesMatch('Bolívar', 'Santander')).toBe(false);
  });
});
