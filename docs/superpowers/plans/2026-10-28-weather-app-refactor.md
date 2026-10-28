# Refactor editorial de Weather App — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconstruir Weather App con Vite + TypeScript y una interfaz editorial japonesa-suiza, conservando clima actual, 6 días y curva horaria para >768 px.

**Architecture:** Capas `api/` → `domain/` → `ui/`; `app.ts` orquesta con dependencias inyectables y `main.ts` solo monta. Cada componente tiene su propio CSS para que las tareas no compartan archivos.

**Tech Stack:** Vite, TypeScript, pnpm, Vitest, jsdom, ESLint, Open-Meteo, BigDataCloud.

**Spec:** `docs/superpowers/specs/2026-10-28-weather-app-refactor-design.md`

## Global Constraints

- **Gestor:** pnpm 12.6.0; Node 22. No se usa npm.
- **Runtime:** cero dependencias de producción. Todo lo demás es `devDependency`.
- **Alcance visual:** >768 px completo; ≤768 px solo stack funcional, sin pulir.
- **Idioma:** toda la UI y los textos en español.
- **Sin tarjetas, sombras, gradientes, glassmorphism ni iconos raster.** Solo papel, tinta, reglas, SVG planos y los tokens del spec.
- **Paleta exacta:** `--paper:#EFE7DA`, `--paper-deep:#E7DCCB`, `--ink:#201E1A`, `--ink-muted:#6E675C`, `--coral:#D6382C`, `--ochre:#D8A33F`, `--ochre-deep:#A9741F`, `--rule:rgba(32,30,26,.18)`, `--rule-strong:rgba(32,30,26,.45)`.
- **Tipografías:** Space Grotesk 300/400/500 e IBM Plex Mono 400/500, con fallback local.
- **Accesibilidad:** contraste ≥4,5:1 en texto, foco visible, `prefers-reduced-motion`, `<time datetime>`, `aria-live` en estados.
- **Datos:** Open-Meteo Forecast y BigDataCloud reverse geocoding, sin API keys.
- **Commits:** no se commitea código en rojo. Antes de cada commit, lo staged pasa `pnpm run lint` y `pnpm run build` sin errores ni warnings nuevos. Un commit = un cambio lógico, staged por archivo, nunca `git add .`. Conventional Commits, asunto ≤72 caracteres, sin punto final. Rama `dev`; nunca `main`/`master`. Push a `dev`. Merge solo si el usuario lo pide.
- **Cada tarea termina con:** `pnpm run lint && pnpm run build && pnpm run test`, stage por archivo, commit y `git push origin dev`.

## Review Focus

Estos son los cinco fallos que más probablemente afecten a una persona y que el spec no convierte en tarea explícita. Cada uno se fija en la tarea indicada:

1. **Permiso de ubicación ignorado:** la app no puede quedarse en el skeleton; debe caer a Málaga a los 8 s y actualizarse si el permiso llega después. → Task 6.
2. **Cambio de día o de zona horaria:** las próximas 8 horas deben cruzar medianoche y la fecha del lugar no debe desplazarse por UTC. → Task 3.
3. **Geocodificación lenta o caída:** el clima debe pintarse igualmente y el nombre debe caer a "Tu ubicación". → Tasks 5 y 14.
4. **Actualización manual fallida:** los datos anteriores deben seguir visibles, con aviso inline. → Task 14.
5. **Nombres largos y temperaturas extremas:** no deben romper la retícula; −10° y 100° deben caber y el nombre completo debe quedar en `title`. → Tasks 3, 8 y 11.

---

## Task 0: Rama de trabajo y documentos

**Files:**
- Create: `docs/superpowers/specs/2026-10-28-weather-app-refactor-design.md`
- Create: `docs/superpowers/plans/2026-10-28-weather-app-refactor.md`

**Interfaces:**
- Consumes: nada.
- Produces: rama `dev` con el diseño y este plan commiteados.

- [ ] **Step 1: Crear o cambiar a `dev`**

Run:
```bash
git switch dev || git switch -c dev
```
Expected: rama actual `dev`.

- [ ] **Step 2: Revisar que no haya cambios ajenos**

Run:
```bash
git status --short
```
Expected: solo los dos documentos de `docs/superpowers/`.

- [ ] **Step 3: Commit de documentación**

Este commit es solo documentación; no ejecuta el gate de código porque todavía no existe `package.json`.

```bash
git add docs/superpowers/specs/2026-10-28-weather-app-refactor-design.md docs/superpowers/plans/2026-10-28-weather-app-refactor.md
git commit -m "docs: add weather app refactor design and plan"
git push -u origin dev
```

---

## Task 1: Scaffold Vite + TypeScript + pnpm + tokens

**Files:**
- Create: `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `vite.config.ts`, `eslint.config.js`, `.gitignore`
- Create: `index.html`, `public/favicon.svg`
- Create: `src/main.ts`, `src/styles/index.css`, `src/styles/tokens.css`, `src/styles/base.css`, `src/styles/layout.css`
- Create (vacíos, solo un comentario): `src/styles/masthead.css`, `current.css`, `hero.css`, `daily.css`, `hourly.css`, `status.css`, `footer.css`

**Interfaces:**
- Consumes: nada.
- Produces:
  - IDs del DOM: `#masthead`, `#current`, `#hero`, `#daily`, `#hourly`, `#footer`, `#status`.
  - Tokens CSS del spec §10.2.
  - Scripts de `package.json`: `dev`, `build`, `preview`, `typecheck`, `lint`, `test`, `check`.
  - `src/main.ts` importa `./styles/index.css` y no hace nada más.

- [ ] **Step 1: Crear `package.json`**

