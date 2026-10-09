import { describe, expect, it } from 'vitest';
import { getMomento, MOMENTOS_DISPONIBLES } from './moments';

describe('getMomento', () => {
  it('empareja el acierto con la pose "celebrando" y su microcopy', () => {
    expect(getMomento('acierto')).toEqual({
      pose: 'celebrando',
      mensaje: '¡Muy bien! Así se razona.',
    });
  });

  it('empareja el error con una pose motivadora (no de burla)', () => {
    const { pose, mensaje } = getMomento('error');
    expect(pose).toBe('animando');
    expect(mensaje).toBe('Casi. Mira esta pista y vuelve a intentarlo.');
  });

  it('empareja la bienvenida con la pose "saludando"', () => {
    expect(getMomento('bienvenida').pose).toBe('saludando');
  });

  it('cubre todos los momentos disponibles', () => {
    for (const momento of MOMENTOS_DISPONIBLES) {
      const config = getMomento(momento);
      expect(config.pose).toBeTruthy();
      expect(config.mensaje.length).toBeGreaterThan(0);
    }
  });
});
