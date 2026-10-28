# WeatherApp

Dashboard meteorológico con una estética editorial suizo-japonesa: papel cálido, tinta carbón, acentos coral y ocre, ilustraciones geométricas planas y tipografía Space Grotesk + IBM Plex Mono. La interfaz está en español.

Muestra el clima actual, tres métricas (viento, humedad y mínima), el pronóstico de seis días y la curva de temperatura de las próximas ocho horas. La ubicación se obtiene del navegador y, si no responde en ocho segundos o se deniega el permiso, se usa Málaga como ejemplo con un aviso visible.

## Stack

- [Vite](https://vite.dev/) + TypeScript
- [pnpm](https://pnpm.io/) como gestor de paquetes
- CSS propio con tokens; sin framework de UI ni dependencias en tiempo de ejecución
- [Vitest](https://vitest.dev/) + jsdom para tests
- ESLint + typescript-eslint

## Comandos

```bash
pnpm install       # instala dependencias
pnpm dev           # servidor de desarrollo
pnpm run build     # typecheck + build de producción
pnpm run lint      # ESLint sin warnings
pnpm run test      # suite de tests
pnpm run check     # lint + build + test
pnpm run preview   # sirve el build de producción
```

## Estructura

```text
src/
├── api/       # Open-Meteo, geocodificación inversa y geolocalización
├── domain/    # tipos, códigos WMO, formato y selección de pronóstico
├── ui/        # renderizado del DOM y estados
├── styles/    # tokens y CSS por componente
├── utils/     # helpers de DOM
├── app.ts     # orquestación con dependencias inyectables
└── main.ts    # entrada: dependencias reales y arranque
```

## Datos

- **Open-Meteo** para el pronóstico, con la zona horaria del lugar.
- **BigDataCloud** para resolver el nombre de la ubicación sin API key.
- Si la geocodificación falla, el clima sigue visible y el encabezado muestra «Tu ubicación».

La actualización manual solo vuelve a consultar Open-Meteo: conserva los datos en pantalla y, si falla, muestra un aviso con reintento.

## Alcance

La fase actual diseña escritorio y tablet por encima de 768 px. Por debajo de 768 px la interfaz se apila y sigue siendo funcional, pero el diseño fino de móvil queda para una fase posterior.

## Documentación

- [Especificación de diseño](docs/superpowers/specs/2026-10-28-weather-app-refactor-design.md)
- [Plan de implementación](docs/superpowers/plans/2026-10-28-weather-app-refactor.md)