```json
{
  "name": "weather-app",
  "private": true,
  "version": "2.0.0",
  "type": "module",
  "packageManager": "pnpm@12.6.0",
  "scripts": {
    "dev": "vite",
    "build": "pnpm run typecheck && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --max-warnings 0",
    "test": "vitest run",
    "check": "pnpm run lint && pnpm run build && pnpm run test"
  }
}
```

- [ ] **Step 2: Instalar dependencias de desarrollo**

Run:
```bash
pnpm add -D vite typescript vitest jsdom eslint @eslint/js typescript-eslint globals
```
Expected: `pnpm-lock.yaml` creado y `node_modules/` presente.

- [ ] **Step 3: Crear configuración y estructura**

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noEmit": true,
    "skipLibCheck": true,
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

`vite.config.ts`:
```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: './',
  test: {
    environment: 'node',
  },
});
```

`eslint.config.js`:
```js
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: globals.browser },
    rules: { 'no-console': ['warn', { allow: ['error', 'warn'] }] },
  },
);
```

`.gitignore`:
```text
node_modules/
dist/
*.local
.DS_Store
```

- [ ] **Step 4: Crear el shell semántico y los tokens**

`index.html` debe contener exactamente estos contenedores (el resto es head/meta/fuentes):
```html
<div class="page">
  <header id="masthead" class="masthead" aria-label="Ubicación y fecha"></header>
  <div id="status" class="status" aria-live="polite"></div>
  <main class="hero" aria-label="Clima actual">
    <section id="current" class="current" aria-label="Condiciones actuales"></section>
    <div id="hero" class="hero__art" aria-hidden="true"></div>
    <section id="daily" class="daily" aria-label="Pronóstico de seis días"></section>
  </main>
  <section id="hourly" class="hourly" aria-label="Próximas horas"></section>
  <footer id="footer" class="footer"></footer>
</div>
```

El `<head>` incluye `lang="es"`, viewport, meta description, favicon `public/favicon.svg`, `preconnect` a Google Fonts y la hoja `https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Space+Grotesk:wght@300;400;500&display=swap`.

`src/styles/tokens.css` define los tokens del spec §10.2, las fuentes y el espaciado base de 8 px. `base.css` aplica reset, fondo papel, textura de ruido, foco coral, selección ocre y `prefers-reduced-motion`. `layout.css` define `.page`, `.hero` y los breakpoints del spec §11. Los siete CSS de componente quedan vacíos con un comentario `/* Se completa en la tarea N. */`.

`src/styles/index.css` importa, en este orden:
```css
@import './tokens.css';
@import './base.css';
@import './layout.css';
@import './masthead.css';
@import './current.css';
@import './hero.css';
@import './daily.css';
@import './hourly.css';
@import './status.css';
@import './footer.css';
```

`src/main.ts`:
```ts
import './styles/index.css';
```

- [ ] **Step 5: Verificar**

Run:
```bash
pnpm run lint
pnpm run build
```
Expected: ambos pasan sin errores ni warnings.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml tsconfig.json vite.config.ts eslint.config.js .gitignore index.html public/favicon.svg src/main.ts src/styles/index.css src/styles/tokens.css src/styles/base.css src/styles/layout.css src/styles/masthead.css src/styles/current.css src/styles/hero.css src/styles/daily.css src/styles/hourly.css src/styles/status.css src/styles/footer.css
git commit -m "chore: scaffold vite typescript app shell"
git push origin dev
```

---

## Task 2: Tipos y mapeo de códigos WMO

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/weatherCodes.ts`
- Test: `src/domain/weatherCodes.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces:
```ts
export type WeatherFamily = 'clear' | 'partly' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'storm';
export interface WeatherCondition { family: WeatherFamily; description: string; }
export interface CurrentWeather { temperature: number; apparentTemperature: number; humidity: number; windSpeed: number; weatherCode: number; isDay: boolean; time: string; }
export interface HourlyPoint { time: string; temperature: number; humidity: number; precipitationProbability: number; weatherCode: number; }
export interface DailyPoint { date: string; weatherCode: number; max: number; min: number; sunrise: string; sunset: string; }
export interface WeatherData { timezone: string; current: CurrentWeather; hourly: HourlyPoint[]; daily: DailyPoint[]; }
export interface Place { name: string; country?: string; latitude: number; longitude: number; isFallback: boolean; }
export function getWeatherCondition(code: number): WeatherCondition;
```

- [ ] **Step 1: Escribir el test que falla**

```ts
import { describe, expect, it } from 'vitest';
import { getWeatherCondition } from './weatherCodes';

