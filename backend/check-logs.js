const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkLogs() {
  try {
    console.log('Checking logs in database...');
    
    // Get total count of logs
    const totalLogs = await prisma.log.count();
    console.log(`Total logs in database: ${totalLogs}`);
    
    if (totalLogs > 0) {
      // Get the most recent logs
      const recentLogs = await prisma.log.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          action: true,
          method: true,
          path: true,
          userEmail: true,
          userName: true,
          responseStatus: true,
          createdAt: true,
        }
      });
      
      console.log('\nMost recent logs:');
      recentLogs.forEach(log => {
        console.log(`- ID: ${log.id}, ${log.method} ${log.path} (${log.responseStatus}) - ${log.userName || log.userEmail || 'System'} - ${log.createdAt}`);
      });
    } else {
      console.log('No logs found in database.');
    }
    
  } catch (error) {
    console.error('Error checking logs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLogs(); 