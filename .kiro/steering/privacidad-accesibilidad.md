---
inclusion: always
---

# Privacidad y accesibilidad (requisitos de origen)

Estos requisitos son **de origen** (by design): aplican desde el primer commit, no son una fase
posterior. La app es para menores de edad, así que la protección de datos y la accesibilidad son
condiciones de aceptación, no mejoras opcionales.

## Privacidad y protección de datos (Ley 1581 de 2012)

Principio rector: **minimización de datos**. Recolectar lo mínimo indispensable.

### Reglas duras

- El **estudiante no proporciona datos personales identificables**: usa un **apodo** y entra con
  un **código de clase** entregado por el docente. Sin correo, sin nombre real, sin teléfono, sin
  foto.
- No se recolecta ubicación, contactos, ni identificadores de dispositivo con fines de rastreo.
- No hay publicidad ni trackers de terceros. No se vende ni comparte información.
- El **consentimiento de los acudientes** lo gestiona el docente/institución por fuera de la app;
  la app documenta este requisito pero no almacena datos de acudientes en el MVP.
- Datos del docente: los mínimos para operar su cuenta. En el MVP (solo local) basta un
  identificador y una clave/PIN con hash. En Fase 2 (backend) se admite el **correo del docente**
  únicamente para recuperación de contraseña; sigue siendo el mínimo necesario y corresponde a
  una persona adulta, no al estudiante. Nada sensible.
- Todo dato de progreso del estudiante se asocia a un identificador interno + apodo, nunca a una
  identidad real.

### Buenas prácticas técnicas

- Datos en reposo locales (offline) y en tránsito protegidos; nunca registrar secretos en logs.
- Capacidad de **borrar los datos** de una clase/estudiante (derecho de supresión).
- Política de privacidad clara, en español, redactada para que un acudiente la entienda.
- Finalidad declarada y acotada: solo apoyo al aprendizaje y seguimiento pedagógico.
- Al tratar PII en ejemplos o datos de prueba, usar valores ficticios.

## Accesibilidad (desde el MVP)

Objetivo: usable por estudiantes con distintas capacidades, en dispositivos de gama baja.
Referencia: WCAG 2.1 nivel AA como guía (la conformidad plena exige pruebas con tecnología de
asistencia y revisión experta).

### Requisitos del MVP

- **Lector de pantalla**: componentes con roles/etiquetas ARIA correctas; orden de foco lógico;
  todo elemento interactivo alcanzable y anunciado.
- **Contraste**: cumplir contraste AA (texto normal ≥ 4.5:1; texto grande ≥ 3:1). Ofrecer un
  modo de **alto contraste**.
- **Tamaños de fuente**: control de tamaño de texto (al menos normal / grande / muy grande) sin
  romper el diseño; respetar el ajuste de fuente del sistema.
- **Navegación por teclado** completa.
- **Objetivos táctiles** de al menos 44×44 px.
- No depender solo del color para transmitir información (p. ej. correcto/incorrecto también con
  ícono y texto).
- Textos alternativos en imágenes con contenido informativo.
- Animaciones respetan `prefers-reduced-motion`.

### Rendimiento como accesibilidad

En gama baja, el rendimiento ES accesibilidad: mantener la app liviana, imágenes optimizadas,
mínimo JS en el camino crítico, y funcionamiento fluido sin conexión.
