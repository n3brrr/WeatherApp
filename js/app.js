// app.js

// ========================================
// 1. CONFIGURACIÓN
// ========================================

const API_URL = 'https://api.open-meteo.com/v1/forecast';

// PNG para iconos CENTRALES (grandes)
const weatherIconsCenter = {
  // Sol
  0: 'assets/Sol.png',
  1: 'assets/Sol.png',
  
  // Sol y nubes
  2: 'assets/Sol con nubes.png',
  
  // Nubes
  3: 'assets/SOl con nubajsjajss.png',
  
  // Niebla (usa nubes como placeholder)
  45: 'assets/cloud.svg',
  48: 'assets/cloud.svg',
  
  // Lluvia
  51: 'assets/cloud-rain.svg',
  53: 'assets/cloud-rain.svg',
  55: 'assets/cloud-rain.svg',
  61: 'assets/cloud-rain.svg',
  63: 'assets/cloud-rain.svg',
  65: 'assets/cloud-rain.svg',
  80: 'assets/cloud-rain.svg',
  81: 'assets/cloud-rain.svg',
  82: 'assets/cloud-rain.svg',
  
  // Tormenta (usa lluvia como placeholder)
  95: 'assets/cloud-rain.svg',
  96: 'assets/cloud-rain.svg',
  99: 'assets/cloud-rain.svg',
  
  // Nieve
  71: 'assets/cloud-snow.svg',
  73: 'assets/cloud-snow.svg',
  75: 'assets/cloud-snow.svg',
  77: 'assets/cloud-snow.svg',
  85: 'assets/cloud-snow.svg',
  86: 'assets/cloud-snow.svg'
};

// SVG para iconos PEQUEÑOS (pronóstico días)
const weatherIconsSmall = {
  // Sol
  0: 'assets/sun.svg',
  1: 'assets/sun.svg',
  
  // Sol y nubes
  2: 'assets/sun-cloud.svg',
  
  // Nubes
  3: 'assets/cloud.svg',
  
  // Niebla
  45: 'assets/cloud.svg',
  48: 'assets/cloud.svg',
  
  // Lluvia
  51: 'assets/cloud-rain.svg',
  53: 'assets/cloud-rain.svg',
  55: 'assets/cloud-rain.svg',
  61: 'assets/cloud-rain.svg',
  63: 'assets/cloud-rain.svg',
  65: 'assets/cloud-rain.svg',
  80: 'assets/cloud-rain.svg',
  81: 'assets/cloud-rain.svg',
  82: 'assets/cloud-rain.svg',
  
  // Tormenta
  95: 'assets/cloud-rain.svg',
  96: 'assets/cloud-rain.svg',
  99: 'assets/cloud-rain.svg',
  
  // Nieve
  71: 'assets/cloud-snow.svg',
  73: 'assets/cloud-snow.svg',
  75: 'assets/cloud-snow.svg',
  77: 'assets/cloud-snow.svg',
  85: 'assets/cloud-snow.svg',
  86: 'assets/cloud-snow.svg'
};

// Descripciones
const weatherDescriptions = {
  0: 'Despejado',
  1: 'Despejado',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Niebla',
  48: 'Niebla',
  51: 'Lluvia ligera',
  53: 'Lluvia',
  55: 'Lluvia',
  61: 'Lluvia',
  63: 'Lluvia moderada',
  65: 'Lluvia fuerte',
  71: 'Nieve ligera',
  73: 'Nieve',
  75: 'Nieve fuerte',
  80: 'Lluvia',
  81: 'Lluvia',
  82: 'Lluvia fuerte',
  95: 'Tormenta',
  96: 'Tormenta eléctrica',
  99: 'Tormenta eléctrica'
};

const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const monthsOfYear = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// ========================================
// 2. FUNCIONES UTILIDAD
// ========================================

function getFormattedDate() {
  const now = new Date();
  const dayName = daysOfWeek[now.getDay()];
  const monthName = monthsOfYear[now.getMonth()];
  const day = now.getDate();
  return `${dayName}, ${monthName} ${day}`;
}

function getWeatherIconCenter(code) {
  return weatherIconsCenter[code] || 'assets/Sol.png';
}

