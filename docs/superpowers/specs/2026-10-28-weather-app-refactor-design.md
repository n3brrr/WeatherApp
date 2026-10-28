# Rediseño y refactor completo — Weather App

- **Fecha:** 2026-10-28
- **Estado:** propuesta para aprobación
- **Stack elegido:** Vite + TypeScript + pnpm (opción B)
- **Alcance de esta fase:** escritorio y tablet (>768 px). Móvil se diseña en una fase posterior.

---

## 1. Intención

La app funciona, pero su diseño actual —fondo casi negro, sol PNG neón, tarjetas redondeadas— no tiene una identidad propia, y su lógica arrastra errores silenciosos. Este proyecto la reconstruye por completo con una dirección editorial japonesa-suiza: papel cálido, sol rojo plano, tipografía discreta, números grandes y mucho aire.

El objetivo es que la temperatura sea lo primero que se ve, que el conjunto transmita calma y precisión, y que cada detalle técnico (viento, humedad, horas, días) esté donde debe estar sin competir con el dato principal.

La referencia visual es la imagen adjunta por el usuario en la conversación (concepto de Minh Pham, 2020): fondo beige con textura, bloque ocre vertical con «WEATHER APP», «26°C» en tipografía fina, sol rojo geométrico con líneas horizontales y una nube mínima, palabra vertical «SUNNY», «TOKYO» con tracking amplio y una franja de días con iconos diminutos. Esa imagen es la fuente de verdad visual; este documento la traduce a decisiones de interfaz. Si hay conflicto entre la imagen y el texto, manda la imagen.

---

## 2. Objetivos

1. Rehacer la lógica en TypeScript con Vite, separando API, dominio y UI.
2. Aplicar un sistema visual completo basado en la referencia: paleta cálida, tipografía editorial, ilustraciones SVG planas y retícula precisa.
3. Conservar el concepto funcional actual: clima actual, tres métricas, pronóstico de 6 días y curva horaria.
4. Corregir los errores de lógica y de assets detectados en la auditoría.
5. Eliminar los ~4 MB de PNG y sustituirlos por ilustraciones SVG hechas a medida.
6. Entregar una interfaz accesible, rápida y sin dependencias de runtime.
7. Dejar la estructura preparada para la fase móvil, sin diseñarla todavía.

## 3. No objetivos

- Diseño móvil final por debajo de 768 px.
- Búsqueda de ciudades, varias ubicaciones guardadas o favoritos.
- Cuentas, backend, base de datos o sincronización.
- PWA, modo offline o notificaciones.
- Modo oscuro. La identidad es deliberadamente paper-first.
- Iconos realistas, 3D, gradientes, glassmorphism o tarjetas con sombra.
- Cambiar de idioma la interfaz: sigue en español.

## 4. Anti-objetivos

El proyecto fracasa si:

- El resultado parece una plantilla genérica de dashboard con la paleta cambiada.
- La ilustración o la tipografía sacrifican la legibilidad del dato.
- Se acumulan adornos (badges, sombras, bordes, animaciones) que rompen la calma.
- La app pesa más que ahora o tarda en mostrar la temperatura.
- El diseño depende de una imagen raster para verse bien.

## 5. Estado actual y problemas detectados

La app es HTML/CSS/JS vanilla, sin build, con Open-Meteo como única API.

Problemas concretos:

| Problema | Ubicación | Impacto |
|---|---|---|
| ~300 líneas de CSS duplicadas y comentadas | `css/styles.css` (final del archivo) | Mantenimiento confuso |
| Ruta de asset inexistente: `assets/SOl con nubajsjajss.png` | `js/app.js` | El icono de "nublado" rompe |
| La geocodificación se llama con `latitude`/`longitude`, pero Open-Meteo Geocoding busca por nombre | `js/app.js` → `getCityName()` | Casi siempre cae en el fallback "Málaga" |
| La humedad usa `hourly.relativehumidity_2m[currentHour]` | `js/app.js` | Índice incorrecto: la API devuelve 7 días desde las 00:00, no desde "ahora" |
| PNG de 1,3 MB, 2,8 MB y 203 KB | `assets/` | Peso desproporcionado para una sola pantalla |
| Sin estados de carga, error ni permiso denegado | `js/app.js` | La UI queda con placeholders o vacía |
| Sin manejo de zona horaria del lugar | `js/app.js` | Fechas y horas pueden no coincidir con la ciudad |
| `js/api/weatherService.js` está vacío | `js/api/` | Estructura a medio hacer |

