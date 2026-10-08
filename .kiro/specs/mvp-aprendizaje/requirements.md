# Requisitos — MVP App de Historia y Ciencias Sociales (Cátedra de la Paz) · Bacatá

## Introducción

Aplicación educativa tipo Duolingo (PWA, offline-first, Android gama baja/media) para que
estudiantes de secundaria (6° y 7°) de Colombia aprendan y repasen historia y ciencias
sociales, con la Cátedra de la Paz como eje transversal. Incluye ruta de progreso por niveles,
ejercicios interactivos, retroalimentación inmediata y gamificación (puntos, rachas, logros).
Foco en estudiante, con panel docente mínimo. Privacidad (Ley 1581) y accesibilidad como
requisitos de origen. El enfoque pedagógico es formar criterio (investigar, contrastar fuentes
y argumentar), sin proselitismo político. La identidad visual (mascota, paleta, tono de voz) está
definida en `brand.md`.

### Decisión de alcance: MVP "solo local" (Opción A)

El MVP **no incluye backend**. El progreso vive en el dispositivo (IndexedDB), el panel docente
opera en **modo local**, y la sincronización, el login docente con servidor y la recuperación de
progreso entre dispositivos quedan en **Fase 2 (backend)**. Los criterios que dependen de backend
están marcados con **[Fase 2]** y no son condición de aceptación del MVP; se dejan escritos para
no perder el requisito. El modelo de datos se diseña desde ya para habilitar backend sin reescribir.

Convenciones EARS:
- **El sistema** = la aplicación. Formato: "CUANDO/MIENTRAS/SI <condición>, EL SISTEMA DEBERÁ
  <respuesta>." Los requisitos ubicuos usan "EL SISTEMA DEBERÁ ...".

---

## Requisito 1 — Acceso del estudiante sin datos personales

**Historia:** Como estudiante menor de edad, quiero entrar con un apodo y un código de clase,
para usar la app sin dar datos personales.

#### Criterios de aceptación
1. CUANDO un estudiante ingresa un código de clase válido y un apodo, EL SISTEMA DEBERÁ crear
   o recuperar un perfil local asociado a ese apodo y clase.
2. EL SISTEMA DEBERÁ NO solicitar nombre real, correo, teléfono, ubicación ni foto al estudiante.
3. SI el código de clase es inválido o no existe, EL SISTEMA DEBERÁ mostrar un mensaje claro en
   español y no crear perfil.
4. CUANDO el estudiante regresa a la app en el mismo dispositivo, EL SISTEMA DEBERÁ recuperar su
   perfil y progreso sin volver a pedir el código.
5. EL SISTEMA DEBERÁ permitir usar el modo estudiante sin conexión una vez el contenido esté
   descargado.
6. EL SISTEMA DEBERÁ garantizar que el apodo sea único dentro de una clase y avisar al estudiante
   si ya está en uso.
7. EL SISTEMA DEBERÁ indicar al estudiante, antes de elegir su apodo, que no use su nombre real
   ni datos que lo identifiquen, y rechazar apodos con lenguaje ofensivo.
8. EL SISTEMA DEBERÁ usar códigos de clase difíciles de adivinar y limitar los intentos fallidos
   consecutivos (bloqueo temporal).
9. **[Fase 2]** SI el estudiante cambia de dispositivo o pierde sus datos locales, EL SISTEMA
   DEBERÁ permitir recuperar el progreso desde el servidor usando apodo + código de clase.
   En el MVP (solo local), el sistema DEBERÁ advertir que el progreso se guarda únicamente en
   este dispositivo.

---

## Requisito 2 — Ruta de aprendizaje por niveles

**Historia:** Como estudiante, quiero una ruta de lecciones por niveles, para saber qué sigue y
sentir progreso.

#### Criterios de aceptación
1. EL SISTEMA DEBERÁ mostrar las unidades y lecciones del grado del estudiante como una ruta
   ordenada.
2. CUANDO el estudiante completa una lección, EL SISTEMA DEBERÁ desbloquear la siguiente según
   el orden definido en el contenido.
3. MIENTRAS una lección esté bloqueada, EL SISTEMA DEBERÁ indicarlo visualmente y por texto
   (no solo por color) e impedir su inicio.
