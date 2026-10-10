/**
 * Política de privacidad de Bacatá como DATOS tipados (separados de la
 * presentación). El texto está en español claro, pensado para que un ACUDIENTE
 * lo entienda, con el tono Bacatá: serio, honesto y respetuoso.
 *
 * Mantenimiento: para actualizar el texto legal se edita este módulo, sin tocar
 * el componente de presentación (`PoliticaPrivacidad.tsx`). No se usa una
 * librería de markdown (restricción de peso): el contenido son estructuras
 * tipadas que el componente renderiza con encabezados y listas accesibles.
 *
 * Alcance (MVP solo local, para menores): Ley 1581 de 2012 como requisito de
 * origen. Es un BORRADOR informativo; ver `avisoBorrador`.
 */

/** Un bloque de contenido dentro de una sección: párrafo o lista. */
export type BloquePolitica =
  | { tipo: 'parrafo'; texto: string }
  | { tipo: 'lista'; items: string[] };

/** Una sección con su encabezado y sus bloques de contenido. */
export interface SeccionPolitica {
  /** Identificador estable, útil para pruebas y anclas. */
  id: string;
  titulo: string;
  bloques: BloquePolitica[];
}

/** Documento completo de la política de privacidad. */
export interface PoliticaPrivacidad {
  titulo: string;
  /** Fecha o estado de la versión del documento (texto libre, no vinculante). */
  actualizado: string;
  /** Aviso visible de que el texto es un borrador sin valor de asesoría legal. */
  avisoBorrador: string;
  /** Resumen breve y amable antes del detalle. */
  intro: string;
  secciones: SeccionPolitica[];
}

/** Aviso literal exigido por la tarea; se muestra de forma destacada. */
export const AVISO_BORRADOR =
  'Este documento es un borrador informativo, no asesoría jurídica; debe ser ' +
  'revisado por un profesional del derecho antes de un despliegue con ' +
  'estudiantes reales.';

export const POLITICA_PRIVACIDAD: PoliticaPrivacidad = {
  titulo: 'Política de privacidad de Bacatá',
  actualizado: 'Versión preliminar (MVP). Fecha por confirmar.',
  avisoBorrador: AVISO_BORRADOR,
  intro:
    'Bacatá es una app para que estudiantes de secundaria repasen historia y ' +
    'ciencias sociales. Como está pensada para menores de edad, cuidamos los ' +
    'datos al máximo: recogemos lo mínimo necesario y todo se queda en este ' +
    'dispositivo. Aquí te explicamos, en lenguaje claro, qué información se usa ' +
    'y cómo se protege.',
  secciones: [
    {
      id: 'que-datos',
      titulo: '¿Qué datos usa Bacatá?',
      bloques: [
        {
          tipo: 'parrafo',
          texto:
            'Para funcionar, la app solo necesita un apodo (un nombre inventado ' +
            'que elige el estudiante) y el código de la clase que entrega el ' +
            'docente. A medida que el estudiante aprende, se guarda su progreso: ' +
            'lecciones completadas, puntos, racha y logros.',
        },
        {
          tipo: 'lista',
          items: [
            'Apodo: un nombre inventado, no el nombre real.',
            'Código de clase: lo entrega el docente; no identifica al estudiante.',
            'Progreso de aprendizaje: avance en lecciones, puntos, racha y logros.',
          ],
        },
      ],
    },
    {
      id: 'que-no-recoge',
      titulo: '¿Qué datos NO se recogen?',
      bloques: [
        {
          tipo: 'parrafo',
          texto:
            'Bacatá no pide ni guarda ningún dato que permita identificar al ' +
            'estudiante. En concreto, no recogemos:',
        },
        {
          tipo: 'lista',
          items: [
            'Nombre y apellidos reales.',
            'Correo electrónico ni número de teléfono.',
            'Ubicación o GPS.',
            'Fotos ni cámara.',
            'Contactos de la agenda ni identificadores del dispositivo para rastreo.',
          ],
        },
      ],
    },
    {
      id: 'donde-se-guardan',
      titulo: '¿Dónde se guardan los datos?',
      bloques: [
        {
          tipo: 'parrafo',
          texto:
            'Todo se guarda únicamente en este dispositivo (en el almacenamiento ' +
            'local del navegador). En esta versión no hay servidor: la ' +
            'información no viaja a internet ni a ninguna empresa. Si la app se ' +
            'usa en otro dispositivo, el progreso no se comparte entre ellos.',
        },
      ],
    },
    {
      id: 'para-que',
      titulo: '¿Para qué se usan?',
      bloques: [
        {
          tipo: 'parrafo',
          texto:
            'Los datos se usan solo con una finalidad: apoyar el aprendizaje del ' +
            'estudiante y permitir que el docente haga seguimiento pedagógico del ' +
            'avance de su clase. Para nada más.',
        },
      ],
    },
    {
      id: 'sin-publicidad',
      titulo: 'Sin publicidad, sin rastreadores, sin venta de datos',
      bloques: [
        {
          tipo: 'parrafo',
          texto:
            'Bacatá no muestra publicidad, no incluye rastreadores de terceros y ' +
            'nunca vende ni comparte la información. No hay anuncios dirigidos a ' +
            'menores ni perfilado de ningún tipo.',
        },
      ],
    },
    {
      id: 'borrar-datos',
      titulo: '¿Cómo se borran los datos?',
      bloques: [
        {
          tipo: 'parrafo',
          texto:
            'El estudiante puede borrar sus propios datos desde la app, con la ' +
            'opción "Borrar mis datos": elimina su perfil y su progreso de este ' +
            'dispositivo. El docente también puede eliminar un perfil o una clase ' +
            'completa desde su panel. Este es el derecho de supresión: pedir que ' +
            'se eliminen los datos cuando ya no se necesiten.',
        },
      ],
    },
    {
      id: 'consentimiento-acudiente',
      titulo: 'Consentimiento del acudiente',
      bloques: [
        {
          tipo: 'parrafo',
          texto:
            'Por tratarse de menores, el consentimiento del acudiente (padre, ' +
            'madre o responsable) lo gestiona el docente o la institución por ' +
            'fuera de la app. En esta versión Bacatá no almacena datos de ' +
            'acudientes.',
        },
      ],
    },
    {
      id: 'ley-1581',
      titulo: 'La Ley 1581 de 2012',
      bloques: [
        {
          tipo: 'parrafo',
          texto:
            'En Colombia, la Ley 1581 de 2012 protege los datos personales. ' +
            'Bacatá sigue su principio central: recoger la menor cantidad de ' +
            'datos posible y usarlos solo para lo que se declaró. Como el ' +
            'estudiante usa un apodo y el progreso vive en el dispositivo, no se ' +
            'maneja información que lo identifique.',
        },
      ],
    },
    {
      id: 'conservacion',
      titulo: '¿Cuánto tiempo se conservan?',
      bloques: [
        {
          tipo: 'parrafo',
          texto:
            'Los datos viven en el dispositivo y se eliminan cuando se borra el ' +
            'perfil o la clase, o cuando se desinstala la app. El plazo legal ' +
            'formal de conservación está por definir con un asesor jurídico; no ' +
            'fijamos aquí un número que pueda inducir a error.',
        },
      ],
    },
    {
      id: 'contacto',
      titulo: 'Dudas',
      bloques: [
        {
          tipo: 'parrafo',
          texto:
            'Si un acudiente o docente tiene dudas sobre la privacidad, puede ' +
            'consultarlas con la institución educativa que ofrece Bacatá.',
        },
      ],
    },
  ],
};
