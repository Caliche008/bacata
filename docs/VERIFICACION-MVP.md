# Verificación final del MVP — Bacatá

> *Conoce tu historia, construye tu país.*

Documento de cierre de la **tarea 17** del spec `mvp-aprendizaje`. Consolida la
auditoría del MVP: estado de las compuertas de calidad, cobertura de requisitos,
hallazgos de accesibilidad, prueba offline y limitaciones conocidas.

Es una **auditoría de código y de build**, honesta sobre lo verificado de forma
automática frente a lo que exige validación humana. No es una certificación de
conformidad WCAG ni una validación jurídica.

---

## 1. Resumen ejecutivo

- **Alcance:** MVP **solo local** (sin backend), grados **6° y 7°**, 4 unidades
  livianas con la Cátedra de la Paz como eje transversal. PWA offline-first para
  Android de gama baja, en español, para menores de edad.
- **Veredicto global:** el MVP está **completo y verde en las 4 compuertas**
  (lint, test, build, validate:content). La base de accesibilidad es sólida y
  está documentada en código; los puntos que requieren tecnología de asistencia
  real quedan listados como *pendientes de validación manual*. Los criterios que
  dependen de backend están marcados **[Fase 2]** y no son condición de
  aceptación del MVP.
- **Entorno de verificación:** Windows PowerShell. Comandos ejecutados tal cual
  se registran abajo; el revisor puede leer los resultados sin re-ejecutar.

---

## 2. Estado de las 4 compuertas

Todas ejecutadas en la raíz del proyecto el día del cierre de la tarea 17.

| Compuerta | Comando | Resultado |
|---|---|---|
| Lint | `npm run lint` | **0 errores, 0 warnings** (`eslint .`, sin salida de problemas). |
| Pruebas | `npm run test` | **314 pruebas en verde**, 58 archivos de test (`vitest run`), 0 fallos. |
| Build | `npm run build` | **OK** (`tsc -b && vite build`). SW + manifest generados. Resumen abajo. |
| Contenido | `npm run validate:content` | **OK**: `grado-6.json` y `grado-7.json`, cada uno 4 unidades, 4 lecciones, 25 ejercicios. |

### Detalle del build (vite v6.4.4, `generateSW`)

- `dist/index.html` — 0.79 kB (gzip 0.42 kB)
- CSS: `index-*.css` 18.32 kB (gzip **3.50 kB**) + 3.76 kB + 1.47 kB
- `dist/assets/index-CtLdmeFn.js` — 169.89 kB (gzip **45.15 kB**) · chunk principal de app
- `dist/assets/vendor-react-*.js` — 142.79 kB (gzip **45.72 kB**) · React aislado
- Chunks lazy por ruta: `LeccionDetalle-*.js` (gzip 4.79 kB), `RepasoLeccion-*.js`
  (gzip 1.01 kB), `deletion-*.js` (gzip 0.83 kB)
- PWA `generateSW`: **precache 24 entradas (392.79 KiB)**; genera `dist/sw.js` y
  `dist/workbox-*.js`.

**Presupuesto de peso (R10.5):** el JS crítico (index ~45 kB gzip + vendor-react
~46 kB gzip ≈ **91 kB gzip**) queda holgadamente por debajo del objetivo de
250 kB gzip. (El dispositivo de referencia definitivo sigue pendiente — ver §6.)

### Corrección de lint aplicada en esta tarea

El estado previo era 0 errores pero **8 warnings**
`react-refresh/only-export-components`, los 8 en un único archivo
`src/features/mascota/poses.tsx` (la regla se disparaba porque el archivo
exportaba un valor no-componente, `poseRenderers`, junto a los componentes de
pose). Se resolvió con un **refactor interno sin cambio de comportamiento
visible**:

- Nuevo `src/features/mascota/pose-types.ts` — tipos `MascotaPose` y `PoseProps`.
- Nuevo `src/features/mascota/pose-renderers.ts` — el `Record` `poseRenderers`.
- `poses.tsx` ahora **exporta únicamente componentes** (cada pose) e importa los
  tipos desde `pose-types.ts`.
