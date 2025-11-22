import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create test users
  const passwordHash = await bcrypt.hash('Test123!', 10);

  const testTenant = await prisma.user.upsert({
    where: { email: 'tenant@test.com' },
    update: {},
    create: {
      email: 'tenant@test.com',
      passwordHash,
      role: 'TENANT',
      emailVerified: true,
      profile: {
        create: {
          firstName: 'Jan',
          lastName: 'Kowalski',
          phone: '+48123456789',
          languagePreference: 'pl',
          verificationStatus: 'VERIFIED',
        },
      },
    },
  });

  const testLandlord = await prisma.user.upsert({
    where: { email: 'landlord@test.com' },
    update: {},
    create: {
      email: 'landlord@test.com',
      passwordHash,
      role: 'LANDLORD',
      emailVerified: true,
      profile: {
        create: {
          firstName: 'Anna',
          lastName: 'Nowak',
          phone: '+48987654321',
          languagePreference: 'pl',
          verificationStatus: 'VERIFIED',
        },
      },
    },
  });

  console.log('✅ Created test users:', {
    tenant: testTenant.email,
    landlord: testLandlord.email,
  });

  // Create sample properties
  const property1 = await prisma.property.create({
    data: {
      landlordId: testLandlord.id,
      title: '2-pokojowe mieszkanie w centrum Warszawy',
      description:
        'Przytulne 2-pokojowe mieszkanie w doskonałej lokalizacji w centrum Warszawy. Blisko metra, sklepów i restauracji.',
      propertyType: 'APARTMENT',
      status: 'ACTIVE',
      address: {
        street: 'ul. Marszałkowska 123',
        city: 'Warszawa',
        postalCode: '00-123',
        country: 'Poland',
      },
      price: 3500,
      currency: 'PLN',
      deposit: 3500,
      utilities: 500,
      area: 45,
      rooms: 2,
      bedrooms: 1,
      bathrooms: 1,
      floor: 3,
      totalFloors: 5,
      features: ['furnished', 'balcony', 'elevator'],
      amenities: ['wifi', 'washing_machine', 'dishwasher'],
      rules: {
        pets: false,
        smoking: false,
        parties: false,
      },
      availableFrom: new Date('2025-12-01'),
      photos: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
            order: 0,
            caption: 'Salon',
          },
          {
            url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858',
            order: 1,
            caption: 'Sypialnia',
          },
        ],
      },
    },
  });

  const property2 = await prisma.property.create({
    data: {
      landlordId: testLandlord.id,
      title: 'Nowoczesne studio na Mokotowie',
      description:
        'Świeżo wyremontowane studio w nowym budynku. Idealne dla singla lub pary.',
      propertyType: 'STUDIO',
      status: 'ACTIVE',
      address: {
        street: 'ul. Puławska 456',
        city: 'Warszawa',
        district: 'Mokotów',
        postalCode: '02-566',
        country: 'Poland',
      },
      price: 2800,
      currency: 'PLN',
      deposit: 2800,
      utilities: 400,
      area: 32,
      rooms: 1,
      bedrooms: 1,
      bathrooms: 1,
      floor: 7,
      totalFloors: 10,
      features: ['furnished', 'balcony', 'elevator', 'parking'],
      amenities: ['wifi', 'air_conditioning', 'security'],
      rules: {
        pets: true,
        smoking: false,
        parties: false,
      },
      availableFrom: new Date('2025-11-15'),
      photos: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
            order: 0,
            caption: 'Główny pokój',
          },
        ],
      },
    },
  });

  console.log('✅ Created sample properties:', {
    property1: property1.title,
    property2: property2.title,
  });

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
