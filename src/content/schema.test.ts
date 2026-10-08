import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { cursoSchema, ejercicioSchema } from './schema';

/**
 * Pruebas del esquema de contenido.
 *
 * Caso válido: el contenido semilla real (`content/cursos/grado-6.json`) valida.
 * Casos malformados: una regla clave por caso; cada uno debe fallar con un
 * mensaje/ruta útil. Los fixtures malformados se construyen aquí (no se toca
 * el contenido semilla).
 */

const seedCurso = JSON.parse(
  readFileSync(join(process.cwd(), 'content', 'cursos', 'grado-6.json'), 'utf8'),
) as unknown;

/** Ejercicio de opción múltiple válido reutilizable como base de los fixtures. */
function ejercicioOpcionMultipleValido() {
  return {
    id: 'e-1',
    tipo: 'opcion_multiple',
    enunciado: '¿Cuál es un ejemplo de convivencia pacífica?',
    opciones: [
      { id: 'a', texto: 'Dialogar', esCorrecta: true, retro: 'Correcto: el diálogo construye.' },
      { id: 'b', texto: 'Gritar', esCorrecta: false, retro: 'Casi: imponerse no resuelve.' },
    ],
    retroalimentacion: 'El diálogo es la base de la convivencia.',
    meta: {
      tema: 'Convivencia',
      etiquetas: ['paz'],
      estado: 'aprobado',
    },
  };
}

describe('cursoSchema — caso válido', () => {
  it('valida el contenido semilla real grado-6.json', () => {
    const resultado = cursoSchema.safeParse(seedCurso);
    expect(resultado.success).toBe(true);
  });
});

describe('ejercicioSchema — casos malformados por regla clave', () => {
  it('dilema con un campo de respuesta correcta (esCorrecta) falla', () => {
    const dilema = {
      id: 'd-1',
      tipo: 'dilema',
      enunciado: '¿Qué harías?',
      escenario: 'Un compañero te empuja sin querer.',
      opciones: [
        {
          id: 'o1',
          texto: 'Responder con calma',
          reflexion: 'Expresar sin agredir abre el entendimiento.',
          esCorrecta: true, // campo indebido: el dilema no tiene respuesta correcta
        },
      ],
      meta: { tema: 'Dilema', etiquetas: ['paz'], estado: 'aprobado' },
    };

    const resultado = ejercicioSchema.safeParse(dilema);
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      // Zod reporta la clave no reconocida en la opción del dilema
      const texto = JSON.stringify(resultado.error.issues);
      expect(texto).toContain('esCorrecta');
    }
  });

  it('analisis_fuente con recurso imagen sin alt falla', () => {
    const analisis = {
      id: 'af-1',
      tipo: 'analisis_fuente',
      enunciado: 'Observa la imagen y responde.',
      recurso: { clase: 'imagen', src: 'mural.png', alt: '' }, // alt vacío
      preguntas: [
        {
          id: 'q1',
          pregunta: '¿Qué muestra?',
          opciones: [
            { id: 'a', texto: 'Un mural', esCorrecta: true, retro: 'Correcto.' },
            { id: 'b', texto: 'Un texto', esCorrecta: false, retro: 'Casi.' },
          ],
        },
      ],
      meta: { tema: 'Fuente', etiquetas: ['paz'], estado: 'aprobado' },
    };

    const resultado = ejercicioSchema.safeParse(analisis);
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const issue = resultado.error.issues[0];
      expect(issue.path.join('.')).toContain('alt');
      expect(issue.message.toLowerCase()).toContain('alt');
    }
  });

  it('meta sin estado falla', () => {
    const ejercicio = ejercicioOpcionMultipleValido();
    const metaSinEstado = {
      tema: ejercicio.meta.tema,
      etiquetas: ejercicio.meta.etiquetas,
    };
    const malformado = { ...ejercicio, meta: metaSinEstado };

    const resultado = ejercicioSchema.safeParse(malformado);
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const texto = JSON.stringify(resultado.error.issues);
      expect(texto).toContain('estado');
    }
  });

  it('tipo de ejercicio desconocido falla', () => {
    const ejercicio = { ...ejercicioOpcionMultipleValido(), tipo: 'arrastrar' };

    const resultado = ejercicioSchema.safeParse(ejercicio);
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const texto = JSON.stringify(resultado.error.issues);
      expect(texto).toContain('tipo');
    }
  });

  it('ejercicio evaluable sin retroalimentación disponible falla', () => {
    const sinRetro = {
      id: 'om-2',
      tipo: 'opcion_multiple',
      enunciado: '¿Pregunta sin retro?',
      opciones: [
        { id: 'a', texto: 'Sí', esCorrecta: true },
        { id: 'b', texto: 'No', esCorrecta: false },
      ],
      meta: { tema: 'Convivencia', etiquetas: ['paz'], estado: 'aprobado' },
    };

    const resultado = ejercicioSchema.safeParse(sinRetro);
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const texto = JSON.stringify(resultado.error.issues);
      expect(texto.toLowerCase()).toContain('retroalimentación');
    }
  });
});

describe('unidadSchema — Cátedra de la Paz obligatoria', () => {
  it('unidad sin catedraPaz ni ejePaz falla', () => {
    const curso = {
      id: 'c-1',
      grado: 6,
      area: 'ciencias_sociales',
      titulo: 'Curso',
      descripcion: 'Descripción',
      version: '0.1.0',
      unidades: [
        {
          id: 'u-1',
          titulo: 'Unidad sin paz',
          descripcion: 'Sin eje de paz.',
          orden: 1,
          objetivos: [],
          lecciones: [],
          // falta ejePaz y catedraPaz
        },
      ],
    };

    const resultado = cursoSchema.safeParse(curso);
    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      const texto = JSON.stringify(resultado.error.issues);
      expect(texto).toContain('ejePaz');
      expect(texto).toContain('catedraPaz');
    }
  });
});
