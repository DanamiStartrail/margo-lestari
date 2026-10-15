import dotenv from 'dotenv';

dotenv.config();

export const ENV = {
  BMKG: {
    ADM4: process.env.BMKG_ADM4 ?? '18.01.13.2012',
    BASE_URL: process.env.BMKG_BASE_URL ?? 'https://api.bmkg.go.id/publik/prakiraan-cuaca',
    get API_URL(): string {
      return `${this.BASE_URL}?adm4=${this.ADM4}`;
    },
  },
  OPEN_METEO: {
    LAT: Number(process.env.OPEN_METEO_LAT ?? -5.2933),
    LON: Number(process.env.OPEN_METEO_LON ?? 105.3409),
    BASE_URL: process.env.OPEN_METEO_BASE_URL ?? 'https://api.open-meteo.com/v1/forecast',
    get API_URL(): string {
      return `${this.BASE_URL}?latitude=${this.LAT}&longitude=${this.LON}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&timezone=Asia%2FJakarta`;
    },
  },
  CRON_SCHEDULE: process.env.CRON_SCHEDULE ?? '0 */3 * * *',
  WHATSAPP_TARGET_JID: process.env.WHATSAPP_TARGET_JID ?? '',
  MONGODB_URI: process.env.MONGODB_URI ?? '',
};