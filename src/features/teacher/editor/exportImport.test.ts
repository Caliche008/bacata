import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Curso } from '../../../content/types';
import { exportarCurso, importarCurso } from './exportImport';

/**
 * Pruebas de export/import. El fixture es el contenido real `grado-6.json`,
 * leído con `readFileSync` como hace `storage.test.ts`. jsdom provee `document`
 * pero no `URL.createObjectURL` ni `a.click`, así que se simulan.
 */

const cursoValidoTexto = readFileSync(
  join(process.cwd(), 'content', 'cursos', 'grado-6.json'),
  'utf8',
);
const cursoValido = JSON.parse(cursoValidoTexto) as Curso;

afterEach(() => {
  vi.restoreAllMocks();
});

describe('importarCurso', () => {
  it('round-trip: importa el grado-6.json real con ok:true', () => {
    const resultado = importarCurso(cursoValidoTexto);
    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.curso.id).toBe(cursoValido.id);
      expect(resultado.curso.grado).toBe(6);
    }
  });

  it('devuelve ok:false y mensaje en español si el texto no es JSON', () => {
    const resultado = importarCurso('esto no es json {');
    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.errores.length).toBeGreaterThan(0);
      expect(resultado.errores[0]).toMatch(/JSON válido/);
    }
  });

  it('devuelve ok:false con mensajes de ruta si no cumple cursoSchema', () => {
    const invalido = JSON.stringify({ id: 'x', grado: 99, area: 'otra' });
    const resultado = importarCurso(invalido);
    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.errores.length).toBeGreaterThan(0);
    }
  });
});

describe('exportarCurso', () => {
  it('rechaza un curso inválido sin descargar', () => {
    const createUrl = vi.fn();
    vi.stubGlobal('URL', { ...URL, createObjectURL: createUrl, revokeObjectURL: vi.fn() });

    const invalido = { id: '' } as unknown as Curso;
    const resultado = exportarCurso(invalido);

    expect(resultado.ok).toBe(false);
    expect(resultado.errores?.length).toBeGreaterThan(0);
    expect(createUrl).not.toHaveBeenCalled();
  });

  it('descarga un curso válido con el nombre grado-<grado>.json', () => {
    const createUrl = vi.fn(() => 'blob:fake');
    const revokeUrl = vi.fn();
    vi.stubGlobal('URL', { ...URL, createObjectURL: createUrl, revokeObjectURL: revokeUrl });
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);

    let descargaSugerida = '';
    vi.spyOn(HTMLAnchorElement.prototype, 'download', 'set').mockImplementation(function (
      this: HTMLAnchorElement,
      v: string,
    ) {
      descargaSugerida = v;
    });

    const resultado = exportarCurso(cursoValido);

    expect(resultado.ok).toBe(true);
    expect(createUrl).toHaveBeenCalledTimes(1);
    expect(revokeUrl).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(descargaSugerida).toBe('grado-6.json');
  });
});
