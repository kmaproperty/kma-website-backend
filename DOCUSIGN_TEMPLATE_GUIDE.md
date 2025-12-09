# DocuSign Template Setup Guide

This guide explains how to create a reusable DocuSign template from your document and use it for all future signing requests. Using templates is more efficient than uploading the document each time.

## Overview

The system supports two methods for sending documents:
1. **Template-based** (Recommended): Create a template once, reuse it for all signing requests
2. **Document-based**: Upload the document each time (fallback if no template is configured)

## Prerequisites

1. Ensure your DocuSign credentials are configured in environment variables:
   - `DOCUSIGN_INTEGRATOR_KEY`
   - `DOCUSIGN_USER_ID`
   - `DOCUSIGN_ACCOUNT_ID`
   - `DOCUSIGN_BASE_PATH` (optional, defaults to demo environment)
   - `DOCUSIGN_PRIVATE_KEY` or `DOCUSIGN_PRIVATE_KEY_PATH`
   - `DOCUSIGN_CHANNEL_PARTNER_AGREEMENT_PATH` (path to your PDF document)

2. Have your PDF document ready at the configured path

## Step-by-Step Instructions

### Step 1: Create the Template (One-Time Setup)

Create a DocuSign template from your PDF document using the API endpoint:

**Endpoint:** `POST /users/docusign/create-template`

**Authentication:** Bearer token required

**Request Body:**
```json
{
  "templateName": "Channel Partner Agreement Template"
}
```

**Example using cURL:**
```bash
curl -X POST http://localhost:3000/users/docusign/create-template \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "templateName": "Channel Partner Agreement Template"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Template created successfully",
  "templateId": "abc123-def456-ghi789",
  "instructions": "Save this template ID to DOCUSIGN_TEMPLATE_ID environment variable..."
}
```

### Step 2: Save the Template ID

Copy the `templateId` from the response and add it to your environment variables:

**Add to your `.env` file:**
```env
DOCUSIGN_TEMPLATE_ID=abc123-def456-ghi789
```

**Or set as environment variable:**
```bash
export DOCUSIGN_TEMPLATE_ID=abc123-def456-ghi789
```

### Step 3: Restart Your Application

After setting the `DOCUSIGN_TEMPLATE_ID` environment variable, restart your application so it picks up the new configuration.

### Step 4: Use the Template for Signing

Once the template ID is configured, all future calls to create envelopes will automatically use the template instead of uploading the document each time.

**Endpoint:** `POST /users/docusign/channel-partner-agreement`

**Request Body:**
```json
{
  "recipientEmail": "user@example.com",
  "recipientName": "John Doe",
  "returnUrl": "https://yourapp.com/signing-complete"
}
```

The system will automatically:
1. Check if `DOCUSIGN_TEMPLATE_ID` is configured
2. If yes, use the template-based method (`createEnvelopeFromTemplate`)
3. If no, fall back to document upload method (`createEnvelope`)

## How It Works

### Template-Based Flow (When Template ID is Configured)

1. **Template Creation** (one-time):
   - PDF is uploaded to DocuSign
   - Signing fields (tabs) are positioned
   - Template is saved with a unique ID

2. **Envelope Creation** (each signing request):
   - Template ID is used to create a new envelope
   - Recipient information is assigned to template roles
   - No document upload needed - faster and more efficient

### Document-Based Flow (Fallback)

If no template ID is configured:
- PDF is read from file system
- Document is uploaded to DocuSign for each envelope
- Signing fields are positioned programmatically
- Works but is less efficient

## Benefits of Using Templates

1. **Performance**: No need to upload the document for each signing request
2. **Consistency**: Document and field positions are fixed in the template
3. **Efficiency**: Faster envelope creation
4. **Maintenance**: Update the template in DocuSign dashboard if needed (without code changes)

## Updating the Template

If you need to update the document or field positions:

