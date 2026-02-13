# KMA API – Postman Collection

This collection is generated from the Swagger documentation and grouped by area:

| Folder | Description |
|--------|-------------|
| **Home Page** | Health check, session, home cities, top properties/cities, reviews, about us, master data, configurations |
| **End User - Auth** | Signup, verify OTP, login, verify login OTP |
| **End User - Profile & Session** | Profile get/update, change mobile, activity counts |
| **End User - Properties** | Search, count, similar, details, contact, rating/reviews, media |
| **End User - Favorites** | Add, remove, list, check favorite |
| **End User - Contact Us & KMA Review** | Contact us OTP/submit, KMA rating review |
| **End User - Channel Partners** | List channel partners, get details |
| **User Management - Auth** | Send OTP (signup/login), validate OTP, resend, refresh token, logout |
| **User Management - Create User** | Create owner, channel partner, end user; upgrade to channel partner |
| **User Management - Profile & Verification** | Profile, profile pic, verification (live photo, Aadhaar, bank), dashboard, cities, leads |
| **User Management - DocuSign** | Channel partner agreement, templates, agreements, webhook |
| **Admin - Auth** | Bootstrap admin, admin login |
| **Admin - Properties** | List, top, get, approve, reject, verify, update, delete, mark/remove top |
| **Admin - Master Data** | Cities, rooms, societies, BHKs, localities, furnishings, amenities, channel partner codes |
| **Admin - Users & Leads** | Users list/detail, block/unblock, approve live photo/KYC, leads list/detail/export/delete |
| **Admin - Contact Us & Reviews** | Contact us lists, rating reviews list/approve/disapprove |
| **Admin - Property Verifications** | List, get, approve, reject |
| **Admin - About Us & Config** | About us CRUD, configurations CRUD, admins, permissions |
| **Property - Lead & Master** | Create lead, master data, listings, search, get by ID |
| **Property - Listing CRUD** | Step 1–4 create/get, reset, deactivate, repost, request verification, generate description |
| **Property Verification** | Submit verification media |
| **Blogs (End User)** | List blogs, get blog, get/create comments |
| **Admin - Blog Management** | Create, list, get, update, approve, publish, delete blog; comments approve/delete |
| **Channel Partner Code Management** | Create, list, validate, delete codes |
| **Contact Us (Standalone)** | Submit contact form, get all contacts |
| **Uploads** | Generate presigned URL |

## Variables

- **baseUrl**: `http://localhost:3000` (or your server URL)
- **accessToken**, **refreshToken**: From login/validate-otp (set after auth)
- **sessionId**: From `GET /end-user/session` for anonymous flows
- **propertyId**, **channelPartnerId**, **userId**, **blogId**, **cityId**, **id**, **commentId**, **leadId**: Path/query params (set as needed)

Optional header (Swagger): **x-correlation-id** (UUID) for request tracing.

## Payloads, query params, path params

Request bodies (payloads), query parameters, and path parameters are filled from Swagger DTOs with example values. Edit query/path in the Params tab and body in the Body tab. Path params like `{{propertyId}}` use collection variables—set them in the collection variables panel or in the URL/path for each request.

## Import in Postman

1. Open Postman → **Import** → **File** → select `KMA-API.postman_collection.json`.
2. Set **baseUrl** in collection variables if different from localhost:3000.
3. For protected endpoints, run an auth request (e.g. **End User - Auth** → Verify OTP or **Admin - Auth** → Admin Login), then set **accessToken** from the response (or use a script to copy it).

Swagger UI: when the app is running, open `http://localhost:3000/docs` for full API docs.
