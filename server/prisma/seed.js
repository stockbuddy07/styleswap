const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // 1. Create Users
    const password = await bcrypt.hash('password123', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@styleswap.com' },
        update: {},
        create: {
            email: 'admin@styleswap.com',
            name: 'Admin User',
            password,
            role: 'Admin',
        },
    });

    const vendor = await prisma.user.upsert({
        where: { email: 'vendor@styleswap.com' },
        update: {},
        create: {
            email: 'vendor@styleswap.com',
            name: 'Vendor One',
            password,
            role: 'Sub-Admin',
            shopName: 'Elite Bridal',
            mobileNumber: '1234567890',
            shopNumber: '1234567890',
            shopAddress: '123 Fashion St',
        },
    });

    const customer = await prisma.user.upsert({
        where: { email: 'user@styleswap.com' },
        update: {},
        create: {
            email: 'user@styleswap.com',
            name: 'Demo Customer',
            password,
            role: 'End-User',
        },
    });

    console.log('✅ Users created: Admin, Vendor, Customer');

    // 2. Create Products (linked to Vendor)
    const products = [
        {
            name: 'Royal Blue Sherwani',
            category: 'Wedding Attire',
            description: 'Premium silk sherwani with intricate embroidery. Perfect for grooms.',
            pricePerDay: 1500,
            securityDeposit: 5000,
            stockQuantity: 5,
            availableQuantity: 5,
            sizes: ["S", "M", "L", "XL"],
            images: ["https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&q=80&w=800"],
            subAdminId: vendor.id,
        },
        {
            name: 'Golden Lehenga Choli',
            category: 'Wedding Attire',
            description: 'Stunning golden lehenga with mirror work. Ideal for receptions.',
            pricePerDay: 2000,
            securityDeposit: 6000,
            stockQuantity: 3,
            availableQuantity: 3,
            sizes: ["XS", "S", "M"],
            images: ["https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&q=80&w=800"],
            subAdminId: vendor.id,
        },
        {
            name: 'Classic Black Tuxedo',
            category: 'Blazers',
            description: 'Modern slim-fit tuxedo for formal events.',
            pricePerDay: 1200,
            securityDeposit: 4000,
            stockQuantity: 10,
            availableQuantity: 10,
            sizes: ["38", "40", "42", "44"],
            images: ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=800"],
            subAdminId: vendor.id,
        },
        {
            name: 'Diamond Necklace Set',
            category: 'Accessories',
            description: 'Elegant artificial diamond necklace with matching earrings.',
            pricePerDay: 500,
            securityDeposit: 1500,
            stockQuantity: 2,
            availableQuantity: 2,
            sizes: ["One Size"],
            images: ["https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&q=80&w=800"],
            subAdminId: vendor.id,
        },
        {
            name: 'Designer Juttis',
            category: 'Shoes',
            description: 'Handcrafted leather juttis with gold thread work.',
            pricePerDay: 300,
            securityDeposit: 1000,
            stockQuantity: 6,
            availableQuantity: 6,
            sizes: ["7", "8", "9", "10"],
            images: ["https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=800"],
            subAdminId: vendor.id,
        },
    ];

    for (const p of products) {
        await prisma.product.create({ data: p });
    }

    console.log(`✅ ${products.length} products added.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
