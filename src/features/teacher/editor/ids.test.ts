import { describe, expect, it } from 'vitest';
import { asegurarId, idEjercicio, idLeccion, idUnidad, slugify } from './ids';

describe('slugify', () => {
  it('quita tildes y signos, pasa a kebab-case en minúsculas', () => {
    expect(slugify('Convivencia y Resolución de Conflictos')).toBe(
      'convivencia-y-resolucion-de-conflictos',
    );
    expect(slugify('¿Qué es la paz? ¡Importa!')).toBe('que-es-la-paz-importa');
    expect(slugify('Diversidad, Cultura & Territorio')).toBe('diversidad-cultura-territorio');
  });

  it('colapsa y recorta guiones sobrantes', () => {
    expect(slugify('  ---hola---mundo---  ')).toBe('hola-mundo');
  });
});

describe('idUnidad / idLeccion / idEjercicio', () => {
  it('construyen ids legibles con el prefijo esperado', () => {
    expect(idUnidad(6, 'Convivencia', [])).toBe('u6-convivencia');
    expect(idLeccion(6, 'convivencia', 'Primeros pasos', [])).toBe(
      'l6-convivencia-primeros-pasos',
    );
    expect(idEjercicio('l6-convivencia-primeros-pasos', 1, [])).toBe(
      'el6-convivencia-primeros-pasos-1',
    );
    expect(idEjercicio('l6-conv', 'Pregunta inicial', [])).toBe('el6-conv-pregunta-inicial');
  });

  it('da sufijo incremental único cuando el id ya existe', () => {
    const existentes = ['u6-convivencia'];
    expect(idUnidad(6, 'Convivencia', existentes)).toBe('u6-convivencia-2');

    const masExistentes = ['u6-convivencia', 'u6-convivencia-2'];
    expect(idUnidad(6, 'Convivencia', masExistentes)).toBe('u6-convivencia-3');
  });
});

describe('asegurarId', () => {
  it('conserva el id existente (estabilidad al editar)', () => {
    expect(asegurarId('u6-convivencia', () => 'u6-nuevo')).toBe('u6-convivencia');
  });

  it('genera uno nuevo cuando no hay id o está vacío', () => {
    expect(asegurarId(undefined, () => 'u6-nuevo')).toBe('u6-nuevo');
    expect(asegurarId('   ', () => 'u6-nuevo')).toBe('u6-nuevo');
  });
});
