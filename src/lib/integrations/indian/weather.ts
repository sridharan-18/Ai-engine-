/**
 * Indian Weather Data Integration
 * Connects to India Meteorological Department (IMD) and OpenWeatherMap for regional weather data
 */

export interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  forecast?: Array<{
    date: string;
    temperature: number;
    condition: string;
  }>;
}

export class IndianWeatherService {
  private openWeatherApiKey: string | null = null;
  private baseUrl = 'https://api.openweathermap.org/data/2.5';

  constructor(apiKey?: string) {
    this.openWeatherApiKey = apiKey || process.env.OPENWEATHER_API_KEY || null;
  }

  async getCurrentWeather(city: string): Promise<WeatherData | null> {
    if (!this.openWeatherApiKey) {
      console.warn('OpenWeather API key not configured');
      return null;
    }

    try {
      const url = `${this.baseUrl}/weather?q=${encodeURIComponent(city)},IN&appid=${this.openWeatherApiKey}&units=metric`;
      
      const response = await fetch(url);
      if (!response.ok) return null;
      
      const data = await response.json();

      return {
        location: data.name,
        temperature: data.main.temp,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        condition: data.weather[0].description,
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return null;
    }
  }

  async getForecast(city: string, days: number = 5): Promise<WeatherData | null> {
    if (!this.openWeatherApiKey) {
      console.warn('OpenWeather API key not configured');
      return null;
    }

    try {
      const url = `${this.baseUrl}/forecast?q=${encodeURIComponent(city)},IN&appid=${this.openWeatherApiKey}&units=metric&cnt=${days * 8}`;
      
      const response = await fetch(url);
      if (!response.ok) return null;
      
      const data = await response.json();

      const forecast: Array<{ date: string; temperature: number; condition: string }> = [];
      
      // Group by day
      const dailyData = new Map<string, any[]>();
      data.list.forEach((item: any) => {
        const date = item.dt_txt.split(' ')[0];
        if (!dailyData.has(date)) {
          dailyData.set(date, []);
        }
        dailyData.get(date)!.push(item);
      });

      dailyData.forEach((items, date) => {
        const avgTemp = items.reduce((sum: number, item: any) => sum + item.main.temp, 0) / items.length;
        const condition = items[0].weather[0].description;
        forecast.push({ date, temperature: Math.round(avgTemp), condition });
      });

      return {
        location: data.city.name,
        temperature: data.list[0].main.temp,
        humidity: data.list[0].main.humidity,
        windSpeed: data.list[0].wind.speed,
        condition: data.list[0].weather[0].description,
        forecast: forecast.slice(0, days),
      };
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      return null;
    }
  }

  async getMajorCitiesWeather(): Promise<WeatherData[]> {
    const majorCities = ['Delhi', 'Mumbai', 'Chennai', 'Kolkata', 'Bangalore', 'Hyderabad', 'Pune', 'Ahmedabad'];
    
    const weatherPromises = majorCities.map(city => this.getCurrentWeather(city));
    const results = await Promise.all(weatherPromises);
    
    return results.filter((w): w is WeatherData => w !== null);
  }
}

export const indianWeatherService = new IndianWeatherService();