- Imports internos actualizados en `Mascota.tsx`, `moments.ts` e `index.ts`
  (barrel). La **API pública del barrel no cambia**: `poseRenderers`,
  `MascotaPose`, `PoseProps` se siguen exportando con los mismos nombres, así que
  ningún consumidor externo se ve afectado. El DOM, los textos y las clases CSS
  quedan idénticos. **No se usó ningún `eslint-disable`.**

---

## 3. Cobertura de requisitos (R1–R15)

Leyenda: **Cubierto** · **Parcial** (con nota) · **[Fase 2]** (fuera de alcance
intencional del MVP local, no es incumplimiento).

| Req | Estado | Evidencia principal |
|---|---|---|
| **R1** Acceso sin datos personales | Cubierto (R1.9 parcial por diseño) | `src/features/auth/*` (`AccesoEstudiante.tsx`, `useAuthForm`, `nickname.ts`, `attempts.ts`, `offensive-words.ts`). Pruebas: `nickname.test.ts`, `attempts.test.ts`, `offensive-words.test.ts`. R1.2: el formulario solo pide código + apodo + grado. R1.7: aviso "No uses tu nombre real…". R1.8: límite de intentos con bloqueo temporal. R1.9: en MVP solo aviso local ("Tu progreso se guarda solo en este dispositivo"); recuperación entre dispositivos **[Fase 2]**. |
| **R2** Ruta por niveles | Cubierto | `src/features/lessons/RutaAprendizaje.tsx`, `path.ts` (`path.test.ts`), `useRuta.ts`, `UnidadCard.tsx`, `LeccionItem.tsx`, `CelebracionUnidad`. R2.3: estado bloqueado por texto + no solo color. R2.6: porcentaje por unidad. R2.7: celebración con mascota. |
| **R3** Lecciones y ejercicios | Cubierto | `evaluate.ts` (`evaluate.test.ts`), `leccion-flow.ts` (`leccion-flow.test.ts`), `LeccionDetalle.tsx`, `exercises/*` (los 7 tipos). R3.2: feedback por texto + ícono vía `Feedback`. R3.3: dilema sin veredicto. R3.5: `scripts/validate-content.ts` + `src/content/schema.ts` fallan en build. R3.8: `FuenteCredito`. R3.9: `leccion-progreso.ts` guarda/rehidrata parcial. |
| **R4** Gamificación | Cubierto | `src/features/progress/gamification.ts` (`gamification.test.ts`), `constants.ts`, `logros.ts` (`logros.test.ts`), `gamificacion-store.ts` (`gamificacion-store.test.ts`), `CabeceraGamificacion.tsx`. R4.4: sin rankings públicos. R4.5: cálculo local. R4.7: racha por fecha local, defensiva ante cambios de reloj. |
| **R5** Offline-first | Cubierto (R5.4 **[Fase 2]**) | `vite.config.ts` (VitePWA/Workbox `generateSW`), `src/app/registerSW.ts` (`registerSW.test.ts`), `lib/storage/*`, `useStoragePersistence.ts`, `StoragePersistenceNotice.tsx`, `ContenidoNoDisponible.tsx`, `ConnectionStatus.tsx`. Ver §5. R5.4 (sync al recuperar conexión) es **[Fase 2]**. |
| **R6** Panel docente mínimo | Cubierto (R6.8, R6.9 **[Fase 2]**) | `src/features/teacher/*` (`PanelDocente`, `AccesoDocente`, `GestionClases`, `GestionEstudiantes`, `ProgresoClase`, `UnidadesClase`), `students-service.test.ts`. R6.5: acceso con rol. R6.6: renombrar/eliminar estudiante con `ConfirmDialog`. R6.8 (última sync) y R6.9 (recuperación de contraseña docente) son **[Fase 2]**. |
| **R7** Gestión de contenido | Cubierto (R7.5 **[Fase 2]**) | `src/content/*` (types, `schema.ts` → `schema.test.ts`, loader, selectors → `selectors.test.ts`), `scripts/validate-content.ts`, `content/` JSON versionado con `estado`. R7.4/R7.8: actualización por archivos versionados, flujo borrador→aprobado por repositorio. R7.5 (descarga online) **[Fase 2]**. |
| **R8** Privacidad (Ley 1581) | Cubierto (R8.7 **[Fase 2]**; R8.8 parcial) | `src/features/privacy/*` (`PoliticaPrivacidad.tsx`, `BorrarMisDatos.tsx`, `privacy-policy.ts`), `lib/storage/deletion.ts` (`deletion.test.ts`), `teacher/pin.ts` (hash de PIN, `pin.test.ts`). R8.2: sin trackers ni runtimeCaching (ver §5). R8.3: borrado del propio estudiante. R8.6: PIN con hash; sin secretos en logs (el borrado no registra el error). R8.7 (cifrado en servidor) **[Fase 2]**. R8.8: plazo de conservación **pendiente de asesor jurídico**. |
| **R9** Accesibilidad | Cubierto en código; validación AT pendiente | Ver §4 (tabla de hallazgos). Transversal: `src/styles/tokens.css` (contrastes AA documentados + tema `high-contrast`), `index.css` (`:focus-visible`, `prefers-reduced-motion`), `text-size.css` + `AppearanceControls.tsx`, `--touch-min: 44px`. |
| **R10** Rendimiento gama baja | Cubierto (R10.5 objetivo cumplido; cifras finales pendientes) | `vite.config.ts` (`manualChunks` para `vendor-react`), code-splitting (`React.lazy` de `LeccionDetalle`, `RepasoLeccion`, `PanelDocente`, `PoliticaPrivacidad`). R10.3: cache-first del precache. R10.5: JS crítico ~91 kB gzip < 250 kB (ver §2); dispositivo de referencia pendiente. |
| **R11** Idioma y contexto | Cubierto | Toda la UI y el contenido en español (revisión transversal); microcopy con tono Bacatá; ejemplos del contexto colombiano en `content/`. |
| **R12** Cátedra de la Paz y temas sensibles | Cubierto | `content/` (metadatos de eje Paz, `notaContexto`, marca de sensible), `exercises/AvisoSensible.tsx` (nota de contexto + omitir sin bloquear, R12.3/R12.4), avance del eje Paz en `progress`. |
| **R13** Pensamiento crítico y neutralidad | Cubierto | `exercises/AnalisisFuenteRenderer.tsx`, `DilemaRenderer.tsx` (sin veredicto), contenido con fuentes y perspectivas múltiples. R13.3/R13.4: sin proselitismo ni lenguaje que estigmatice (criterio de contenido). |
| **R14** Repaso de errores | Cubierto | `src/features/progress/repaso.ts` (`repaso.test.ts`), `repaso-store.ts` (`repaso-store.test.ts`), `RepasoLeccion.tsx`. R14.1: registro de fallo una vez por aparición (hook `onEjercicioFallado` en `LeccionDetalle`). R14.3: espaciado tras acierto. |
| **R15** Identidad y mascota | Cubierto | `src/features/mascota/*` (poses, `moments.ts` → `moments.test.ts`); uso en bienvenida/acierto/error/celebración/recordatorio. `tokens.css`: paleta y tipografía de marca. R15.2: SVG inline ligeros, 0 KB de fuentes descargadas. |

