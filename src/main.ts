import './styles/index.css';
import { createApp } from './app';
import { getUserLocation } from './api/geolocation';
import { fetchWeather } from './api/openMeteo';
import { reverseGeocode } from './api/reverseGeocode';

const app = createApp(document, {
  getLocation: () => getUserLocation(),
  fetchWeather: (latitude, longitude) => fetchWeather({ latitude, longitude }),
  reverseGeocode: (latitude, longitude) => reverseGeocode({ latitude, longitude }),
  now: () => new Date(),
});

void app.start();
