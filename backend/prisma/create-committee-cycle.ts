import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createCommitteeCycle() {
  try {
    // Check if a COMMITTEE cycle already exists
    const existingCycle = await prisma.evaluationCycle.findFirst({
      where: {
        type: 'COMMITTEE',
        status: 'CLOSED'
      }
    });

    if (existingCycle) {
      console.log('COMMITTEE cycle already exists:', existingCycle);
      return;
    }

    // Create a new COMMITTEE cycle that's closed and ready for equalization
    const committeeCycle = await prisma.evaluationCycle.create({
      data: {
        name: '2025.1 - Committee Equalization',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago (closed)
        status: 'CLOSED',
        type: 'COMMITTEE',
      },
    });

    console.log('✅ COMMITTEE cycle created successfully:', committeeCycle);
    console.log('📋 Cycle Details:');
    console.log(`   - ID: ${committeeCycle.id}`);
    console.log(`   - Name: ${committeeCycle.name}`);
    console.log(`   - Status: ${committeeCycle.status}`);
    console.log(`   - Type: ${committeeCycle.type}`);
    console.log(`   - Start Date: ${committeeCycle.startDate}`);
    console.log(`   - End Date: ${committeeCycle.endDate}`);

  } catch (error) {
    console.error('❌ Error creating COMMITTEE cycle:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createCommitteeCycle(); 