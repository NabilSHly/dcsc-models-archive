// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Look for any existing user (single-admin app)
  const existingUser = await prisma.user.findFirst();

  if (existingUser) {
    console.log('⚠️  Admin user already exists. Skipping seed.');
    return;
  }

  const plain = process.env.DEFAULT_PASSWORD || 'admin123';
  const hashedPassword = await bcrypt.hash(plain, 10);

  await prisma.user.create({
    data: { password: hashedPassword },
  });

  console.log('✅ Default admin user created:');
  console.log(`   Password: ${plain}`);
  console.log('   ⚠️  IMPORTANT: Change this password after first login!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
