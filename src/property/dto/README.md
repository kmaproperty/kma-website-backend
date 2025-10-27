# Property API DTOs

This directory contains all Data Transfer Objects (DTOs) for the Property API endpoints.

## Files Overview

### Request DTOs

#### `create-property.dto.ts`
Contains DTOs for property creation:
- `CreatePropertyDto` - Main DTO for creating a new property
- `CityInfo` - City information (can be ID or name for new city creation)
- `SocietyInfo` - Society information (can be ID or name for new society creation)
- `LocalityInfo` - Locality information (can be ID or name for new locality creation)
- `BhkTypeInfo` - BHK type information (can be ID or name for new BHK type creation)
- `BuiltUpAreaInfo` - Built-up area information (can be ID or new area details)

#### `property-query.dto.ts`
Contains DTOs for query parameters:
- `MasterDataQueryDto` - Query parameters for master data endpoint
- `CitySearchQueryDto` - Query parameters for city search
- `SocietySearchQueryDto` - Query parameters for society search
- `LocalitySearchQueryDto` - Query parameters for locality search
- `BhkTypesQueryDto` - Query parameters for BHK types endpoint

### Response DTOs

#### `property-response.dto.ts`
Contains DTOs for API responses:
- `PropertyTypeResponseDto` - Property type information
- `CityResponseDto` - City search results
- `SocietyResponseDto` - Society search results
- `LocalityResponseDto` - Locality search results
- `BhkTypeResponseDto` - BHK type with built-up areas
- `BuiltUpAreaResponseDto` - Built-up area information
- `MasterDataResponseDto` - Master data response
- `ReseedMasterDataResponseDto` - Master data reseed response
- `PropertyResponseDto` - Created property response

## Usage

### Import DTOs
```typescript
import { 
  CreatePropertyDto, 
  CitySearchQueryDto, 
  PropertyResponseDto 
} from './dto';
```

### Validation
All DTOs include proper validation decorators:
- `@IsString()`, `@IsNumber()`, `@IsOptional()`, etc.
- `@Min()`, `@Max()` for numeric constraints
- `@IsEnum()` for enum validation
- `@ValidateNested()` for nested object validation

### Swagger Documentation
All DTOs include comprehensive Swagger decorators:
- `@ApiProperty()` with descriptions, examples, and constraints
- Proper type definitions for API documentation
- Required/optional field indicators

## API Endpoints Covered

1. **GET /properties/master/property-types** - Get filtered master data
2. **POST /properties/master/reseed** - Reseed master data
3. **GET /properties/cities/search** - Search cities
4. **GET /properties/societies/search** - Search societies
5. **GET /properties/localities/search** - Search localities
6. **GET /properties/bhk-types-and-areas/society/:societyId** - Get BHK types and areas
7. **POST /properties** - Create property

## Features

- **Flexible Input**: DTOs support both ID-based and name-based input for master data creation
- **Comprehensive Validation**: Input validation with proper error messages
- **Type Safety**: Full TypeScript support with proper typing
- **API Documentation**: Complete Swagger/OpenAPI documentation
- **Consistent Structure**: Standardized response format across all endpoints
- **Error Handling**: Proper error response DTOs and validation

## Examples

### Creating a Property
```typescript
const createPropertyDto: CreatePropertyDto = {
  listingTypeId: 'uuid-string',
  categoryId: 'uuid-string',
  propertyTypeId: 'uuid-string',
  bathrooms: 2,
  builtUpAreaSqFt: 1200,
  carpetAreaSqFt: 1000,
  ageOfProperty: 5,
  userId: 'uuid-string',
  city: { name: 'Gurgaon', state: 'Haryana' },
  society: { name: 'Green Park Society' },
  locality: { name: 'Sector 15' },
  bhkType: { name: '2 BHK' },
  builtUpArea: { superBuiltUpArea: 1200, carpetArea: 1000, noOfBathrooms: 2 }
};
```

### Searching Cities
```typescript
const citySearchQuery: CitySearchQueryDto = {
  q: 'Gurg',
  limit: 10
};
```