describe('getWeatherCondition', () => {
  it('mapea despejado', () => {
    expect(getWeatherCondition(0)).toEqual({ family: 'clear', description: 'Despejado' });
  });

  it('mapea las ocho familias', () => {
    const cases: Array<[number, string]> = [
      [2, 'partly'], [3, 'cloudy'], [45, 'fog'], [51, 'drizzle'],
      [61, 'rain'], [71, 'snow'], [95, 'storm'],
    ];
    for (const [code, family] of cases) {
      expect(getWeatherCondition(code).family).toBe(family);
    }
  });

  it('cae en nublado y Desconocido', () => {
    expect(getWeatherCondition(999)).toEqual({ family: 'cloudy', description: 'Desconocido' });
  });
});
```

- [ ] **Step 2: Ejecutar y ver el fallo**

Run: `pnpm run test -- src/domain/weatherCodes.test.ts`
Expected: FAIL porque `weatherCodes.ts` no existe.

- [ ] **Step 3: Implementar el mapeo**

Códigos y descripciones exactas: 0/1 Despejado; 2 Parcialmente nublado; 3 Nublado; 45/48 Niebla; 51/53/55 Llovizna; 56/57 Llovizna helada; 61/63/65 Lluvia; 66/67 Lluvia helada; 71/73/75 Nieve; 77 Granos de nieve; 80/81/82 Chubascos; 85/86 Chubascos de nieve; 95 Tormenta; 96/99 Tormenta con granizo. Las familias siguen la tabla del spec §9.3. El desconocido devuelve `{ family: 'cloudy', description: 'Desconocido' }`.

- [ ] **Step 4: Ejecutar y ver el pase**

Run: `pnpm run test -- src/domain/weatherCodes.test.ts`
Expected: PASS.

- [ ] **Step 5: Gate y commit**

```bash
pnpm run lint
pnpm run build
pnpm run test
git add src/domain/types.ts src/domain/weatherCodes.ts src/domain/weatherCodes.test.ts
git commit -m "feat(domain): map wmo weather codes"
git push origin dev
```

---

## Task 3: Formato determinista y selección de pronóstico

**Files:**
- Create: `src/domain/format.ts`, `src/domain/forecast.ts`
- Test: `src/domain/format.test.ts`, `src/domain/forecast.test.ts`

**Interfaces:**
- Consumes: `HourlyPoint`, `DailyPoint` de Task 2.
- Produces:
```ts
export function formatTemperature(value: number): string;
export function formatTemperatureWithUnit(value: number): string;
export function formatWind(value: number): string;
export function formatHumidity(value: number): string;
export function formatCoordinates(latitude: number, longitude: number): string;
export function getDateInTimeZone(date: Date, timeZone: string): string;
export function formatPlaceDate(isoDate: string): string;
export function formatDayLabel(isoDate: string, today: string): string;
export function formatHourLabel(isoDateTime: string): string;
export function formatUpdatedAt(date: Date, timeZone: string): string;
export function getNextHours(hourly: HourlyPoint[], currentTime: string, count?: number): HourlyPoint[];
export function getDisplayDays(daily: DailyPoint[], count?: number): DailyPoint[];
export function getTodayDate(currentTime: string): string;
```

- [ ] **Step 1: Escribir los tests que fallan**

Asserts exactos:
- `formatTemperature(23.4) === '23°'`, `formatTemperature(-3.6) === '-4°'`.
- `formatTemperatureWithUnit(23.4) === '23°C'`.
- `formatWind(7.2) === '7 km/h'`, `formatHumidity(77.6) === '78%'`.
- `formatCoordinates(36.7213, -4.4214) === '36.72° N · 4.42° O'`.
- `getDateInTimeZone(new Date('2026-10-28T23:30:00Z'), 'Europe/Madrid') === '2026-10-29'`.
- `formatPlaceDate('2026-10-28') === 'MIÉ, 28 OCT'`.
- `formatDayLabel('2026-10-28', '2026-10-28') === 'HOY'`; `formatDayLabel('2026-10-29', '2026-10-28') === 'JUE'`.
- `formatHourLabel('2026-10-28T14:00') === '14:00'`.
- `formatUpdatedAt(new Date('2026-10-28T09:24:00Z'), 'Europe/Madrid') === '10:24'`.
- `getTodayDate('2026-10-28T14:30') === '2026-10-28'`.
- `getNextHours` desde `2026-10-28T14:30` empieza en `14:00` y devuelve 8 puntos; cruzando medianoche desde `22:10` incluye `2026-10-29T05:00`; si no existe la hora exacta, empieza en la primera posterior.
- `getDisplayDays` devuelve los primeros 6.

- [ ] **Step 2: Ejecutar y ver el fallo**

Run: `pnpm run test -- src/domain/format.test.ts src/domain/forecast.test.ts`
Expected: FAIL porque los módulos no existen.

- [ ] **Step 3: Implementar**

Usa arrays propios `DIAS = ['DOM','LUN','MAR','MIÉ','JUE','VIE','SÁB']` y `MESES = ['ENE',...,'DIC']`; parsea `YYYY-MM-DD` por componentes para evitar UTC. `getNextHours` compara `currentTime.slice(0, 13) + ':00'` con `hourly.time`; si no encuentra coincidencia, usa el primer índice con hora ≥ la actual; si no, 0. `getDateInTimeZone` usa `Intl.DateTimeFormat` con `timeZone` y `formatToParts`.

- [ ] **Step 4: Ejecutar y ver el pase**

Run: `pnpm run test -- src/domain/format.test.ts src/domain/forecast.test.ts`
Expected: PASS.

- [ ] **Step 5: Gate y commit**

```bash
pnpm run lint
pnpm run build
pnpm run test
git add src/domain/format.ts src/domain/forecast.ts src/domain/format.test.ts src/domain/forecast.test.ts
git commit -m "feat(domain): add formatting and forecast selection"
git push origin dev
```

---

## Task 4: Cliente de Open-Meteo

**Files:**
- Create: `src/api/openMeteo.ts`
- Test: `src/api/openMeteo.test.ts`

**Interfaces:**
- Consumes: `WeatherData` de Task 2.
- Produces:
```ts
export interface FetchWeatherOptions { latitude: number; longitude: number; signal?: AbortSignal; }
export function buildForecastUrl(latitude: number, longitude: number): string;
export async function fetchWeather(options: FetchWeatherOptions, fetcher?: typeof fetch): Promise<WeatherData>;
```

- [ ] **Step 1: Escribir el test que falla**

```ts
const raw = {
  timezone: 'Europe/Madrid',
  current: { time: '2026-10-28T14:30', temperature_2m: 23.4, relative_humidity_2m: 77, apparent_temperature: 24, is_day: 1, weather_code: 0, wind_speed_10m: 7.2 },
  hourly: { time: ['2026-10-28T13:00', '2026-10-28T14:00'], temperature_2m: [22, 23], relative_humidity_2m: [70, 77], precipitation_probability: [0, 0], weather_code: [0, 0] },
  daily: { time: ['2026-10-28'], weather_code: [0], temperature_2m_max: [25], temperature_2m_min: [17], sunrise: ['2026-10-28T07:30'], sunset: ['2026-10-28T18:30'] },
};
```
- `buildForecastUrl(36.72, -4.42)` contiene `latitude=36.72`, `longitude=-4.42`, `current=temperature_2m`, `weather_code`, `timezone=auto` y `forecast_days=7`.
- `fetchWeather({ latitude, longitude }, fetcher)` con un `fetcher` que devuelve `new Response(JSON.stringify(raw), { status: 200 })` normaliza `current.temperature === 23.4`, `hourly[0].temperature === 22`, `daily[0].max === 25`, `timezone === 'Europe/Madrid'`.
- Un `Response` con status 500 lanza un error que incluye `500`.

- [ ] **Step 2: Ejecutar y ver el fallo**

Run: `pnpm run test -- src/api/openMeteo.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementar**

