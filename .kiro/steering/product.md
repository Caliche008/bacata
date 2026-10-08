---
inclusion: always
---

# Visión del producto

> **Marca: Bacatá** — *Conoce tu historia, construye tu país.* La identidad visual, el tono de
> voz, la mascota y la paleta están definidos en `brand.md` (steering siempre activo) y aplican a
> todo lo de cara al usuario.

## Qué es

**Bacatá** es una aplicación educativa tipo Duolingo para que estudiantes de secundaria de Colombia
aprendan y repasen historia y ciencias sociales mediante lecciones cortas, una ruta de
progreso por niveles, ejercicios interactivos, retroalimentación inmediata y mecánicas de
motivación (rachas, puntos y logros). La **Cátedra de la Paz** es el eje transversal de todo
el contenido, no un módulo aparte.

## Propósito

Hacer que repasar historia y ciencias sociales sea divertido y accesible para estudiantes de
colegios públicos, complementar lo que ven en clase y, sobre todo, sembrar pensamiento
crítico y formación ciudadana. El norte del producto es cívico: formar personas conscientes
y críticas en el contexto colombiano.

## Usuarios

- **Estudiante** (foco principal): secundaria, inicialmente 6° y 7°. Usa la app de forma
  individual, con un apodo, sin datos personales sensibles.
- **Docente** (especialista en ciencias sociales): crea y actualiza contenido, crea clases,
  entrega códigos de clase y hace seguimiento del progreso.
- **Institución** (futuro): estructura de datos preparada, sin pantallas en el MVP.
- **Acudiente**: no usa la app directamente en el MVP; su consentimiento lo gestiona el
  docente por fuera de la aplicación.

## Contexto

- País: Colombia. Idioma: español.
- Dispositivos objetivo: móviles Android de gama baja/media.
- Conectividad: debe funcionar **con y sin conexión** (offline-first). Muchos estudiantes
  tienen datos limitados o conectividad intermitente.
- Alineación: lineamientos curriculares de ciencias sociales del MEN y Cátedra de la Paz
  (Ley 1732 de 2014 y Decreto 1038 de 2015).

## Modelo de negocio

- **Freemium con aspiración de financiación estatal** (p. ej. secretaría de educación de un
  municipio).
- **Principio irrenunciable: aprender es gratis.** Todo el contenido pedagógico base es
  gratuito para el estudiante, siempre. Nunca se cobra por acceder a aprender.
- Lo "premium" se limita a funciones de docente/institución: reportes avanzados, analítica,
  más cursos o administración a escala. El estudiante nunca paga.

## Alcance del MVP

- Grados: **6° y 7°**.
- **4 unidades livianas** (amplitud sobre profundidad), con Cátedra de la Paz transversal:
  1. Convivencia y resolución de conflictos
  2. Derechos humanos y deberes ciudadanos
  3. Diversidad cultural y territorio colombiano
  4. Memoria histórica y construcción de paz
- Roles: estudiante completo + panel docente mínimo (seguimiento del progreso y
  activar/desactivar unidades). Institución preparada en el modelo de datos, sin pantallas.
- Contenido inicial fijo (archivos versionados), con la actualización habilitada desde el inicio.

## Principios de diseño

1. **Aprender es gratis y accesible** para colegios públicos.
2. **Pensamiento crítico y civismo** por encima de la memorización.
3. **Cátedra de la Paz como eje transversal**, nunca un añadido.
4. **Privacidad primero**: el mínimo de datos posible, por tratarse de menores.
5. **Offline-first**: funciona sin conexión en dispositivos de gama baja.
6. **Accesibilidad desde el día uno**: lector de pantalla, contraste y tamaños de fuente.
7. **Diversión con propósito**: la motivación (rachas, puntos, logros) refuerza el aprendizaje,
   no lo sustituye.
