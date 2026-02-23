const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Testing connection to database...');
        const count = await prisma.user.count();
        console.log(`Connection successful. User count: ${count}`);

        const testUser = await prisma.user.findFirst();
        if (testUser) {
            console.log('First user found:', testUser.email);
        } else {
            console.log('No users in database.');
        }
    } catch (error) {
        console.error('Database connection failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
