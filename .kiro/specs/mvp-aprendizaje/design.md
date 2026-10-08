# Diseño — MVP App de Historia y Ciencias Sociales (Cátedra de la Paz) · Bacatá

## Visión general

PWA offline-first en React + TypeScript (Vite), optimizada para Android de gama baja/media. El
MVP es **solo local (Opción A)**: funciona 100% con contenido empaquetado y progreso en el
dispositivo, **sin backend**. El backend (sincronización, login docente centralizado,
recuperación entre dispositivos, descarga incremental) es **Fase 2**; el modelo de datos se diseña
desde ya para habilitarlo sin reescritura. La Cátedra de la Paz es transversal: vive dentro del
modelo de contenido (etiquetas y metadato por unidad), no como un módulo separado. La identidad
(mascota, paleta, tono) sigue `brand.md`.

Este diseño responde a `requirements.md` y a los steering de producto, marca, pedagogía,
privacidad/accesibilidad, técnico y contenido.

## Arquitectura (MVP local)

```
┌──────────────────────────────────────────────────────────┐
│                     PWA (navegador Android)                │
│  UI (React + TS)                                           │
│   ├─ features/auth        (código de clase + apodo)        │
│   ├─ features/lessons     (ruta, lección, motor ejercicios)│
│   ├─ features/progress    (XP, rachas, logros, repaso)     │
│   ├─ features/teacher     (panel docente — modo local)     │
│   ├─ features/mascota     (poses + microcopy de marca)     │
│   └─ components           (UI accesible reutilizable)      │
│  Núcleo                                                    │
│   ├─ content/   (tipos, esquema Zod, loader, validación)   │
│   ├─ lib/storage (IndexedDB vía idb/Dexie)                 │
│   └─ lib/sync    (cola de eventos — preparada, inactiva)   │
│  Service Worker (Workbox): cachea app shell + assets +     │
│  contenido empaquetado                                     │
└──────────────────────────────────────────────────────────┘

Fase 2 (no en el MVP): API REST + BD para sync, cuentas docente, descarga de contenido.
```

### Capas

- **Presentación**: componentes accesibles, enrutamiento con React Router + lazy-loading.
- **Dominio**: evaluador de ejercicios, cálculo de progreso/gamificación, reglas de desbloqueo,
  repaso de errores. Lógica pura y testeable, independiente de la UI.
- **Datos**: contenido (JSON validado por esquema) + persistencia local (IndexedDB). La capa
  `lib/sync` existe como cola de eventos preparada para Fase 2, pero inactiva en el MVP.

## Modelo de contenido

Tipos (TypeScript) validados con esquema (Zod). El contenido vive en `/content` como JSON.

```ts
type Grado = 6 | 7;
type EstadoContenido = 'borrador' | 'aprobado';   // R7.8: solo 'aprobado' entra a la app

interface Curso {
  id: string;
  grado: Grado;
  area: 'ciencias_sociales';
  titulo: string;
  descripcion: string;
  version: string;            // versión de contenido (R7.6 IDs estables entre versiones)
  unidades: Unidad[];
}

interface Unidad {
  id: string;
  titulo: string;
  descripcion: string;
  orden: number;
  objetivos: string[];
  ejePaz: boolean;            // R12.1: etiqueta de eje Paz
  catedraPaz: { tematicas: string[]; como: string };  // R12.2
  lecciones: Leccion[];
}

interface Leccion {
  id: string;
  titulo: string;
  objetivoAprendizaje: string;
  competencia: string;
  orden: number;
  ejercicios: Ejercicio[];
}

// Metadatos por ejercicio (R7.7): grado, tema, tipo, fuente, etiquetas (incl. ejePaz)
interface Meta {
  tema: string;
  etiquetas: string[];        // puede incluir 'paz'
  fuente?: Fuente;            // R3.8: crédito de hechos/documentos
  sensible?: boolean;         // R12.3/12.4: tratamiento y opción de omitir
  notaContexto?: string;      // R12.4: nota mostrada antes de un tema sensible
  estado: EstadoContenido;    // R7.8
}
interface Fuente { titulo: string; autor?: string; url?: string; anio?: number; }

type Ejercicio =
  | OpcionMultiple | VerdaderoFalso | Emparejar | Ordenar | Completar | Dilema | AnalisisFuente;

interface Base { id: string; enunciado: string; retroalimentacion?: string; meta: Meta; }

interface OpcionMultiple extends Base {
  tipo: 'opcion_multiple';
  opciones: { id: string; texto: string; esCorrecta: boolean; retro?: string }[];
}
interface VerdaderoFalso extends Base {
  tipo: 'verdadero_falso'; respuestaCorrecta: boolean; justificacion: string;
}
interface Emparejar extends Base {
  tipo: 'emparejar'; pares: { izquierda: string; derecha: string }[];
}
interface Ordenar extends Base {
  tipo: 'ordenar'; elementos: { id: string; texto: string; orden: number }[];
}
interface Completar extends Base {
  tipo: 'completar'; texto: string; huecos: { id: string; opciones: string[]; correcta: string }[];
}
interface Dilema extends Base {
  tipo: 'dilema'; escenario: string; opciones: { id: string; texto: string; reflexion: string }[];
}
// R3.1: nuevo tipo. Fuente (texto o imagen con alt) + preguntas de análisis.
interface AnalisisFuente extends Base {
  tipo: 'analisis_fuente';
  recurso: { clase: 'texto'; contenido: string } | { clase: 'imagen'; src: string; alt: string };
  preguntas: { id: string; pregunta: string; opciones: { id: string; texto: string; esCorrecta: boolean; retro?: string }[] }[];
}
```

