import { describe, expect, it } from 'vitest';
import type { Repaso } from '../../lib/storage';
import {
  DIA_MS,
  INTERVALO_TOPE_DIAS,
  alAcertarEnRepaso,
  alFallar,
  estaDue,
  seleccionarDue,
} from './repaso';

/**
 * Pruebas PURAS de la repetición espaciada del repaso (R14.3). Determinismo
 * total: `ahora` siempre inyectado (epoch ms fijo).
 */

const AHORA = 1_700_000_000_000;

function repaso(ejercicioId: string, fallos: number, proximaAparicion: number): Repaso {
  return {
    id: `est-1:${ejercicioId}`,
    estudianteId: 'est-1',
    ejercicioId,
    fallos,
    proximaAparicion,
  };
}

describe('repaso — estaDue / seleccionarDue', () => {
  it('estaDue es true cuando proximaAparicion <= ahora', () => {
    expect(estaDue(repaso('a', 1, AHORA), AHORA)).toBe(true);
    expect(estaDue(repaso('a', 1, AHORA - 1), AHORA)).toBe(true);
    expect(estaDue(repaso('a', 1, AHORA + 1), AHORA)).toBe(false);
  });

  it('seleccionarDue filtra los no vencidos y ordena por proximaAparicion', () => {
    const repasos = [
      repaso('c', 1, AHORA + DIA_MS), // futuro: fuera
      repaso('a', 1, AHORA - 2 * DIA_MS),
      repaso('b', 1, AHORA - DIA_MS),
    ];
    const due = seleccionarDue(repasos, AHORA);
    expect(due.map((r) => r.ejercicioId)).toEqual(['a', 'b']);
  });
});

describe('repaso — alFallar (R14.1)', () => {
  it('crea un record nuevo con fallos=1 y proximaAparicion al día base', () => {
    const nuevo = alFallar(undefined, 'est-1', 'ej-1', AHORA);
    expect(nuevo).toEqual({
      id: 'est-1:ej-1',
      estudianteId: 'est-1',
      ejercicioId: 'ej-1',
      fallos: 1,
      proximaAparicion: AHORA + DIA_MS,
    });
  });

  it('al fallar de nuevo incrementa fallos y re-acerca la próxima aparición', () => {
    const previo = repaso('ej-1', 3, AHORA + 10 * DIA_MS);
    const actualizado = alFallar(previo, 'est-1', 'ej-1', AHORA);
    expect(actualizado.fallos).toBe(4);
    expect(actualizado.proximaAparicion).toBe(AHORA + DIA_MS);
  });
});

describe('repaso — alAcertarEnRepaso (R14.3)', () => {
  it('duplica el intervalo (1→2 días) y decrementa fallos', () => {
    // fallos=2 → intervalo vigente 2 días; al acertar → 4 días, fallos=1.
    const previo = repaso('ej-1', 2, AHORA);
    const resultado = alAcertarEnRepaso(previo, AHORA);
    expect(resultado.tipo).toBe('actualizar');
    if (resultado.tipo === 'actualizar') {
      expect(resultado.repaso.fallos).toBe(1);
      expect(resultado.repaso.proximaAparicion).toBe(AHORA + 4 * DIA_MS);
    }
  });

  it('elimina el record cuando el ejercicio queda dominado (fallos→0)', () => {
    const previo = repaso('ej-1', 1, AHORA);
    const resultado = alAcertarEnRepaso(previo, AHORA);
    expect(resultado.tipo).toBe('eliminar');
  });

  it('elimina cuando el intervalo vigente ya alcanzó el tope', () => {
    // fallos alto → intervalo vigente topado en INTERVALO_TOPE_DIAS.
    const previo = repaso('ej-1', 10, AHORA);
    const resultado = alAcertarEnRepaso(previo, AHORA);
    expect(resultado.tipo).toBe('eliminar');
    expect(INTERVALO_TOPE_DIAS).toBe(32);
  });
});
