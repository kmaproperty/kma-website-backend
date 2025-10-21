# kma-website-backend

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Master Data Management

The application includes a comprehensive master data management system with automatic seeding and reseeding capabilities.

### Automatic Seeding on Startup

Master data is automatically seeded when the application starts. The system seeds:
- Property Listing Types (Sale, Rent)
- Property Categories (Residential, Commercial)
- Property Types (Various residential and commercial types)
- BHK Types (Bedroom configurations for residential properties)
- Cities (Major Indian cities)
- Localities (Neighborhoods within cities)
- Societies (Housing complexes)

### Reseeding Master Data

To delete existing master data and reseed with fresh data:

**Using the API:**
```bash
curl -X POST http://localhost:3000/properties/master/reseed \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Using the shell script:**
```bash
JWT_TOKEN='your-token' ./scripts/reseed-master-data.sh
```

### Documentation

For detailed information about master data management:
- **Quick Start:** See [RESEED_QUICK_START.md](./RESEED_QUICK_START.md)
- **Full Documentation:** See [MASTER_DATA_RESEEDING.md](./MASTER_DATA_RESEEDING.md)