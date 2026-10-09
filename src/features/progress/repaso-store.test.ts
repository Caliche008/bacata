import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDb, getGamification, getReview, resetDb } from '../../lib/storage';
import { DIA_MS } from './repaso';
import {
  contarDue,
  obtenerEjerciciosDue,
  registrarAciertoRepaso,
  registrarFallo,
} from './repaso-store';
import { registrarRepasoCompletado } from './gamificacion-store';

/**
 * Pruebas de integración del repaso con `fake-indexeddb` (tarea 11). Se recrea
 * la BD por prueba (patrón de `gamificacion-store.test.ts`). Determinismo:
 * `ahora` siempre inyectado.
 */

const ESTUDIANTE = 'est-1';
const AHORA = 1_700_000_000_000;

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
  resetDb();
});

afterEach(async () => {
  await closeDb();
});

describe('registrarFallo (R14.1)', () => {
  it('persiste un fallo nuevo con fallos=1 y proximaAparicion al día base', async () => {
    await registrarFallo(ESTUDIANTE, 'ej-1', AHORA);
    const repaso = await getReview(ESTUDIANTE, 'ej-1');
    expect(repaso).toBeDefined();
    expect(repaso?.fallos).toBe(1);
    expect(repaso?.proximaAparicion).toBe(AHORA + DIA_MS);
  });

  it('al fallar de nuevo incrementa fallos (actualiza el record)', async () => {
    await registrarFallo(ESTUDIANTE, 'ej-1', AHORA);
    await registrarFallo(ESTUDIANTE, 'ej-1', AHORA + 5 * DIA_MS);
    const repaso = await getReview(ESTUDIANTE, 'ej-1');
    expect(repaso?.fallos).toBe(2);
    expect(repaso?.proximaAparicion).toBe(AHORA + 5 * DIA_MS + DIA_MS);
  });
});

describe('obtenerEjerciciosDue / contarDue (R14.2)', () => {
  it('respeta proximaAparicion vs ahora', async () => {
    // Falla en el día base: due un día después.
    await registrarFallo(ESTUDIANTE, 'ej-1', AHORA);

    // Antes de que venza: no hay due.
    expect(await contarDue(ESTUDIANTE, AHORA)).toBe(0);
    expect(await obtenerEjerciciosDue(ESTUDIANTE, AHORA)).toEqual([]);

    // Pasado un día: queda due.
    const manana = AHORA + DIA_MS;
    expect(await contarDue(ESTUDIANTE, manana)).toBe(1);
    expect(await obtenerEjerciciosDue(ESTUDIANTE, manana)).toEqual(['ej-1']);
  });
});

describe('registrarAciertoRepaso (R14.3)', () => {
  it('espacia (duplica el intervalo) cuando aún quedan fallos', async () => {
    // Dos fallos → fallos=2 (intervalo vigente 2 días).
    await registrarFallo(ESTUDIANTE, 'ej-1', AHORA);
    await registrarFallo(ESTUDIANTE, 'ej-1', AHORA);

    await registrarAciertoRepaso(ESTUDIANTE, 'ej-1', AHORA);
    const repaso = await getReview(ESTUDIANTE, 'ej-1');
    expect(repaso).toBeDefined();
    expect(repaso?.fallos).toBe(1);
    expect(repaso?.proximaAparicion).toBe(AHORA + 4 * DIA_MS);
  });

  it('elimina el record cuando el ejercicio queda dominado', async () => {
    await registrarFallo(ESTUDIANTE, 'ej-1', AHORA); // fallos=1
    await registrarAciertoRepaso(ESTUDIANTE, 'ej-1', AHORA);
    expect(await getReview(ESTUDIANTE, 'ej-1')).toBeUndefined();
  });

  it('es no-op si el ejercicio no estaba en repaso', async () => {
    await registrarAciertoRepaso(ESTUDIANTE, 'inexistente', AHORA);
    expect(await getReview(ESTUDIANTE, 'inexistente')).toBeUndefined();
  });
});

describe('registrarRepasoCompletado (R14.2, +5 XP)', () => {
  it('suma exactamente +5 XP sobre el estado previo', async () => {
    const antes = await getGamification(ESTUDIANTE);
    expect(antes).toBeUndefined();

    await registrarRepasoCompletado({ estudianteId: ESTUDIANTE, hoy: '2024-05-01' });
    const uno = await getGamification(ESTUDIANTE);
    expect(uno?.xp).toBe(5);

    await registrarRepasoCompletado({ estudianteId: ESTUDIANTE, hoy: '2024-05-02' });
    const dos = await getGamification(ESTUDIANTE);
    expect(dos?.xp).toBe(10);
  });
});
