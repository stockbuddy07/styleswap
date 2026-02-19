const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany();
    console.log(`Found ${products.length} products.`);

    products.forEach(p => {
        console.log(`Product: ${p.id} | Name: ${p.name}`);
        console.log(`  Images Type: ${typeof p.images}`);
        console.log(`  Images Value:`, p.images);

        if (!Array.isArray(p.images)) {
            console.log(`  WARNING: Images is NOT an array for product ${p.id}`);
        }
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