1. **Option 1**: Update the template directly in DocuSign dashboard
   - Log in to DocuSign
   - Navigate to Templates
   - Edit your template
   - Changes apply to all future envelopes

2. **Option 2**: Create a new template
   - Follow Step 1 again with a new template name
   - Update `DOCUSIGN_TEMPLATE_ID` with the new template ID
   - Restart the application

## Troubleshooting

### Template Not Being Used

**Issue:** System still uploads documents instead of using template

**Solution:**
1. Verify `DOCUSIGN_TEMPLATE_ID` is set correctly
2. Check application logs for template usage messages
3. Restart the application after setting the environment variable

### Template Creation Fails

**Issue:** Error when creating template

**Possible Causes:**
1. PDF file not found at `DOCUSIGN_CHANNEL_PARTNER_AGREEMENT_PATH`
2. DocuSign authentication failed
3. Invalid PDF format

**Solution:**
1. Verify PDF path is correct
2. Check DocuSign credentials
3. Ensure PDF is valid and readable

### File Path Not Found Error

**Issue:** `Channel Partner Agreement file not found at path: /resume.pdf`

**Cause:** The environment variable `DOCUSIGN_CHANNEL_PARTNER_AGREEMENT_PATH` is set to an absolute path starting with `/` (filesystem root) instead of a relative path or correct absolute path.

**Solution:**
1. **Option 1 - Use relative path (Recommended):**
   ```env
   DOCUSIGN_CHANNEL_PARTNER_AGREEMENT_PATH=resume.pdf
   ```
   This will look for the file in the project root directory.

2. **Option 2 - Use full absolute path:**
   ```env
   DOCUSIGN_CHANNEL_PARTNER_AGREEMENT_PATH=/Users/paras.gambhir/Documents/GitHub/kma-website-backend/resume.pdf
   ```
   Use the complete absolute path to your PDF file.

3. **Option 3 - Don't set the variable:**
   If you don't set `DOCUSIGN_CHANNEL_PARTNER_AGREEMENT_PATH`, it will default to `resume.pdf` in the project root.

**Note:** The file `resume.pdf` should exist in your project root directory. Check the application logs to see which paths were tried.

### Signing Fields Not Positioned Correctly

**Issue:** Sign here tabs are in wrong location

**Solution:**
1. Update the template in DocuSign dashboard to reposition fields
2. Or modify the `xPosition` and `yPosition` values in `createTemplate()` method and recreate the template

## Code Reference

The template functionality is implemented in:
- **Service:** `src/user/services/docusign.service.ts`
  - `createTemplate()` - Creates template from PDF
  - `createEnvelopeFromTemplate()` - Creates envelope using template
  - `createChannelPartnerAgreementEnvelope()` - Main method that chooses template or document upload

- **Controller:** `src/user/user.controller.ts`
  - `POST /users/docusign/create-template` - Template creation endpoint
  - `POST /users/docusign/channel-partner-agreement` - Envelope creation endpoint

## Environment Variables Summary

```env
# Required for DocuSign integration
DOCUSIGN_INTEGRATOR_KEY=your_integrator_key
DOCUSIGN_USER_ID=your_user_id
DOCUSIGN_ACCOUNT_ID=your_account_id
DOCUSIGN_BASE_PATH=https://demo.docusign.net/restapi  # or production URL
DOCUSIGN_PRIVATE_KEY_PATH=./pem/private_key.pem  # or use DOCUSIGN_PRIVATE_KEY

# Document path
DOCUSIGN_CHANNEL_PARTNER_AGREEMENT_PATH=./path/to/agreement.pdf

# Template ID (set after creating template)
DOCUSIGN_TEMPLATE_ID=your_template_id_here
```

## Next Steps

1. Create your template using the API endpoint
2. Save the template ID to environment variables
3. Restart your application
4. Start using the template-based signing for all new envelopes

The system will automatically use the template for all future signing requests, making the process faster and more efficient!