function getWeatherIconSmall(code) {
  return weatherIconsSmall[code] || 'assets/sun.svg';
}

function getWeatherDescription(code) {
  return weatherDescriptions[code] || 'Desconocido';
}

// ========================================
// 3. GEOLOCALIZACIÓN
// ========================================

function getUserLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ lat: 36.7213, lon: -4.4214 });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      () => {
        resolve({ lat: 36.7213, lon: -4.4214 });
      }
    );
  });
}

async function getCityName(lat, lon) {
  try {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?latitude=${lat}&longitude=${lon}&count=1&language=es&format=json`
    );
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return data.results[0].name + ', ' + (data.results[0].country || 'España');
    }
    return 'Málaga, España';
  } catch (error) {
    return 'Málaga, España';
  }
}

// ========================================
// 4. API CLIMA
// ========================================

async function getWeatherData(lat, lon) {
  const url = `${API_URL}?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relativehumidity_2m,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min&current_weather=true&timezone=auto`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// ========================================
// 5. ACTUALIZAR UI
// ========================================

function updateCurrentWeather(data, cityName) {
  const current = data.current_weather;
  
  // Temperatura
  document.querySelector('.temp-section h1').textContent = `${Math.round(current.temperature)}°`;
  
  // Descripción
  document.querySelector('.temp-section .description').textContent = 
    getWeatherDescription(current.weathercode);
  
  // Icono principal GRANDE (PNG)
  const weatherIcon = document.querySelector('.weather-icon');
  weatherIcon.src = getWeatherIconCenter(current.weathercode);
  
  // Viento
  document.querySelectorAll('.metric-value')[0].textContent = `${Math.round(current.windspeed)} km/h`;
  
  // Humedad
  const currentHour = new Date().getHours();
  const humidity = data.hourly.relativehumidity_2m[currentHour] || 60;
  document.querySelectorAll('.metric-value')[1].textContent = `${humidity}%`;
  
  // Mínima
  const minTemp = Math.round(data.daily.temperature_2m_min[0]);
  document.querySelectorAll('.metric-value')[2].textContent = `${minTemp}°`;
  
  // Ubicación y fecha
  document.querySelector('.location span').textContent = cityName;
  document.querySelector('.date p').textContent = getFormattedDate();
}

function updateHourlyForecast(data) {
  const hourlyData = data.hourly;
  const chartContainer = document.querySelector('.hourly-chart');
  chartContainer.innerHTML = '';
  
  const now = new Date();
  const currentHour = now.getHours();
  
  // Arrays para datos
  const temps = [];
  const hours = [];
  
  for (let i = 0; i < 8; i++) {
    temps.push(Math.round(hourlyData.temperature_2m[currentHour + i]));
    hours.push((currentHour + i) % 24);
  }
  
  // Calcular rango de temperaturas
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const tempRange = maxTemp - minTemp || 10;
  
  // Crear contenedor principal
  const wrapper = document.createElement('div');
  wrapper.style.position = 'relative';
  wrapper.style.width = '100%';
  wrapper.style.height = '150px';
  
  // Crear SVG para la línea
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.style.width = '100%';
  svg.style.height = '100%';
  svg.style.position = 'absolute';
  svg.style.top = '0';
  svg.style.left = '0';
  
  // Definir gradiente
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  gradient.setAttribute('id', 'lineGradient');
  gradient.setAttribute('x1', '0%');
  gradient.setAttribute('x2', '100%');
  
  const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop1.setAttribute('offset', '0%');
  stop1.setAttribute('stop-color', 'rgba(199, 157, 80, 0.3)');
  
  const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop2.setAttribute('offset', '50%');
  stop2.setAttribute('stop-color', 'rgba(199, 157, 80, 1)');
  
  const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
  stop3.setAttribute('offset', '100%');
  stop3.setAttribute('stop-color', 'rgba(199, 157, 80, 0.3)');
  
  gradient.appendChild(stop1);
  gradient.appendChild(stop2);
  gradient.appendChild(stop3);
  defs.appendChild(gradient);
  svg.appendChild(defs);
  
  // Calcular puntos con padding
  const padding = 5;
  const points = temps.map((temp, index) => {
    const xPercent = (index / (temps.length - 1)) * 100;
    const normalized = (temp - minTemp) / tempRange;
    const yPercent = 100 - (normalized * 60 + 20); // Invertir Y
    return { x: xPercent, y: yPercent, temp };
  });
  
  // Crear path con curvas Bezier suaves
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  let pathData = `M ${points[0].x} ${points[0].y}`;
  
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    
    const controlX1 = current.x + (next.x - current.x) / 3;
    const controlY1 = current.y;
    const controlX2 = current.x + (next.x - current.x) * 2 / 3;
    const controlY2 = next.y;
    
    pathData += ` C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${next.x} ${next.y}`;
  }
  
  path.setAttribute('d', pathData);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'url(#lineGradient)');
  path.setAttribute('stroke-width', '2.5');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  path.setAttribute('vector-effect', 'non-scaling-stroke');
  
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.appendChild(path);
  
  wrapper.appendChild(svg);
  
  // Crear puntos y etiquetas
  points.forEach((point, index) => {
    const itemWrapper = document.createElement('div');
    itemWrapper.style.position = 'absolute';
    itemWrapper.style.left = `${point.x}%`;
    itemWrapper.style.top = `${point.y}%`;
    itemWrapper.style.transform = 'translate(-50%, -50%)';
    itemWrapper.style.display = 'flex';
    itemWrapper.style.flexDirection = 'column';
    itemWrapper.style.alignItems = 'center';
    itemWrapper.style.gap = '5px';
    
    itemWrapper.innerHTML = `
      <span class="hour-temp">${temps[index]}°</span>
      <div class="hour-dot"></div>
      <span class="hour-time">${hours[index].toString().padStart(2, '0')}:00</span>
    `;
    
    wrapper.appendChild(itemWrapper);
  });
  
  chartContainer.appendChild(wrapper);
}


function updateDailyForecast(data) {
  const dailyData = data.daily;
  const forecastContainer = document.querySelector('.daily-forecast');
  forecastContainer.innerHTML = '';
  
  for (let i = 0; i < 6; i++) {
    const date = new Date(dailyData.time[i]);
    const dayName = daysOfWeek[date.getDay()];
    const temp = Math.round(dailyData.temperature_2m_max[i]);
    const weatherCode = dailyData.weathercode[i];
    const icon = getWeatherIconSmall(weatherCode); // SVG pequeños
    
    const dayItem = document.createElement('div');
    dayItem.className = 'day-item';
    
    dayItem.innerHTML = `
      <div class="day-left">
        <img src="${icon}" alt="weather" class="day-icon">
        <div class="day-info">
          <span class="day-name">${dayName}</span>
        </div>
      </div>
      <span class="day-temp">${temp}°</span>
    `;
    
    forecastContainer.appendChild(dayItem);
  }
}

// ========================================
// 6. MICROINTERACCIONES
// ========================================

function addMicrointeractions() {
  // Hover en horas
  const hourItems = document.querySelectorAll('.hour-item');
  hourItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      item.style.transform = 'scale(1.1) translateY(-5px)';
      item.style.transition = 'transform 0.3s ease';
    });
    
    item.addEventListener('mouseleave', () => {
      item.style.transform = 'scale(1) translateY(0)';
    });
  });
  
  // Clic en icono principal
  const weatherIcon = document.querySelector('.weather-icon');
  weatherIcon.style.cursor = 'pointer';
  weatherIcon.style.transition = 'transform 0.6s ease';
  
  weatherIcon.addEventListener('click', () => {
    weatherIcon.style.transform = 'rotate(360deg) scale(1.1)';
    setTimeout(() => {
      weatherIcon.style.transform = 'rotate(0deg) scale(1)';
    }, 600);
  });
}

// ========================================
// 7. INICIALIZACIÓN
// ========================================

async function init() {
  try {
    const location = await getUserLocation();
    const weatherData = await getWeatherData(location.lat, location.lon);
    const cityName = await getCityName(location.lat, location.lon);
    
    updateCurrentWeather(weatherData, cityName);
    updateHourlyForecast(weatherData);
    updateDailyForecast(weatherData);
    addMicrointeractions();
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Iniciar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
