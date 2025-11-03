# File Upload Using Presigned URLs

This guide explains how to use the presigned URL API to upload files directly to S3 from the client side.

## Overview

The presigned URL approach allows clients to upload files directly to S3 without passing file data through your backend server. This improves performance and reduces server load.

## API Endpoint

```
POST /uploads/presigned-url
```

**Authentication:** Bearer JWT Token required

**Request Body:**
```json
{
  "filename": "my-image.jpg",
  "contentType": "image/jpeg",
  "folder": "properties",      // optional, default: "uploads"
  "expiresIn": 3600            // optional, min: 60, max: 36000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Presigned URL generated successfully",
  "data": {
    "url": "https://bucket.s3.amazonaws.com/uploads/1234567890-abc123.jpg?signature=...",
    "key": "uploads/1234567890-abc123.jpg",
    "expiresIn": 3600
  }
}
```

## Usage Flow

1. **Generate Presigned URL** - Call the `/uploads/presigned-url` endpoint with file metadata
2. **Upload to S3** - Use the returned presigned URL to upload the file directly to S3 using a PUT request

## Example HTML Client

The `upload-sample.html` file demonstrates how to:
- Get a presigned URL from your API
- Upload a file directly to S3 using the presigned URL
- Handle errors and show upload progress

### Running the Sample

1. Open `upload-sample.html` in a web browser
2. Enter your API base URL (e.g., `http://localhost:3001`)
3. Enter your JWT authentication token
4. Select a file to upload
5. Click "Generate Presigned URL"
6. Click "Upload to S3"

## Example with cURL

### Step 1: Generate Presigned URL

```bash
curl -X POST http://localhost:3001/uploads/presigned-url \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "filename": "example.jpg",
    "contentType": "image/jpeg",
    "folder": "properties"
  }'
```

### Step 2: Upload File to S3

```bash
curl -X PUT "PRESIGNED_URL_FROM_STEP_1" \
  -H "Content-Type: image/jpeg" \
  --upload-file path/to/example.jpg
```

## Example with JavaScript/Fetch

```javascript
// Step 1: Generate presigned URL
const response = await fetch('http://localhost:3001/uploads/presigned-url', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${yourJwtToken}`
  },
  body: JSON.stringify({
    filename: file.name,
    contentType: file.type,
    folder: 'properties',
    expiresIn: 3600
  })
});

const { data } = await response.json();

// Step 2: Upload file to S3 using presigned URL
const uploadResponse = await fetch(data.url, {
  method: 'PUT',
  headers: {
    'Content-Type': file.type
  },
  body: file
});

if (uploadResponse.ok) {
  console.log('Upload successful!');
  console.log('File key:', data.key);
}
```

## Example with React

```jsx
import React, { useState } from 'react';

function FileUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);

    try {
      // Step 1: Get presigned URL
      const presignedResponse = await fetch('http://localhost:3001/uploads/presigned-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${yourJwtToken}`
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type
        })
      });

      const { data } = await presignedResponse.json();

      // Step 2: Upload to S3
      const uploadResponse = await fetch(data.url, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type
        },
        body: file
      });

      if (uploadResponse.ok) {
        alert('Upload successful!');
        console.log('File stored at:', data.key);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        onChange={(e) => setFile(e.target.files[0])}
        accept="image/*"
      />
      <button onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
}

export default FileUpload;
```

## Supported File Types

- `image/jpeg`
- `image/jpg`
- `image/png`
- `image/gif`
- `image/webp`

## Security Notes

1. **JWT Token Required:** All requests must include a valid JWT bearer token
2. **URL Expiration:** Presigned URLs expire after the specified time (default: 3600 seconds)
3. **Direct Upload:** Files are uploaded directly to S3, bypassing your server
4. **Unique Filenames:** The backend generates unique filenames to prevent collisions

## Error Handling

### Common Errors

**401 Unauthorized**
- Missing or invalid JWT token
- Token has expired

**400 Bad Request**
- Invalid file type
- Missing required fields
- Invalid `expiresIn` value (must be between 60-36000)

**500 Internal Server Error**
- AWS configuration issues
- S3 service unavailable

**Failed to Fetch / CORS Error**
- S3 bucket CORS not configured properly
- Network connectivity issues
- Blocked by browser security policies

### Troubleshooting Failed Uploads

If you get "Failed to fetch" when uploading to S3:

1. **Check Browser Console** - The sample HTML logs detailed error information
2. **Verify S3 CORS Configuration** - Your S3 bucket must allow PUT requests from your domain
3. **Check Network Tab** - See the actual HTTP request and response
4. **Verify Presigned URL** - Make sure the URL is valid and hasn't expired

#### S3 CORS Configuration

Your S3 bucket needs the following CORS configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

Or for development/testing:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

To configure CORS in AWS Console:
1. Go to your S3 bucket
2. Click on "Permissions" tab
3. Scroll to "Cross-origin resource sharing (CORS)"
4. Click "Edit"
5. Paste the JSON configuration
6. Save changes

## Benefits

✅ **Improved Performance** - Direct uploads to S3 reduce server load  
✅ **Reduced Bandwidth** - Files don't pass through your backend  
✅ **Scalable** - Can handle large file uploads efficiently  
✅ **Secure** - Presigned URLs expire after a set time  
✅ **Simple Integration** - Works with any HTTP client

## File Storage Structure

Files are stored in S3 with the following structure:
```
bucket/
  ├── uploads/
  │   └── 1703123456789-abc123def.jpg
  ├── properties/
  │   └── 1703123456789-xyz789ghi.jpg
  └── ...
```

Each filename includes:
- Timestamp in milliseconds
- Random 16-character hex string
- Original file extension

This ensures unique filenames and prevents collisions.

