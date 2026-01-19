import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../../common/config/config.service';
import axios from 'axios';

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.openai.com/v1';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.getOpenAIApiKey();
    if (!this.apiKey) {
      this.logger.warn('OpenAI API key is not configured');
    }
  }

  /**
   * Generate property description using ChatGPT
   */
  async generatePropertyDescription(
    propertyData: Record<string, any>,
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    try {
      // Build a comprehensive prompt with property details
      const prompt = this.buildPropertyDescriptionPrompt(propertyData);

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'gpt-4o-mini', // Using gpt-4o-mini for cost efficiency, can be changed to gpt-4 or gpt-3.5-turbo
          messages: [
            {
              role: 'system',
              content:
                'You are a professional real estate description writer. Create compelling, accurate, and detailed property descriptions based on the provided information. The description should be professional, engaging, and highlight key features and amenities.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 500,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const description =
        response.data.choices[0]?.message?.content?.trim() || '';

      if (!description) {
        throw new Error('Empty response from OpenAI API');
      }

      return description;
    } catch (error) {
      this.logger.error('Error calling OpenAI API', error);
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.error?.message ||
          error.message ||
          'Failed to generate description';
        throw new Error(`OpenAI API error: ${errorMessage}`);
      }
      throw error;
    }
  }

  /**
   * Build a comprehensive prompt from property data
   */
  private buildPropertyDescriptionPrompt(
    propertyData: Record<string, any>,
  ): string {
    const parts: string[] = [];

    parts.push('Generate a professional property description based on the following details:\n\n');

    // Basic Information
    if (propertyData.bhkType) {
      parts.push(`BHK Type: ${propertyData.bhkType}\n`);
    }
    if (propertyData.propertyType) {
      parts.push(`Property Type: ${propertyData.propertyType}\n`);
    }
    if (propertyData.furnishType) {
      parts.push(`Furnish Type: ${propertyData.furnishType}\n`);
    }

    // Location
    const locationParts: string[] = [];
    if (propertyData.society) locationParts.push(propertyData.society);
    if (propertyData.locality) locationParts.push(propertyData.locality);
    if (propertyData.city) locationParts.push(propertyData.city);
    if (locationParts.length > 0) {
      parts.push(`Location: ${locationParts.join(', ')}\n`);
    }

    // Area Details
    if (propertyData.superBuiltUpArea) {
      parts.push(`Super Built-up Area: ${propertyData.superBuiltUpArea} sq ft\n`);
    }
    if (propertyData.carpetArea) {
      parts.push(`Carpet Area: ${propertyData.carpetArea} sq ft\n`);
    }

    // Room Details
    if (propertyData.bedrooms) {
      parts.push(`Bedrooms: ${propertyData.bedrooms}\n`);
    }
    if (propertyData.bathrooms) {
      parts.push(`Bathrooms: ${propertyData.bathrooms}\n`);
    }
    if (propertyData.balconies) {
      parts.push(`Balconies: ${propertyData.balconies}\n`);
    }

    // Floor Details
    if (propertyData.floorNumber !== null && propertyData.totalFloors !== null) {
      parts.push(`Floor: ${propertyData.floorNumber} of ${propertyData.totalFloors}\n`);
    } else if (propertyData.floorNumber !== null) {
      parts.push(`Floor: ${propertyData.floorNumber}\n`);
    }

    if (propertyData.flatNumber) {
      parts.push(`Unit Number: ${propertyData.flatNumber}\n`);
    }
    if (propertyData.towerBlock) {
      parts.push(`Tower/Block: ${propertyData.towerBlock}\n`);
    }

    // Additional Rooms
    if (propertyData.additionalRooms && propertyData.additionalRooms.length > 0) {
      parts.push(`Additional Rooms: ${propertyData.additionalRooms.join(', ')}\n`);
    }

    // Parking
    if (propertyData.reservedParkingCovered || propertyData.reservedParkingOpen) {
      const parkingParts: string[] = [];
      if (propertyData.reservedParkingCovered) {
        parkingParts.push(`${propertyData.reservedParkingCovered} covered`);
      }
      if (propertyData.reservedParkingOpen) {
        parkingParts.push(`${propertyData.reservedParkingOpen} open`);
      }
      parts.push(`Parking: ${parkingParts.join(', ')} spaces\n`);
    }

    // Power Backup
    if (propertyData.powerBackup) {
      parts.push(`Power Backup: ${propertyData.powerBackup}\n`);
    }

    // Commercial Space Details
    if (propertyData.minNumberOfSeats !== null || propertyData.maxNumberOfSeats !== null) {
      if (propertyData.minNumberOfSeats !== null && propertyData.maxNumberOfSeats !== null) {
        parts.push(`Seating Capacity: ${propertyData.minNumberOfSeats}-${propertyData.maxNumberOfSeats}\n`);
      } else if (propertyData.maxNumberOfSeats !== null) {
        parts.push(`Seating Capacity: Up to ${propertyData.maxNumberOfSeats}\n`);
      } else if (propertyData.minNumberOfSeats !== null) {
        parts.push(`Seating Capacity: At least ${propertyData.minNumberOfSeats}\n`);
      }
    }

    if (propertyData.numberOfCabins) {
      parts.push(`Cabins: ${propertyData.numberOfCabins}\n`);
    }
    if (propertyData.numberOfMeetingRooms) {
      parts.push(`Meeting Rooms: ${propertyData.numberOfMeetingRooms}\n`);
    }
    if (propertyData.conferenceRoom) {
      parts.push(`Conference Rooms: ${propertyData.conferenceRoom}\n`);
    }
    if (propertyData.receptionArea === 'yes') {
      parts.push(`Reception Area: Available\n`);
    }

    // Furnishings
    if (propertyData.furnishingsCounts && propertyData.furnishingsCounts.length > 0) {
      const furnishings = propertyData.furnishingsCounts
        .filter((fc: any) => (fc.count ?? 0) > 0)
        .map((fc: any) => `${fc.count} ${fc.item}`)
        .join(', ');
      if (furnishings) {
        parts.push(`Furnishings: ${furnishings}\n`);
      }
    }

    // Amenities
    if (propertyData.amenities && propertyData.amenities.length > 0) {
      parts.push(`Amenities: ${propertyData.amenities.join(', ')}\n`);
    }

    // Age and Construction
    if (propertyData.ageOfProperty !== null) {
      parts.push(`Age: ${propertyData.ageOfProperty} year${propertyData.ageOfProperty > 1 ? 's' : ''}\n`);
    }
    if (propertyData.constructionStatus) {
      parts.push(`Construction Status: ${propertyData.constructionStatus}\n`);
    }
    if (propertyData.facing) {
      parts.push(`Facing: ${propertyData.facing}\n`);
    }
    if (propertyData.transactionType) {
      parts.push(`Transaction Type: ${propertyData.transactionType}\n`);
    }

    // Pricing
    if (propertyData.monthlyRent) {
      parts.push(`Monthly Rent: ₹${propertyData.monthlyRent.toLocaleString('en-IN')}\n`);
    }
    if (propertyData.price) {
      parts.push(`Price: ₹${propertyData.price.toLocaleString('en-IN')}\n`);
    }

    // Possession
    if (propertyData.possessionStatus === 'immediate') {
      parts.push(`Possession: Immediate\n`);
    } else if (propertyData.possessionStatus === 'future' && propertyData.possessionDate) {
      parts.push(`Possession: ${propertyData.possessionDate}\n`);
    }

    // Utilities
    if (propertyData.waterSource) {
      parts.push(`Water Source: ${propertyData.waterSource}\n`);
    }
    if (propertyData.isLiftAvailable === true) {
      parts.push(`Lift: Available\n`);
    }

    parts.push(
      '\nGenerate a professional, engaging property description (2-4 sentences) that highlights the key features and amenities. Make it appealing to potential buyers/renters.',
    );

    return parts.join('');
  }
}

