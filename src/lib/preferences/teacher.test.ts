import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  clearClassGrade,
  clearTeacherSession,
  getClassGrade,
  getTeacherPinHash,
  isTeacherSessionActive,
  setClassGrade,
  setTeacherPinHash,
  setTeacherSession,
} from './teacher';

/** Pruebas del estado local del panel docente (localStorage, sin PII). */

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
});

describe('teacherPinHash', () => {
  it('redondea set/get del hash', () => {
    expect(getTeacherPinHash()).toBeNull();
    setTeacherPinHash('salt:hash');
    expect(getTeacherPinHash()).toBe('salt:hash');
  });

  it('devuelve null si no hay valor', () => {
    expect(getTeacherPinHash()).toBeNull();
  });
});

describe('teacherSession', () => {
  it('activa y cierra la sesión docente', () => {
    expect(isTeacherSessionActive()).toBe(false);
    setTeacherSession(true);
    expect(isTeacherSessionActive()).toBe(true);
    setTeacherSession(false);
    expect(isTeacherSessionActive()).toBe(false);
  });

  it('clearTeacherSession deja la sesión inactiva', () => {
    setTeacherSession(true);
    clearTeacherSession();
    expect(isTeacherSessionActive()).toBe(false);
  });
});

describe('classGrade', () => {
  it('redondea set/get del grado por clase', () => {
    expect(getClassGrade('clase-1')).toBeNull();
    setClassGrade('clase-1', 7);
    expect(getClassGrade('clase-1')).toBe(7);
  });

  it('valores corruptos devuelven null (estado seguro)', () => {
    window.localStorage.setItem('bacata.teacher.classGrade.clase-x', '99');
    expect(getClassGrade('clase-x')).toBeNull();
  });

  it('clearClassGrade olvida la elección', () => {
    setClassGrade('clase-2', 6);
    clearClassGrade('clase-2');
    expect(getClassGrade('clase-2')).toBeNull();
  });
});
