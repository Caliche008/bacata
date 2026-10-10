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

## PWA offline-first (tarea 12)

La app es instalable y funciona sin conexión tras la primera carga (R5).

- **Instalable (R5.1):** manifest generado por `vite-plugin-pwa` con los datos de marca (nombre
  "Bacatá", lema, `theme_color` verde esmeralda `#1F7A5A`, `background_color` crema `#FBF6EC`,
  `display: standalone`, orientación vertical) e íconos 192/512 + uno `maskable`.
- **Service Worker (Workbox, R5.2/R5.5/R10.3):** se usa el modo `generateSW` (no `injectManifest`)
  porque el contenido pedagógico ya viaja empaquetado en el bundle (`import.meta.glob` en
  `src/content/loader.ts`) y entra automáticamente en el precache; no hay fetch de red que
  justifique un SW a mano. El SW se registra con `registerType: 'autoUpdate'` (sin diálogo de
  actualización, apropiado para gama baja): la versión nueva se activa de forma transparente en la
  próxima carga, lo cual es seguro porque el progreso vive en IndexedDB.
- **Persistencia y cuota (R5.6):** al iniciar se solicita `navigator.storage.persist()`
  (reutilizando el helper de `src/lib/storage`); si queda poco espacio o se deniega la
  persistencia, se muestra un aviso accesible con tono de marca (`StoragePersistenceNotice`).
- **Aviso offline (R5.7):** `ConnectionStatus` indica de forma accesible cuando no hay conexión;
  `ContenidoNoDisponible` cubre el caso límite de una lección ausente del paquete. En el MVP el
  contenido viaja con la app (disponible offline); este caso cobra sentido pleno en la Fase 2 con
  descarga/sincronización.

**Íconos provisionales:** los PNG de `public/` (`pwa-192x192.png`, `pwa-512x512.png`,
`maskable-512x512.png`, `apple-touch-icon.png`) se generan desde `public/brand-icon.svg` con
`npx tsx scripts/generate-icons.ts` y son **provisionales** hasta tener el arte final de la
mascota.

### Probar la instalación y el modo offline

El Service Worker solo se activa en un build real (no en `dev`):

```powershell
npm run build ; npm run preview
```

1. Abre la URL de `preview` en Chrome/Edge.
2. DevTools → Application → Manifest: el manifest se detecta sin errores y la app es instalable.
3. Instala la PWA (icono de instalación en la barra de direcciones) o pruébala en un emulador
   Android.
4. Activa modo avión/offline (DevTools → Network → "Offline", o Application → Service Workers →
   "Offline").
5. Recarga: la app abre y puedes iniciar y **completar una lección sin conexión**; el progreso se
   guarda en IndexedDB.
6. Cierra la pestaña y vuelve a abrirla offline: sigue funcionando (precache del app shell +
   contenido empaquetado).

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

### Datos y consentimiento (MVP solo local)

- El estudiante entra con un **apodo** (nombre inventado) y un **código de clase**; no se pide ni
  se guarda nombre real, correo, teléfono, ubicación ni foto. El progreso se asocia a un id interno
  + apodo, nunca a una identidad real.
- Todo vive en el **dispositivo** (IndexedDB/almacenamiento local). En el MVP no hay servidor: la
  información no se envía a terceros, no hay publicidad ni rastreadores, y no se vende ni comparte.
- **Consentimiento del acudiente:** se gestiona **fuera de la app** (lo recoge el docente o la
  institución). El MVP **no almacena datos de acudientes**.
- **Borrado (derecho de supresión):** el estudiante puede borrar su perfil y progreso desde la app
  (política de privacidad → "Borrar mis datos"); el docente puede eliminar un perfil o una clase
  completa desde su panel. Al desinstalar la app también se eliminan los datos locales.
- **Política de privacidad in-app:** vive como datos tipados en `src/features/privacy/privacy-policy.ts`
  y se muestra con el componente `PoliticaPrivacidad`, accesible desde el acceso del estudiante, la
  cabecera de la ruta de aprendizaje y el panel docente (enlace "Privacidad").

> El texto legal in-app es un **borrador informativo**, no asesoría jurídica. El plazo formal de
> conservación de datos (R8.8) queda **por definir con un asesor jurídico** antes de un despliegue
> con estudiantes reales.

### Auditoría de privacidad (R8.2, R8.6)

Se verificó que no hay analytics, rastreadores ni publicidad de terceros, ni llamadas de red
salientes a terceros, y que no se registran secretos (PIN del docente, hashes, apodos ni progreso)
en consola/logs. El detalle está en `.agents/tasks/verify-task15.md`.

## Modelo

Freemium con aspiración de financiación estatal. **Aprender siempre es gratis para el estudiante.**
