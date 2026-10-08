# Plan de implementación — MVP Bacatá (Opción A: solo local)

Cada tarea es incremental, construye sobre la anterior y referencia los requisitos que cubre.
El MVP es offline-first **sin backend**; el backend y la sincronización son Fase 2 (opcional, al
final). Marca `[x]` al completar.

- [ ] 1. Inicializar el proyecto PWA (React + TS + Vite)
  - Crear el proyecto con Vite (plantilla react-ts) y TypeScript estricto.
  - Configurar ESLint + Prettier + eslint-plugin-jsx-a11y.
  - Estructura de carpetas de `tech.md` (incluye `features/mascota`); carpeta `/content` en raíz.
  - Scripts: `dev`, `build`, `preview`, `lint`, `test`, `validate:content`.
  - _Requisitos: steering tech; base para todos._

- [ ] 2. Definir el modelo de contenido y su validación
  - [ ] 2.1 Tipos TS en `src/content/types.ts`: Curso, Unidad, Lección, los 7 tipos de Ejercicio
        (incluye `analisis_fuente`), `Meta` (tema, etiquetas, fuente, sensible, notaContexto,
        estado) y `version`.
  - [ ] 2.2 Esquema Zod en `src/content/schema.ts` con las reglas (unidad con `catedraPaz`+`ejePaz`,
        dilema sin respuesta correcta, retroalimentación, `estado` aprobado, `alt` en imágenes).
  - [ ] 2.3 `validate:content`: carga los JSON de `/content`, valida y reporta errores claros;
        excluye/alerta contenido en `borrador`.
  - [ ] 2.4 Pruebas unitarias del esquema (válido pasa; malformado falla con mensaje).
  - _Requisitos: 3.1, 3.5, 7.1, 7.2, 7.3, 7.6, 7.7, 7.8, 12.1, 12.2._

- [ ] 3. Contenido semilla (al menos 1 unidad completa por grado)
  - Redactar en `/content` los cursos de 6° y 7° con las 4 unidades y, mínimo, la primera unidad
    completa con lecciones y los 7 tipos de ejercicio; declarar `catedraPaz`, `ejePaz`, metadatos
    y fuentes; marcar `estado: aprobado`.
  - Validar con `validate:content`.
  - _Requisitos: 2.5, 7.1, 7.3, 7.7, 11.1, 11.2, 12.2, 13.1, 13.2._

- [ ] 4. Capa de almacenamiento local (IndexedDB)
  - [ ] 4.1 `lib/storage` con idb/Dexie: stores `perfilEstudiante`, `progreso`, `gamificacion`,
        `repaso`, `contenidoCache`, `clasesLocales`, `colaSync` (inactiva).
  - [ ] 4.2 CRUD + borrado por estudiante/clase (derecho de supresión) + `storage.persist()`.
  - [ ] 4.3 Pruebas unitarias de lectura/escritura, borrado y manejo de cuota.
  - _Requisitos: 5.3, 5.6, 8.1, 8.3._

- [ ] 5. Loader de contenido y caché
  - Cargar contenido empaquetado al iniciar; guardarlo en `contenidoCache` con versión; selectores
    (curso por grado, unidad, lección); conservar IDs estables entre versiones.
  - _Requisitos: 5.2, 7.1, 7.4, 7.6._

- [ ] 6. Base de UI accesible, tematización y marca
  - [ ] 6.1 Tokens de color de `brand.md` con contraste AA + tema de alto contraste; **verificar
        cada par texto/fondo**. Tipografías (títulos redondeados, texto sans), mínimo 16 px.
  - [ ] 6.2 Escala de tamaño de texto (normal/grande/muy grande) persistida.
  - [ ] 6.3 Componentes base accesibles (botón, tarjeta, barra de progreso, feedback) con ARIA,
        focus visible, objetivos táctiles ≥ 44px; respetar `prefers-reduced-motion`.
  - [ ] 6.4 Componente de mascota con sus poses (SVG ligeros) y microcopy de marca.
  - [ ] 6.5 Pruebas de los controles de accesibilidad.
  - _Requisitos: 9.1–9.7, 15.1, 15.2, 10.5 (peso de assets)._

- [ ] 7. Acceso del estudiante (código de clase + apodo)
  - Pantalla de ingreso; validación de código (local); apodo único por clase; aviso de no usar
    nombre real; filtro de lenguaje ofensivo; límite de intentos; aviso de progreso solo local.
  - Crear/recuperar `perfilEstudiante`; persistir sesión sin volver a pedir el código.
  - _Requisitos: 1.1–1.9 (1.9 en modo MVP local)._

- [ ] 8. Ruta de aprendizaje por niveles
  - Curso del grado → unidades → lecciones ordenadas; estados con ícono + texto; desbloqueo por
    orden/progreso; % por unidad; ocultar unidades desactivadas; celebración con mascota.
  - _Requisitos: 2.1–2.7, 6.4, 9.5, 15.1._

