---
inclusion: fileMatch
fileMatchPattern: 'content/**'
---

# Estructura y creación de contenido pedagógico

Este documento define el modelo de datos del contenido para que un docente pueda crearlo y
actualizarlo, y para que la app lo valide y lo renderice de forma consistente.

## Jerarquía

```
Curso (grado + área)
└── Unidad (tema; declara su vínculo con la Cátedra de la Paz)
    └── Lección (objetivo de aprendizaje, 5–10 min)
        └── Ejercicio (ítem interactivo con retroalimentación)
```

## Metadatos obligatorios

- **Curso**: `id`, `grado` (6 | 7), `area`, `titulo`, `descripcion`, `version`.
- **Unidad**: `id`, `titulo`, `descripcion`, `orden`, `objetivos`, `ejePaz` (bool),
  `catedraPaz` (temáticas de la Cátedra de la Paz que aborda y cómo).
- **Lección**: `id`, `titulo`, `objetivoAprendizaje`, `competencia`, `orden`, `ejercicios`.
- **Ejercicio**: `id`, `tipo`, `enunciado`, datos propios del tipo, `retroalimentacion`, y
  `meta` con: `tema`, `etiquetas[]` (puede incluir `paz`), `fuente?` (título/autor/url/año),
  `sensible?` (bool), `notaContexto?`, `estado` (`borrador` | `aprobado`).

## Tipos de ejercicio soportados (MVP)

- `opcion_multiple`: `opciones[]` (texto + `esCorrecta` + `retro` por opción).
- `verdadero_falso`: `respuestaCorrecta` (bool) + `justificacion`.
- `emparejar`: `pares[]` (izquierda ↔ derecha).
- `ordenar`: `elementos[]` con `orden`.
- `completar`: `texto` con huecos + `opciones` por hueco.
- `dilema`: `escenario`, `opciones[]` (cada una con una `reflexion`; sin única respuesta
  correcta) — refuerza criterio y empatía.
- `analisis_fuente`: `recurso` (texto, o imagen con `alt`) + `preguntas[]` con opciones
  evaluables — desarrolla pensamiento crítico (contrastar fuentes, identificar perspectivas).

## Reglas de contenido

- Todo ejercicio DEBE tener retroalimentación formativa (por qué, no solo correcto/incorrecto).
- Toda unidad DEBE declarar su vínculo con la Cátedra de la Paz en `catedraPaz` y su `ejePaz`.
- Cada unidad DEBE incluir al menos un ejercicio con enfoque de eje Paz (memoria, convivencia,
  resolución de conflictos o participación ciudadana).
- Hechos, datos o documentos DEBEN citar su `fuente`. Presentar múltiples perspectivas; sin
  proselitismo político ni lenguaje que estigmatice a personas o grupos.
- Temas sensibles (`sensible: true`): tratamiento pedagógico, sin imágenes gráficas, con respeto
  a las víctimas y enfoque de dignidad; incluir `notaContexto`. El estudiante puede omitirlos.
- Lenguaje claro, inclusivo, apropiado a la edad; usar tildes y signos de apertura (¿ ¡).
- Datos y ejemplos verificables y contextualizados a Colombia.
- Imágenes informativas requieren texto alternativo (`alt`).
- Solo contenido con `estado: aprobado` se incluye en la app (flujo borrador → aprobado).

## Validación

- El contenido se valida contra un **esquema** (ver `/content/schema`). Un archivo que no cumpla
  el esquema debe fallar la validación (`validate:content`) y no llegar al estudiante.
- IDs únicos y estables (no reusar un `id` para otro contenido).

## Versionado y actualización

- El contenido vive como **archivos JSON versionados** en `/content`.
- Cambiar contenido es un cambio de datos: idealmente en commits separados del código.
- Preparar el modelo para que, en una fase futura, un panel docente edite estos datos sin tocar
  el repositorio.
