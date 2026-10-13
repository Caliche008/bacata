# Estado del proyecto — Bacatá

> Archivo de retome rápido. Resume qué es el proyecto, dónde vive, cómo se
> ejecuta y qué sigue pendiente. No contiene secretos, credenciales ni datos
> personales. Los materiales internos (propuestas, informes, arte) viven fuera
> del repositorio en `documentos bacata/` (ignorada por git).

Última actualización: 2026-10-12

## Qué es

Bacatá es una PWA educativa tipo Duolingo para historia y ciencias sociales de
secundaria en Colombia (6° y 7°), con la Cátedra de la Paz como eje transversal.
Offline-first, privacidad primero (Ley 1581), accesible desde el MVP y pensada
para Android de gama baja/media.

Detalle completo del producto, marca, pedagogía, privacidad y stack en el
`README.md` y en `.kiro/steering/`.

## Dónde vive

- Repositorio: https://github.com/Caliche008/bacata.git
- App publicada (GitHub Pages): https://caliche008.github.io/bacata/
- Carpeta local: `D:\APPS CREADAS\bacata`
- Despliegue automático: GitHub Actions (`.github/workflows/deploy-pages.yml`)
  publica en cada push a `main`.

## Stack

PWA con React + TypeScript (Vite), IndexedDB + Service Worker (Workbox) para
offline, contenido pedagógico en JSON validado con Zod. Sin backend en el MVP.

## Comandos clave

```powershell
npm install            # instalar dependencias
npm run dev            # desarrollo (sin Service Worker)
npm run build          # build de producción (tsc + vite)
npm run preview        # servir el build (aquí sí se activa el SW/offline)
npm run lint           # ESLint
npm run test           # pruebas (vitest run)
npm run validate:content   # validar el contenido JSON contra el esquema
```

Para probar instalación PWA y modo offline hay que usar un build real:
`npm run build ; npm run preview` (ver sección PWA del README).

## Estructura

```
/content                       Contenido pedagógico en JSON (grado-6/7/8)
/src                           Código de la app (app, components, features, lib, content)
/public                        Íconos PWA y assets de la mascota
/.kiro/steering                Reglas siempre activas (producto, marca, pedagogía, privacidad, técnico)
/.kiro/specs/mvp-aprendizaje    requirements.md, design.md, tasks.md
/.kiro/hooks                   Automatizaciones
/documentos bacata             Materiales internos (NO versionados)
```

## Estado del MVP

El plan completo con el detalle por tarea está en
`.kiro/specs/mvp-aprendizaje/tasks.md`. La app ya está construida y desplegada en
GitHub Pages, funcionando como PWA offline-first.

Implementado (según README y tareas 10–17 marcadas): progreso y gamificación,
repaso de errores, PWA offline-first (manifest + Service Worker), rendimiento en
gama baja, panel docente local (PIN, clases, progreso sin PII, activar/desactivar
unidades), privacidad y textos legales, contenido del MVP y verificación final.

Nota de seguimiento: en `tasks.md` las tareas 1–9 (base del proyecto, modelo de
contenido, storage, loader, UI accesible, acceso del estudiante, ruta de
aprendizaje, motor de ejercicios) aparecen sin marcar `[x]` aunque gran parte de
esa funcionalidad ya existe en `src/`. Conviene revisar y actualizar esas
casillas para que el plan refleje el estado real.

## Qué sigue (pendiente)

- Revisar/actualizar el estado de las tareas 1–9 en `tasks.md`.
- Fase 2 (fuera del MVP): backend y sincronización — API REST, cola de sync,
  recuperación de progreso entre dispositivos, descarga incremental de contenido.
  Ver sección "Fase 2" en `tasks.md`.
- Pendiente legal: definir el plazo formal de conservación de datos (R8.8) con un
  asesor jurídico antes de un despliegue con estudiantes reales.
- Arte final de la mascota (los íconos PWA en `public/` son provisionales).

## Cómo retomar con Kiro

1. Abre la carpeta completa `D:\APPS CREADAS\bacata` (no un archivo suelto) para
   que se carguen las reglas de steering.
2. Da una frase de contexto, por ejemplo: "Retomamos Bacatá, la PWA educativa
   desplegada en GitHub Pages. Quiero [agregar grado 9 / arreglar X / mejorar Y]".
3. Si quieres el estado al día, pide: "Lee el spec en
   `.kiro/specs/mvp-aprendizaje/` y dime en qué quedó el MVP".