4. EL SISTEMA DEBERÁ mostrar el estado de cada lección (bloqueada, disponible, completada).
5. EL SISTEMA DEBERÁ reflejar la Cátedra de la Paz como contenido integrado en las unidades,
   no como una sección separada.
6. EL SISTEMA DEBERÁ mostrar el progreso de cada unidad como porcentaje.
7. CUANDO el estudiante completa un nivel o una unidad, EL SISTEMA DEBERÁ mostrar una
   celebración breve con la mascota.

---

## Requisito 3 — Lecciones y ejercicios interactivos con retroalimentación

**Historia:** Como estudiante, quiero resolver ejercicios variados y recibir explicación
inmediata, para entender y no solo acertar.

#### Criterios de aceptación
1. EL SISTEMA DEBERÁ soportar los tipos: opción múltiple, verdadero/falso, emparejar, ordenar,
   completar, dilema y análisis de fuente (texto o imagen con preguntas).
2. CUANDO el estudiante responde un ejercicio evaluable, EL SISTEMA DEBERÁ indicar de inmediato
   si es correcto o incorrecto mediante texto e ícono (no solo color) y mostrar retroalimentación.
3. CUANDO el ejercicio es de tipo dilema, EL SISTEMA DEBERÁ mostrar una reflexión según la opción
   elegida, sin marcarla como correcta o incorrecta.
4. CUANDO el estudiante responde todos los ejercicios evaluables de una lección (los sensibles
   omitidos no bloquean, ver R12.4), EL SISTEMA DEBERÁ marcarla como completada y registrar su
   resultado.
5. SI un ejercicio no cumple el esquema de contenido, EL SISTEMA DEBERÁ excluirlo o fallar la
   validación en build, de modo que no se muestre malformado al estudiante.
6. CUANDO la respuesta es incorrecta, EL SISTEMA DEBERÁ mostrar una explicación breve o pista
   y permitir reintentar, con el tono definido en `brand.md`.
7. EL SISTEMA DEBERÁ NO usar mensajes que humillen, castiguen o comparen negativamente al
   estudiante.
8. CUANDO un ejercicio se base en un hecho histórico, dato o documento, EL SISTEMA DEBERÁ
   mostrar la fuente y el crédito correspondiente.
9. CUANDO el estudiante abandona una lección a mitad, EL SISTEMA DEBERÁ guardar su avance y
   permitirle retomarla sin penalización.

---

## Requisito 4 — Gamificación con propósito

**Historia:** Como estudiante, quiero puntos, rachas y logros, para motivarme a repasar seguido.

#### Criterios de aceptación
1. CUANDO el estudiante completa una lección o acierta ejercicios, EL SISTEMA DEBERÁ otorgar
   puntos (XP) según la fórmula definida en el diseño (ver `design.md`).
2. CUANDO el estudiante practica en días consecutivos, EL SISTEMA DEBERÁ incrementar su racha.
3. EL SISTEMA DEBERÁ otorgar logros ligados a hitos pedagógicos (p. ej. completar una unidad).
4. EL SISTEMA DEBERÁ NO mostrar rankings públicos que expongan o comparen a estudiantes de forma
   que pueda avergonzarlos.
5. EL SISTEMA DEBERÁ calcular puntos, rachas y logros de forma local y sin conexión.
6. CUANDO el estudiante pierde su racha, EL SISTEMA DEBERÁ mostrar un mensaje motivador, sin
   tono de castigo.
7. EL SISTEMA DEBERÁ calcular la racha con la fecha local del dispositivo y evitar que un
   cambio de reloj genere rachas inconsistentes.

---

## Requisito 5 — Funcionamiento offline-first

**Historia:** Como estudiante con conectividad limitada, quiero usar la app sin internet, para
estudiar aunque no tenga datos.

#### Criterios de aceptación
1. EL SISTEMA DEBERÁ instalarse como PWA en Android.
2. CUANDO el contenido ha sido descargado, EL SISTEMA DEBERÁ permitir completar lecciones sin
   conexión.
3. MIENTRAS no haya conexión, EL SISTEMA DEBERÁ guardar el progreso localmente (IndexedDB).
4. **[Fase 2]** CUANDO se recupere la conexión y exista backend, EL SISTEMA DEBERÁ sincronizar el
   progreso pendiente sin pérdida ni duplicación (cola de sincronización idempotente).