La URL incluye exactamente: `current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m`, `hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code`, `daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset`, `timezone=auto`, `forecast_days=7`. Normaliza a los tipos de Task 2. Si `!response.ok`, lanza `Error(\`Open-Meteo ${response.status}\`)`.

- [ ] **Step 4: Ejecutar y ver el pase**

Run: `pnpm run test -- src/api/openMeteo.test.ts`
Expected: PASS.

- [ ] **Step 5: Gate y commit**

```bash
pnpm run lint
pnpm run build
pnpm run test
git add src/api/openMeteo.ts src/api/openMeteo.test.ts
git commit -m "feat(api): fetch and normalize open-meteo data"
git push origin dev
```

---

## Task 5: Geocodificación inversa

**Files:**
- Create: `src/api/reverseGeocode.ts`
- Test: `src/api/reverseGeocode.test.ts`

**Interfaces:**
- Consumes: `Place` de Task 2.
- Produces:
```ts
export interface ReverseGeocodeOptions { latitude: number; longitude: number; signal?: AbortSignal; }
export function buildReverseGeocodeUrl(latitude: number, longitude: number): string;
export async function reverseGeocode(options: ReverseGeocodeOptions, fetcher?: typeof fetch): Promise<Place>;
```

- [ ] **Step 1: Escribir el test que falla**

- URL con `localityLanguage=es`.
- Respuesta `{ city: 'Málaga', countryName: 'España' }` → `{ name: 'Málaga, España', isFallback: false }`.
- Sin `city` pero con `locality: 'Centro'` → nombre contiene `Centro`.
- `fetcher` que rechaza → `{ name: 'Tu ubicación', isFallback: true }`, con lat/lon intactas.

- [ ] **Step 2: Ejecutar y ver el fallo**

Run: `pnpm run test -- src/api/reverseGeocode.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementar**

Endpoint `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=...&longitude=...&localityLanguage=es`. Nombre: `city || locality || principalSubdivision || 'Tu ubicación'`; si hay `countryName` y no coincide con el nombre, añade `, ${countryName}`. Cualquier error o `!response.ok` devuelve el fallback, nunca lanza.

- [ ] **Step 4: Ejecutar y ver el pase**

Run: `pnpm run test -- src/api/reverseGeocode.test.ts`
Expected: PASS.

- [ ] **Step 5: Gate y commit**

```bash
pnpm run lint
pnpm run build
pnpm run test
git add src/api/reverseGeocode.ts src/api/reverseGeocode.test.ts
git commit -m "feat(api): resolve place names with reverse geocoding"
git push origin dev
```

---

## Task 6: Geolocalización con timeout y fallback

**Files:**
- Create: `src/api/geolocation.ts`
- Test: `src/api/geolocation.test.ts` (con `// @vitest-environment jsdom`)

**Interfaces:**
- Consumes: nada.
- Produces:
```ts
export interface UserLocation { latitude: number; longitude: number; source: 'gps' | 'fallback'; notice?: string; }
export const FALLBACK_LOCATION = { latitude: 36.7213, longitude: -4.4214 } as const;
export function getUserLocation(timeoutMs?: number): Promise<UserLocation>;
```

- [ ] **Step 1: Escribir el test que falla**

Con `navigator.geolocation.getCurrentPosition` mockeado:
- éxito → coordenadas reales, `source: 'gps'`.
- error → `source: 'fallback'`, coordenadas de Málaga, `notice` contiene "Málaga".
- sin `navigator.geolocation` → fallback.
- con `vi.useFakeTimers()`, un `getCurrentPosition` que nunca llama a nada y `timeoutMs = 8000`; avanzar 8000 ms → fallback con `notice` "Permiso de ubicación pendiente".

- [ ] **Step 2: Ejecutar y ver el fallo**

