export interface OpenMeteoCurrentUnits {
  time: string;
  interval: string;
  temperature_2m: string;
  relative_humidity_2m: string;
  precipitation: string;
  weather_code: string;
  wind_speed_10m: string;
}

export interface OpenMeteoCurrentData {
  time: string;
  interval: number;
  temperature_2m: number;
  relative_humidity_2m: number;
  precipitation: number;
  weather_code: number;
  wind_speed_10m: number;
}

export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: OpenMeteoCurrentUnits;
  current: OpenMeteoCurrentData;
}

export interface OpenMeteoHourlyData {
  time: string[];
  precipitation: number[];
  precipitation_probability: number[];
  temperature_2m: number[];
  relative_humidity_2m: number[];
  dew_point_2m: number[];
  cloud_cover: number[];
  surface_pressure: number[];
  cape: number[];
  wind_speed_10m: number[];
  wind_gusts_10m: number[];
  weather_code: number[];
}

export interface OpenMeteoHourlyResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  hourly: OpenMeteoHourlyData;
}