## 6. Decisiones de producto

| Decisión | Elección | Motivo |
|---|---|---|
| Stack | Vite + TypeScript + pnpm | Elegido por el usuario; mejor tipado, HMR y build estático |
| Framework de UI | Ninguno (DOM nativo) | No hace falta React para una sola pantalla |
| Gestor de paquetes | pnpm | Exigido por las reglas de commit (`pnpm run lint`, `pnpm run build`) |
| Días mostrados | 6 (hoy + 5) | Mantiene el concepto actual |
| Contenido por día | Icono, nombre, máx. y mín. | La mínima ya se consulta; añadirla mejora la lectura |
| Etiqueta del día actual | "HOY" | Detalle editorial y jerarquía clara |
| Métricas | Viento, humedad, mínima | Idénticas al concepto actual |
| Idioma | Español | Continuidad |
| Palabra vertical | Condición en español, p. ej. "DESPEJADO" | Eco tipográfico de la referencia |
| Geolocalización denegada | Cargar Málaga como ubicación de ejemplo + aviso discreto | La app nunca queda vacía |
| Geocodificación inversa | BigDataCloud (sin API key) | Open-Meteo no ofrece reverse geocoding |
| Fuente de datos | Open-Meteo Forecast | Gratuita, sin key, suficiente |
| Tipografías | Space Grotesk + IBM Plex Mono | Ya presentes; encajan con lo suizo-japonés |
| Iconos | 8 familias SVG planas | Cubren todos los códigos WMO |
| Botón de actualizar | Sí, discreto en el pie | Útil y coherente con lo técnico |
| Tests | Vitest para lógica pura | Rápido, integrado con Vite |
| Despliegue | Build estático (`dist/`), `base: './'` | Compatible con GitHub Pages y cualquier host |

### 6.1 Decisiones resueltas durante la revisión

| Tema | Decisión | Motivo |
|---|---|---|
| Permiso de ubicación pendiente | Timeout de 8 s → Málaga + aviso; si se concede después, actualiza sin recargar | Evita un skeleton infinito |
| Actualización manual | Mantiene los datos visibles, solo gira el botón; no re-geolocaliza | Refrescar el clima no debe mover la ciudad |
| Fallo al actualizar | Conserva los datos y muestra un aviso inline | No destruir información válida |
| Geocodificación inversa | No bloqueante; el clima pinta primero y el nombre llega después | Protege el LCP |
| "ACTUALIZADO" | Hora local del lugar, al terminar la carga | Coherencia con el encabezado |
| Contraste de la gráfica | `--ochre-deep` para línea y puntos | 3,27:1 sobre papel; cumple no-texto |
| Referencia visual | La imagen adjunta en la conversación manda | El documento es su traducción |

---

## 7. Enfoques considerados

### A — Vanilla modular sin build
Ventaja: cero dependencias y despliegue directo. Coste: sin HMR, sin tipado real y sin bundling. Descartado por decisión del usuario.

### B — Vite + TypeScript (elegido)
Ventaja: tipado estricto, HMR, build optimizado y tests integrados. Coste: toolchain de desarrollo y `node_modules`. Es el equilibrio adecuado para un rediseño completo que aspira a mantenerse.

### C — Astro o React
Descartado: añade un framework de componentes y peso conceptual sin resolver ningún problema de esta pantalla.

---

## 8. Arquitectura técnica

### 8.1 Estructura de archivos

