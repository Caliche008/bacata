import { describe, expect, it } from 'vitest';
import { OFFENSIVE_WORDS, containsOffensiveLanguage } from './offensive-words';

describe('containsOffensiveLanguage', () => {
  it('detecta un término de la lista', () => {
    expect(containsOffensiveLanguage('tonto')).toBe(true);
  });

  it('detecta variantes con tildes y mayúsculas', () => {
    expect(containsOffensiveLanguage('TóNtO')).toBe(true);
  });

  it('detecta intentos de evasión con separadores', () => {
    expect(containsOffensiveLanguage('t.o.n.t.o')).toBe(true);
  });

  it('no marca apodos razonables', () => {
    expect(containsOffensiveLanguage('Bolívar')).toBe(false);
    expect(containsOffensiveLanguage('El explorador')).toBe(false);
  });

  it('trata el vacío como no ofensivo', () => {
    expect(containsOffensiveLanguage('')).toBe(false);
    expect(containsOffensiveLanguage('   ')).toBe(false);
  });

  it('la lista es ampliable (array exportado no vacío)', () => {
    expect(Array.isArray(OFFENSIVE_WORDS)).toBe(true);
    expect(OFFENSIVE_WORDS.length).toBeGreaterThan(0);
  });
});
