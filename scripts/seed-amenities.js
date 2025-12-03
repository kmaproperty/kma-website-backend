// Import crypto for Node.js compatibility
if (typeof globalThis.crypto === 'undefined') {
  const { webcrypto } = require('crypto');
  globalThis.crypto = webcrypto;
}

const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module');
const { MasterDataSeederService } = require('../dist/property/services/master-data-seeder.service');

async function bootstrap() {
  console.log('Starting amenities seeder...');

  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const seederService = app.get(MasterDataSeederService);

    console.log('Reseeding only amenities...');
    const result = await seederService.reseedAmenities();

    console.log('\n✅ Amenities seeding completed successfully!');
    console.log('Details:', JSON.stringify(result.details, null, 2));

    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during amenities seeding:', error);
    process.exit(1);
  }
}

bootstrap();

