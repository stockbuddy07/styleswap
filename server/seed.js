/**
 * Seed script — populates the database with initial mock data.
 * Run: node seed.js
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...\n');

    // ─── Clear existing data ────────────────────────────────────────────────
    // Order matters due to foreign key constraints
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
    console.log('✓ Cleared existing data');

    // ─── Users ──────────────────────────────────────────────────────────────
    const hashedAdmin = await bcrypt.hash('admin123', 10);
    const hashedVendor = await bcrypt.hash('vendor123', 10);
    const hashedUser = await bcrypt.hash('user123', 10);

    const usersData = [
        // Admin
        {
            id: 'admin-001',
            name: 'Alex Morgan',
            email: 'admin@styleswap.com',
            password: hashedAdmin,
            role: 'Admin',
            status: 'active',
            createdAt: new Date('2024-01-01T00:00:00.000Z'),
        },
        // Vendors
        {
            id: 'vendor-001',
            name: 'Sophia Elegance',
            email: 'elegance@styleswap.com',
            password: hashedVendor,
            role: 'Sub-Admin',
            shopName: 'Elegance Rentals',
            shopAddress: '12 Fashion Lane, Bandra West, Mumbai, Maharashtra 400050',
            shopNumber: 'SHOP/MH/2024/001',
            mobileNumber: '+91 98765 43210',
            salesHandlerMobile: '+91 91234 56789',
            gstNumber: '27AABCE1234F1Z5',
            onboardedAt: new Date('2024-01-16'),
            createdAt: new Date('2024-01-15T00:00:00.000Z'),
            status: 'active',
        },
        {
            id: 'vendor-002',
            name: 'Marcus Formal',
            email: 'formal@styleswap.com',
            password: hashedVendor,
            role: 'Sub-Admin',
            shopName: 'Formal Affair',
            shopAddress: '45 Business Hub, Connaught Place, New Delhi 110001',
            shopNumber: 'SHOP/DL/2024/002',
            mobileNumber: '+91 98001 23456',
            salesHandlerMobile: '+91 90001 23456',
            gstNumber: '07AABCF5678G1Z3',
            onboardedAt: new Date('2024-02-02'),
            createdAt: new Date('2024-02-01T00:00:00.000Z'),
            status: 'active',
        },
        {
            id: 'vendor-003',
            name: 'Priya Accessories',
            email: 'accessory@styleswap.com',
            password: hashedVendor,
            role: 'Sub-Admin',
            shopName: 'Accessory Avenue',
            shopAddress: '78 MG Road, Indiranagar, Bengaluru, Karnataka 560038',
            shopNumber: 'SHOP/KA/2024/003',
            mobileNumber: '+91 97654 32109',
            salesHandlerMobile: '+91 89012 34567',
            gstNumber: null,
            onboardedAt: new Date('2024-02-16'),
            createdAt: new Date('2024-02-15T00:00:00.000Z'),
            status: 'active',
        },
        // Customers
        {
            id: 'user-001',
            name: 'James Wilson',
            email: 'customer@styleswap.com',
            password: hashedUser,
            role: 'User',
            status: 'active',
            createdAt: new Date('2024-03-01T00:00:00.000Z'),
        },
        {
            id: 'user-002',
            name: 'Emma Thompson',
            email: 'emma@example.com',
            password: hashedUser,
            role: 'User',
            status: 'active',
            createdAt: new Date('2024-03-10T00:00:00.000Z'),
        },
        {
            id: 'user-003',
            name: 'Raj Patel',
            email: 'raj@example.com',
            password: hashedUser,
            role: 'User',
            status: 'active',
            createdAt: new Date('2024-03-20T00:00:00.000Z'),
        },
        {
            id: 'user-004',
            name: 'Lily Chen',
            email: 'lily@example.com',
            password: hashedUser,
            role: 'User',
            status: 'active',
            createdAt: new Date('2024-04-01T00:00:00.000Z'),
        },
        {
            id: 'user-005',
            name: 'Carlos Rivera',
            email: 'carlos@example.com',
            password: hashedUser,
            role: 'User',
            status: 'active',
            createdAt: new Date('2024-04-15T00:00:00.000Z'),
        },
    ];

    for (const u of usersData) {
        await prisma.user.create({ data: u });
    }
    console.log(`✓ Created ${usersData.length} users`);

    // ─── Products ────────────────────────────────────────────────────────────
    const productsData = [
        {
            id: 'lux-001',
            subAdminId: 'vendor-001',
            name: 'Sabyasachi "Red Mahal" Bridal Lehenga',
            category: 'Wedding Attire',
            pricePerDay: 5000,
            retailPrice: 350000,
            securityDeposit: 75000,
            description: 'The iconic Red Mahal lehenga by Sabyasachi. Hand-woven silk with antique gold zardosi and semi-precious stone embellishments.',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1549439602-43ebca2327af?w=800',
                'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'
            ]),
            stockQuantity: 2,
            availableQuantity: 2,
            sizes: JSON.stringify(['S', 'M']),
            createdAt: new Date(),
        },
        {
            id: 'lux-002',
            subAdminId: 'vendor-001',
            name: 'Manish Malhotra "Starlight" Gown',
            category: 'Wedding Attire',
            description: 'A shimmering midnight blue gown featuring thousands of hand-placed crystals. Perfect for a grand reception.',
            pricePerDay: 4000,
            retailPrice: 280000,
            securityDeposit: 50000,
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1610030469983-98e547219b22?w=800',
                'https://images.unsplash.com/photo-1621236304192-f75604107197?w=800'
            ]),
            stockQuantity: 3,
            availableQuantity: 3,
            sizes: JSON.stringify(['S', 'M', 'L']),
            createdAt: new Date(),
        },
        {
            id: 'lux-003',
            subAdminId: 'vendor-002',
            name: 'Tom Ford Velvet Evening Tuxedo',
            category: 'Blazers',
            description: 'Classic Tom Ford tailoring in a deep emerald velvet. Features silk peak lapels and a contemporary slim fit.',
            pricePerDay: 3000,
            retailPrice: 220000,
            securityDeposit: 40000,
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
                'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800'
            ]),
            stockQuantity: 4,
            availableQuantity: 4,
            sizes: JSON.stringify(['48', '50', '52', '54']),
            createdAt: new Date(),
        },
        {
            id: 'lux-004',
            subAdminId: 'vendor-001',
            name: 'Anita Dongre "Vana" Sherwani',
            category: 'Wedding Attire',
            description: 'Soft cream silk sherwani with delicate floral threadwork and hand-crafted buttons. Includes matching pashmina stole.',
            pricePerDay: 2500,
            retailPrice: 150000,
            securityDeposit: 30000,
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?w=800'
            ]),
            stockQuantity: 5,
            availableQuantity: 5,
            sizes: JSON.stringify(['M', 'L', 'XL']),
            createdAt: new Date(),
        },
        {
            id: 'lux-005',
            subAdminId: 'vendor-003',
            name: 'Jimmy Choo "Love 100" Crystal Pumps',
            category: 'Shoes',
            description: 'Pointed-toe pumps encrusted with light-catching crystals and coarse glitter for a brilliant shine.',
            pricePerDay: 1500,
            retailPrice: 85000,
            securityDeposit: 20000,
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1543163521-1bf539c55bb2?w=800',
                'https://images.unsplash.com/photo-1512374382149-433a72b9a5a5?w=800'
            ]),
            stockQuantity: 6,
            availableQuantity: 6,
            sizes: JSON.stringify(['36', '37', '38', '39']),
            createdAt: new Date(),
        },
        {
            id: 'lux-006',
            subAdminId: 'vendor-001',
            name: 'Hermes Birkin 30 Gold Epsom',
            category: 'Luxury Bags',
            description: 'The world\'s most coveted handbag in Gold Epsom leather with gold-plated hardware. A timeless investment in style.',
            pricePerDay: 2500,
            retailPrice: 1200000,
            securityDeposit: 150000,
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
                'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800'
            ]),
            stockQuantity: 1,
            availableQuantity: 1,
            sizes: JSON.stringify(['One Size']),
            createdAt: new Date(),
        },
        {
            id: 'lux-007',
            subAdminId: 'vendor-003',
            name: 'Rolex Day-Date 40 President',
            category: 'Watches',
            description: 'The "Presidential" masterpiece in 18K Yellow Gold with a champagne-colored dial. Ultimate prestige.',
            pricePerDay: 3500,
            retailPrice: 3200000,
            securityDeposit: 500000,
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800',
                'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800'
            ]),
            stockQuantity: 1,
            availableQuantity: 1,
            sizes: JSON.stringify(['One Size']),
            createdAt: new Date(),
        },
        {
            id: 'lux-008',
            subAdminId: 'vendor-003',
            name: 'Cartier "Panthère" Diamond Necklace',
            category: 'Accessories',
            description: '18K White Gold necklace set with emerald eyes, onyx nose, and pavé diamonds. The embodyment of bold luxury.',
            pricePerDay: 4000,
            retailPrice: 4500000,
            securityDeposit: 600000,
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1515562141207-7a88fb0537bf?w=800'
            ]),
            stockQuantity: 1,
            availableQuantity: 1,
            sizes: JSON.stringify(['One Size']),
            createdAt: new Date(),
        },
        {
            id: 'lux-009',
            subAdminId: 'vendor-001',
            name: 'Chanel Classic Flap Quilted Bag',
            category: 'Luxury Bags',
            description: 'Black quilted Caviar leather with Gold-tone metal. The legendary double-flap silhouette.',
            pricePerDay: 1800,
            retailPrice: 850000,
            securityDeposit: 100000,
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800'
            ]),
            stockQuantity: 2,
            availableQuantity: 2,
            sizes: JSON.stringify(['Medium']),
            createdAt: new Date(),
        },
        {
            id: 'lux-010',
            subAdminId: 'vendor-002',
            name: 'Zegna 15milmil15 Silk Suit',
            category: 'Blazers',
            description: 'Ultra-luxurious wool-silk blend suit in charcoal grey. Hand-finished details and unmatched fabric quality.',
            pricePerDay: 2000,
            retailPrice: 280000,
            securityDeposit: 45000,
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?w=800'
            ]),
            stockQuantity: 3,
            availableQuantity: 3,
            sizes: JSON.stringify(['50', '52', '54']),
            createdAt: new Date(),
        }
    ];

    for (const p of productsData) {
        await prisma.product.create({ data: p });
    }
    console.log(`✓ Created ${productsData.length} products`);

    // ─── Orders ──────────────────────────────────────────────────────────────
    const ordersData = []; // Clear orders to avoid reference errors with new products

    for (const o of ordersData) {
        await prisma.order.create({ data: o });
    }
    console.log(`✓ Created ${ordersData.length} orders`);

    console.log('\n✅ Database seeded successfully!');
    console.log('Demo accounts:');
    console.log('  Admin:    admin@styleswap.com  / admin123');
    console.log('  Vendor 1: elegance@styleswap.com / vendor123');
    console.log('  Vendor 2: formal@styleswap.com   / vendor123');
    console.log('  Vendor 3: accessory@styleswap.com / vendor123');
    console.log('  Customer: customer@styleswap.com / user123\n');
}

main()
    .catch(e => { console.error('❌ Seed failed:', e); process.exit(1); })
    .finally(() => prisma.$disconnect());

