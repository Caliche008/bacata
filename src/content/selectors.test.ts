import { describe, expect, it } from 'vitest';
import { loadBundledCourses } from './loader';
import { getCursoPorGrado, getEjercicioPorId } from './selectors';

/**
 * Pruebas del selector `getEjercicioPorId` (tarea 11, R14.2). Usa el contenido
 * semilla real cargado por `loadBundledCourses` para encontrar un ejercicio a
 * través de todas las unidades/lecciones del curso.
 */

describe('getEjercicioPorId', () => {
  it('encuentra un ejercicio real del curso de 6° por su id', () => {
    const { index } = loadBundledCourses();
    const curso = getCursoPorGrado(index, 6);
    expect(curso).toBeDefined();
    if (!curso) {
      return;
    }
    const ejercicio = getEjercicioPorId(curso, 'e6-conv-1-1');
    expect(ejercicio).toBeDefined();
    expect(ejercicio?.id).toBe('e6-conv-1-1');
    expect(ejercicio?.tipo).toBe('opcion_multiple');
  });

  it('devuelve undefined para un id inexistente', () => {
    const { index } = loadBundledCourses();
    const curso = getCursoPorGrado(index, 6);
    expect(curso).toBeDefined();
    if (!curso) {
      return;
    }
    expect(getEjercicioPorId(curso, 'no-existe-123')).toBeUndefined();
  });
});