```text
weather-app/
├── index.html
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vite.config.ts
├── eslint.config.js
├── public/
│   └── favicon.svg
├── src/
│   ├── main.ts              # entrada; solo monta createApp()
│   ├── app.ts               # orquestación testeable
│   ├── styles/
│   │   ├── index.css        # importa el resto
│   │   ├── tokens.css
│   │   ├── base.css
│   │   ├── layout.css
│   │   ├── masthead.css
│   │   ├── current.css
│   │   ├── hero.css
│   │   ├── daily.css
│   │   ├── hourly.css
│   │   ├── status.css
│   │   └── footer.css
│   ├── api/
│   │   ├── openMeteo.ts
│   │   ├── reverseGeocode.ts
│   │   └── geolocation.ts
│   ├── domain/
│   │   ├── types.ts
│   │   ├── weatherCodes.ts
│   │   ├── format.ts
│   │   ├── forecast.ts
│   │   └── *.test.ts
│   ├── ui/
│   │   ├── masthead.ts
│   │   ├── currentWeather.ts
│   │   ├── dailyForecast.ts
│   │   ├── hourlyChart.ts
│   │   ├── heroIllustration.ts
│   │   ├── icons.ts
│   │   ├── status.ts
│   │   └── refresh.ts
│   └── utils/
│       └── dom.ts
└── docs/
    ├── superpowers/specs/2026-10-28-weather-app-refactor-design.md
    └── superpowers/plans/2026-10-28-weather-app-refactor.md
```

Los archivos CSS de cada componente se crean vacíos en la tarea de scaffold y se importan una sola vez desde `styles/index.css`. Cada tarea posterior rellena únicamente su archivo; ninguna vuelve a tocar `index.css`. Lo mismo ocurre con `index.html`: la estructura semántica completa se crea en el scaffold y las tareas de UI solo rellenan sus contenedores.

### 8.2 Capas

- **`api/`** — llamadas HTTP y normalización de respuestas. No toca el DOM.
- **`domain/`** — funciones puras: mapeo WMO, cálculo de próximas horas, formato de fechas y temperaturas. Testeable sin navegador.
- **`ui/`** — renderizado y actualización del DOM. Recibe datos ya normalizados.
- **`app.ts`** — orquesta el ciclo ubicación → datos → render → estados con dependencias inyectables, para poder testearlo sin red ni geolocalización real.
- **`main.ts`** — entrada mínima: construye las dependencias reales y llama a `createApp(document, deps).start()`.
- **`styles/`** — tokens primero; ningún color o tamaño "mágico" fuera de tokens. Un archivo por componente para que las tareas no se pisen.

### 8.3 Estado de la aplicación

```ts
type AppStatus = 'loading' | 'ready' | 'error';

interface AppState {
  status: AppStatus;
  isRefreshing: boolean;
  weather?: WeatherData;
  place?: Place;
  locationNotice?: string;
  error?: string;
  lastUpdated?: Date;
}
```

Durante una actualización manual, `status` sigue siendo `'ready'` y `isRefreshing` controla el giro del botón; los datos anteriores permanecen visibles. El estado vive en el closure de `app.ts`; no se introduce una librería de estado.

### 8.4 Seguridad de renderizado

Los únicos datos externos que se insertan como texto son el nombre del lugar y las etiquetas de tiempo. Se usarán `textContent` / `createElement`, nunca `innerHTML` con interpolación de datos de la API. Las plantillas SVG de `icons.ts` son constantes internas y seguras.

---

## 9. Datos y lógica

### 9.1 Open-Meteo

Endpoint único:

```text
https://api.open-meteo.com/v1/forecast
  ?latitude={lat}&longitude={lon}
  &current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m
  &hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code
  &daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset
  &timezone=auto
  &forecast_days=7
```

Notas:

- Se usa el parámetro moderno `current=` en lugar del legacy `current_weather=true`.
- `current.relative_humidity_2m` elimina el bug de índice de humedad.
- La zona horaria se toma de `data.timezone` para formatear fechas y horas del lugar.
- `forecast_days=7` da margen; la UI muestra 6.

### 9.2 Geocodificación inversa

BigDataCloud:

```text
https://api.bigdatacloud.net/data/reverse-geocode-client
  ?latitude={lat}&longitude={lon}&localityLanguage=es
```

- Nombre: `city || locality || principalSubdivision`, seguido de `countryName`.
- Si falla: "Tu ubicación".
- Si la geolocalización del navegador falla o se deniega: Málaga (`36.7213, -4.4214`) y aviso "Ubicación de ejemplo · Málaga".
- Si el navegador no soporta geolocalización: mismo fallback.

### 9.3 Códigos WMO → 8 familias