Run: `pnpm run test -- src/api/geolocation.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementar**

`getCurrentPosition(success, error, { timeout: timeoutMs, maximumAge: 300000 })` más un `setTimeout` propio que resuelve el fallback; limpia el timer en éxito y error. Nunca rechaza.

- [ ] **Step 4: Ejecutar y ver el pase**

Run: `pnpm run test -- src/api/geolocation.test.ts`
Expected: PASS.

- [ ] **Step 5: Gate y commit**

```bash
pnpm run lint
pnpm run build
pnpm run test
git add src/api/geolocation.ts src/api/geolocation.test.ts
git commit -m "feat(api): add geolocation with fallback"
git push origin dev
```

---

## Task 7: Iconos e ilustración del hero

**Files:**
- Create: `src/ui/icons.ts`, `src/ui/heroIllustration.ts`
- Create: `src/styles/hero.css` (rellenar el archivo vacío de Task 1)
- Test: `src/ui/icons.test.ts`, `src/ui/heroIllustration.test.ts`

**Interfaces:**
- Consumes: `WeatherFamily` de Task 2.
- Produces:
```ts
export type MetricIcon = 'wind' | 'humidity' | 'min';
export function weatherIcon(family: WeatherFamily, isDay: boolean, size?: number): string;
export function metricIcon(kind: MetricIcon): string;
export function heroIllustration(family: WeatherFamily, isDay: boolean, description: string): string;
export function renderHero(container: HTMLElement, family: WeatherFamily, isDay: boolean, description: string): void;
```

- [ ] **Step 1: Escribir los tests que fallan**

- Las 8 familias de `weatherIcon` devuelven un string que contiene `<svg`, `aria-hidden="true"` y `data-family="<familia>"`.
- `heroIllustration('clear', true, 'Despejado')` contiene `<title>Despejado</title>`, `data-family="clear"` y `hero__sun`.
- `heroIllustration('clear', false, 'Despejado')` contiene `data-variant="night"`.
- `rain` contiene `hero__drop`; `storm` contiene `hero__bolt`; `snow` contiene `hero__flake`.
- `metricIcon('wind')` contiene `<svg` y `aria-hidden="true"`.
- `renderHero(container, 'clear', true, 'Despejado')` deja un `svg` y un `.hero__word` con `DESPEJADO`; el contenedor no usa `innerHTML` con la descripción.

- [ ] **Step 2: Ejecutar y ver el fallo**

Run: `pnpm run test -- src/ui/icons.test.ts src/ui/heroIllustration.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementar**

SVG planos con `viewBox="0 0 24 24"` para iconos y `viewBox="0 0 400 400"` para el hero. Usa clases (`hero__sun`, `hero__line`, `hero__cloud`, `hero__drop`, `hero__flake`, `hero__bolt`) y `currentColor`/`var(--coral)`/`var(--ochre)`. Sin gradientes; las líneas del sol usan opacidad decreciente. `heroIllustration` incluye `<title>` con la descripción. `hero.css` estiliza `#hero`, `.hero__art`, `.hero__word` y las clases SVG, con las reglas responsive del spec §11.

- [ ] **Step 4: Ejecutar y ver el pase**

Run: `pnpm run test -- src/ui/icons.test.ts src/ui/heroIllustration.test.ts`
Expected: PASS.

- [ ] **Step 5: Gate y commit**

```bash
pnpm run lint
pnpm run build
pnpm run test
git add src/ui/icons.ts src/ui/heroIllustration.ts src/ui/icons.test.ts src/ui/heroIllustration.test.ts src/styles/hero.css
git commit -m "feat(ui): add flat weather illustrations"
git push origin dev
```

---

## Task 8: Bloque de clima actual

**Files:**
- Create: `src/ui/currentWeather.ts`
- Create: `src/test/fixtures.ts`
- Create: `src/styles/current.css` (rellenar el archivo vacío de Task 1)
- Test: `src/ui/currentWeather.test.ts` (con `// @vitest-environment jsdom`)

**Interfaces:**
- Consumes: `WeatherData`, `WeatherCondition` (Task 2); `formatTemperature`, `formatWind`, `formatHumidity` (Task 3); `metricIcon` (Task 7).
- Produces:
```ts
export function renderCurrentWeather(container: HTMLElement, data: WeatherData, condition: WeatherCondition): void;
```
- Produce además `src/test/fixtures.ts`:
```ts
export function makeWeatherData(overrides?: Partial<WeatherData>): WeatherData;
```

El fixture por defecto debe ser determinista y servir a Tasks 8–10 y 14:
- `timezone: 'Europe/Madrid'`.
- `current`: `time: '2026-10-28T14:30'`, `temperature: 23.4`, `humidity: 77.6`, `windSpeed: 7.2`, `weatherCode: 0`, `isDay: true`, `apparentTemperature: 24`.
- `hourly`: 12 puntos desde `2026-10-28T13:00` hasta `2026-10-29T00:00`, con temperaturas `[22, 22, 23, 22, 21, 20, 20, 20, 19, 18, 18, 17]`, humedad 70–80 y precipitación 0.
- `daily`: 7 días desde `2026-10-28`; el primero con `max: 25`, `min: 17`, `weatherCode: 0`; el segundo `2026-10-29` con `max: 27`, `min: 18`, `weatherCode: 2`.

- [ ] **Step 1: Escribir el test que falla**

Con `makeWeatherData()`:
- `.current__temp` es `23°`; `.current__unit` es `C`; `.current__description` es `Despejado`.
- `.current__wind` es `7 km/h`; `.current__humidity` es `78%`; `.current__min` es `17°`.
- `h1` tiene `aria-label="23 grados Celsius"`.
- Con `temperature: -4`, el texto es `-4°` y el `aria-label` es `-4 grados Celsius`.
- Los tres iconos de métricas existen.

- [ ] **Step 2: Ejecutar y ver el fallo**

Run: `pnpm run test -- src/ui/currentWeather.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementar**

Crea la estructura con `createElement` y `replaceChildren`; no uses `innerHTML` con datos. Estructura: `h1.current__temperature > span.current__temp + span.current__unit`, `p.current__description`, `dl.current__metrics` con tres `div.current__metric` (`dt` etiqueta, `dd` valor). El `h1` lleva `aria-label` con grados; los spans visuales llevan `aria-hidden`. `current.css` aplica la tipografía gigante, métricas y responsive.

- [ ] **Step 4: Ejecutar y ver el pase**

Run: `pnpm run test -- src/ui/currentWeather.test.ts`
Expected: PASS.

- [ ] **Step 5: Gate y commit**

```bash
pnpm run lint
pnpm run build
pnpm run test
git add src/ui/currentWeather.ts src/ui/currentWeather.test.ts src/test/fixtures.ts src/styles/current.css
git commit -m "feat(ui): render current weather block"
git push origin dev
```

---

## Task 9: Lista de seis días

**Files:**
- Create: `src/ui/dailyForecast.ts`
- Create: `src/styles/daily.css` (rellenar el archivo vacío de Task 1)
- Test: `src/ui/dailyForecast.test.ts` (con `// @vitest-environment jsdom`)