**Criterios [Fase 2] (registrados, fuera de alcance intencional):** R1.9 (recuperación
entre dispositivos), R5.4 (sync al recuperar conexión), R6.8 (última sincronización),
R6.9 (recuperación de contraseña docente), R7.5 (descarga online de la versión más
reciente), R8.7 (cifrado en servidor).

---

## 4. Accesibilidad (R9) — auditoría de código

> **Importante:** esto documenta una auditoría de **código y marcado**, no una
> certificación. La conformidad **WCAG 2.1 AA plena requiere pruebas manuales con
> lectores de pantalla reales (TalkBack/NVDA), navegación física por teclado,
> zoom del navegador y revisión experta.** No afirmamos conformidad total.

### Conforme (con evidencia en código)

| Área | Evidencia |
|---|---|
| Roles/labels ARIA (R9.1) | Formularios con `<label htmlFor>`, `aria-describedby`, `aria-invalid`, `role="radiogroup"` (`AccesoEstudiante.tsx`). `Feedback` con `role="status"` + `aria-live="polite"`. `ConfirmDialog` con `role="dialog"`, `aria-modal`, `aria-labelledby`/`aria-describedby`. SVGs decorativos con `aria-hidden` + `focusable="false"`. |
| Contraste AA + alto contraste (R9.2) | `src/styles/tokens.css`: cada par texto/fondo con su ratio medido (p. ej. carbón/crema 13.14:1, blanco/esmeralda 5.26:1); colores que fallan como texto se restringen a fondo o a su variante `*-text`. Tema `data-theme='high-contrast'`. |
| Tamaño de texto (R9.3) | `text-size.css` con `data-text-size` (normal/large/xlarge) sobre `--font-scale`; todo en `rem`; base nunca < 16px. `AppearanceControls.tsx`. |
| Teclado y foco (R9.4) | Controles nativos (`<button>`, `<input>`, `<select>`, radios); `:focus-visible` global en `index.css`; foco al primer campo con error (auth) y al título (privacidad); trap de foco + Escape en `ConfirmDialog`. |
| No solo color (R9.5) | Estado correcto/incorrecto por **ícono + texto** (`Feedback`, `ConnectionStatus`); aviso de borrador con `⚠` + texto; lección bloqueada por texto además de color. |
| Movimiento reducido (R9.6) | `@media (prefers-reduced-motion: reduce)` anula animaciones/transiciones en `index.css`; la mascota solo anima en `no-preference`. |
| Objetivos táctiles (R9.7) | `--touch-min: 44px` aplicado a `.bc-button` (`min-height`/`min-width`); los controles de `OrdenarRenderer` usan `Button`. |
| Alternativa al drag (R9.1/R9.4) | `OrdenarRenderer.tsx`: botones "Subir"/"Bajar" con `aria-label` por elemento, operables por teclado; `EmparejarRenderer.tsx` usa `<select>` nativo en vez de drag. |