| Familia | Códigos |
|---|---|
| `clear` | 0, 1 |
| `partly` | 2 |
| `cloudy` | 3 |
| `fog` | 45, 48 |
| `drizzle` | 51, 53, 55, 56, 57 |
| `rain` | 61, 63, 65, 66, 67, 80, 81, 82 |
| `snow` | 71, 73, 75, 77, 85, 86 |
| `storm` | 95, 96, 99 |

Cada familia tiene:

- descripción en español,
- ilustración grande para el hero,
- icono pequeño de 24 px para la lista diaria,
- variante nocturna cuando `is_day = 0` (solo `clear` y `partly`: discos en carbón con detalles ocres).

### 9.4 Cálculos

- **Próximas 8 horas:** localizar el índice de la hora actual comparando `current.time` (recortado a `YYYY-MM-DDTHH:00`) con `hourly.time`; desde ahí, tomar 8 posiciones. Esto funciona aunque se cruce la medianoche y respeta la zona del lugar.
- **Temperaturas:** redondeo entero; mostrar `°C` en el hero y `°` en la lista y la gráfica.
- **Días:** parsear `daily.time[i]` (`YYYY-MM-DD`) por componentes, no con `new Date(string)`, para evitar el desplazamiento de un día por UTC.
- **Fecha del encabezado:** se obtiene la fecha local del lugar con `Intl.DateTimeFormat` y `timeZone`, y se formatea con arrays propios de días y meses (`MIÉ, 28 OCT`) para que el resultado sea determinista en los tests.
- **Etiqueta "HOY":** índice 0 de `daily.time` comparado con la fecha local del lugar.
- **Viento:** `Math.round(wind_speed_10m)` + `km/h`.
- **Mínima del hero:** `daily.temperature_2m_min[0]`.

### 9.5 Estados y errores

- **Carga:** estructura estable con placeholders de líneas; etiqueta mono "CARGANDO".
- **Geolocalización pendiente:** si el navegador no responde en 8 s (permiso ignorado), se carga Málaga con el aviso "Permiso de ubicación pendiente" y se continúa. Si el permiso se concede después, la ubicación y el clima se actualizan sin recargar.
- **Error de red/API:** bloque editorial con una regla coral, mensaje claro y botón "REINTENTAR".
- **Permiso denegado:** la app carga el fallback y muestra un aviso discreto, no un error.
- **Geocodificación no bloqueante:** el clima se pinta en cuanto llega Open-Meteo; el nombre del lugar se rellena después. Mientras tanto, el encabezado muestra "UBICACIÓN…"; si falla, "Tu ubicación". Esto protege el LCP.
- **Actualización manual:** botón en el pie; mantiene los datos visibles, gira el icono y deshabilita el botón. No vuelve a pedir geolocalización ni geocodificación; solo refresca Open-Meteo. Si falla, conserva los datos y muestra un aviso inline con "REINTENTAR".
- **"ACTUALIZADO HH:MM":** hora local del lugar en el momento en que terminó la última carga, formateada con la misma zona horaria que el encabezado.
- **Timeout:** `AbortController` a 10 s para Open-Meteo y BigDataCloud; se trata como error de red (o fallback de nombre en el caso del geocoder).

---

## 10. Sistema visual

### 10.1 Traducción de la referencia

| Principio | Decisión concreta |
|---|---|
| Minimalismo japonés | Fondo papel cálido, sin tarjetas, mucho negativo, composición asimétrica y equilibrada, cada dato con su sitio |
| Ilustración vectorial retro | Sol geométrico coral, líneas horizontales que se desvanecen, nubes y símbolos planos, sin realismo |
| Diseño editorial suizo-japonés | Retícula de 12 columnas, micro-etiquetas mono con tracking amplio, números gigantes, alineación óptica estricta |
| Retro-futurismo suave | Sol de cartel vintage + indicadores contemporáneos pequeños (coordenadas, fuente, actualización) |

### 10.2 Paleta

| Token | Valor | Uso |
|---|---|---|
| `--paper` | `#EFE7DA` | Fondo principal cálido |
| `--paper-deep` | `#E7DCCB` | Tints de hover y bandas sutiles |
| `--ink` | `#201E1A` | Texto y trazos principales |
| `--ink-muted` | `#6E675C` | Texto secundario |
| `--coral` | `#D6382C` | Sol, acentos, estados de error |
| `--ochre` | `#D8A33F` | Bloque de marca y acentos grandes (decorativo) |
| `--ochre-deep` | `#A9741F` | Línea y puntos de la gráfica, texto pequeño ocre (contraste ≥3:1) |
| `--rule` | `rgba(32, 30, 26, 0.18)` | Reglas finas |
| `--rule-strong` | `rgba(32, 30, 26, 0.45)` | Reglas de énfasis |