**Interfaces:**
- Consumes: `DailyPoint` (Task 2); `getWeatherCondition` (Task 2); `formatDayLabel`, `formatTemperature` (Task 3); `weatherIcon` (Task 7); `makeWeatherData` (Task 8).
- Produces:
```ts
export function renderDailyForecast(container: HTMLElement, days: DailyPoint[], today: string): void;
```

- [ ] **Step 1: Escribir el test que falla**

- Se renderizan exactamente 6 `.daily__row`.
- La primera `.daily__day` es `HOY`; la segunda es `JUE`.
- Cada fila tiene un `<time datetime="YYYY-MM-DD">`.
- La primera `.daily__max` es `25°` y `.daily__min` es `17°`.
- Cada `.daily__icon svg` tiene `data-family`.
- El contenedor tiene un label `PRÓXIMOS DÍAS`.

- [ ] **Step 2: Ejecutar y ver el fallo**

Run: `pnpm run test -- src/ui/dailyForecast.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementar**

`ol.daily__list > li.daily__row` con `<time class="daily__day">`, `<span class="daily__icon" aria-hidden="true">` + SVG, y `<span class="daily__temps">` con `.daily__max` y `.daily__min`. Usa `textContent` para nombres y valores. `daily.css` usa reglas finas, sin caja, y el hover coral de 2 px del spec.

- [ ] **Step 4: Ejecutar y ver el pase**

Run: `pnpm run test -- src/ui/dailyForecast.test.ts`
Expected: PASS.

- [ ] **Step 5: Gate y commit**

```bash
pnpm run lint
pnpm run build
pnpm run test
git add src/ui/dailyForecast.ts src/ui/dailyForecast.test.ts src/styles/daily.css
git commit -m "feat(ui): render six-day forecast list"
git push origin dev
```

---

## Task 10: Gráfica horaria

**Files:**
- Create: `src/ui/hourlyChart.ts`
- Create: `src/styles/hourly.css` (rellenar el archivo vacío de Task 1)
- Test: `src/ui/hourlyChart.test.ts` (con `// @vitest-environment jsdom`)

**Interfaces:**
- Consumes: `HourlyPoint` (Task 2); `formatTemperature`, `formatHourLabel` (Task 3); `makeWeatherData` (Task 8).
- Produces:
```ts
export function renderHourlyChart(container: HTMLElement, hours: HourlyPoint[]): void;
```

- [ ] **Step 1: Escribir el test que falla**

- 8 `.hourly__dot`; exactamente uno tiene `.hourly__dot--now`.
- 8 `.hourly__temp` y 8 `.hourly__time`.
- Existe un `path.hourly__line` con atributo `d`.
- El SVG tiene `role="img"` y un `<title>` que contiene "Próximas 8 horas".
- La primera hora es `14:00`, la primera temperatura `22°`, la última hora `21:00`.

- [ ] **Step 2: Ejecutar y ver el fallo**

Run: `pnpm run test -- src/ui/hourlyChart.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementar**

SVG `viewBox="0 0 800 220"`, `preserveAspectRatio="none"` solo para el path, texto con `textLength` no; usa `text-anchor="middle"`. Calcula x con padding 50 y reparto uniforme; y normalizando min/max con padding vertical. Construye con `createElementNS` y `textContent`. El punto actual usa `hourly__dot--now`. `hourly.css` aplica tamaños, colores `--ochre-deep`/`--coral`, reglas de fondo y responsive.

- [ ] **Step 4: Ejecutar y ver el pase**

Run: `pnpm run test -- src/ui/hourlyChart.test.ts`
Expected: PASS.

- [ ] **Step 5: Gate y commit**

```bash
pnpm run lint
pnpm run build
pnpm run test
git add src/ui/hourlyChart.ts src/ui/hourlyChart.test.ts src/styles/hourly.css
git commit -m "feat(ui): render hourly temperature curve"
git push origin dev
```

---

## Task 11: Masthead editorial

**Files:**
- Create: `src/ui/masthead.ts`
- Create: `src/styles/masthead.css` (rellenar el archivo vacío de Task 1)
- Test: `src/ui/masthead.test.ts` (con `// @vitest-environment jsdom`)

**Interfaces:**
- Consumes: `Place` (Task 2); `formatPlaceDate`, `formatCoordinates` (Task 3).
- Produces:
```ts
export interface MastheadData { place: Place; today: string; coordinates: string; notice?: string; }
export function renderMasthead(container: HTMLElement, data: MastheadData): void;
export function renderMastheadLoading(container: HTMLElement): void;
```

`today` es una fecha ISO `YYYY-MM-DD`; `renderMasthead` la formatea con `formatPlaceDate` y `coordinates` ya viene formateado con `formatCoordinates`.

- [ ] **Step 1: Escribir el test que falla**

- `renderMasthead` pinta `.masthead__brand` con `WEATHER APP`, `.masthead__place` con `Málaga, España`, `.masthead__date` con `MIÉ, 28 OCT` y `.masthead__coords` con `36.72° N · 4.42° O`.
- Un nombre de 80 caracteres queda en `textContent` y en el atributo `title`.
- `notice` pinta `.masthead__notice`.
- `renderMastheadLoading` pinta `UBICACIÓN…`.

