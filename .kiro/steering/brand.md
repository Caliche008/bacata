---
inclusion: always
---

# Bacatá — Guía de marca

Este documento es contexto permanente de diseño. Toda pantalla, texto (microcopy), componente,
color y tono de voz debe alinearse con esta guía. La marca refuerza el propósito del producto:
formar criterio y ciudadanía, con calidez y respeto.

## Esencia

- **Nombre:** Bacatá (nombre muisca del territorio donde hoy está Bogotá). Une raíz histórica,
  identidad y punto de partida del aprendizaje.
- **Eslogan:** *Conoce tu historia, construye tu país.*
- **Propósito de marca:** formar criterio. Enseña a investigar, comparar fuentes y argumentar;
  **nunca** dice por quién votar ni adopta posturas partidistas.

## Personalidad

Cercana, curiosa, humilde, esperanzadora, respetuosa. Inteligente sin ser pedante.

- Es: cálida y bogotana en el trato; curiosa (pregunta más de lo que sentencia); motivadora
  ante el error; clara y directa.
- No es: solemne, dogmática, partidista, burlona, castigadora ni rebuscada.

## Mascota

- **Concepto:** perro andino, compañero de ruta del estudiante (homenaje al apodo del profesor
  que inspiró la app). Símbolo de lealtad y curiosidad.
- **Rasgos:** pelaje color miel; orejas expresivas; ojos grandes y curiosos; mochila tejida con
  motivos geométricos inspirados en el arte muisca; un detalle dorado (collar o parche).
- **Estilo:** ilustración vectorial plana, contornos limpios, formas redondeadas, legible en
  tamaños pequeños.
- **Poses mínimas:** feliz, pensando, celebrando, animando tras un error, saludando, durmiendo
  (recordatorio de racha).
- **Reglas:** nunca se burla del error; sin símbolos políticos, armas ni uniformes.
- **Nombre de la mascota:** por definir.

## Logo

- Versión horizontal (mascota + palabra "Bacatá") y versión ícono cuadrado para la app.
- Legible a 48 px, en fondo claro y oscuro.
- Zona de respeto: al menos la altura de la letra "B" alrededor del logo.
- No deformar, no cambiar colores fuera de la paleta, no usar sobre fondos de bajo contraste.

## Paleta de colores (tokens)

| Uso | Nombre | HEX |
|---|---|---|
| Primario | Verde esmeralda | `#1F7A5A` |
| Secundario | Dorado muisca | `#E2A72E` |
| Acento | Terracota | `#C4623A` |
| Fondo claro | Crema | `#FBF6EC` |
| Texto principal | Carbón | `#2B2B2B` |
| Fondo oscuro | Verde noche | `#0F2F26` |
| Acierto | Verde claro | `#4CAF7A` |
| Error (suave) | Coral | `#E5694F` |

Valores propuestos; ajustar tras el logo final. **Accesibilidad (manda sobre la estética):** el
texto cumple contraste WCAG AA (≥ 4.5:1); el error nunca se comunica solo con color (siempre
ícono + texto). Estos tokens deben implementarse como variables de tema, con una variante de
alto contraste (ver `privacidad-accesibilidad.md`).

## Tipografía

- **Títulos:** fuente redondeada y legible (Nunito, Baloo 2 o Fredoka).
- **Texto:** sans-serif sencilla (Inter o Nunito Sans).
- Tamaño mínimo de lectura en móvil: 16 px.
- Usar siempre tildes y signos de apertura (¿ ¡).

## Tono de voz y microcopy

- Español de Colombia, tuteo, frases cortas. Sin regionalismos que excluyan a otras regiones.
- Pregunta antes de afirmar; invita a contrastar fuentes.

Ejemplos (reutilizar y mantener consistencia):
- Bienvenida: "¡Hola! Soy tu compañero de ruta. ¿Empezamos a explorar la historia?"
- Acierto: "¡Muy bien! Así se razona."
- Error: "Casi. Mira esta pista y vuelve a intentarlo."
- Racha: "¡Llevas 5 días seguidos! Tu constancia cuenta."
- Recordatorio: "Hoy te espera una lección corta. Son solo 5 minutos."
- Cátedra de la Paz: "Entender el pasado nos ayuda a convivir mejor hoy."
- Pensamiento crítico: "¿Quién cuenta esta historia? ¿Qué otras versiones existen?"

## Principios de diseño de interfaz

1. Una acción principal por pantalla.
2. Ruta de aprendizaje visual por unidades y niveles, con progreso claro.
3. Retroalimentación inmediata y amable en cada ejercicio.
4. Gamificación sana: premia constancia y comprensión, no competencia hostil.
5. Accesible: contraste, objetivos táctiles ≥ 44 px, lectura clara, lectores de pantalla.
6. Pensada para móviles de gama media y conexiones limitadas.

## Contenido y neutralidad

- Alineado con lineamientos curriculares de ciencias sociales y Cátedra de la Paz (Ley 1732 de
  2014, Decreto 1038 de 2015).
- Presentar hechos y múltiples perspectivas; citar fuentes.
- Prohibido el proselitismo político o partidista y el lenguaje que estigmatice grupos.
- Temas sensibles (conflicto armado, violencia): tratamiento pedagógico, sin imágenes gráficas,
  con enfoque en memoria, dignidad de las víctimas y construcción de paz.

## Privacidad (menores de edad)

- Recolectar solo los datos estrictamente necesarios (ver `privacidad-accesibilidad.md`).
- Cumplir la Ley 1581 de 2012; consentimiento de acudientes cuando aplique.
- Sin publicidad dirigida a menores.

## Prompt base para generar mascota y logo (IA de imagen)

```
Create the visual identity for a Colombian educational app called "Bacatá" (slogan: "Conoce tu historia, construye tu país"), for high-school students aged 12-17 learning history, social sciences and peace studies through short Duolingo-style lessons.

Mascot: a friendly Andean dog, honey-colored fur, big curious eyes, expressive ears, wearing a small woven backpack with geometric Muisca-inspired patterns and a small golden detail on the collar. Flat vector illustration, clean outlines, rounded shapes. Show 5 poses: happy, thinking, celebrating, encouraging after a mistake, waving.

Logo: horizontal version (mascot + wordmark "Bacatá" in a rounded friendly typeface) and a square app icon. Must stay legible at small sizes on light and dark backgrounds.

Palette: emerald green #1F7A5A, muisca gold #E2A72E, terracotta #C4623A, cream #FBF6EC.

Tone: warm, hopeful, respectful. Avoid political symbols, weapons, violence or stereotypes. Transparent or white background.
```