Reglas de uso:

- El coral no se usa para texto pequeño (contraste insuficiente); sí para gráficos, cifras grandes y acentos.
- El ocre aparece en dosis pequeñas: marca, gráfica, un detalle del icono.
- Para trazos finos y texto pequeño se usa `--ochre-deep`; el ocre claro queda para superficies grandes.
- Sin gradientes. La sensación de desvanecido se consigue con opacidad por línea.
- Textura de papel: ruido SVG (`feTurbulence`) al 3–4 % de opacidad, fijo y con `pointer-events: none`.

### 10.3 Tipografía

| Rol | Fuente | Tamaño / estilo |
|---|---|---|
| Temperatura | Space Grotesk 300 | `clamp(96px, 13vw, 200px)`, line-height 0.8, tracking −0.05em, `tabular-nums` |
| Descripción | Space Grotesk 400 | 18–22 px |
| Cifras de métricas | Space Grotesk 500 | 14–16 px, `tabular-nums` |
| Micro-etiquetas | IBM Plex Mono 400/500 | 9–11 px, uppercase, tracking 0.18em |
| Días y horas | IBM Plex Mono 400 | 11–12 px |
| Palabra vertical | IBM Plex Mono 400 | 10 px, uppercase, tracking 0.32em, `writing-mode: vertical-rl` |

Solo se cargan los pesos necesarios: Space Grotesk 300/400/500 e IBM Plex Mono 400/500, con `display=swap` y `preconnect`. Si la red falla, el fallback es `ui-sans-serif, system-ui, sans-serif` y `ui-monospace, monospace`.

### 10.4 Retícula y composición (>1200 px)

- Contenedor máximo: 1560 px; padding lateral `clamp(28px, 4vw, 64px)`.
- Fondo papel a pantalla completa; sin contenedores con borde.
- **Masthead:** bloque de marca ocre vertical (26 × 88 px) + ubicación y fecha en mono; coordenadas del lugar alineadas a la derecha; regla inferior de 1 px.
- **Hero:** tres columnas `5fr / 4fr / 3fr`.
  - Izquierda: temperatura gigante, `°C` pequeño, descripción, fila de tres métricas con iconos de 16 px.
  - Centro: ilustración de hasta 420 px, centrada, con la condición en vertical a su derecha.
  - Derecha: lista de 6 días separada por reglas finas, sin caja.
- **Gráfica horaria:** ancho completo, 200–240 px de alto, línea `--ochre-deep` de 1,5 px, puntos de 5 px (`--coral` en la hora actual, `--ochre-deep` en el resto), temperaturas encima, horas debajo, una línea base y dos reglas horizontales muy tenues. Sin ejes ni leyenda. La línea y los puntos cumplen contraste no textual ≥3:1 sobre el papel.
- **Pie:** fuente "OPEN-METEO", "ACTUALIZADO HH:MM", botón "ACTUALIZAR" y coordenadas si no caben arriba.
- Espaciado base de 8 px; los bloques grandes usan múltiplos de 24/32/48.

### 10.5 Ilustración

Ilustración principal compuesta por geometría pura:

- Disco coral de ~300 px para `clear` y `partly`.
- Entre 10 y 14 líneas horizontales debajo del disco, con opacidad decreciente, como reflejo/ondas.
- Nube de silueta simple cruzando el disco en `partly`.
- `cloudy`: dos o tres siluetas de nube en carbón y papel, sin disco.
- `fog`: líneas horizontales de anchos distintos, sin disco.
- `rain` / `drizzle`: nube + líneas verticales coral y ocre de longitudes variables.
- `storm`: nube + rayo angular ocre.
- `snow`: nube + puntos geométricos.
- Noche: disco carbón + líneas ocres + puntos pequeños.

Los iconos pequeños son versiones de línea de las mismas formas, trazo de 1,5 px, extremos rectos, 24 × 24 px. Se generan como funciones SVG internas, no como peticiones de red.