- [ ] **Step 2: Ejecutar y ver el fallo**

Run: `pnpm run test -- src/ui/masthead.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementar**

Bloque de marca ocre vertical, ubicación/fecha en mono, coordenadas a la derecha. Usa `textContent` para el nombre y `title` para el completo. `masthead.css` implementa la retícula y el responsive.

- [ ] **Step 4: Ejecutar y ver el pase**

Run: `pnpm run test -- src/ui/masthead.test.ts`
Expected: PASS.

- [ ] **Step 5: Gate y commit**

```bash
pnpm run lint
pnpm run build
pnpm run test
git add src/ui/masthead.ts src/ui/masthead.test.ts src/styles/masthead.css
git commit -m "feat(ui): render editorial masthead"
git push origin dev
```

---

## Task 12: Estados de carga, error y aviso

**Files:**
- Create: `src/ui/status.ts`
- Create: `src/styles/status.css` (rellenar el archivo vacío de Task 1)
- Test: `src/ui/status.test.ts` (con `// @vitest-environment jsdom`)

**Interfaces:**
- Consumes: nada.
- Produces:
```ts
export function renderLoading(container: HTMLElement): void;
export function renderError(container: HTMLElement, message: string, onRetry: () => void): void;
export function renderNotice(container: HTMLElement, message: string, options?: { retry?: () => void }): void;
export function clearStatus(container: HTMLElement): void;
```

- [ ] **Step 1: Escribir el test que falla**

- `renderLoading` pinta `.status__loading` con `CARGANDO`.
- `renderError` pinta `.status__error`, el mensaje y `.status__retry`; al hacer click en el botón se llama al callback.
- `renderNotice` pinta `.status__notice`; si recibe `retry`, pinta un botón que lo llama.
- `clearStatus` deja el contenedor vacío.

- [ ] **Step 2: Ejecutar y ver el fallo**

Run: `pnpm run test -- src/ui/status.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementar**

Usa `replaceChildren` y `textContent`. El error no reemplaza los datos existentes por sí mismo; eso lo decide `app.ts`. `status.css` aplica la regla coral, el mono y el foco.

- [ ] **Step 4: Ejecutar y ver el pase**

Run: `pnpm run test -- src/ui/status.test.ts`
Expected: PASS.

- [ ] **Step 5: Gate y commit**

```bash
pnpm run lint
pnpm run build
pnpm run test
git add src/ui/status.ts src/ui/status.test.ts src/styles/status.css
git commit -m "feat(ui): add loading and error states"
git push origin dev
```

---

## Task 13: Control de actualización y pie

**Files:**
- Create: `src/ui/refresh.ts`
- Create: `src/styles/footer.css` (rellenar el archivo vacío de Task 1)
- Test: `src/ui/refresh.test.ts` (con `// @vitest-environment jsdom`)

**Interfaces:**
- Consumes: nada.
- Produces:
```ts
export interface RefreshControl { button: HTMLButtonElement; updated: HTMLElement; }
export function createRefreshControl(container: HTMLElement, onRefresh: () => void): RefreshControl;
export function setRefreshing(control: RefreshControl, isRefreshing: boolean): void;
export function setUpdatedAt(control: RefreshControl, text: string): void;
```

- [ ] **Step 1: Escribir el test que falla**

- Se crean `.footer__source` con `OPEN-METEO`, `.footer__updated` y `.footer__refresh` con `ACTUALIZAR`.
- El click en el botón llama a `onRefresh`.
- `setRefreshing(control, true)` deshabilita el botón y añade `is-refreshing`; `false` lo revierte.
- `setUpdatedAt(control, 'ACTUALIZADO 10:24')` actualiza el texto.

- [ ] **Step 2: Ejecutar y ver el fallo**

Run: `pnpm run test -- src/ui/refresh.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementar**

Crea el pie con `createElement`; el botón es un `<button type="button">` con `aria-label="Actualizar datos del clima"`. `footer.css` aplica la fila mono, el borde inferior del botón y el giro de 180° con `prefers-reduced-motion`.

- [ ] **Step 4: Ejecutar y ver el pase**

Run: `pnpm run test -- src/ui/refresh.test.ts`
Expected: PASS.

- [ ] **Step 5: Gate y commit**

```bash
pnpm run lint
pnpm run build
pnpm run test
git add src/ui/refresh.ts src/ui/refresh.test.ts src/styles/footer.css
git commit -m "feat(ui): add manual refresh control"
git push origin dev
```

---

## Task 14: Orquestación de la app

**Files:**
- Create: `src/app.ts`, `src/utils/dom.ts`
- Modify: `src/main.ts` (reemplazar el placeholder de Task 1)
- Test: `src/app.test.ts` (con `// @vitest-environment jsdom`)

**Interfaces:**
- Consumes: `getUserLocation`/`UserLocation` (Task 6); `fetchWeather` (Task 4); `reverseGeocode` (Task 5); `renderCurrentWeather` (Task 8); `renderDailyForecast` (Task 9); `renderHourlyChart` (Task 10); `renderMasthead`/`renderMastheadLoading` (Task 11); `renderLoading`/`renderError`/`renderNotice`/`clearStatus` (Task 12); `createRefreshControl`/`setRefreshing`/`setUpdatedAt` (Task 13); `getTodayDate`/`formatPlaceDate`/`formatCoordinates`/`formatUpdatedAt` (Task 3); `getWeatherCondition` (Task 2); `renderHero` (Task 7); `makeWeatherData` (Task 8).
- Produces:
```ts
export interface AppDependencies {
  getLocation: () => Promise<UserLocation>;
  fetchWeather: (latitude: number, longitude: number) => Promise<WeatherData>;
  reverseGeocode: (latitude: number, longitude: number) => Promise<Place>;
  now: () => Date;
}
export interface AppController { start: () => Promise<void>; refresh: () => Promise<void>; }
export function createApp(root: ParentNode, deps: AppDependencies): AppController;
```

