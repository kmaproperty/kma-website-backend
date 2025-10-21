# City Search API Documentation

## Overview
The City Search API provides intelligent autocomplete functionality for cities. It searches your local database first, and if not enough results are found, it falls back to Google Places API to provide comprehensive results.

## Endpoint

```
GET /properties/cities/search
```

**Authentication:** Requires JWT token (Bearer authentication)

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | string | Yes | - | Search query (minimum 2 characters) |
| `limit` | number | No | 10 | Maximum number of results to return |

## Response Format

### Database Results
Cities from your local database include:
```json
{
  "id": "uuid",
  "name": "Gurgaon",
  "code": "gurgaon",
  "state": "Haryana",
  "latitude": 28.4595,
  "longitude": 77.0266,
  "source": "database"
}
```

### Google Places Results
Cities from Google Places API include:
```json
{
  "name": "Gurugram",
  "state": "Haryana",
  "country": "India",
  "latitude": 28.4595,
  "longitude": 77.0266,
  "placeId": "ChIJyZ...",
  "source": "google"
}
```

## Examples

### Example 1: Search for cities starting with "Gurg"

**Request:**
```bash
GET /properties/cities/search?q=Gurg&limit=5
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Gurgaon",
    "code": "gurgaon",
    "state": "Haryana",
    "latitude": 28.4595,
    "longitude": 77.0266,
    "source": "database"
  },
  {
    "name": "Gurugram",
    "state": "Haryana",
    "country": "India",
    "latitude": 28.4595,
    "longitude": 77.0266,
    "placeId": "ChIJyZ4H4m6AEl4RTsOcgBkx7gY",
    "source": "google"
  }
]
```

### Example 2: Search with cURL

```bash
curl -X GET "http://localhost:3000/properties/cities/search?q=Mum&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## How It Works

1. **Local Database Search**: First, the API searches your `master_cities` table for cities matching the query (case-insensitive, partial match)

2. **Google Places Fallback**: If fewer than 5 results are found locally, the API queries Google Places API for additional results

3. **Deduplication**: Results from both sources are combined and duplicates (based on city name) are removed

4. **Limit**: Returns up to the specified limit (default: 10 results)

## Setup

### 1. Add Google Maps API Key to Environment

Add the following to your `.env` file:

```env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 2. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - **Places API**
   - **Geocoding API** (optional, for additional features)
4. Create credentials (API Key)
5. Restrict the API key:
   - Application restrictions: HTTP referrers or IP addresses
   - API restrictions: Select "Places API" and "Geocoding API"

### 3. API Key Security

**Important:** Never commit your API key to version control!

- Add `.env` to `.gitignore`
- Use environment variables in production
- Consider using Google Cloud's Application Default Credentials for production

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Search query must be at least 2 characters long",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

## Implementation Details

### Search Priority
1. **Database First**: Fast, cached results from your local database
2. **Google Places Second**: Only called if local results < 5
3. **Combined & Deduplicated**: Both sources merged, duplicates removed

### Performance
- Local database search: ~10-50ms
- Google Places API: ~200-500ms (only when needed)
- Results are not cached (implement Redis cache for production if needed)

### Future Enhancements
Consider adding:
- Redis caching for Google Places results
- Ability to save Google results to local database
- Fuzzy matching for better local search
- Search by state/country filters
- Geolocation-based sorting (nearest cities first)

## API Rate Limits

**Google Places API Limits:**
- Free tier: $200 credit/month (~28,000 requests)
- After free tier: $17 per 1000 requests for Place Autocomplete
- See [Google Maps Platform Pricing](https://mapsplatform.google.com/pricing/)

**Recommendations:**
- Implement client-side debouncing (wait 300-500ms after user stops typing)
- Cache frequently searched cities
- Consider pagination for large result sets

## Testing

Test the endpoint without Google API key:
- The API will still work using only local database
- You'll see a warning in logs: "Google Maps API key not configured"
- Only database results will be returned

## Support

For issues or questions:
1. Check that `GOOGLE_MAPS_API_KEY` is set in `.env`
2. Verify the Google Places API is enabled in your Google Cloud project
3. Check application logs for detailed error messages