La ilustración grande es decorativa (`role="img"` con `<title>` que describe la condición); la información real está siempre en texto.

### 10.6 Movimiento

- Entrada de página: la temperatura sube 12 px y aparece en 600 ms; las líneas del sol se dibujan con `scaleX` escalonado; la lista y la gráfica aparecen con un fade corto.
- Hover en un día: una regla coral de 2 px crece desde la izquierda y las cifras se desplazan 2 px.
- Botón de actualizar: giro de 180° mientras carga.
- Todo se desactiva con `prefers-reduced-motion: reduce`.
- Sin parallax, sin scroll-jacking, sin animaciones en bucle.

### 10.7 Estados visuales

- **Loading:** mismas posiciones; líneas de placeholder con pulso suave; etiqueta "CARGANDO".
- **Error:** regla coral de 2 px arriba, mensaje en Space Grotesk y botón mono "REINTENTAR" con borde inferior.
- **Aviso de ubicación:** línea mono pequeña bajo la fecha, sin caja.
- **Focus:** contorno coral de 2 px con offset de 3 px.
- **Selección de texto:** fondo ocre, texto carbón.

---

## 11. Responsive

La fase actual cubre >768 px. Los breakpoints se definen ahora para que el móvil posterior no obligue a rehacer la estructura.

| Rango | Composición |
|---|---|
| ≥1200 px | Hero 5/4/3; lista vertical; gráfica a ancho completo |
| 1024–1199 px | Hero 6/6; lista debajo en rejilla 3×2; gráfica a ancho completo |
| 769–1023 px | Hero 7/5; métricas en dos filas si hace falta; lista 3×2; palabra vertical oculta; gráfica con scroll horizontal contenido si el espacio aprieta |
| ≤768 px | Stack funcional: temperatura, ilustración, métricas, lista, gráfica. Sin pulir; fase 2 |

Reglas:

- La temperatura nunca baja de 72 px en tablet.
- La lista diaria no se convierte en tarjetas; mantiene reglas y alineación.
- La gráfica mantiene etiquetas legibles; si no caben, se reduce a 6 horas visibles con scroll, no se ocultan datos.
- Los nombres de ciudad largos se truncan con `text-overflow: ellipsis` y `max-width`; el nombre completo queda en `title`.

---

## 12. Accesibilidad

- Landmarks: `header`, `main`, `footer`; un solo `h1` (la temperatura).
- La temperatura visible lleva `aria-hidden` y un `sr-only` con "23 grados Celsius".
- `aria-live="polite"` en la región de estado para anunciar la actualización.
- Fechas en `<time datetime="...">`.
- Iconos decorativos con `aria-hidden="true"`; los que aportan información llevan texto visible al lado.
- Contraste mínimo 4,5:1 para texto; el coral se reserva para elementos grandes o gráficos.
- Navegación por teclado: botón de actualizar y enlaces con foco visible.
- `prefers-reduced-motion` respetado.
- Zoom al 200 % sin pérdida de contenido.

---

## 13. Rendimiento

- Sin dependencias de runtime; Vite solo en desarrollo/build.
- Todos los iconos e ilustraciones son SVG inline: cero peticiones de imagen.
- Se eliminan los PNG y los SVG antiguos que no se usen.
- Fuentes: solo 5 pesos, `preconnect` y `display=swap`; sin bloquear el render.
- JS y CSS con hash en el build; objetivo < 100 KB gzip en total.
- La temperatura es el LCP y es texto; no hay imagen que bloquee.
- `fetch` con `AbortController` y timeout de 10 s.
- Lighthouse objetivo: rendimiento ≥95 y accesibilidad ≥95 en escritorio.

---

## 14. Testing y QA

### Tests automáticos (Vitest)

