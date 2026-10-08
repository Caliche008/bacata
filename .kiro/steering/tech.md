---
inclusion: always
---

# Estándares técnicos

## Arquitectura general

- **PWA (Progressive Web App)** instalable en Android, **offline-first**.
- **Frontend**: React + TypeScript, construido con **Vite**.
- **Enrutamiento**: React Router.
- **Estado**: estado local con hooks/Context; para datos del servidor y sincronización, una
  librería de data-fetching con caché (p. ej. TanStack Query) cuando se integre el backend.
- **Almacenamiento offline**: **IndexedDB** (vía una capa ligera como `idb` o Dexie) para
  contenido descargado y progreso del estudiante; **Service Worker** (Workbox) para cachear la
  app y los recursos.
- **Backend (fase posterior al contenido fijo)**: API REST sencilla. Mantener la opción de un
  backend liviano (p. ej. Node + Fastify/Express) o un BaaS. El MVP arranca con **contenido
  fijo empaquetado** y sincronización opcional cuando haya conexión.

> Decisión MVP: la primera versión funciona 100% con contenido empaquetado y progreso local,
> sin exigir backend. El backend se añade para sincronizar progreso y para el panel docente.

## Principios de código

- **TypeScript estricto** (`strict: true`). Evitar `any`; tipar el modelo de contenido.
- Componentes funcionales con hooks. Componentes pequeños y enfocados.
- Separar **datos (contenido)** de **presentación**: el contenido pedagógico vive como datos
  (JSON validado por esquema), no incrustado en componentes.
- **Validación de contenido** con un esquema (p. ej. Zod) para que una lección malformada falle
  en build/carga, no en runtime frente al estudiante.
- Accesibilidad y rendimiento son criterios de revisión, no extras.

## Estructura de carpetas (propuesta)

```
/public            # íconos PWA, manifest, assets estáticos
/src
  /app             # arranque, router, providers
  /components      # UI reutilizable (accesible)
  /features        # dominios: lessons, progress, gamification, teacher, auth
  /content         # motor de contenido: tipos, esquema, loader, validación
  /lib             # utilidades: storage (IndexedDB), sync, a11y helpers
  /styles          # tema, tokens de color (contraste AA), tamaños de fuente
/content           # CONTENIDO PEDAGÓGICO en JSON (versionado)
  /cursos          # un archivo o carpeta por curso/unidad
  schema           # definición y validación del esquema de contenido
/.kiro
  /steering
  /specs
  /hooks
```

## Calidad y herramientas

- **ESLint + Prettier** con reglas de accesibilidad (`eslint-plugin-jsx-a11y`).
- **TypeScript** como primer control de calidad.
- **Pruebas**: Vitest + Testing Library para lógica y componentes clave (motor de ejercicios,
  cálculo de progreso/rachas, validación de contenido). No se añaden pruebas salvo que aporten
  valor claro; sí se cubren el motor de evaluación y la sincronización.
- **Comandos** (se definirán en package.json): `dev`, `build`, `preview`, `lint`, `test`,
  `validate:content` (valida el JSON de contenido contra el esquema).

## Rendimiento (gama baja)

- Presupuesto de carga ajustado; code-splitting por ruta.
- Imágenes optimizadas (formatos modernos, tamaños adecuados) y lazy-loading.
- Minimizar dependencias pesadas; preferir soluciones ligeras.
- La app debe ser utilizable con red lenta o nula tras la primera carga.

## Convenciones

- Nombres de archivos y símbolos en inglés para el código; **todo el texto de cara al usuario
  en español**.
- Mensajes de commit claros; cambios de contenido separados de cambios de código cuando se pueda.
- No introducir dependencias nuevas sin justificar su peso y mantenimiento.