5. EL SISTEMA DEBERÁ seguir funcionando (contenido ya cargado) tras cerrar y reabrir sin red.
6. EL SISTEMA DEBERÁ solicitar almacenamiento persistente al navegador y avisar al estudiante
   si el espacio del dispositivo es insuficiente para descargar contenido.
7. CUANDO el estudiante interactúa con contenido aún no descargado y sin conexión, EL SISTEMA
   DEBERÁ indicar qué falta y cómo descargarlo.

> Nota de alcance: en el MVP el contenido se empaqueta con la app; la descarga incremental y la
> sincronización de progreso con servidor son de Fase 2.

---

## Requisito 6 — Panel docente mínimo (modo local en el MVP)

**Historia:** Como docente, quiero crear clases, entregar códigos y ver el progreso, para
acompañar a mis estudiantes.

#### Criterios de aceptación
1. CUANDO un docente crea una clase, EL SISTEMA DEBERÁ generar un código de clase único.
2. EL SISTEMA DEBERÁ mostrar al docente el progreso de los estudiantes de su clase (unidades y
   lecciones completadas) sin exponer datos personales.
3. EL SISTEMA DEBERÁ permitir al docente activar o desactivar unidades para su clase.
4. MIENTRAS una unidad esté desactivada para una clase, EL SISTEMA DEBERÁ ocultarla a los
   estudiantes de esa clase.
5. EL SISTEMA DEBERÁ restringir las funciones docentes a un acceso con rol docente.
6. EL SISTEMA DEBERÁ permitir al docente renombrar o eliminar el perfil de un estudiante de su
   clase (por ejemplo, ante un apodo inapropiado).
7. EL SISTEMA DEBERÁ permitir al docente regenerar o desactivar el código de su clase.
8. **[Fase 2]** EL SISTEMA DEBERÁ mostrar al docente la fecha de la última sincronización de cada
   estudiante. (En el MVP, el panel docente ve el progreso del propio dispositivo/instalación.)
9. **[Fase 2]** EL SISTEMA DEBERÁ ofrecer recuperación de contraseña al docente y, para ello,
   recolectar de él solo los datos mínimos de cuenta (correo). En el MVP el acceso docente es
   local.

> Nota de alcance (MVP local): el panel docente funciona sobre datos locales del dispositivo.
> El seguimiento centralizado de una clase a través de varios dispositivos es de Fase 2.

---

## Requisito 7 — Gestión de contenido pedagógico

**Historia:** Como docente especialista, quiero que el contenido sea estructurado y actualizable,
para mantener las lecciones al día.

#### Criterios de aceptación
1. EL SISTEMA DEBERÁ cargar el contenido desde archivos JSON versionados conforme al esquema
   definido.
2. EL SISTEMA DEBERÁ validar el contenido contra el esquema y reportar errores claros cuando no
   cumpla.
3. EL SISTEMA DEBERÁ asociar cada unidad a un grado (6 o 7) y a sus temáticas de Cátedra de la Paz.
4. EL SISTEMA DEBERÁ permitir actualizar el contenido (nuevas versiones) sin requerir cambios de
   código de la aplicación.
5. **[Fase 2]** CUANDO el contenido se actualiza y hay conexión, EL SISTEMA DEBERÁ poder descargar
   la versión más reciente. (En el MVP el contenido se actualiza empaquetándolo con una nueva
   versión de la app.)
6. EL SISTEMA DEBERÁ conservar identificadores estables de unidades, lecciones y ejercicios
   entre versiones, para no perder el progreso del estudiante al actualizar el contenido.
7. CADA ejercicio DEBERÁ registrar grado, tema, tipo, fuente y etiquetas (incluida la etiqueta
   del eje Paz).
8. EL SISTEMA DEBERÁ publicar solo contenido que haya pasado por revisión pedagógica
   (borrador → aprobado). El flujo en el MVP se realiza por revisión en el repositorio (control
   de versiones): el contenido se marca `estado: borrador | aprobado` y solo el aprobado se
   incluye en la app.

---

## Requisito 8 — Privacidad y protección de datos (Ley 1581 de 2012)

**Historia:** Como acudiente/institución, quiero que se recolecten los mínimos datos, para
proteger a los menores.

#### Criterios de aceptación
1. EL SISTEMA DEBERÁ aplicar minimización de datos: no recolectar datos personales del estudiante
   más allá de apodo e identificador interno.
