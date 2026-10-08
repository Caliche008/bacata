# Bacatá — Historia y Ciencias Sociales (Cátedra de la Paz)

> *Conoce tu historia, construye tu país.*

**Bacatá** es una aplicación educativa tipo Duolingo para que estudiantes de secundaria de
Colombia (inicialmente 6° y 7°) aprendan y repasen historia y ciencias sociales de forma
interactiva, divertida y accesible. La **Cátedra de la Paz** es el eje transversal del contenido.
El propósito es complementar la clase, fomentar el pensamiento crítico y sembrar formación
ciudadana. El nombre viene de *Bacatá*, el nombre muisca del territorio donde hoy está Bogotá.

> Estado: fase de diseño. Este repositorio contiene el andamiaje de Kiro (steering, spec, hooks)
> y el contenido semilla. La implementación sigue el plan en `.kiro/specs/mvp-aprendizaje/tasks.md`.

## Características (MVP)

- Ruta de aprendizaje por niveles con lecciones cortas.
- 6 tipos de ejercicio con retroalimentación inmediata (incluye dilemas de toma de postura).
- Gamificación con propósito: puntos, rachas y logros (sin rankings que expongan).
- **Offline-first**: funciona con y sin conexión; pensada para Android de gama baja/media.
- **Privacidad primero** (Ley 1581): el estudiante entra con apodo + código de clase, sin datos
  personales.
- **Accesibilidad desde el MVP**: lector de pantalla, alto contraste, tamaños de texto.
- Panel docente mínimo: crear clases, ver progreso, activar/desactivar unidades.

## Marca

La identidad de **Bacatá** (personalidad, mascota, logo, paleta, tipografía, tono de voz y
microcopy) está definida en `.kiro/steering/brand.md` y es contexto permanente de diseño.
Resumen: perro andino como compañero de ruta; paleta verde esmeralda / dorado muisca / terracota
sobre crema; tono cálido, curioso y respetuoso; accesibilidad por encima de la estética.

## Stack

PWA con React + TypeScript (Vite), IndexedDB + Service Worker (Workbox) para offline, contenido
pedagógico en JSON validado por esquema. Backend opcional en fase posterior.

## Estructura del repositorio

```
/content                  Contenido pedagógico en JSON (versionado)
  /cursos                 Un archivo por curso/grado (p. ej. grado-6.json)
/.kiro
  /steering               Lineamientos siempre activos (producto, marca, pedagogía, privacidad, técnico)
  /specs/mvp-aprendizaje   requirements.md, design.md, tasks.md
  /hooks                  Automatizaciones (validar contenido, lint, guard de privacidad)
```

## Cómo seguir (para implementar con Kiro)

1. Revisa el spec en `.kiro/specs/mvp-aprendizaje/` (requisitos → diseño → tareas).
2. Ejecuta las tareas de `tasks.md` en orden; cada una referencia los requisitos que cubre.
3. La tarea 1 inicializa el proyecto PWA; a partir de ahí se construye incrementalmente.

## Contenido pedagógico

El contenido lo define y actualiza un docente especialista en ciencias sociales. Vive en
`/content` como JSON, se valida contra un esquema (`npm run validate:content`) y sigue las reglas
de `.kiro/steering/contenido.md`. Cada unidad declara su vínculo con la Cátedra de la Paz.

## Privacidad y accesibilidad

Son requisitos de origen, no opcionales. Ver `.kiro/steering/privacidad-accesibilidad.md`. La app
recolecta el mínimo de datos y está diseñada para ser usable en colegios públicos.

## Modelo

Freemium con aspiración de financiación estatal. **Aprender siempre es gratis para el estudiante.**
