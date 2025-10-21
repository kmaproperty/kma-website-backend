import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../../common/config/config.service';
import axios from 'axios';

export interface GooglePlaceCity {
  name: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
}

@Injectable()
export class GooglePlacesService {
  private readonly logger = new Logger(GooglePlacesService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://maps.googleapis.com/maps/api/place';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.getGoogleMapsApiKey();
  }

  /**
   * Search for cities using Google Places Autocomplete API
   */
  async searchCities(query: string): Promise<GooglePlaceCity[]> {
    if (!this.apiKey) {
      this.logger.warn('Google Maps API key not configured');
      return [];
    }

    try {
      // Use Place Autocomplete API restricted to cities
      const autocompleteUrl = `${this.baseUrl}/autocomplete/json`;
      const response = await axios.get(autocompleteUrl, {
        params: {
          input: query,
          types: '(cities)',
          key: this.apiKey,
        },
      });

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        this.logger.error(`Google Places API error: ${response.data.status}`);
        return [];
      }

      if (!response.data.predictions || response.data.predictions.length === 0) {
        return [];
      }

      // Get details for each place to extract coordinates and structured info
      const cities: GooglePlaceCity[] = [];
      
      for (const prediction of response.data.predictions.slice(0, 5)) {
        try {
          const placeDetails = await this.getPlaceDetails(prediction.place_id);
          if (placeDetails) {
            cities.push(placeDetails);
          }
        } catch (error) {
          this.logger.error(`Error fetching place details: ${error.message}`);
        }
      }

      return cities;
    } catch (error) {
      this.logger.error(`Error searching cities from Google: ${error.message}`);
      return [];
    }
  }

  /**
   * Get detailed information about a place
   */
  private async getPlaceDetails(placeId: string): Promise<GooglePlaceCity | null> {
    try {
      const detailsUrl = `${this.baseUrl}/details/json`;
      const response = await axios.get(detailsUrl, {
        params: {
          place_id: placeId,
          fields: 'name,geometry,address_components',
          key: this.apiKey,
        },
      });

      if (response.data.status !== 'OK') {
        return null;
      }

      const result = response.data.result;
      const addressComponents = result.address_components || [];

      // Extract state and country from address components
      let state = '';
      let country = '';

      for (const component of addressComponents) {
        if (component.types.includes('administrative_area_level_1')) {
          state = component.long_name;
        }
        if (component.types.includes('country')) {
          country = component.long_name;
        }
      }

      return {
        name: result.name,
        state,
        country,
        latitude: result.geometry?.location?.lat,
        longitude: result.geometry?.location?.lng,
        placeId,
      };
    } catch (error) {
      this.logger.error(`Error getting place details: ${error.message}`);
      return null;
    }
  }
}