Reglas:
- Toda `Unidad` declara `catedraPaz` y `ejePaz` (R12.1, R12.2, R7.3).
- Todo ejercicio evaluable aporta retroalimentación formativa (R3.2, R3.6).
- `dilema` no tiene respuesta correcta; devuelve reflexión por opción (R3.3).
- Contenido con `estado !== 'aprobado'` no se incluye en la app (R7.8).
- Toda imagen informativa (incl. `analisis_fuente`) requiere `alt` (R9, accesibilidad).
- Validación por esquema; contenido malformado falla en build / se excluye (R3.5, R7.2).

## Modelo de datos local (IndexedDB)

Stores:
- `perfilEstudiante`: `{ id, apodo, codigoClase, grado, creadoEn }` — sin PII (R1, R8.1).
- `progreso`: `{ id, estudianteId, leccionId, estado, aciertos, parcial?, completadaEn }`
  (`parcial` guarda avance a mitad de lección — R3.9).
- `gamificacion`: `{ estudianteId, xp, rachaActual, mejorRacha, ultimaFechaActiva, logros[] }`.
- `repaso`: `{ estudianteId, ejercicioId, fallos, proximaAparicion }` (R14).
- `contenidoCache`: contenido empaquetado + versión.
- `clasesLocales`: `{ id, codigo, unidadesActivas[], docentePinHash }` (panel docente local).
- `colaSync`: eventos de progreso — **preparada para Fase 2, inactiva en el MVP** (R5.4).

Todo progreso se escribe local primero (R5.3). Los `id` de evento son idempotentes para que la
sincronización de Fase 2 no duplique ni pierda datos. Se solicita `navigator.storage.persist()`
y se maneja la cuota (R5.6).

## Componentes clave

### Autenticación estudiante (features/auth)
- Pantalla: código de clase + apodo. Antes de elegir apodo, aviso de no usar nombre real (R1.7).
- Valida formato del código; resuelve clase local; apodo único por clase (R1.6); filtro de
  lenguaje ofensivo (R1.7). Códigos difíciles de adivinar y límite de intentos (R1.8).
- Crea/recupera `perfilEstudiante`; sesión local sin volver a pedir el código (R1.4, R1.5).
- Aviso: en el MVP el progreso vive solo en este dispositivo (R1.9 MVP).

### Ruta de aprendizaje (features/lessons)
- Curso del grado → unidades → lecciones, ordenadas (R2.1). Progreso de unidad en % (R2.6).
- Estados de lección (bloqueada/disponible/completada) con ícono + texto, no solo color
  (R2.3, R2.4, R9.5). Desbloqueo por `orden` y progreso (R2.2).
- Oculta unidades desactivadas por el docente para la clase (R6.4).
- Celebración breve con mascota al completar nivel/unidad (R2.7, R15.1).

### Motor de ejercicios (features/lessons)
- Renderizador por `tipo` (7 tipos) + **evaluador puro** → `{ correcto, retroalimentacion }`.
  `dilema` devuelve reflexión sin veredicto; `analisis_fuente` evalúa sus preguntas.
- Retroalimentación inmediata con texto + ícono (R3.2); en error, pista + reintento con tono de
  marca (R3.6, R3.7). Muestra fuente/crédito cuando aplica (R3.8).
- Guarda avance parcial al abandonar (R3.9). Temas sensibles: nota de contexto + opción de omitir
  sin bloquear la lección (R12.3, R12.4).

### Progreso y gamificación (features/progress)
- **Fórmula de XP (R4.1, definida):** +10 XP por completar una lección; +2 XP por acierto en
  primer intento; +0 en reintentos (sin penalización por fallar). Lección de repaso: +5 XP al
  completarla. (Ajustable; vive en una constante central.)
- **Racha (R4.2, R4.7):** cuenta por fecha local (día calendario del dispositivo). Si pasa más de
  1 día sin actividad, la racha vuelve a 1 con mensaje motivador (R4.6). Se guarda `mejorRacha`.
  Para evitar inconsistencias por cambio de reloj, se registra la última fecha activa y se ignoran
  saltos hacia atrás. **"Congelar racha": no incluido en el MVP** (decisión; se evalúa después).
- **Logros (R4.3):** hitos pedagógicos (completar unidad, racha de 7 días, etc.). Sin rankings
  públicos (R4.4). Todo 100% offline (R4.5).
