const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const email = 'elegance@styleswap.com';
        console.log(`Searching for user with email: ${email}`);

        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (user) {
            console.log('User found:', user.name);
        } else {
            console.log('User not found.');
        }
    } catch (error) {
        console.error('Prisma query failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
