import { formatWeatherBroadcast } from './utils/formatter.js';
import type { WeatherItem } from './types/weather.js';
import type { OpenMeteoCurrentData } from './types/openmeteo.js';

// 1. Data Dummy Cuaca Normal (Status: AMAN | Curah Hujan: 0 mm)
const mockDataAman: { bmkg: WeatherItem; openMeteo: OpenMeteoCurrentData } = {
  bmkg: {
    local_datetime: new Date().toLocaleString('id-ID'),
    weather_desc: 'Cerah Berawan',
    t: 28,
    hu: 75,
    tp: 0,
    ws: 5,
  } as WeatherItem,
  openMeteo: {
    temperature_2m: 28.2,
    relative_humidity_2m: 74,
    precipitation: 0,
    weather_code: 1,
    wind_speed_10m: 5.2,
  } as OpenMeteoCurrentData,
};

// 2. Data Dummy Potensi Hujan Sedang (Status: WASPADA | Curah Hujan: 25 mm)
const mockDataWaspada: { bmkg: WeatherItem; openMeteo: OpenMeteoCurrentData } = {
  bmkg: {
    local_datetime: new Date().toLocaleString('id-ID'),
    weather_desc: 'Hujan Sedang',
    t: 24,
    hu: 88,
    tp: 25,
    ws: 18,
  } as WeatherItem,
  openMeteo: {
    temperature_2m: 24.0,
    relative_humidity_2m: 89,
    precipitation: 22,
    weather_code: 63,
    wind_speed_10m: 17.5,
  } as OpenMeteoCurrentData,
};

// 3. Data Dummy Potensi Hujan Lebat / Darurat (Status: SIAGA | Curah Hujan: 65 mm)
const mockDataSiaga: { bmkg: WeatherItem; openMeteo: OpenMeteoCurrentData } = {
  bmkg: {
    local_datetime: new Date().toLocaleString('id-ID'),
    weather_desc: 'Hujan Badai / Lebat',
    t: 22,
    hu: 95,
    tp: 65,
    ws: 35,
  } as WeatherItem,
  openMeteo: {
    temperature_2m: 21.8,
    relative_humidity_2m: 96,
    precipitation: 60,
    weather_code: 95,
    wind_speed_10m: 34.0,
  } as OpenMeteoCurrentData,
};

function generateTerminalOutput() {
  console.log('\n==================================================');
  console.log('  SIMULASI 3 VARIASI PESAN BROADCAST DESA MARGO LESTARI');
  console.log('==================================================\n');

  const pesanAman = formatWeatherBroadcast(mockDataAman.bmkg, mockDataAman.openMeteo);
  const pesanWaspada = formatWeatherBroadcast(mockDataWaspada.bmkg, mockDataWaspada.openMeteo);
  const pesanSiaga = formatWeatherBroadcast(mockDataSiaga.bmkg, mockDataSiaga.openMeteo);

  console.log(`>>> [VARIASI 1: ${pesanAman.status}] <<<`);
  console.log(pesanAman.pesanWhatsApp);
  console.log('\n--------------------------------------------------\n');

  console.log(`>>> [VARIASI 2: ${pesanWaspada.status}] <<<`);
  console.log(pesanWaspada.pesanWhatsApp);
  console.log('\n--------------------------------------------------\n');

  console.log(`>>> [VARIASI 3: ${pesanSiaga.status}] <<<`);
  console.log(pesanSiaga.pesanWhatsApp);
  console.log('\n==================================================');
}

generateTerminalOutput();