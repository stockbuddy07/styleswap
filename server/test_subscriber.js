const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.subscriber.count();
        console.log(`✅ Subscriber count: ${count}`);
    } catch (error) {
        console.error('❌ Error querying Subscriber model:');
        console.error(error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