### Corregido en esta tarea (bajo riesgo)

Ninguno. La auditoría **no encontró hallazgos de bajo riesgo accionables sin
alterar el comportamiento visible**: la base ya aplica de forma consistente
labels, roles ARIA, foco visible, estado no-solo-color, 44px, reduced-motion,
escala de texto y alto contraste. No se tocó código de accesibilidad (coherente
con la restricción de no cambiar comportamiento visible).

### Pendiente de validación manual con tecnología de asistencia

| Punto | Por qué requiere prueba humana |
|---|---|
| Anuncio real por lector de pantalla del flujo de lección | El feedback usa `aria-live="polite"`; confirmar con TalkBack/NVDA que el orden de anuncio (feedback + mascota) es claro y no se solapa. |
| Gestión del foco al avanzar de ejercicio en `LeccionDetalle` | Hoy no se mueve el foco al nuevo ejercicio al pulsar "Siguiente" (se evita robar el foco). Validar con teclado/lector si conviene reubicarlo; cambiarlo afecta comportamiento, por eso NO se modificó aquí. |
| Contraste real en pantallas de gama baja y bajo sol | Los ratios están calculados; conviene verificar en dispositivo físico y en modo alto contraste. |
| Zoom del navegador al 200% y tamaños de sistema extremos | La escala en `rem` lo soporta en teoría; validar que ningún layout se rompe en pantallas pequeñas reales. |
| Navegación completa por teclado físico extremo a extremo | Confirmar orden de tabulación lógico en todas las vistas (ruta, lección, panel docente, privacidad) con teclado real. |
| `<select>` de emparejar con lector de pantalla | Verificar que el barajado estable de opciones se anuncia de forma comprensible. |

---

## 5. Prueba offline (R5)

### Artefactos verificados en el build

Tras `npm run build`, `dist/` contiene:

- Service Worker: **`dist/sw.js`** + `dist/workbox-*.js` (Workbox `generateSW`).
- Manifest: **`dist/manifest.webmanifest`** (name/short_name "Bacatá", `display: standalone`,
  `theme_color` esmeralda, íconos).
- Íconos PWA: `pwa-192x192.png`, `pwa-512x512.png`, `maskable-512x512.png`,
  `apple-touch-icon.png`, `brand-icon.svg`.
- Registro del SW vía el chunk `virtual_pwa-register-*.js` (`src/app/registerSW.ts`).

### Precache y ausencia de terceros