- [ ] **Step 1: Escribir el test que falla**

- Montar el DOM con los siete IDs en jsdom.
- Dependencias falsas: `getLocation` resuelve Málaga; `fetchWeather` resuelve el fixture; `reverseGeocode` resuelve `Málaga, España`; `now` fijo.
- `await app.start()`: `.current__temp` es `23°`, `#daily` tiene 6 filas, `#hourly` tiene 8 puntos.
- `vi.waitFor` hasta que `.masthead__place` sea `Málaga, España`.
- Si `reverseGeocode` rechaza, el masthead muestra `Tu ubicación` y el clima sigue visible.
- Si el segundo `fetchWeather` rechaza, `await app.refresh()` conserva `23°` y muestra `.status__notice`.
- Si `getLocation` resuelve con `notice`, el aviso aparece.

- [ ] **Step 2: Ejecutar y ver el fallo**

Run: `pnpm run test -- src/app.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementar**

`createApp` consulta los elementos con `utils/dom.ts` (`mustQuery<T>`), pinta el hero con `renderHero`, y sigue este orden: loading → ubicación → clima → render → nombre en segundo plano. La geocodificación no bloquea el clima. `refresh()` no vuelve a pedir ubicación; mantiene los datos y solo actualiza Open-Meteo. `main.ts` compone las dependencias reales y llama `void app.start()`.

- [ ] **Step 4: Ejecutar y ver el pase**

Run: `pnpm run test -- src/app.test.ts`
Expected: PASS.

- [ ] **Step 5: Gate y commit**

```bash
pnpm run lint
pnpm run build
pnpm run test
git add src/app.ts src/app.test.ts src/main.ts src/utils/dom.ts
git commit -m "feat(app): orchestrate weather loading and refresh"
git push origin dev
```

---

## Task 15: Limpieza legacy, README y QA final

**Files:**
- Delete: `css/styles.css`, `js/app.js`, `js/api/weatherService.js`, toda la carpeta `assets/`
- Delete: `screenshot/WeatherApp-Preview.png` (es una captura del diseño viejo)
- Modify: `readme.md`

**Interfaces:**
- Consumes: todas las tareas anteriores.
- Produces: repo sin assets legacy; README con el stack y los comandos nuevos.

- [ ] **Step 1: Comprobar que nada referencia los archivos viejos**

Run:
```bash
rg -n "assets/|js/app|css/styles|weatherService" --glob '!node_modules' --glob '!docs/**'
```
Expected: sin resultados en `index.html`, `src/` o `public/`.

- [ ] **Step 2: Borrar los archivos legacy**

```bash
git rm -r css js assets screenshot/WeatherApp-Preview.png
```
Expected: solo se eliminan los archivos listados.

- [ ] **Step 3: Actualizar `readme.md`**

Incluye: descripción del rediseño, stack Vite + TypeScript + pnpm, comandos `pnpm install`, `pnpm dev`, `pnpm run build`, `pnpm run lint`, `pnpm run test`, alcance >768 px y enlace al spec/plan. Elimina badges y placeholders que ya no apliquen.

- [ ] **Step 4: QA manual**

Run: `pnpm run dev`
Comprueba:
- 1440, 1280, 1024, 900 y 769 px: hero 5/4/3 o 6/6 o 7/5 según el spec, sin desbordes.
- Geocodificación permitida, denegada y permiso pendiente.
- Error de red y reintento; refresh correcto y refresh fallido.
- Las 8 familias de clima y las variantes de noche.
- Teclado, foco visible, zoom 200 % y `prefers-reduced-motion`.

- [ ] **Step 5: Gate final y commit**

```bash
pnpm run lint
pnpm run build
pnpm run test
git add readme.md
git commit -m "chore: remove legacy assets and refresh readme"
git push origin dev
```

- [ ] **Step 6: Verificación final**

Run:
```bash
git status --short
pnpm run check
```
Expected: árbol limpio y `check` en verde. Si el QA visual detectó defectos, se corrigen en un commit `fix(ui): ...` separado, nunca dentro de este.

---

## Dependencias entre tareas

```text
Task 0 (docs, rama dev)
  └── Task 1 (scaffold)
        ├── Task 2 (tipos + WMO)
        │     ├── Task 3 (formato + forecast)
        │     ├── Task 4 (Open-Meteo)
        │     ├── Task 5 (reverse geocode)
        │     └── Task 6 (geolocalización)
        ├── Task 7 (iconos + hero) ← Task 2
        ├── Task 8 (clima actual) ← Tasks 2, 3, 7 (+ fixtures)
        ├── Task 9 (6 días) ← Tasks 2, 3, 7, 8
        ├── Task 10 (gráfica) ← Tasks 2, 3, 8
        ├── Task 11 (masthead) ← Tasks 2, 3
        ├── Task 12 (estados) ← Task 1
        ├── Task 13 (refresh/pie) ← Task 1
        ├── Task 14 (app) ← Tasks 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13
        └── Task 15 (limpieza + QA) ← todas
```

- Tasks 2–6 no comparten archivos; se ejecutan en orden por claridad, no por dependencia estricta.
- Tasks 8–11 comparten `src/test/fixtures.ts` (creado en Task 8) y los tipos de Task 2, pero cada una escribe solo su archivo de UI y su CSS.
- Task 14 es la única que modifica `main.ts` y consume todas las interfaces anteriores.
- Task 15 no toca código de la app; solo borra legacy y actualiza el README.