2. EL SISTEMA DEBERÁ NO incluir publicidad ni rastreadores de terceros.
3. EL SISTEMA DEBERÁ permitir borrar los datos de un estudiante o de una clase (derecho de
   supresión).
4. EL SISTEMA DEBERÁ presentar una política de privacidad en español, comprensible para un
   acudiente.
5. EL SISTEMA DEBERÁ documentar que el consentimiento del acudiente se gestiona por fuera de la
   app, sin almacenar datos de acudientes en el MVP.
   > Recomendado: validar con un asesor jurídico si el apodo asociado a una clase puede
   > considerarse dato personal y si este esquema de consentimiento es suficiente.
6. EL SISTEMA DEBERÁ proteger las credenciales del docente (contraseña con hash) y no registrar
   secretos en logs.
7. **[Fase 2]** EL SISTEMA DEBERÁ cifrar las comunicaciones (HTTPS) y los datos en reposo en el
   servidor. (En el MVP no hay servidor; los datos viven en el dispositivo.)
8. EL SISTEMA DEBERÁ definir y comunicar cuánto tiempo se conservan los datos y en qué plazo se
   ejecuta una solicitud de supresión. ⚠️ (plazo por definir con el asesor jurídico)

---

## Requisito 9 — Accesibilidad (desde el MVP)

**Historia:** Como estudiante con alguna discapacidad o un dispositivo sencillo, quiero una app
accesible, para poder usarla.

#### Criterios de aceptación
1. EL SISTEMA DEBERÁ exponer roles, nombres y estados accesibles (ARIA) para todo elemento
   interactivo, de modo que un lector de pantalla pueda anunciarlos.
2. EL SISTEMA DEBERÁ cumplir contraste AA (texto normal ≥ 4.5:1; grande ≥ 3:1) y ofrecer un modo
   de alto contraste.
3. EL SISTEMA DEBERÁ permitir ajustar el tamaño del texto (al menos normal, grande, muy grande)
   sin romper el diseño.
4. EL SISTEMA DEBERÁ ser operable por teclado, con orden de foco lógico.
5. EL SISTEMA DEBERÁ no transmitir información solo por color.
6. CUANDO el usuario prefiere movimiento reducido, EL SISTEMA DEBERÁ limitar las animaciones.
7. EL SISTEMA DEBERÁ tener objetivos táctiles de al menos 44×44 px.

---

## Requisito 10 — Rendimiento en gama baja

**Historia:** Como estudiante con un celular sencillo, quiero que la app sea rápida y liviana,
para que no se trabe ni gaste muchos datos.

#### Criterios de aceptación
1. EL SISTEMA DEBERÁ aplicar code-splitting por ruta para reducir la carga inicial.
2. EL SISTEMA DEBERÁ optimizar imágenes (formato y tamaño) y cargarlas de forma diferida.
3. CUANDO ya se visitó la app, EL SISTEMA DEBERÁ cargar desde caché para abrir rápido y con poco
   consumo de datos.
4. EL SISTEMA DEBERÁ mantener la interacción fluida en dispositivos de gama baja.
5. EL SISTEMA DEBERÁ cumplir un presupuesto de peso medido en un dispositivo de referencia:
   carga inicial (JS crítico) ≤ 250 KB comprimidos como objetivo, y peso por unidad de contenido
   acotado. ⚠️ (dispositivo de referencia y cifras finales por confirmar en el diseño)

---

## Requisito 11 — Idioma y contexto

**Historia:** Como estudiante colombiano, quiero la app en español y con ejemplos locales, para
que me resulte cercana.

#### Criterios de aceptación
1. EL SISTEMA DEBERÁ presentar toda la interfaz y el contenido en español.
2. EL SISTEMA DEBERÁ usar ejemplos y lenguaje del contexto colombiano.

---

## Requisito 12 — Cátedra de la Paz y temas sensibles

**Historia:** Como estudiante y como docente, quiero que la Cátedra de la Paz esté integrada en
el aprendizaje y se trate con cuidado, para comprender el pasado y aprender a convivir mejor.

#### Criterios de aceptación
1. EL SISTEMA DEBERÁ etiquetar el contenido vinculado a la Cátedra de la Paz con el eje Paz.
2. CADA unidad DEBERÁ incluir al menos un nivel o ejercicio con enfoque en memoria, convivencia,
   resolución de conflictos o participación ciudadana.
