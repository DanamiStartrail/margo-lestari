import requests

# Endpoint API BMKG untuk Desa Margo Lestari (Adm4: 18.01.13.2012)
URL = "https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=18.01.13.2012"


def fetch_weather_data():
    try:
        response = requests.get(URL)
        if response.status_code == 200:
            data = response.json()
            lokasi = data.get("lokasi", {})
            prakiraan = data.get("data", [])

            print(f"Berhasil mengambil data untuk Desa: {lokasi.get('desa')}")
            # Contoh mengambil data cuaca periode pertama
            if prakiraan:
                cuaca_pertama = prakiraan[0]["cuaca"][0][0]
                print(f"Waktu: {cuaca_pertama.get('local_datetime')}")
                print(f"Suhu: {cuaca_pertama.get('t')}°C")
                print(f"Kondisi: {cuaca_pertama.get('weather_desc')}")
                print(f"Kelembapan: {cuaca_pertama.get('hu')}%")
        else:
            print(f"Gagal terhubung, status code: {response.status_code}")
    except Exception as e:
        print(f"Terjadi kesalahan: {e}")


if __name__ == "__main__":
    fetch_weather_data()