- [ ] 9. Motor de ejercicios y retroalimentación
  - [ ] 9.1 Evaluador puro de los 7 tipos (`analisis_fuente` evalúa sus preguntas; `dilema` sin
        veredicto, con reflexión por opción).
  - [ ] 9.2 Renderizadores accesibles de los 7 tipos.
  - [ ] 9.3 Flujo de lección: retroalimentación inmediata (texto + ícono); en error, pista +
        reintento con tono de marca; mostrar fuente/crédito; guardar avance parcial al abandonar;
        temas sensibles con nota de contexto y opción de omitir sin bloquear.
  - [ ] 9.4 Marcar lección completada (sensibles omitidos no bloquean) y registrar resultado.
  - [ ] 9.5 Pruebas del evaluador y del flujo (incluye abandono/retome y omitir sensible).
  - _Requisitos: 3.1–3.9, 12.3, 12.4, 13.1._

- [ ] 10. Progreso y gamificación con propósito
  - [ ] 10.1 Fórmula de XP (constante central), racha por fecha local con tolerancia a cambio de
        reloj, logros por hitos; avance en eje Paz.
  - [ ] 10.2 Persistir en `gamificacion`; cálculo 100% offline; sin rankings; mensaje motivador al
        perder racha.
  - [ ] 10.3 UI accesible de puntos, racha, logros y eje Paz.
  - [ ] 10.4 Pruebas de XP, racha (corte de días y cambio de reloj) y logros.
  - _Requisitos: 4.1–4.7, 12.5._

- [ ] 11. Repaso de errores
  - Registrar fallos en `repaso`; lección de repaso offline; espaciar aparición al acertar.
  - Pruebas de registro y espaciado.
  - _Requisitos: 14.1, 14.2, 14.3._

- [ ] 12. PWA offline-first
  - Manifest + íconos (claro/crema/noche); Service Worker (Workbox): precache app shell; contenido
    cache-first; `storage.persist()` y avisos de cuota.
  - Verificar: completar lecciones y guardar progreso sin conexión; reabrir sin red.
  - _Requisitos: 5.1, 5.2, 5.3, 5.5, 5.6, 5.7, 10.3._

- [ ] 13. Rendimiento en gama baja
  - Code-splitting por ruta; imágenes optimizadas y diferidas; medir contra el presupuesto de peso.
  - _Requisitos: 10.1, 10.2, 10.4, 10.5._

- [ ] 14. Panel docente mínimo (modo local)
  - [ ] 14.1 Acceso docente con PIN/clave local (hash).
  - [ ] 14.2 Crear clase → código único; regenerar/desactivar código.
  - [ ] 14.3 Ver progreso por estudiante (apodo), sin PII.
  - [ ] 14.4 Activar/desactivar unidades por clase.
  - [ ] 14.5 Renombrar/eliminar perfil de estudiante.
  - _Requisitos: 6.1–6.7, 8.6._

- [ ] 15. Privacidad y textos legales
  - Política de privacidad en español, comprensible para un acudiente; borrado de datos de
    estudiante/clase desde la UI; documentar consentimiento del acudiente (fuera de la app);
    verificar ausencia de trackers/publicidad y que no se registran secretos.
  - _Requisitos: 8.2, 8.3, 8.4, 8.5, 8.8 (documentar plazo cuando se defina)._

- [ ] 16. Completar contenido del MVP
  - Terminar las 4 unidades para 6° y 7° con lecciones y ejercicios variados, con enfoque de
    pensamiento crítico y neutralidad; cada unidad con al menos un ejercicio de eje Paz; validar.
  - _Requisitos: 2.5, 7.*, 11.*, 12.2, 13.1–13.4._

- [ ] 17. Verificación final del MVP
  - `lint`, `test`, `build`, `validate:content` sin errores.
  - Revisión de accesibilidad (lector de pantalla, teclado, contraste, tamaño de texto).
  - Prueba offline end-to-end en un dispositivo/emulador Android de gama baja contra el
    presupuesto de peso.
  - _Requisitos: 9.*, 10.*, 5.*._

---

## Fase 2 — Backend y sincronización (fuera del MVP)

- [ ] F2.1 API REST: login docente (hash + correo), clases, progreso (sync idempotente), contenido
      por grado, recuperación de contraseña. HTTPS + cifrado en reposo.
- [ ] F2.2 Activar `colaSync`: sincronizar progreso al recuperar conexión, sin duplicados ni
      pérdidas (idempotencia por evento).
- [ ] F2.3 Recuperación de progreso entre dispositivos con apodo + código.
- [ ] F2.4 Descarga incremental de contenido y "última sincronización" en el panel docente.
- [ ] F2.5 Pruebas de sincronización, idempotencia y seguridad.
  - _Requisitos: 1.9 (completo), 5.4, 6.8, 6.9, 7.5, 8.7._