3. CUANDO el contenido trate el conflicto armado, la violencia u otros temas sensibles, EL SISTEMA
   DEBERÁ aplicar un tratamiento pedagógico: sin imágenes gráficas, con respeto a las víctimas y
   con enfoque en dignidad y construcción de paz.
4. CUANDO se presente un tema sensible, EL SISTEMA DEBERÁ mostrar una nota de contexto y permitir
   al estudiante omitir el ejercicio sin que ello impida completar la lección.
5. EL SISTEMA DEBERÁ permitir ver el avance del estudiante en el eje Paz.

---

## Requisito 13 — Pensamiento crítico y neutralidad

**Historia:** Como docente, quiero que la app forme criterio propio en los estudiantes, para que
analicen y decidan con argumentos.

#### Criterios de aceptación
1. EL SISTEMA DEBERÁ incluir ejercicios que pidan contrastar fuentes, identificar quién cuenta una
   historia y reconocer distintas perspectivas.
2. EL SISTEMA DEBERÁ presentar hechos y múltiples perspectivas, citando fuentes verificables.
3. EL SISTEMA DEBERÁ NO incluir proselitismo político o partidista ni indicar por quién votar.
4. EL SISTEMA DEBERÁ NO usar lenguaje que estigmatice a personas o grupos.

---

## Requisito 14 — Repaso de errores

**Historia:** Como estudiante, quiero repasar lo que fallé, para fijar lo aprendido.

#### Criterios de aceptación
1. CUANDO el estudiante falla un ejercicio, EL SISTEMA DEBERÁ registrarlo localmente para repaso.
2. CUANDO el estudiante acumula ejercicios por repasar, EL SISTEMA DEBERÁ ofrecerle una lección de
   repaso con esos ejercicios, disponible sin conexión.
3. CUANDO el estudiante acierta un ejercicio en repaso, EL SISTEMA DEBERÁ espaciar su próxima
   aparición.

---

## Requisito 15 — Identidad y mascota

**Historia:** Como estudiante, quiero que un personaje me acompañe, para sentir la app cercana y
amable.

#### Criterios de aceptación
1. EL SISTEMA DEBERÁ mostrar la mascota en bienvenida, aciertos, errores, celebraciones y
   recordatorios, usando las poses definidas en `brand.md`.
2. EL SISTEMA DEBERÁ aplicar la paleta, tipografía y tono de voz de `brand.md` en toda la
   interfaz, cuidando que los recursos gráficos no afecten el presupuesto de peso del R10.

---

## Fuera de alcance del MVP (registrado)

- **Backend y sincronización** (Fase 2): servidor, login docente centralizado, recuperación de
  progreso entre dispositivos, descarga incremental de contenido, última sincronización.
- Pantallas de institución (solo estructura de datos preparada).
- Panel/CMS visual completo de edición de contenido para el docente (contenido editable por
  archivos en el MVP; edición visual en fase futura).
- Rol de acudiente dentro de la app.
- Funciones premium concretas (se define el principio: aprender es gratis; premium = funciones
  docentes/institucionales).
- Notificaciones push (limitadas en PWA/iOS); se evalúan en fase posterior.
- Chat, mensajes o contacto entre estudiantes.
- Grados distintos de 6° y 7°.

## Preguntas abiertas (seguimiento)

Resueltas por la decisión de alcance (Opción A, MVP local):
- ✅ (1) Backend en MVP → No. Backend es Fase 2.
- ✅ (2) Recuperar progreso entre dispositivos → Fase 2 (en MVP, progreso solo local, con aviso).
- ✅ (3) Redacción/revisión de contenido → docente especialista; flujo borrador→aprobado por
  control de versiones del repositorio (R7.8).

Pendientes de definir:
- (4) Fórmula de XP y política de rachas (incluido si habrá "congelar racha") → fijar en `design.md`.
- (5) Dispositivo de referencia y cifras finales del presupuesto de peso (R10.5).
- (6) Validación jurídica del esquema de consentimiento (Ley 1581) y plazos de conservación/borrado
  (R8.8). Requiere asesor jurídico; fuera del alcance técnico.
- (7) Nombre definitivo de la mascota.
