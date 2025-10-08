export const MESSAGES = {
  FILE_UPLOAD: {
    SUCCESS: 'File uploaded successfully',
    NO_FILE: 'No file provided',
    INVALID_TYPE: 'Only PNG, JPG, and JPEG files are allowed',
    SIZE_EXCEEDED: 'File size exceeds 5MB limit',
    S3_UPLOAD_FAILED: 'Failed to upload file to S3',
    UNEXPECTED_ERROR: 'An unexpected error occurred while uploading the file',
  },
  FILE_DOWNLOAD: {
    SUCCESS: 'File downloaded successfully',
    NO_KEY: 'No file key provided',
    FILE_NOT_FOUND: 'File not found',
    S3_DOWNLOAD_FAILED: 'Failed to download file from S3',
    UNEXPECTED_ERROR: 'An unexpected error occurred while downloading the file',
  },
} as const; 