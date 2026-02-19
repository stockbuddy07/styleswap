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

    // 2. Clear Existing Products (Remove "static data")
    await prisma.product.deleteMany();
    console.log('🗑️  Cleared existing products.');

    // 3. Create 15 Luxury Products
    const products = [
        {
            name: 'Sabyasachi "Heritage" Wedding Lehenga',
            category: 'Wedding Attire',
            description: 'A masterpiece from Sabyasachi, featuring deep maroon silk with intricate gold zardosi handwork and a double dupatta set.',
            pricePerDay: 4500,
            retailPrice: 250000,
            securityDeposit: 50000,
            stockQuantity: 2,
            availableQuantity: 2,
            sizes: ["S", "M"],
            images: ["https://images.unsplash.com/photo-1549439602-43ebca2327af?auto=format&fit=crop&q=80&w=800"],
            subAdminId: vendor.id,
        },
        {
            name: 'Manish Malhotra Sequin Sari',
            category: 'Wedding Attire',
            description: 'Glamorous champagne pink sequin sari with a sweetheart neckline blouse. Seen on Bollywood red carpets.',
            pricePerDay: 3500,
            retailPrice: 180000,
            securityDeposit: 30000,
            stockQuantity: 3,
            availableQuantity: 3,
            sizes: ["One Size"],
            images: ["https://images.unsplash.com/photo-1610030469983-98e547219b22?auto=format&fit=crop&q=80&w=800"],
            subAdminId: vendor.id,
        },
        {
            name: 'Anita Dongre Emerald Sherwani',
            category: 'Wedding Attire',
            description: 'Rich emerald green silk sherwani with hand-crafted buttons and a complementing stole. Pure elegance.',
            pricePerDay: 2500,
            retailPrice: 120000,
            securityDeposit: 20000,
            stockQuantity: 5,
            availableQuantity: 5,
            sizes: ["M", "L", "XL"],
            images: ["https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&q=80&w=800"],
            subAdminId: vendor.id,
        },
        {
            name: 'Louis Vuitton Keepall 55',
            category: 'Luxury Bags',
            description: 'The ultimate travel companion in signature Monogram Canvas with natural cowhide leather trim.',
            pricePerDay: 800,
            retailPrice: 220000,
            securityDeposit: 15000,
            stockQuantity: 2,
            availableQuantity: 2,
            sizes: ["One Size"],
            images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800"],
            subAdminId: vendor.id,
        },
        {
            name: 'Christian Dior Lady Dior Bag',
            category: 'Luxury Bags',
            description: 'Cannage lambskin in black with silver-finish metal "D.I.O.R." charms. Symbol of elegance.',
            pricePerDay: 1200,
            retailPrice: 480000,
            securityDeposit: 25000,
            stockQuantity: 1,
            availableQuantity: 1,
            sizes: ["Medium"],
            images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800"],
            subAdminId: vendor.id,
        },
        {
            name: 'Rolex Submariner Date',
            category: 'Watches',
            description: 'Cerachrom bezel in black ceramic and Oyster bracelet. The quintessential diving watch.',
            pricePerDay: 2000,
            retailPrice: 950000,
            securityDeposit: 100000,
            stockQuantity: 1,
            availableQuantity: 1,
            sizes: ["One Size"],
            images: ["https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=800"],
            subAdminId: vendor.id,
        },
        {
            name: 'TAG Heuer Monaco',
            category: 'Watches',
            description: 'The legendary square-faced chronograph inspired by Steve McQueen. Blue sunray dial.',
            pricePerDay: 1000,
            retailPrice: 580000,
            securityDeposit: 50000,
            stockQuantity: 2,
            availableQuantity: 2,
            sizes: ["One Size"],
            images: ["https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&q=80&w=800"],
            subAdminId: vendor.id,
        },
        {
            name: 'Gucci Velvet Dinner Jacket',
            category: 'Blazers',
            description: 'Luxurious black velvet blazer with satin peak lapels. Made in Italy.',
            pricePerDay: 1500,
            retailPrice: 220000,
            securityDeposit: 20000,
            stockQuantity: 3,
            availableQuantity: 3,
            sizes: ["48", "50", "52"],
            images: ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=800"],
            subAdminId: vendor.id,
        },
        {
            name: 'Giorgio Armani Silk Suit',
            category: 'Blazers',
            description: 'Charcoal grey wool-silk blend suit with a tailored fit. Perfect for corporate events or weddings.',
            pricePerDay: 1800,
            retailPrice: 280000,
            securityDeposit: 25000,
            stockQuantity: 2,
            availableQuantity: 2,
            sizes: ["48", "50", "52", "54"],
            images: ["https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&q=80&w=800"],
            subAdminId: vendor.id,
        },
        {
            name: 'Jimmy Choo "Cinderella" Pumps',
            category: 'Footwear',
            description: 'Swarovski crystal-covered pumps with a pointed toe. True fairytale shoes.',
            pricePerDay: 2000,
            retailPrice: 350000,
            securityDeposit: 40000,
            stockQuantity: 2,
            availableQuantity: 2,
            sizes: ["36", "37", "38"],
            images: ["https://images.unsplash.com/photo-1512374382149-433a72b9a5a5?auto=format&fit=crop&q=80&w=800"],
            subAdminId: vendor.id,
        },
        {
            name: 'Christian Louboutin Pigalle',
            category: 'Footwear',
            description: 'Iconic black patent leather pumps with the signature red sole.',
            pricePerDay: 900,
            retailPrice: 65000,
            securityDeposit: 15000,
            stockQuantity: 4,
            availableQuantity: 4,
            sizes: ["37", "38", "39", "40"],
            images: ["https://images.unsplash.com/photo-1543163521-1bf539c55bb2?auto=format&fit=crop&q=80&w=800"],
            subAdminId: vendor.id,
        },
        {
            name: 'Bulgari Serpenti Necklace',
            category: 'Accessories',
            description: 'Rose gold necklace set with pavé diamonds. A symbol of wisdom and vitality.',
            pricePerDay: 2500,
            retailPrice: 1200000,
            securityDeposit: 150000,
            stockQuantity: 1,
            availableQuantity: 1,
            sizes: ["One Size"],
            images: ["https://images.unsplash.com/photo-1515562141207-7a88fb0537bf?auto=format&fit=crop&q=80&w=800"],
            subAdminId: vendor.id,
        },
        {
            name: 'Chanel Classic Flap Bag',
            category: 'Luxury Bags',
            description: 'Lambskin and gold-tone metal, black. The most desirable bag in the world.',
            pricePerDay: 1500,
            retailPrice: 850000,
            securityDeposit: 50000,
            stockQuantity: 1,
            availableQuantity: 1,
            sizes: ["Medium"],
            images: ["https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800"],
            subAdminId: vendor.id,
        },
        {
            name: 'Tom Ford Velvet Tuxedo',
            category: 'Blazers',
            description: 'Plum velvet tuxedo jacket with black grosgrain lapels. As worn by James Bond.',
            pricePerDay: 2200,
            retailPrice: 380000,
            securityDeposit: 40000,
            stockQuantity: 1,
            availableQuantity: 1,
            sizes: ["50", "52"],
            images: ["https://images.unsplash.com/photo-1594938291221-9d115f667e4e?auto=format&fit=crop&q=80&w=800"],
            subAdminId: vendor.id,
        },
        {
            name: 'Tiffany & Co. Diamond Studs',
            category: 'Accessories',
            description: 'Round brilliant diamonds in platinum. Total weight 1.00 carat.',
            pricePerDay: 800,
            retailPrice: 320000,
            securityDeposit: 25000,
            stockQuantity: 2,
            availableQuantity: 2,
            sizes: ["One Size"],
            images: ["https://images.unsplash.com/photo-1623939012330-362209e27441?auto=format&fit=crop&q=80&w=800"],
            subAdminId: vendor.id,
        }
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
