# Diseño: ajustes visuales y modo nocturno — WeatherApp refactor

**Fecha:** 2026-10-28
**Contexto:** QA visual y feedback del usuario sobre la UI refactorada (Tasks 7–15).

## Intento

1. El bloque central del hero (ilustración/icono + grados) choca casi con la línea que lo separa del bloque superior (borde inferior del masthead, `y = 129` medido en 1440 px). Quiere separación clara.
2. El footer debe quitar la sección "OPEN-METEO" y las letras restantes necesitan más contraste.
3. Modo nocturno: entre las **20:00 y las 08:00** hora de la ubicación, la página pasa a fondo negro con el símbolo lunar en el hero y esquema oscuro (tokens invertidos).

## Goals / Non-goals

- Goals: sin colisión hero/masthead; footer limpio y legible; noche funcional con luna.
- Non-goals: rediseño móvil <768 px (fase 2), otras familias nocturnas.

## Approaches consideradas

1. **Hero**: añadir `padding-top` en `.hero__art` (32 px, `--space-4`) para que la ilustración quede bajo el borde.
2. **Footer**: eliminar el nodo fuente y el estilo `.footer__source`; subir el color de `.footer__updated` a `--ink`.
3. **Noche**: `[data-theme='night']` en `tokens.css` (tokens invertidos) + helper `isNight` en `app.ts` + `renderHero` con `isDay = !night`.

## Decisiones

- Se elige inversión de tokens (no paleta negra custom) para mantener la coherencia del sistema.
- El umbral nocturno se calcula con hora local de la zona del lugar (`weather.timezone`) a partir de `lastUpdated`.

## Pendiente

- Verificación visual final tras los cambios.