- **Avance en eje Paz (R12.5):** porcentaje de contenido con `ejePaz`/etiqueta 'paz' completado.

### Repaso de errores (features/progress)
- Al fallar, se registra en `repaso` (R14.1). Lección de repaso con los pendientes, offline
  (R14.2). Al acertar en repaso, se espacia la próxima aparición (repetición espaciada simple:
  duplicar intervalo por acierto) (R14.3).

### Panel docente (features/teacher) — modo local
- Acceso docente con PIN/clave local (hash) (R6.5, R8.6). Crear clase → código único (R6.1).
- Ver progreso por estudiante (apodo), sin PII (R6.2). Activar/desactivar unidades por clase
  (R6.3, R6.4). Renombrar/eliminar perfil de estudiante (R6.6). Regenerar/desactivar código (R6.7).
- Nota: el seguimiento centralizado entre dispositivos y la "última sincronización" son Fase 2
  (R6.8, R6.9).

### Mascota e identidad (features/mascota, styles)
- Poses de `brand.md` (feliz, pensando, celebrando, animando tras error, saludando, durmiendo)
  en bienvenida, acierto, error, celebración y recordatorio (R15.1). Microcopy y tono de marca.
- Recursos gráficos ligeros (SVG) para no afectar el presupuesto de peso (R15.2, R10.5).

### Accesibilidad transversal (components, styles)
- Tokens de color de `brand.md` con contraste AA + tema de alto contraste (R9.2). **Verificar cada
  par texto/fondo** (p. ej. dorado sobre crema suele quedar justo).
- Escala de tamaño de texto (normal/grande/muy grande), mínimo 16 px (R9.3, brand).
- Focus visible, teclado, roles ARIA, objetivos táctiles ≥ 44px (R9). `prefers-reduced-motion`
  respetado (R9.6).

## Offline-first y PWA

- Manifest + íconos (claro/crema/noche de `brand.md`) para instalar en Android (R5.1).
- Service Worker (Workbox): precache del app shell y assets; contenido empaquetado cache-first
  (R5.2, R10.3). `navigator.storage.persist()` + manejo de cuota y avisos (R5.6, R5.7).
- Progreso siempre en IndexedDB (R5.3, R5.5). Sin red requerida tras la primera carga.

## Rendimiento (gama baja)

- **Presupuesto de peso (R10.5):** objetivo de JS crítico ≤ 250 KB comprimidos en la carga
  inicial; contenido e imágenes por unidad acotados y diferidos. Dispositivo de referencia
  sugerido: gama de entrada ~2 GB RAM (⚠️ confirmar modelo concreto para pruebas).
- Code-splitting por ruta; lazy-load de pantallas y de tipos de ejercicio pesados (R10.1).
- Imágenes optimizadas (formatos modernos) y diferidas (R10.2). Dependencias ligeras.

## Fase 2 (backend — diseño preliminar, fuera del MVP)

API REST mínima: login docente, clases, progreso (sync idempotente), contenido por grado,
recuperación de contraseña. Datos: cuentas docente (hash + correo mínimo), clases, matrícula
(apodo + id interno, sin PII), progreso, versión de contenido. HTTPS + cifrado en reposo
(R8.7). Sin datos de acudientes (R8.5).

## Privacidad (transversal)

- Minimización: solo apodo + id interno del estudiante (R8.1). Sin publicidad ni trackers (R8.2).
- Borrado de datos por clase/estudiante (R8.3). Política de privacidad en español (R8.4).
- Secretos nunca en logs (R8.6). Neutralidad política y no estigmatización en todo el contenido
  (R13.3, R13.4).

## Estrategia de pruebas

- **Unitarias (Vitest):** evaluador de los 7 tipos; fórmula de XP; racha (incluye corte de días y
  cambio de reloj); logros; repaso espaciado; validación de esquema; desbloqueo; idempotencia de
  eventos (preparación Fase 2).
- **Componentes (Testing Library):** flujo de lección (incl. abandono/retome y omitir sensible),
  estados de ruta, controles de accesibilidad (tamaño de texto, alto contraste), anuncio de
  correcto/incorrecto, aparición de la mascota.
- **Validación de contenido:** `validate:content` en CI y hook local; verifica esquema, `estado`
  aprobado, `alt` en imágenes, metadatos obligatorios.

## Decisiones y trade-offs

- **MVP solo local (Opción A):** menor costo e infraestructura para el piloto; el progreso queda
  atado al dispositivo hasta Fase 2. Es la decisión alineada con "bajo presupuesto".
- **PWA sobre nativo:** una base de código, instalable, offline; a cambio de push limitado.
- **Contenido en archivos sobre CMS:** arranque rápido y versionado; flujo borrador→aprobado por
  revisión en el repositorio; CMS visual en fase futura.
- **"Congelar racha" fuera del MVP:** se prioriza simplicidad; se reevalúa con datos de uso.
