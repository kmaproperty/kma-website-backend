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
      const societies: GooglePlaceSociety[] = [];
      
      // Strategy 1: Search for residential areas and societies with specific types
      const residentialResults = await this.searchSocietiesByType(
        query,
        cityName,
        '(neighborhood|sublocality)',
        'residential'
      );
      societies.push(...residentialResults);

      // Strategy 2: Search for specific society keywords
      if (societies.length < 5) {
        const societyKeywordResults = await this.searchSocietiesWithKeywords(
          query,
          cityName
        );
        societies.push(...societyKeywordResults);
      }

      // Strategy 3: If we have city context, search for establishments with location bias
      if (cityName && societies.length < 5) {
        const establishmentResults = await this.searchSocietiesByType(
          query,
          cityName,
          'establishment',
          'society'
        );
        societies.push(...establishmentResults);
      }

      // Strategy 4: Fallback to broader search if still not enough results
      if (societies.length < 3) {
        const fallbackResults = await this.searchSocietiesFallback(
          query,
          cityName
        );
        societies.push(...fallbackResults);
      }

      // Remove duplicates and filter for relevant results
      const uniqueSocieties = this.filterAndDeduplicateSocieties(societies);
      
      return uniqueSocieties.slice(0, 5);
    } catch (error) {
      this.logger.error(
        `Error searching societies from Google: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return [];
    }
  }

  /**
   * Search for societies using specific society-related keywords
   */
  private async searchSocietiesWithKeywords(
    query: string,
    cityName: string | undefined,
  ): Promise<GooglePlaceSociety[]> {
    try {
      const societyKeywords = [
        'society', 'societies', 'residential complex', 'apartment complex',
        'villa complex', 'colony', 'nagar', 'puram', 'enclave', 'heights',
        'towers', 'park', 'garden', 'green city', 'town', 'phase', 'sector'
      ];

      const societies: GooglePlaceSociety[] = [];

      for (const keyword of societyKeywords.slice(0, 3)) { // Try top 3 keywords
        const searchQuery = cityName 
          ? `${query} ${keyword} in ${cityName}, India`
          : `${query} ${keyword} India`;

        // Get city coordinates for location bias if city is provided
        let locationBias = '';
        if (cityName) {
          const cityCoords = await this.getCityCoordinates(cityName);
          if (cityCoords) {
            locationBias = `${cityCoords.lat},${cityCoords.lng}`;
          }
        }

        const autocompleteUrl = `${this.baseUrl}/autocomplete/json`;
        const params: any = {
          input: searchQuery,
          types: 'establishment',
          components: 'country:in',
          key: this.apiKey,
        };

        // Add location bias if available
        if (locationBias) {
          params.location = locationBias;
          params.radius = 50000; // 50km radius
        }

        const response = await axios.get(autocompleteUrl, { params });

        if (
          response.data.status === 'OK' &&
          response.data.predictions &&
          response.data.predictions.length > 0
        ) {
          for (const prediction of response.data.predictions.slice(0, 2)) {
            try {
              const placeDetails = await this.getSocietyDetails(
                prediction.place_id,
              );
              if (placeDetails && this.isRelevantSociety(placeDetails, query)) {
                societies.push(placeDetails);
              }
            } catch (error) {
              this.logger.error(
                `Error fetching society details: ${error instanceof Error ? error.message : 'Unknown error'}`,
              );
            }
          }
        }

        // If we have enough results, break early
        if (societies.length >= 3) {
          break;
        }
      }

      return societies;
    } catch (error) {
      this.logger.error(
        `Error in searchSocietiesWithKeywords: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return [];
    }
  }

  /**
   * Search for societies using specific place types
   */
  private async searchSocietiesByType(
    query: string,
    cityName: string | undefined,
    types: string,
    context: string
  ): Promise<GooglePlaceSociety[]> {
    try {
      // Construct search query with city context
      let searchQuery = query;
      if (cityName) {
        searchQuery = `${query} ${context} in ${cityName}, India`;
      } else {
        searchQuery = `${query} ${context} India`;
      }

      // Get city coordinates for location bias if city is provided
      let locationBias = '';
      if (cityName) {
        const cityCoords = await this.getCityCoordinates(cityName);
        if (cityCoords) {
          locationBias = `${cityCoords.lat},${cityCoords.lng}`;
        }
      }

      const autocompleteUrl = `${this.baseUrl}/autocomplete/json`;
      const params: any = {
        input: searchQuery,
        types: types,
        components: 'country:in',
        key: this.apiKey,
      };

      // Add location bias if available
      if (locationBias) {
        params.location = locationBias;
        params.radius = 50000; // 50km radius
      }

      const response = await axios.get(autocompleteUrl, { params });

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

      const societies: GooglePlaceSociety[] = [];

      for (const prediction of response.data.predictions.slice(0, 3)) {
        try {
          const placeDetails = await this.getSocietyDetails(
            prediction.place_id,
          );
          if (placeDetails && this.isRelevantSociety(placeDetails, query)) {
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
        `Error in searchSocietiesByType: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return [];
    }
  }

  /**
   * Fallback search using Text Search API for more comprehensive results
   */
  private async searchSocietiesFallback(
    query: string,
    cityName: string | undefined,
  ): Promise<GooglePlaceSociety[]> {
    try {
      let searchQuery = query;
      if (cityName) {
        searchQuery = `${query} society residential complex in ${cityName}, India`;
      } else {
        searchQuery = `${query} society residential complex India`;
      }

      // Get city coordinates for location bias if city is provided
      let locationBias = '';
      if (cityName) {
        const cityCoords = await this.getCityCoordinates(cityName);
        if (cityCoords) {
          locationBias = `${cityCoords.lat},${cityCoords.lng}`;
        }
      }

      const textSearchUrl = `${this.baseUrl}/textsearch/json`;
      const params: any = {
        query: searchQuery,
        type: 'establishment',
        key: this.apiKey,
      };

      // Add location bias if available
      if (locationBias) {
        params.location = locationBias;
        params.radius = 50000; // 50km radius
      }

      const response = await axios.get(textSearchUrl, { params });

      if (
        response.data.status !== 'OK' &&
        response.data.status !== 'ZERO_RESULTS'
      ) {
        this.logger.error(`Google Text Search API error: ${response.data.status}`);
        return [];
      }

      if (
        !response.data.results ||
        response.data.results.length === 0
      ) {
        return [];
      }

      const societies: GooglePlaceSociety[] = [];

      for (const result of response.data.results.slice(0, 3)) {
        try {
          const societyDetails = await this.convertTextSearchResultToSociety(result);
          if (societyDetails && this.isRelevantSociety(societyDetails, query)) {
            societies.push(societyDetails);
          }
        } catch (error) {
          this.logger.error(
            `Error converting text search result: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      }

      return societies;
    } catch (error) {
      this.logger.error(
        `Error in searchSocietiesFallback: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return [];
    }
  }

  /**
   * Convert Text Search API result to GooglePlaceSociety format
   */
  private async convertTextSearchResultToSociety(result: any): Promise<GooglePlaceSociety | null> {
    try {
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
        placeId: result.place_id,
        address: result.formatted_address,
      };
    } catch (error) {
      this.logger.error(
        `Error converting text search result: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return null;
    }
  }

  /**
   * Check if a place is a relevant society based on name and context
   */
  private isRelevantSociety(society: GooglePlaceSociety, query: string): boolean {
    const name = society.name.toLowerCase();
    const searchQuery = query.toLowerCase();
    
    // Keywords that indicate residential societies
    const societyKeywords = [
      'society', 'societies', 'residential', 'complex', 'apartment', 'villa',
      'colony', 'nagar', 'puram', 'enclave', 'heights', 'towers', 'park',
      'garden', 'green', 'city', 'town', 'phase', 'sector', 'block'
    ];
    
    // Check if the name contains society-related keywords
    const hasSocietyKeyword = societyKeywords.some(keyword => name.includes(keyword));
    
    // Check if the name contains the search query
    const containsQuery = name.includes(searchQuery);
    
    // Exclude obvious non-residential places
    const excludeKeywords = [
      'hospital', 'school', 'college', 'university', 'office', 'mall',
      'market', 'hotel', 'restaurant', 'bank', 'atm', 'pharmacy',
      'clinic', 'gym', 'salon', 'spa', 'garage', 'petrol', 'station'
    ];
    
    const hasExcludeKeyword = excludeKeywords.some(keyword => name.includes(keyword));
    
    return (hasSocietyKeyword || containsQuery) && !hasExcludeKeyword;
  }

  /**
   * Filter and deduplicate societies
   */
  private filterAndDeduplicateSocieties(societies: GooglePlaceSociety[]): GooglePlaceSociety[] {
    const uniqueSocieties = societies.reduce((acc, society) => {
      const existingSociety = acc.find(
        (s) => s.name.toLowerCase() === society.name.toLowerCase() ||
               (s.placeId && s.placeId === society.placeId)
      );
      if (!existingSociety) {
        acc.push(society);
      }
      return acc;
    }, [] as GooglePlaceSociety[]);

    return uniqueSocieties;
  }

  /**
   * Get city coordinates for location bias
   */
  private async getCityCoordinates(cityName: string): Promise<{ lat: number; lng: number } | null> {
    try {
      const geocodeUrl = `${this.baseUrl}/geocode/json`;
      const response = await axios.get(geocodeUrl, {
        params: {
          address: `${cityName}, India`,
          key: this.apiKey,
        },
      });

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location;
        return {
          lat: location.lat,
          lng: location.lng,
        };
      }

      return null;
    } catch (error) {
      this.logger.error(
        `Error getting city coordinates: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return null;
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
