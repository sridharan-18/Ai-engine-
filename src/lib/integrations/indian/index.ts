/**
 * Indian Government Data Sources Integration
 * Unified interface for accessing Indian government data
 */

import { indianWeatherService, WeatherData } from './weather';
import { indianAgricultureService, CropInfo, MarketPrice } from './agriculture';
import { indianTransportService, TrainSchedule, FlightInfo } from './transport';

export interface IndianDataResult {
  category: 'weather' | 'agriculture' | 'transport';
  data: WeatherData | CropInfo | MarketPrice | TrainSchedule | FlightInfo;
}

export class IndianDataService {
  async search(query: string): Promise<IndianDataResult[]> {
    const results: IndianDataResult[] = [];
    const lowerQuery = query.toLowerCase();

    // Check for weather-related queries
    if (lowerQuery.includes('weather') || lowerQuery.includes('temperature') || lowerQuery.includes('rain')) {
      const cityMatch = query.match(/(?:in|at|for)\s+([a-zA-Z\s]+)/i);
      const city = cityMatch ? cityMatch[1].trim() : 'Delhi';
      
      const weatherData = await indianWeatherService.getCurrentWeather(city);
      if (weatherData) {
        results.push({ category: 'weather', data: weatherData });
      }
    }

    // Check for agriculture-related queries
    if (lowerQuery.includes('crop') || lowerQuery.includes('farming') || lowerQuery.includes('agriculture')) {
      const cropMatch = query.match(/(?:about|info|information)\s+([a-zA-Z\s]+)/i);
      const crop = cropMatch ? cropMatch[1].trim() : 'rice';
      
      const cropInfo = await indianAgricultureService.getCropInfo(crop);
      if (cropInfo) {
        results.push({ category: 'agriculture', data: cropInfo });
      }

      // Also fetch market prices
      const stateMatch = query.match(/(?:in|at|for)\s+([a-zA-Z\s]+)/i);
      const state = stateMatch ? stateMatch[1].trim() : 'Punjab';
      
      const marketPrices = await indianAgricultureService.getMarketPrices(state);
      marketPrices.forEach(price => {
        results.push({ category: 'agriculture', data: price });
      });
    }

    // Check for transport-related queries
    if (lowerQuery.includes('train') || lowerQuery.includes('railway')) {
      const trainMatch = query.match(/(?:train|number)\s*(\d+)/i);
      if (trainMatch) {
        const trainSchedule = await indianTransportService.getTrainSchedule(trainMatch[1]);
        if (trainSchedule) {
          results.push({ category: 'transport', data: trainSchedule });
        }
      }
    }

    if (lowerQuery.includes('flight')) {
      const flightMatch = query.match(/(?:flight)\s*([a-zA-Z0-9]+)/i);
      if (flightMatch) {
        const flightInfo = await indianTransportService.getFlightStatus(flightMatch[1]);
        if (flightInfo) {
          results.push({ category: 'transport', data: flightInfo });
        }
      }
    }

    return results;
  }

  async getWeather(city: string): Promise<WeatherData | null> {
    return indianWeatherService.getCurrentWeather(city);
  }

  async getCropInfo(crop: string): Promise<CropInfo | null> {
    return indianAgricultureService.getCropInfo(crop);
  }

  async getMarketPrices(state: string): Promise<MarketPrice[]> {
    return indianAgricultureService.getMarketPrices(state);
  }

  async getTrainSchedule(trainNumber: string): Promise<TrainSchedule | null> {
    return indianTransportService.getTrainSchedule(trainNumber);
  }

  async getFlightStatus(flightNumber: string): Promise<FlightInfo | null> {
    return indianTransportService.getFlightStatus(flightNumber);
  }
}

export const indianDataService = new IndianDataService();
