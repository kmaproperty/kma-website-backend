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
  localityName?: string | null;
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
  type?: string; // 'locality', 'sublocality', 'neighbourhood'
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
  // async searchSocieties(
  //   query: string,
  //   cityName?: string,
  // ): Promise<GooglePlaceSociety[]> {
  //   if (!this.apiKey) {
  //     this.logger.warn(
  //       'Google Maps API key not configured - skipping Google API search',
  //     );
  //     return [];
  //   }

  //   try {
  //     const societies: GooglePlaceSociety[] = [];
      
  //     // Strategy 1: Search for residential areas and societies with specific types
  //     const residentialResults = await this.searchSocietiesByType(
  //       query,
  //       cityName,
  //       '(neighborhood|sublocality)',
  //       'residential'
  //     );
  //     societies.push(...residentialResults);

  //     // Strategy 2: Search for specific society keywords
  //     if (societies.length < 5) {
  //       const societyKeywordResults = await this.searchSocietiesWithKeywords(
  //         query,
  //         cityName
  //       );
  //       societies.push(...societyKeywordResults);
  //     }

  //     // Strategy 3: If we have city context, search for establishments with location bias
  //     if (cityName && societies.length < 5) {
  //       const establishmentResults = await this.searchSocietiesByType(
  //         query,
  //         cityName,
  //         'establishment',
  //         'society'
  //       );
  //       societies.push(...establishmentResults);
  //     }

  //     // Strategy 4: Fallback to broader search if still not enough results
  //     if (societies.length < 3) {
  //       const fallbackResults = await this.searchSocietiesFallback(
  //         query,
  //         cityName
  //       );
  //       societies.push(...fallbackResults);
  //     }

  //     // Remove duplicates and filter for relevant results
  //     const uniqueSocieties = this.filterAndDeduplicateSocieties(societies);
      
  //     return uniqueSocieties.slice(0, 5);
  //   } catch (error) {
  //     this.logger.error(
  //       `Error searching societies from Google: ${error instanceof Error ? error.message : 'Unknown error'}`,
  //     );
  //     return [];
  //   }
  // }

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
    
    let locationBias = '';
    if (cityName) {
      const cityCoords = await this.getCityCoordinates(cityName);
      if (cityCoords) {
        locationBias = `${cityCoords.lat},${cityCoords.lng}`;
      }
    }

    const autocompleteUrl = `${this.baseUrl}/autocomplete/json`;
    const params: any = {
      input: cityName ? `${query}, ${cityName}, India` : `${query}, India`,
      types: 'establishment',
      components: 'country:in',
      key: this.apiKey,
    };

    if (locationBias) {
      params.location = locationBias;
      params.radius = 25000;
    }

    const response = await axios.get(autocompleteUrl, { params });

    if (
      response.data.status === 'OK' &&
      response.data.predictions &&
      response.data.predictions.length > 0
    ) {
      for (const prediction of response.data.predictions.slice(0, 5)) {
        try {
          const placeDetails = await this.getSocietyDetails(prediction.place_id);
          if (placeDetails) {
            societies.push(placeDetails);
          }
        } catch (error) {
          this.logger.error(`Error fetching society details: ${error.message}`);
        }
      }
    }

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
   * Get place coordinates from Place Details API
   */
  private async getPlaceCoordinates(placeId: string): Promise<{ lat: number; lng: number } | null> {
    try {
      const detailsUrl = `${this.baseUrl}/details/json`;
      const response = await axios.get(detailsUrl, {
        params: {
          place_id: placeId,
          fields: 'geometry',
          key: this.apiKey,
        },
      });

      if (response.data.status === 'OK' && response.data.result?.geometry?.location) {
        const location = response.data.result.geometry.location;
        return {
          lat: location.lat,
          lng: location.lng,
        };
      }

      return null;
    } catch (error: any) {
      // Handle errors gracefully - don't log as this might happen frequently
      if (error.response?.status === 404 || error.response?.status === 400) {
        return null;
      }
      
      if (error.response?.status >= 500) {
        this.logger.error(
          `Error getting place coordinates for "${placeId}": ${error.response?.status} ${error.response?.statusText || error.message}`,
        );
      }
      
      return null;
    }
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

      // City not found or no results - this is expected in some cases
      return null;
    } catch (error: any) {
      // Handle 404 and other expected errors gracefully
      if (error.response?.status === 404 || error.response?.status === 400) {
        // City not found - this is expected, don't log as error
        return null;
      }
      
      // Only log unexpected errors
      if (error.response?.status >= 500) {
        this.logger.error(
          `Error getting city coordinates for "${cityName}": ${error.response?.status} ${error.response?.statusText || error.message}`,
        );
      } else {
        // Log warnings for client errors (4xx) that aren't 404/400
        this.logger.warn(
          `Could not get city coordinates for "${cityName}": ${error.response?.status || 'Unknown error'}`,
        );
      }
      
      return null;
    }
  }

  /**
   * Search for localities using Google Places Autocomplete API within a city
   */
  async searchLocalitiesAutocomplete(
    query: string,
    cityName: string,
    limit: number = 10,
  ): Promise<any[]> {
    if (!this.apiKey) {
      this.logger.warn(
        'Google Maps API key not configured - skipping Google API search',
      );
      return [];
    }

    if (!cityName || !query || query.trim().length < 2) {
      return [];
    }

    try {
      const startTime = Date.now();
      
      // Get city coordinates for location bias
      const cityCoords = await this.getCityCoordinates(cityName);
      if (!cityCoords) {
        this.logger.warn(`Could not get coordinates for city: ${cityName}`);
        // Try searching without location bias as fallback
        this.logger.warn(`Attempting search without location bias for: ${query} in ${cityName}`);
      }

      // Use Place Autocomplete API
      const autocompleteUrl = `${this.baseUrl}/autocomplete/json`;
      const params: any = {
        input: query.trim(),
        types: 'geocode',
        components: 'country:in',
        key: this.apiKey,
      };

      // Add location bias if we have city coordinates
      if (cityCoords) {
        // Increase radius to 30km for better results
        params.locationbias = `circle:30000@${cityCoords.lat},${cityCoords.lng}`;
      } else {
        // If no coordinates, try adding city to query
        params.input = `${query.trim()}, ${cityName}, India`;
      }

      this.logger.debug(`Searching localities with params:`, {
        input: params.input,
        cityName,
        locationbias: params.locationbias || 'none',
        hasCityCoords: !!cityCoords,
      });

      const response = await axios.get(autocompleteUrl, { params });

      this.logger.debug(`Google Places API response:`, {
        status: response.data.status,
        predictionsCount: response.data.predictions?.length || 0,
      });

      // Log first few predictions for debugging
      if (response.data.predictions && response.data.predictions.length > 0) {
        this.logger.debug(`First 3 predictions:`, 
          response.data.predictions.slice(0, 3).map((p: any) => ({
            description: p.description,
            types: p.types,
          }))
        );
      }

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
        this.logger.debug('No predictions returned from Google Places API');
        return [];
      }

      const took = Date.now() - startTime;

      // Process predictions - location bias already ensures results are near the city
      const localities: any[] = [];
      const cityNameLower = cityName.toLowerCase().trim();

      // Track duplicates using place_id and locality name (case-insensitive)
      const seenPlaceIds = new Set<string>();
      const seenLocalityNames = new Set<string>();

      // Process all predictions and include those that might be in the city
      // Location bias already prioritizes results within the city area
      let processedCount = 0;
      let skippedCount = 0;
      let duplicateCount = 0;
      
      // Process more predictions to account for filtering - aim for at least the limit
      const predictionsToProcess = Math.min(
        response.data.predictions.length,
        Math.max(limit * 10, 50) // Process at least 50 or limit*10, whichever is smaller
      );
      
      for (const prediction of response.data.predictions.slice(0, predictionsToProcess)) {
        processedCount++;
        const description = prediction.description || '';
        const descriptionLower = description.toLowerCase();
        
        // Extract locality name (first part before comma)
        const parts = description.split(',').map((p: string) => p.trim());
        const localityName = parts[0];
        const localityNameLower = localityName.toLowerCase();
        
        // Skip if locality name is the same as city name (might be a city-level result)
        if (localityNameLower === cityNameLower) {
          skippedCount++;
          this.logger.debug(`Skipping city-level result: ${localityName}`);
          continue;
        }

        // Check for duplicates by place_id
        if (prediction.place_id && seenPlaceIds.has(prediction.place_id)) {
          duplicateCount++;
          this.logger.debug(`Skipping duplicate by place_id: ${description}`);
          continue;
        }

        // Check for duplicates by locality name (case-insensitive)
        const localityKey = `${localityNameLower},${cityNameLower}`;
        if (seenLocalityNames.has(localityKey)) {
          duplicateCount++;
          this.logger.debug(`Skipping duplicate by name: ${localityName}, ${cityName}`);
          continue;
        }

        // Check if result is likely in the city (either in description or through location bias)
        // Be more lenient - if location bias is set, trust it completely
        // If location bias is set, include all results (location bias handles proximity)
        if (!cityCoords) {
          // Only filter by city name if we don't have location bias
          const hasCityInDescription = descriptionLower.includes(cityNameLower) || 
                                       descriptionLower.includes('gurgaon') || 
                                       descriptionLower.includes('gurugram');
          
          if (!hasCityInDescription) {
            skippedCount++;
            this.logger.debug(`Skipping result (no city match): ${description}`);
            continue;
          }
        }
        // If cityCoords exists, trust location bias - include all non-city-level results

        // Mark as seen
        if (prediction.place_id) {
          seenPlaceIds.add(prediction.place_id);
        }
        seenLocalityNames.add(localityKey);

        // Generate short UUID from place_id
        const uuid = prediction.place_id?.substring(0, 21).replace(/[^a-z0-9]/gi, '') || 
                     Math.random().toString(36).substring(2, 21);

        // Generate numeric ID
        const id = this.generateNumericId(uuid);

        // Fetch coordinates from Place Details API
        let latitude: number | undefined;
        let longitude: number | undefined;
        let lon_lat: [number, number] | undefined;

        if (prediction.place_id) {
          try {
            const coordinates = await this.getPlaceCoordinates(prediction.place_id);
            if (coordinates) {
              latitude = coordinates.lat;
              longitude = coordinates.lng;
              lon_lat = [longitude, latitude];
            }
          } catch (error) {
            this.logger.debug(`Could not fetch coordinates for ${prediction.place_id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }

        localities.push({
          id,
          name: `${localityName}, ${cityName}`,
          uuid,
          super_type: 'polygon',
          type: this.determineLocalityType(prediction.types || []),
          city_id: null,
          bounding_box_uuids: [],
          lon_lat,
          latitude,
          longitude,
          is_valid: true,
          took,
          full_name: description,
          displayName: `${localityName}, ${cityName}`,
          source: 'google',
          place_id: prediction.place_id,
        });

        // Stop when we have enough unique results
        if (localities.length >= limit) {
          break;
        }
      }

      // Return exactly up to the limit
      const finalResults = localities.slice(0, limit);
      
      this.logger.debug(`Processing complete: ${processedCount} processed, ${skippedCount} skipped, ${duplicateCount} duplicates, ${localities.length} found, returning ${finalResults.length}`);
      return finalResults;
    } catch (error) {
      this.logger.error(
        `Error searching localities from Google Autocomplete: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return [];
    }
  }

  /**
   * Generate numeric ID from string (helper function)
   */
  private generateNumericId(id: string): number {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      const char = id.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash) % 1000000;
  }

  /**
   * Determine locality type from prediction types
   */
  private determineLocalityType(types: string[]): string {
    if (types.includes('neighborhood')) {
      return 'neighbourhood';
    }
    if (types.some(t => t.includes('sublocality'))) {
      return 'sublocality';
    }
    if (types.includes('locality')) {
      return 'locality';
    }
    return 'locality'; // default
  }

  /**
   * Get city name variations for matching
   */
  private getCityNameVariations(cityName: string): string[] {
    const variations = [cityName];
    const parts = cityName.trim().split(' ');
    
    // Add first word (for multi-word cities)
    if (parts.length > 1) {
      variations.push(parts[0]);
    }
    
    // Add common variations
    if (cityName.toLowerCase() === 'gurgaon') {
      variations.push('Gurugram');
    }
    if (cityName.toLowerCase() === 'gurugram') {
      variations.push('Gurgaon');
    }
    if (cityName.toLowerCase() === 'mumbai') {
      variations.push('Bombay');
    }
    if (cityName.toLowerCase() === 'bombay') {
      variations.push('Mumbai');
    }
    
    return variations;
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
      // Use Place Autocomplete API for localities/neighborhoods
      const autocompleteUrl = `${this.baseUrl}/autocomplete/json`;
      
      // Get city coordinates for circular location bias if city is provided
      const params: any = {
        input: query.trim(),
        types: 'geocode',
        components: 'country:in', // Restrict to India
        key: this.apiKey,
      };
      
      // Add circular location bias if city coordinates are available
      if (cityName) {
        const cityCoords = await this.getCityCoordinates(cityName);
        if (cityCoords) {
          // Use circular location bias: circle:radius@lat,lng (15km = 15000m)
          params.locationbias = `circle:15000@${cityCoords.lat},${cityCoords.lng}`;
          this.logger.debug(
            `Using location bias for city ${cityName}: ${params.locationbias}`,
          );
        } else {
          this.logger.warn(`Could not get coordinates for city: ${cityName}`);
        }
      }
      
      this.logger.debug(`Searching localities with params:`, {
        input: params.input,
        cityName,
        hasLocationBias: !!params.locationbias,
      });
      
      const response = await axios.get(autocompleteUrl, { params });
      
      this.logger.debug(`Google Places API response status: ${response.data.status}, predictions: ${response.data.predictions?.length || 0}`);

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

      // Get details for each prediction to validate and extract locality information
      const localities: GooglePlaceLocality[] = [];
      
      // Process up to 15 predictions to account for filtering
      const predictionsToProcess = response.data.predictions.slice(0, 15);

      for (const prediction of predictionsToProcess) {
        try {
          const placeDetails = await this.getLocalityDetails(
            prediction.place_id,
          );
          // placeDetails will only be returned if it's a valid locality type
          // This validation happens inside getLocalityDetails
          if (placeDetails) {
            localities.push(placeDetails);
            this.logger.debug(
              `Found valid locality: ${placeDetails.name}, type: ${placeDetails.type}`,
            );
            // Stop if we have enough valid localities
            if (localities.length >= 10) {
              break;
            }
          } else {
            this.logger.debug(
              `Place ${prediction.place_id} (${prediction.description}) is not a valid locality type`,
            );
          }
        } catch (error) {
          this.logger.error(
            `Error fetching locality details for ${prediction.place_id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      }
      
      this.logger.debug(`Found ${localities.length} valid localities after processing ${predictionsToProcess.length} predictions`);

      // Filter by city if cityName was provided (ensure results match the city)
      let filteredLocalities = localities;
      if (cityName) {
        const cityNameLower = cityName.toLowerCase().trim();
        const beforeFilter = filteredLocalities.length;
        filteredLocalities = localities.filter((locality) => {
          // Check if locality city matches the requested city (case-insensitive)
          if (locality.city) {
            return locality.city.toLowerCase().trim() === cityNameLower;
          }
          // If no city in locality, check if it's mentioned in the address
          if (locality.address) {
            return locality.address.toLowerCase().includes(cityNameLower);
          }
          return false;
        });
        this.logger.debug(
          `Filtered by city ${cityName}: ${beforeFilter} -> ${filteredLocalities.length} localities`,
        );
      }

      const finalResults = filteredLocalities.slice(0, 5);
      this.logger.debug(`Returning ${finalResults.length} final localities`);
      
      return finalResults;
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

      // Extract city, state, country, and locality from address components
      let city = '';
      let state = '';
      let country = '';
      let localityName = '';

      for (const component of addressComponents) {
        // Debug log to see what types are available
        this.logger.debug(`Address component types: ${component.types.join(', ')}`);
        
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
        
        // Extract sublocality, neighborhood, or area for locality name
        // Check for various possible types
        if (
          component.types.includes('sublocality') ||
          component.types.includes('sublocality_level_1') ||
          component.types.includes('sublocality_level_2') ||
          component.types.includes('neighborhood') ||
          component.types.includes('premise') ||
          component.types.includes('route')
        ) {
          // Prefer sublocality over route for localityName
          if (!localityName || component.types.includes('sublocality') || component.types.includes('sublocality_level_1') || component.types.includes('sublocality_level_2')) {
            localityName = component.long_name;
          }
        }
      }

      // If localityName is still empty, try to extract from formatted address
      // Look for common locality patterns like "Sector XX", "Phase X", etc.
      if (!localityName && result.formatted_address) {
        const addr = result.formatted_address;
        // Try to match patterns like "Sector 24", "Phase 3", "Block X", etc.
        const localityPatterns = [
          /(Sector\s+\d+)/i,
          /(Phase\s+\d+)/i,
          /(Block\s+[A-Z0-9]+)/i,
          /(Ward\s+\d+)/i,
        ];
        
        for (const pattern of localityPatterns) {
          const match = addr.match(pattern);
          if (match) {
            localityName = match[1];
            break;
          }
        }
      }

      return {
        name: result.name,
        localityName: localityName || null,
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
          fields: 'name,geometry,address_components,formatted_address,types',
          key: this.apiKey,
        },
      });

      if (response.data.status !== 'OK') {
        return null;
      }

      const result = response.data.result;
      
      // Validate that this place is of type locality, sublocality, or neighborhood
      // IMPORTANT: Exclude city-level localities (like Secunderabad) - only include neighborhoods/sublocalities within cities
      const validTypes = ['sublocality', 'sublocality_level_1', 'sublocality_level_2', 'neighborhood'];
      const cityLevelTypes = ['administrative_area_level_1', 'administrative_area_level_2', 'political'];
      
      let placeType: string | null = null;
      let isCityLevel = false;
      
      if (result.types && Array.isArray(result.types)) {
        // First check if this is a city-level result (exclude these)
        if (result.types.some((type: string) => 
          cityLevelTypes.some(cityType => type === cityType || type.includes('administrative_area'))
        )) {
          // If it has administrative_area types, it's likely a city itself
          // Only exclude if it doesn't have sublocality/neighborhood types
          const hasLocalityType = result.types.some((type: string) => 
            validTypes.includes(type) || type === 'locality'
          );
          
          if (!hasLocalityType) {
            // This is a city, not a locality within a city - exclude it
            isCityLevel = true;
          }
        }
        
        // Find the primary type (prefer sublocality/neighborhood over locality)
        // Only use 'locality' if we have sublocality/neighborhood, otherwise it might be a city
        for (const type of ['sublocality', 'sublocality_level_1', 'sublocality_level_2', 'neighborhood', 'locality']) {
          if (result.types.includes(type)) {
            // If it's 'locality' type, check if it's NOT a city-level result
            if (type === 'locality') {
              // Only accept 'locality' if it has sublocality/neighborhood context or doesn't have city-level indicators
              const hasSublocality = result.types.some(t => t.includes('sublocality'));
              const hasNeighborhood = result.types.includes('neighborhood');
              
              if (isCityLevel && !hasSublocality && !hasNeighborhood) {
                // This is likely a city itself, skip it
                continue;
              }
              
              placeType = type;
            } else if (type === 'sublocality_level_1' || type === 'sublocality_level_2') {
              placeType = 'sublocality';
            } else if (type === 'neighborhood') {
              placeType = 'neighbourhood'; // Housing.com uses 'neighbourhood' spelling
            } else {
              placeType = type;
            }
            break;
          }
        }
        
        if (!placeType || isCityLevel) {
          // Not a locality/sublocality/neighborhood, or it's a city - skip it
          return null;
        }
      } else {
        // No types available, skip it
        return null;
      }
      
      const addressComponents = result.address_components || [];

      // Additional check: Make sure this is NOT a city itself
      // If address_components has 'locality' but no 'sublocality' or 'neighborhood', 
      // and it has administrative_area_level_2, it might be a city
      const hasParentCity = addressComponents.some((comp: any) => 
        comp.types.includes('administrative_area_level_2') || 
        (comp.types.includes('locality') && comp.types.length > 1)
      );
      
      // Check if this result represents a city (has locality but might be the city itself)
      const isLikelyCity = addressComponents.some((comp: any) => 
        comp.types.includes('locality') && 
        !comp.types.includes('sublocality') &&
        !comp.types.includes('neighborhood') &&
        comp.types.some((t: string) => t.includes('administrative'))
      );
      
      if (isLikelyCity && !hasParentCity) {
        // This is likely a city itself, not a locality within a city - exclude it
        return null;
      }

      // Extract city, state and country from address components
      let city = '';
      let state = '';
      let country = '';
      let localityName = '';

      for (const component of addressComponents) {
        // Get city from administrative_area_level_2 (parent city), not from locality (which might be the place itself)
        if (component.types.includes('administrative_area_level_2')) {
          city = component.long_name;
        } else if (
          component.types.includes('locality') &&
          !component.types.includes('sublocality') &&
          !component.types.includes('neighborhood')
        ) {
          // Only use locality as city if it's not a sublocality/neighborhood
          // This handles cases where the component is actually a parent city
          if (!city) {
            city = component.long_name;
          }
        }
        if (component.types.includes('administrative_area_level_1')) {
          state = component.long_name;
        }
        if (component.types.includes('country')) {
          country = component.long_name;
        }
        
        // Extract sublocality, neighborhood, or area for locality name
        // Check for various possible types that represent localities
        if (
          component.types.includes('sublocality') ||
          component.types.includes('sublocality_level_1') ||
          component.types.includes('sublocality_level_2') ||
          component.types.includes('neighborhood') ||
          component.types.includes('political')
        ) {
          // Prefer sublocality over other types for locality name
          if (!localityName || 
              component.types.includes('sublocality') || 
              component.types.includes('sublocality_level_1') || 
              component.types.includes('sublocality_level_2')) {
            localityName = component.long_name;
          }
        }
      }

      // If localityName is still empty, try to extract from formatted address
      // Look for common locality patterns like "Sector XX", "Phase X", etc.
      if (!localityName && result.formatted_address) {
        const addr = result.formatted_address;
        // Try to match patterns like "Sector 24", "Phase 3", "Block X", etc.
        const localityPatterns = [
          /(Sector\s+\d+)/i,
          /(Phase\s+\d+)/i,
          /(Block\s+[A-Z0-9]+)/i,
          /(Ward\s+\d+)/i,
          /(([A-Z][a-z]+\s+)?Nagar)/i,
          /(([A-Z][a-z]+\s+)?Puram)/i,
          /(([A-Z][a-z]+\s+)?Enclave)/i,
        ];
        
        for (const pattern of localityPatterns) {
          const match = addr.match(pattern);
          if (match) {
            localityName = match[1];
            break;
          }
        }
      }

      // Use extracted locality name or fall back to place name
      const finalLocalityName = localityName || result.name;

      return {
        name: finalLocalityName,
        city,
        state,
        country,
        latitude: result.geometry?.location?.lat,
        longitude: result.geometry?.location?.lng,
        placeId,
        address: result.formatted_address,
        type: placeType, // 'locality', 'sublocality', or 'neighbourhood'
      };
    } catch (error) {
      this.logger.error(
        `Error getting locality details: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return null;
    }
  }

  /**
   * Search for nearby cities using Google Places Nearby Search API
   * Returns cities within 10-15 km radius of the given coordinates
   */
  async searchNearbyCities(
    latitude: number,
    longitude: number,
    radius: number = 15000, // 15km in meters
  ): Promise<GooglePlaceCity[]> {
    if (!this.apiKey) {
      this.logger.warn(
        'Google Maps API key not configured - skipping Google API search',
      );
      return [];
    }

    try {
      const nearbySearchUrl = `${this.baseUrl}/nearbysearch/json`;
      const response = await axios.get(nearbySearchUrl, {
        params: {
          location: `${latitude},${longitude}`,
          radius: radius,
          type: '(cities)',
          key: this.apiKey,
        },
      });

      if (
        response.data.status !== 'OK' &&
        response.data.status !== 'ZERO_RESULTS'
      ) {
        this.logger.error(
          `Google Places Nearby Search API error: ${response.data.status}`,
        );
        return [];
      }

      if (
        !response.data.results ||
        response.data.results.length === 0
      ) {
        return [];
      }

      const cities: GooglePlaceCity[] = [];

      // Process each result
      for (const result of response.data.results) {
        try {
          // Extract city information from the result
          const cityName = this.extractCityNameFromResult(result);
          if (!cityName) {
            continue;
          }

          // Get place details for more information
          const placeDetails = await this.getPlaceDetails(result.place_id);
          if (placeDetails) {
            cities.push(placeDetails);
          } else {
            // Fallback: use basic info from nearby search result
            const addressComponents = result.address_components || [];
            const cityComponent = addressComponents.find(
              (component: any) =>
                component.types.includes('locality') ||
                component.types.includes('administrative_area_level_2'),
            );
            const stateComponent = addressComponents.find((component: any) =>
              component.types.includes('administrative_area_level_1'),
            );
            const countryComponent = addressComponents.find((component: any) =>
              component.types.includes('country'),
            );

            if (cityComponent) {
              cities.push({
                name: cityComponent.long_name,
                state: stateComponent?.long_name,
                country: countryComponent?.long_name || 'India',
                latitude: result.geometry?.location?.lat,
                longitude: result.geometry?.location?.lng,
                placeId: result.place_id,
              });
            }
          }
        } catch (error) {
          this.logger.error(
            `Error processing nearby city result: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      }

      // Remove duplicates based on placeId or name
      const uniqueCities = this.deduplicateCities(cities);

      this.logger.debug(
        `Found ${uniqueCities.length} nearby cities within ${radius / 1000}km`,
      );

      return uniqueCities.slice(0, 15); // Limit to 15 cities
    } catch (error) {
      this.logger.error(
        `Error searching nearby cities from Google: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return [];
    }
  }

  /**
   * Extract city name from Google Places API result
   */
  private extractCityNameFromResult(result: any): string | null {
    const addressComponents = result.address_components || [];
    const cityComponent = addressComponents.find(
      (component: any) =>
        component.types.includes('locality') ||
        component.types.includes('administrative_area_level_2'),
    );
    return cityComponent?.long_name || result.name || null;
  }

  /**
   * Search for nearby places of a specific type (schools, hospitals, gyms, restaurants, etc.)
   * Used by the property detail page "Locality" section
   */
  async searchNearbyPlaces(
    latitude: number,
    longitude: number,
    type: string,
    radius: number = 2000, // 2km default
  ): Promise<{ name: string; distance: string; address: string | null }[]> {
    if (!this.apiKey) {
      this.logger.warn('Google Maps API key not configured - returning empty nearby places');
      return [];
    }

    // Map frontend type labels to Google Places API types
    const typeMap: Record<string, string> = {
      school: 'school',
      hospital: 'hospital',
      clinic: 'doctor',
      gym: 'gym',
      gym_fitness: 'gym',
      restaurant: 'restaurant',
      bus_stop: 'bus_station',
      pharmacy: 'pharmacy',
    };
    const googleType = typeMap[type.toLowerCase()] || type.toLowerCase();

    try {
      const nearbySearchUrl = `${this.baseUrl}/nearbysearch/json`;
      const response = await axios.get(nearbySearchUrl, {
        params: {
          location: `${latitude},${longitude}`,
          radius,
          type: googleType,
          key: this.apiKey,
        },
      });

      if (
        response.data.status !== 'OK' &&
        response.data.status !== 'ZERO_RESULTS'
      ) {
        this.logger.error(`Google Places Nearby Search error: ${response.data.status}`);
        return [];
      }

      const results = response.data.results || [];

      return results.slice(0, 10).map((place: any) => {
        // Calculate approximate distance using Haversine
        const placeLat = place.geometry?.location?.lat;
        const placeLng = place.geometry?.location?.lng;
        let distanceStr = '';
        if (placeLat && placeLng) {
          const R = 6371;
          const dLat = ((placeLat - latitude) * Math.PI) / 180;
          const dLon = ((placeLng - longitude) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((latitude * Math.PI) / 180) *
              Math.cos((placeLat * Math.PI) / 180) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const distKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          distanceStr = distKm < 1
            ? `${Math.round(distKm * 1000)}m`
            : `${distKm.toFixed(1)}km`;
        }

        return {
          name: place.name,
          distance: distanceStr,
          address: place.vicinity || null,
        };
      });
    } catch (error) {
      this.logger.error(
        `Error fetching nearby places: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return [];
    }
  }

  /**
   * Remove duplicate cities based on placeId or name
   */
  private deduplicateCities(cities: GooglePlaceCity[]): GooglePlaceCity[] {
    const seen = new Set<string>();
    return cities.filter((city) => {
      const key = city.placeId || city.name?.toLowerCase() || '';
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
}
