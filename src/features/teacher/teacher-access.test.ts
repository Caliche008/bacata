import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { isTeacherSessionActive } from '../../lib/preferences';
import {
  MENSAJE_PIN_INVALIDO,
  cerrarSesionDocente,
  configurarPin,
  ingresarConPin,
  necesitaConfigurarPin,
} from './teacher-access';

/**
 * Pruebas del acceso docente (R6.5, R8.6): primer uso pide configurar; tras
 * configurar, el PIN correcto abre sesión y el incorrecto no; la sesión docente
 * es independiente y el hash nunca se expone.
 */

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
});

describe('acceso docente — primer uso', () => {
  it('necesita configurar PIN cuando no hay hash', () => {
    expect(necesitaConfigurarPin()).toBe(true);
  });

  it('configurar un PIN válido abre sesión y deja de necesitar configuración', async () => {
    await configurarPin('1234');
    expect(necesitaConfigurarPin()).toBe(false);
    expect(isTeacherSessionActive()).toBe(true);
  });

  it('rechaza configurar un PIN con formato inválido', async () => {
    await expect(configurarPin('12')).rejects.toThrow(MENSAJE_PIN_INVALIDO);
    expect(necesitaConfigurarPin()).toBe(true);
    expect(isTeacherSessionActive()).toBe(false);
  });

  it('no guarda el PIN en claro en localStorage', async () => {
    await configurarPin('5678');
    const todo = JSON.stringify(window.localStorage);
    expect(todo).not.toContain('5678');
  });
});

describe('acceso docente — ingreso', () => {
  it('el PIN correcto abre sesión', async () => {
    await configurarPin('4321');
    cerrarSesionDocente();
    expect(isTeacherSessionActive()).toBe(false);

    expect(await ingresarConPin('4321')).toBe(true);
    expect(isTeacherSessionActive()).toBe(true);
  });

  it('el PIN incorrecto no abre sesión', async () => {
    await configurarPin('4321');
    cerrarSesionDocente();

    expect(await ingresarConPin('0000')).toBe(false);
    expect(isTeacherSessionActive()).toBe(false);
  });

  it('ingresar sin PIN configurado devuelve false', async () => {
    expect(await ingresarConPin('1234')).toBe(false);
  });

  it('cerrar sesión no borra el PIN (se puede reentrar)', async () => {
    await configurarPin('1357');
    cerrarSesionDocente();
    expect(necesitaConfigurarPin()).toBe(false);
    expect(await ingresarConPin('1357')).toBe(true);
  });
});
