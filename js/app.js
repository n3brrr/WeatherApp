// app.js

// ========================================
// 1. CONFIGURACIÓN
// ========================================

const API_URL = 'https://api.open-meteo.com/v1/forecast';

// Mapeo con tus nombres de archivos
const weatherIcons = {
  // Sol
  0: 'assets/sol.png',
  1: 'assets/sol.png',
  
  // Sol y nubes
  2: 'assets/sol-nubes.svg',
  
  // Nubes
  3: 'assets/nubes.svg',
  
  // Niebla
  45: 'assets/fog.svg',
  48: 'assets/fog.svg',
  
  // Lluvia
  51: 'assets/lluvia.svg',
  53: 'assets/lluvia.svg',
  55: 'assets/lluvia.svg',
  61: 'assets/lluvia.svg',
  63: 'assets/lluvia.svg',
  65: 'assets/lluvia.svg',
  80: 'assets/lluvia.svg',
  81: 'assets/lluvia.svg',
  82: 'assets/lluvia.svg',
  
  // Tormenta eléctrica
  95: 'assets/tormenta.svg',
  96: 'assets/tormenta.svg',
  99: 'assets/tormenta.svg',
  
  // Nieve
  71: 'assets/nieve.svg',
  73: 'assets/nieve.svg',
  75: 'assets/nieve.svg',
  77: 'assets/nieve.svg',
  85: 'assets/nieve.svg',
  86: 'assets/nieve.svg'
};

// Descripciones simplificadas
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

function getWeatherIcon(code) {
  return weatherIcons[code] || 'assets/sol.png';
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
      resolve({ lat: 36.7213, lon: -4.4214 }); // Málaga por defecto
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
        resolve({ lat: 36.7213, lon: -4.4214 }); // Málaga si falla
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
  
  // Icono principal
  const weatherIcon = document.querySelector('.weather-icon');
  weatherIcon.src = getWeatherIcon(current.weathercode);
  
  // Viento
  document.querySelectorAll('.metric-value')[0].textContent = `${Math.round(current.windspeed)} km/h`;
  
  // Humedad (del hourly data actual)
  const currentHour = new Date().getHours();
  const humidity = data.hourly.relativehumidity_2m[currentHour] || 60;
  document.querySelectorAll('.metric-value')[1].textContent = `${humidity}%`;
  
  // Mínima del día
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
  
  for (let i = 0; i < 8; i++) {
    const temp = Math.round(hourlyData.temperature_2m[currentHour + i]);
    const hour = (currentHour + i) % 24;
    
    const hourItem = document.createElement('div');
    hourItem.className = 'hour-item';
    
    hourItem.innerHTML = `
      <span class="hour-temp">${temp}°</span>
      <div class="hour-dot"></div>
      <span class="hour-time">${hour.toString().padStart(2, '0')}:00</span>
    `;
    
    chartContainer.appendChild(hourItem);
  }
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
    const icon = getWeatherIcon(weatherCode);
    
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
