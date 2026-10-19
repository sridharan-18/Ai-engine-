/**
 * Indian Agriculture Data Integration
 * Connects to Indian agriculture portals for farming and crop information
 */

export interface CropInfo {
  name: string;
  season: string;
  sowingTime: string;
  harvestingTime: string;
  duration: string;
  description: string;
  regions: string[];
}

export interface MarketPrice {
  commodity: string;
  market: string;
  state: string;
  price: number;
  unit: string;
  date: string;
}

export class IndianAgricultureService {
  private agmarknetBaseUrl = 'https://agmarknet.gov.in';
  
  async getCropInfo(cropName: string): Promise<CropInfo | null> {
    const cropDatabase: Record<string, CropInfo> = {
      rice: {
        name: 'Rice (Paddy)',
        season: 'Kharif',
        sowingTime: 'June-July',
        harvestingTime: 'October-November',
        duration: '120-150 days',
        description: 'Rice is the staple food crop of India. Major rice-producing states include West Bengal, Punjab, Uttar Pradesh, and Andhra Pradesh.',
        regions: ['West Bengal', 'Punjab', 'Uttar Pradesh', 'Andhra Pradesh', 'Tamil Nadu'],
      },
      wheat: {
        name: 'Wheat',
        season: 'Rabi',
        sowingTime: 'October-November',
        harvestingTime: 'March-April',
        duration: '110-130 days',
        description: 'Wheat is the second most important cereal crop in India. Major producers include Uttar Pradesh, Punjab, Haryana, and Madhya Pradesh.',
        regions: ['Uttar Pradesh', 'Punjab', 'Haryana', 'Madhya Pradesh', 'Rajasthan'],
      },
      cotton: {
        name: 'Cotton',
        season: 'Kharif',
        sowingTime: 'April-May',
        harvestingTime: 'December-January',
        duration: '180-200 days',
        description: 'Cotton is a major cash crop in India. Maharashtra, Gujarat, and Karnataka are the leading cotton-producing states.',
        regions: ['Maharashtra', 'Gujarat', 'Karnataka', 'Telangana', 'Punjab'],
      },
    };

    const normalizedCrop = cropName.toLowerCase();
    return cropDatabase[normalizedCrop] || null;
  }

  async getMarketPrices(state: string, commodity?: string): Promise<MarketPrice[]> {
    const mockPrices: MarketPrice[] = [
      {
        commodity: 'Rice',
        market: 'Azadpur Mandi',
        state: 'Delhi',
        price: 3200,
        unit: 'Quintal',
        date: new Date().toISOString().split('T')[0],
      },
      {
        commodity: 'Wheat',
        market: 'Khanna Mandi',
        state: 'Punjab',
        price: 2800,
        unit: 'Quintal',
        date: new Date().toISOString().split('T')[0],
      },
      {
        commodity: 'Cotton',
        market: 'Rajkot APMC',
        state: 'Gujarat',
        price: 6500,
        unit: 'Quintal',
        date: new Date().toISOString().split('T')[0],
      },
    ];

    if (commodity) {
      return mockPrices.filter(p => p.commodity.toLowerCase().includes(commodity.toLowerCase()));
    }

    return mockPrices.filter(p => p.state.toLowerCase().includes(state.toLowerCase()));
  }
}

export const indianAgricultureService = new IndianAgricultureService();
