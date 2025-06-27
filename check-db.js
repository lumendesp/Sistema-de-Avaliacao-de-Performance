const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
    try {
        console.log('Checking database...');
        
        // Check units
        const units = await prisma.unit.findMany();
        console.log('Units:', units.length, units.map(u => u.name));
        
        // Check positions
        const positions = await prisma.position.findMany();
        console.log('Positions:', positions.length, positions.map(p => p.name));
        
        // Check tracks
        const tracks = await prisma.track.findMany();
        console.log('Tracks:', tracks.length, tracks.map(t => t.name));
        
        // Check criteria
        const criteria = await prisma.criterion.findMany();
        console.log('Criteria:', criteria.length, criteria.map(c => c.name));
        
        // Check criterion groups
        const groups = await prisma.criterionGroup.findMany({
            include: {
                track: true,
                unit: true,
                position: true,
            }
        });
        console.log('Criterion Groups:', groups.length, groups.map(g => ({
            name: g.name,
            track: g.track.name,
            unit: g.unit.name,
            position: g.position.name
        })));
        
        // Check configured criteria
        const configuredCriteria = await prisma.configuredCriterion.findMany({
            include: {
                criterion: true,
                track: true,
                group: true,
            }
        });
        console.log('Configured Criteria:', configuredCriteria.length, configuredCriteria.map(cc => ({
            criterion: cc.criterion.name,
            track: cc.track.name,
            group: cc.group.name,
            mandatory: cc.mandatory
        })));
        
    } catch (error) {
        console.error('Error checking database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkDatabase(); 