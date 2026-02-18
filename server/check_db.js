const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.product.count();
        console.log(`Product Count: ${count}`);
        const products = await prisma.product.findMany({ take: 1 });
        console.log('Sample:', JSON.stringify(products, null, 2));
    } catch (e) {
        console.error(e);
    }
}

main();
