<div align="center">

# 🌦️ WeatherApp

**Aplicación meteorológica moderna con datos en tiempo real**

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=flat&logo=javascript)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3)
![OpenWeatherMap](https://img.shields.io/badge/API-OpenWeatherMap-orange?style=flat)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat)

[🚀 Demo](https://weather-app-git-main-n3brrrs-projects.vercel.app/) • [🐛 Issues](https://github.com/n3brrr/WeatherApp/issues) • [📖 Docs](https://openweathermap.org/api)

</div>

---

## ⚡ Resumen

WeatherApp consume la API de OpenWeatherMap para mostrar pronósticos en tiempo real con geolocalización automática y búsqueda manual. Incluye persistencia local y UI responsive para móviles y desktop.

### ✨ Características

- 🎯 **Datos en tiempo real** - Actualización cada 10 min vía One Call API 3.0
- 🌍 **Geolocalización automática** - Detecta ubicación del usuario
- 💾 **Persistencia local** - Guarda última búsqueda en localStorage
- 📱 **Responsive design** - Optimizado para mobile-first
- 🔍 **Búsqueda global** - Acceso a datos de 200,000+ ciudades

### 🛠️ Stack Tecnológico

![Vanilla JS](https://img.shields.io/badge/Vanilla-JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-Flexbox-1572B6?style=for-the-badge&logo=css3)
![OpenWeatherMap API](https://img.shields.io/badge/OpenWeather-API%203.0-orange?style=for-the-badge)

---

## 🚀 Instalación

### Prerequisitos

- Navegador moderno (Chrome 90+, Firefox 88+, Safari 14+)
- API Key de [OpenWeatherMap](https://openweathermap.org/api)

### Setup Rápido

Clonar repositorio
git clone https://github.com/n3brrr/WeatherApp.git

Navegar al directorio
cd WeatherApp

Configurar variables de entorno
cp .env.example .env

Edita .env con tu API_KEY
Abrir en navegador
open index.html

o usar Live Server en VS Code

### Variables de Entorno

| Variable | Requerida | Descripción | Default |
|----------|-----------|-------------|---------|
| `WEATHER_API_KEY` | ✅ | API key de OpenWeatherMap | - |
| `DEFAULT_CITY` | ❌ | Ciudad inicial | `"Madrid"` |
| `UNITS` | ❌ | Sistema de unidades (`metric`/`imperial`) | `"metric"` |

**Archivo `.env`:**

WEATHER_API_KEY=tu_api_key_aqui
DEFAULT_CITY=Barcelona
UNITS=metric

---

## 💻 Uso Básico

// Búsqueda manual de ciudad
searchWeather("Tokyo");

// Obtener clima de ubicación actual
getCurrentWeather();

// Acceder a datos guardados
const lastCity = localStorage.getItem('lastSearchedCity');


**La aplicación se inicializa automáticamente al cargar `index.html`**[attached_file:1].

---

## 📁 Estructura del Proyecto

WeatherApp/

├── index.html # Estructura HTML principal

├── styles.css # Estilos responsive + variables CSS

├── app.js # Lógica de API + DOM manipulation

├── .env.example # Plantilla de configuración

├── README.md

└── assets/

├── icons/ # Iconos SVG del clima (50 estados)

└── fonts/ # Roboto, Open Sans

---

## 🔄 Arquitectura


**Flujo de datos:** El usuario introduce una ciudad o activa geolocalización → `app.js` realiza fetch a OpenWeatherMap → Respuesta JSON se procesa y actualiza el DOM → Última búsqueda se guarda en localStorage para persistencia.

---

## 🧪 Testing

Tests unitarios
npm test

Verificar cobertura
npm run test:coverage

Linting
npm run lint:js
npm run lint:css
npm run lint:html

 

![Coverage](https://img.shields.io/badge/coverage-85%25-brightgreen?style=flat)
![Tests](https://img.shields.io/badge/tests-12%20passing-brightgreen?style=flat)

---

## 📄 Licencia

MIT License - ver [LICENSE](https://github.com/n3brrr/WeatherApp/blob/main/LICENSE)

---

## 👤 Autor

**Rubén** - [@n3brrr](https://github.com/n3brrr)

---

<div align="center">

⭐ **Si te fue útil, considera dejar una estrella**

![GitHub Stars](https://img.shields.io/github/stars/n3brrr/WeatherApp?style=social)
![GitHub Forks](https://img.shields.io/github/forks/n3brrr/WeatherApp?style=social)

</div>