- `weatherCodes.test.ts`: todos los códigos WMO conocidos se mapean a una familia y descripción; los desconocidos caen en `cloudy`/“Desconocido”.
- `forecast.test.ts`: próximas 8 horas desde una hora intermedia y cruzando medianoche; días sin desplazamiento UTC.
- `format.test.ts`: redondeo, viento, fecha con `timeZone`, etiqueta "HOY" y temperaturas extremas (−10°, 100°).
- `openMeteo.test.ts`: URL construida, normalización de la respuesta y error HTTP.
- `reverseGeocode.test.ts`: composición del nombre y fallback ante error (fetch mockeado).
- `geolocation.test.ts`: éxito, denegación, no soportado y timeout de 8 s.
- `icons.test.ts` / `heroIllustration.test.ts`: las 8 familias generan SVG y variantes de día/noche.
- Tests de UI con jsdom para masthead, clima actual, lista diaria, gráfica, estados y refresh.
- `app.test.ts`: integración con dependencias falsas; geocodificación caída, refresh fallido y nombre largo.

### Comprobaciones manuales

- Geolocalización permitida, denegada, no soportada y permiso pendiente (timeout de 8 s).
- Red lenta, offline y timeout.
- Actualización manual correcta y actualización fallida (debe conservar datos).
- Geocodificación lenta o caída (el clima debe pintarse igualmente).
- Códigos de clima de las 8 familias, de día y de noche.
- Viewports: 1440, 1280, 1024, 900, 769 y 768.
- Teclado, foco visible, zoom 200 % y `prefers-reduced-motion`.
- `pnpm run lint`, `pnpm run typecheck`, `pnpm run test`, `pnpm run build`.

---

## 15. Fases de implementación

1. **Scaffold:** Vite + TS, estructura de carpetas, tokens, fuentes y `index.html` semántico.
2. **Dominio y datos:** tipos, Open-Meteo, BigDataCloud, mapeo WMO, cálculos y tests.
3. **Hero:** temperatura, métricas, ilustración principal y palabra vertical.
4. **Pronóstico y gráfica:** lista de 6 días y curva de 8 horas.
5. **Estados y pulido:** loading, error, aviso de ubicación, actualización, accesibilidad y movimiento.
6. **Limpieza y QA:** borrar assets legacy, actualizar README, build y revisión visual.

Cada fase deja la app ejecutable. La fase 6 incluye la comprobación de que no queda ninguna referencia a los PNG antiguos.

---

## 16. Criterios de aceptación

- La composición >768 px reproduce la jerarquía de la referencia: temperatura primero, ilustración central, lista discreta, gráfica al pie.
- No hay tarjetas, sombras ni gradientes; solo papel, tinta, reglas y las ilustraciones planas.
- Las 8 familias de clima se ven correctamente en el hero y en la lista.
- No existe ningún asset roto ni PNG en el build final.
- La humedad corresponde al momento actual del lugar.
- El nombre de la ciudad es correcto (geocodificación inversa real) o "Tu ubicación".
- Geolocalización denegada → Málaga + aviso; error de red → estado de error con reintento.
- Si el permiso de ubicación queda pendiente, la app no se queda cargando: a los 8 s muestra Málaga con aviso.
- El nombre del lugar puede llegar después del clima sin bloquear la primera pintura.
- Una actualización fallida conserva los datos previos y muestra un aviso inline.
- La gráfica cumple contraste no textual ≥3:1.
- `pnpm run lint`, `pnpm run typecheck`, `pnpm run test` y `pnpm run build` pasan sin errores ni warnings nuevos.
- Lighthouse ≥95 en rendimiento y accesibilidad en escritorio.
- El layout de 769–1199 px es usable y fiel al sistema, no solo "no se rompe".
- La estructura CSS/TS permite añadir el diseño móvil sin reescribir la app.

---

## 17. Riesgos

| Riesgo | Mitigación |
|---|---|
| BigDataCloud no responde o cambia | Fallback a "Tu ubicación"; la API se aísla en `reverseGeocode.ts` |
| Open-Meteo cambia nombres de campos | Capa de normalización + tests de tipos |
| La ilustración SVG no alcanza la calidad de la referencia | Construirla por partes (disco, líneas, nube) y revisarla visualmente antes de cerrar la fase 3 |
| La temperatura gigante rompe con 3 dígitos o negativos | `clamp`, `tabular-nums`, contenedor flexible y prueba con −10° y 100° |
| Nombres de ciudad largos | Truncado con ellipsis + `title` |
| Fuentes externas lentas | `display=swap`, fallback local y solo 5 pesos |
| El diseño se vuelve "decorativo" y pierde legibilidad | Revisión de contraste y jerarquía en cada fase; el dato siempre en texto |

