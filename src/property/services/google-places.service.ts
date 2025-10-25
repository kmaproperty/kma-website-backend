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

export interface GooglePlaceSociety {
  name: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
  address?: string;
}

export interface GooglePlaceLocality {
  name: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
  address?: string;
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
      this.logger.warn(
        'Google Maps API key not configured - skipping Google API search',
      );
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

      if (
        response.data.status !== 'OK' &&
        response.data.status !== 'ZERO_RESULTS'
      ) {
        this.logger.error(`Google Places API error: ${response.data.status}`);
        return [];
      }

      if (
        !response.data.predictions ||
        response.data.predictions.length === 0
      ) {
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
          this.logger.error(
            `Error fetching place details: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      }

      return cities;
    } catch (error) {
      this.logger.error(
        `Error searching cities from Google: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return [];
    }
  }

  /**
   * Get detailed information about a place
   */
  private async getPlaceDetails(
    placeId: string,
  ): Promise<GooglePlaceCity | null> {
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
      this.logger.error(
        `Error getting place details: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return null;
    }
  }

  /**
   * Search for societies using Google Places API
   */
  async searchSocieties(
    query: string,
    cityName?: string,
  ): Promise<GooglePlaceSociety[]> {
    if (!this.apiKey) {
      this.logger.warn(
        'Google Maps API key not configured - skipping Google API search',
      );
      return [];
    }

    try {
      // Construct search query with city context if provided
      let searchQuery = query;
      if (cityName) {
        searchQuery = `${query} in ${cityName}, India`;
      } else {
        searchQuery = `${query} India`;
      }

      // Use Place Autocomplete API for societies/residential areas
      const autocompleteUrl = `${this.baseUrl}/autocomplete/json`;
      const response = await axios.get(autocompleteUrl, {
        params: {
          input: searchQuery,
          types: 'establishment',
          components: 'country:in', // Restrict to India
          key: this.apiKey,
        },
      });

      if (
        response.data.status !== 'OK' &&
        response.data.status !== 'ZERO_RESULTS'
      ) {
        this.logger.error(`Google Places API error: ${response.data.status}`);
        return [];
      }

      if (
        !response.data.predictions ||
        response.data.predictions.length === 0
      ) {
        return [];
      }

      // Get details for each place to extract coordinates and structured info
      const societies: GooglePlaceSociety[] = [];

      for (const prediction of response.data.predictions.slice(0, 5)) {
        try {
          const placeDetails = await this.getSocietyDetails(
            prediction.place_id,
          );
          if (placeDetails) {
            societies.push(placeDetails);
          }
        } catch (error) {
          this.logger.error(
            `Error fetching society details: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      }

      return societies;
    } catch (error) {
      this.logger.error(
        `Error searching societies from Google: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return [];
    }
  }

  /**
   * Search for localities using Google Places API
   */
  async searchLocalities(
    query: string,
    cityName?: string,
    societyName?: string,
  ): Promise<GooglePlaceLocality[]> {
    if (!this.apiKey) {
      this.logger.warn(
        'Google Maps API key not configured - skipping Google API search',
      );
      return [];
    }

    try {
      // Construct search query with context
      let searchQuery = query;
      if (societyName && cityName) {
        searchQuery = `${query} near ${societyName}, ${cityName}, India`;
      } else if (cityName) {
        searchQuery = `${query} in ${cityName}, India`;
      } else {
        searchQuery = `${query} India`;
      }

      // Use Place Autocomplete API for localities/neighborhoods
      const autocompleteUrl = `${this.baseUrl}/autocomplete/json`;
      const response = await axios.get(autocompleteUrl, {
        params: {
          input: searchQuery,
          types: '(neighborhood|sublocality)',
          components: 'country:in', // Restrict to India
          key: this.apiKey,
        },
      });

      if (
        response.data.status !== 'OK' &&
        response.data.status !== 'ZERO_RESULTS'
      ) {
        this.logger.error(`Google Places API error: ${response.data.status}`);
        return [];
      }

      if (
        !response.data.predictions ||
        response.data.predictions.length === 0
      ) {
        return [];
      }

      // Get details for each place to extract coordinates and structured info
      const localities: GooglePlaceLocality[] = [];

      for (const prediction of response.data.predictions.slice(0, 5)) {
        try {
          const placeDetails = await this.getLocalityDetails(
            prediction.place_id,
          );
          if (placeDetails) {
            localities.push(placeDetails);
          }
        } catch (error) {
          this.logger.error(
            `Error fetching locality details: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      }

      return localities;
    } catch (error) {
      this.logger.error(
        `Error searching localities from Google: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return [];
    }
  }

  /**
   * Get detailed information about a society/establishment
   */
  private async getSocietyDetails(
    placeId: string,
  ): Promise<GooglePlaceSociety | null> {
    try {
      const detailsUrl = `${this.baseUrl}/details/json`;
      const response = await axios.get(detailsUrl, {
        params: {
          place_id: placeId,
          fields: 'name,geometry,address_components,formatted_address',
          key: this.apiKey,
        },
      });

      if (response.data.status !== 'OK') {
        return null;
      }

      const result = response.data.result;
      const addressComponents = result.address_components || [];

      // Extract city, state and country from address components
      let city = '';
      let state = '';
      let country = '';

      for (const component of addressComponents) {
        if (
          component.types.includes('locality') ||
          component.types.includes('administrative_area_level_2')
        ) {
          city = component.long_name;
        }
        if (component.types.includes('administrative_area_level_1')) {
          state = component.long_name;
        }
        if (component.types.includes('country')) {
          country = component.long_name;
        }
      }

      return {
        name: result.name,
        city,
        state,
        country,
        latitude: result.geometry?.location?.lat,
        longitude: result.geometry?.location?.lng,
        placeId,
        address: result.formatted_address,
      };
    } catch (error) {
      this.logger.error(
        `Error getting society details: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return null;
    }
  }

  /**
   * Get detailed information about a locality/neighborhood
   */
  private async getLocalityDetails(
    placeId: string,
  ): Promise<GooglePlaceLocality | null> {
    try {
      const detailsUrl = `${this.baseUrl}/details/json`;
      const response = await axios.get(detailsUrl, {
        params: {
          place_id: placeId,
          fields: 'name,geometry,address_components,formatted_address',
          key: this.apiKey,
        },
      });

      if (response.data.status !== 'OK') {
        return null;
      }

      const result = response.data.result;
      const addressComponents = result.address_components || [];

      // Extract city, state and country from address components
      let city = '';
      let state = '';
      let country = '';

      for (const component of addressComponents) {
        if (
          component.types.includes('locality') ||
          component.types.includes('administrative_area_level_2')
        ) {
          city = component.long_name;
        }
        if (component.types.includes('administrative_area_level_1')) {
          state = component.long_name;
        }
        if (component.types.includes('country')) {
          country = component.long_name;
        }
      }

      return {
        name: result.name,
        city,
        state,
        country,
        latitude: result.geometry?.location?.lat,
        longitude: result.geometry?.location?.lng,
        placeId,
        address: result.formatted_address,
      };
    } catch (error) {
      this.logger.error(
        `Error getting locality details: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return null;
    }
  }
}
