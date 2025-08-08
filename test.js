// test.js

// Correct path to the custom-generated Prisma client
import { PrismaClient } from '@prisma/client'; 

/** @type {import('./src/generated/prisma').PrismaClient} */
const prisma = new PrismaClient();

const testConnection = async () => {
  try {
    console.log('⏳ Connecting to DB...');

    const user = await prisma.user.create({
      data: {
        userName: 'test_user_1',
        email: 'testuser2@example.com',
        password: 'hashed_password_123',
        role: 'APPLICANT',
        refreshToken: 'dummy_refresh_token_123'
      }
    });

    console.log('✅ User inserted:', user);
  } catch (err) {
    console.error('❌ Error inserting user:', err);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Disconnected from DB.');
  }
  
};

testConnection();