---

## 18. Lo que queda a criterio del implementador

- Trazado exacto de cada SVG (proporciones, número de líneas, posición de la nube).
- Ajuste fino de espaciados y tamaños tipográficos dentro de los rangos definidos.
- Configuración exacta de `tsconfig`, `vite.config` y scripts.
- Estructura interna de los tests y mocks.
- Detalles de la transición de entrada.
- Textos exactos de los mensajes de error y del aviso de ubicación.

---

## 19. Anexo: dependencias previstas

**Runtime:** ninguna.

**Desarrollo:**

- `vite`
- `typescript`
- `vitest`
- `jsdom`
- `eslint`
- `@eslint/js`
- `typescript-eslint`
- `globals`

**Scripts:**

```json
{
  "dev": "vite",
  "build": "pnpm run typecheck && vite build",
  "preview": "vite preview",
  "typecheck": "tsc --noEmit",
  "lint": "eslint . --max-warnings 0",
  "test": "vitest run",
  "check": "pnpm run lint && pnpm run build && pnpm run test"
}
```

**Configuración relevante:**

- `packageManager`: `pnpm@12.6.0`.
- `tsconfig` estricto, `noUncheckedIndexedAccess`, `moduleResolution: "bundler"`, target ES2022.
- `vite.config.ts` con `base: './'` para que el build funcione en GitHub Pages sin depender de la ruta del repo.
- `eslint.config.js` con flat config, TypeScript recomendado y `dist/` ignorado; `--max-warnings 0` para que ningún warning pase desapercibido.
- `index.html` en la raíz, con `lang="es"`, meta description y favicon SVG.

---

## 20. Commits y ramas

Estas reglas son obligatorias para todas las tareas del plan:

- **No se commitea código en rojo.** Antes de cada commit, lo staged debe pasar `pnpm run lint` y `pnpm run build` (typecheck incluido) sin errores ni warnings nuevos. Si algo falla, se corrige y se vuelve a comprobar; nunca se deja para el commit siguiente.
- **Un commit = un cambio lógico**, staged por archivo o por trozo (`git add -p`), nunca `git add .` a ciegas. Refactor, fix y feat van en commits separados.
- **Mensajes en Conventional Commits**: `<tipo>(<ámbito>): <descripción imperativa>`, con tipos `feat`, `fix`, `refactor`, `perf`, `style`, `chore`, `build`, `docs`, `test`. Asunto ≤ 72 caracteres, sin punto final; el cuerpo (opcional) explica el porqué, no el qué.
- **Rama de trabajo: `dev`.** Todo commit va a `dev`, creándola desde la rama actual si no existe (`git switch -c dev`). Nunca se commitea directamente a `master`/`main`.
- **Push siempre a `dev`** (`git push -u origin dev` la primera vez).
- **Merge a `master`/`main` solo cuando el usuario lo pida explícitamente.** El agente no hace merge por iniciativa propia.

Cada tarea del plan termina con la secuencia:

```bash
pnpm run lint
pnpm run build
pnpm run test
git add <archivos exactos de la tarea>
git commit -m "<tipo>(<ámbito>): <descripción>"
git push origin dev
```

---

## 21. Orden y dependencias del plan

Para que ninguna tarea pise a otra:

1. Cada tarea declara **Files** (solo los que crea o modifica), **Consumes** (interfaces exactas de tareas anteriores) y **Produces** (interfaces exactas que usarán las siguientes).
2. Las tareas se ejecutan en orden secuencial. No hay tareas paralelas que toquen el mismo archivo.
3. Los archivos compartidos se crean una sola vez en el scaffold: `index.html`, `styles/index.css`, `main.ts` (placeholder) y los archivos CSS vacíos. Las tareas posteriores solo rellenan su propio archivo.
4. `app.ts` y `main.ts` se completan en la última tarea funcional; ninguna tarea anterior los modifica.
5. La limpieza de assets legacy es la última tarea y solo borra archivos que ya no referencia nadie.
6. Cada tarea deja `lint`, `build` y `test` en verde y un commit propio. Si una tarea necesita cambiar una interfaz de una tarea anterior, se actualiza primero esa interfaz, se ejecutan sus tests y se commitea el cambio como `refactor`, antes de continuar.