- `vite.config.ts` → `workbox.globPatterns`: `**/*.{js,css,html,svg,png,ico,woff,woff2}`.
  El **contenido pedagógico viaja empaquetado dentro de los chunks JS**
  (`import.meta.glob` en el loader), así que entra en el precache (24 entradas,
  ~393 KiB). `navigateFallback` → `index.html` para que cualquier ruta SPA abra
  offline. `maximumFileSizeToCacheInBytes: 4 MiB`.
- **Sin fetch a terceros:** `vite.config.ts` **no define `runtimeCaching`**; una
  búsqueda en `src/` de `runtimeCaching | fetch( | XMLHttpRequest | https?://`
  solo arroja el `xmlns="http://www.w3.org/2000/svg"` de los SVG (no es una
  llamada de red). Fuentes del sistema (0 KB descargados) e íconos locales.

### Pasos de prueba manual (en español)

1. `npm run build`.
2. `npm run preview` y abrir la URL indicada. *(En preview la base es `/`; en
   GitHub Pages es `/bacata/`.)*
3. En Android/Chrome, instalar la PWA (menú → "Instalar app" / "Agregar a
   pantalla de inicio").
4. Activar modo avión / desconectar la red.
5. Recorrer una lección completa **sin conexión**: acceso con apodo + código,
   abrir una unidad, completar una lección con los distintos tipos de ejercicio
   y ver la celebración.
6. Cerrar y reabrir la app sin red: confirmar que **carga desde caché** y
   conserva el progreso (IndexedDB).
7. (Opcional) DevTools → *Application* → *Service Workers* y *Cache Storage*:
   verificar el SW activo y el precache.

> No se usa `npm run dev` para esta prueba: el SW está deshabilitado en dev
> (`devOptions.enabled: false`); la validación offline se hace sobre el build con
> `preview` o sobre el despliegue en GitHub Pages.

---

## 6. Notas conocidas y limitaciones

- **Contenido = borrador para revisión docente.** El contenido pedagógico lleva
  `estado` y el flujo borrador→aprobado se gobierna por el repositorio (R7.8);
  requiere revisión de un docente especialista antes de uso en aula.
- **Política de privacidad = borrador para revisión jurídica.** La política
  (Ley 1581) y, en particular, los **plazos de conservación y de ejecución de
  supresión (R8.8)** están pendientes de asesor jurídico. También conviene validar
  si el apodo asociado a una clase constituye dato personal.
- **"Docente" es por dispositivo en modo local.** El panel docente opera sobre
  los datos de esta instalación; el seguimiento centralizado de una clase a través
  de varios dispositivos es **Fase 2**.
- **Íconos PWA provisionales.** Los `*.png` de la mascota y los íconos de la app
  son placeholders de calidad; el arte final (ver `brand.md`) puede sustituirlos
  sin tocar componentes. El nombre de la mascota sigue por definir.
- **Backend y sincronización = Fase 2.** Login docente centralizado, sync de
  progreso, recuperación entre dispositivos, descarga incremental de contenido y
  "última sincronización" quedan fuera del MVP (ver tabla §3).
- **Presupuesto de peso (R10.5):** el objetivo de 250 kB gzip de JS crítico se
  cumple (~91 kB gzip), pero el **dispositivo de referencia y las cifras finales**
  siguen pendientes de confirmación en una prueba de campo.
- **Fórmula de XP y política de rachas (incl. "congelar racha")** quedan según lo
  implementado en `design.md`/`gamification.ts`; cualquier ajuste de balance es
  trabajo de contenido/diseño, no de código del MVP.

---

## 7. Comandos ejecutados (para el revisor)

Entorno: Windows PowerShell, en la raíz del proyecto. Resultados tal cual se
obtuvieron en el cierre de la tarea 17:

- `npm run lint` → `0 problems (0 errors, 0 warnings)`.
- `npm run test` → `Test Files 58 passed (58)` · `Tests 314 passed (314)`.
- `npm run build` → OK; `dist/sw.js` + `dist/manifest.webmanifest` generados;
  precache 24 entradas (392.79 KiB); JS crítico ~91 kB gzip.
- `npm run validate:content` → OK; `grado-6.json` y `grado-7.json` válidos
  (4 unidades, 4 lecciones, 25 ejercicios cada uno).

`content/` y `.kiro/` quedan intactos salvo el checkbox de la tarea 17 en
`.kiro/specs/mvp-aprendizaje/tasks.md`.
