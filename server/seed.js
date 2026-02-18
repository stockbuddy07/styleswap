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
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
    console.log('✓ Cleared existing data');

    // ─── Users ──────────────────────────────────────────────────────────────
    const hashedAdmin = await bcrypt.hash('admin123', 10);
    const hashedVendor = await bcrypt.hash('vendor123', 10);
    const hashedUser = await bcrypt.hash('user123', 10);

    const admin = await prisma.user.create({
        data: {
            id: 'admin-001',
            name: 'Alex Morgan',
            email: 'admin@styleswap.com',
            password: hashedAdmin,
            role: 'Admin',
            status: 'active',
        },
    });

    const vendor1 = await prisma.user.create({
        data: {
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
            status: 'active',
        },
    });

    const vendor2 = await prisma.user.create({
        data: {
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
            status: 'active',
        },
    });

    const vendor3 = await prisma.user.create({
        data: {
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
            onboardedAt: new Date('2024-02-16'),
            status: 'active',
        },
    });

    const customer1 = await prisma.user.create({
        data: {
            id: 'user-001',
            name: 'James Wilson',
            email: 'customer@styleswap.com',
            password: hashedUser,
            role: 'User',
            status: 'active',
        },
    });

    const customer2 = await prisma.user.create({
        data: {
            id: 'user-002',
            name: 'Emma Thompson',
            email: 'emma@example.com',
            password: hashedUser,
            role: 'User',
            status: 'active',
        },
    });

    console.log('✓ Created 6 users (1 admin, 3 vendors, 2 customers)');

    // ─── Products ────────────────────────────────────────────────────────────
    const products = await Promise.all([
        prisma.product.create({
            data: {
                id: 'prod-001',
                name: 'Chanel Tweed Jacket',
                category: 'Blazers',
                description: 'Classic Chanel tweed jacket in ivory and black. Perfect for formal events and business meetings.',
                pricePerDay: 45,
                securityDeposit: 200,
                stockQuantity: 3,
                availableQuantity: 2,
                sizes: JSON.stringify(['XS', 'S', 'M', 'L']),
                images: JSON.stringify(['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400']),
                subAdminId: vendor1.id,
            },
        }),
        prisma.product.create({
            data: {
                id: 'prod-002',
                name: 'Versace Bridal Lehenga',
                category: 'Wedding Attire',
                description: 'Stunning Versace-inspired bridal lehenga with intricate embroidery and gold detailing.',
                pricePerDay: 120,
                securityDeposit: 500,
                stockQuantity: 2,
                availableQuantity: 1,
                sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
                images: JSON.stringify(['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400']),
                subAdminId: vendor1.id,
            },
        }),
        prisma.product.create({
            data: {
                id: 'prod-003',
                name: 'Tom Ford Tuxedo',
                category: 'Wedding Attire',
                description: 'Sleek Tom Ford black tuxedo with satin lapels. Ideal for black-tie events and weddings.',
                pricePerDay: 80,
                securityDeposit: 350,
                stockQuantity: 4,
                availableQuantity: 3,
                sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
                images: JSON.stringify(['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400']),
                subAdminId: vendor2.id,
            },
        }),
        prisma.product.create({
            data: {
                id: 'prod-004',
                name: 'Gucci Loafers',
                category: 'Shoes',
                description: 'Iconic Gucci horsebit loafers in brown leather. A timeless statement piece.',
                pricePerDay: 35,
                securityDeposit: 150,
                stockQuantity: 5,
                availableQuantity: 4,
                sizes: JSON.stringify(['7', '8', '9', '10', '11']),
                images: JSON.stringify(['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400']),
                subAdminId: vendor2.id,
            },
        }),
        prisma.product.create({
            data: {
                id: 'prod-005',
                name: 'Hermès Silk Scarf',
                category: 'Accessories',
                description: 'Authentic Hermès silk scarf with vibrant equestrian print. A luxury accessory for any occasion.',
                pricePerDay: 25,
                securityDeposit: 100,
                stockQuantity: 6,
                availableQuantity: 5,
                sizes: JSON.stringify(['One Size']),
                images: JSON.stringify(['https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400']),
                subAdminId: vendor3.id,
            },
        }),
        prisma.product.create({
            data: {
                id: 'prod-006',
                name: 'Louis Vuitton Clutch',
                category: 'Accessories',
                description: 'Elegant LV monogram clutch bag. Perfect for evening events and weddings.',
                pricePerDay: 40,
                securityDeposit: 180,
                stockQuantity: 4,
                availableQuantity: 3,
                sizes: JSON.stringify(['One Size']),
                images: JSON.stringify(['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400']),
                subAdminId: vendor3.id,
            },
        }),
    ]);

    console.log(`✓ Created ${products.length} products`);

    // ─── Orders ──────────────────────────────────────────────────────────────
    const order1 = await prisma.order.create({
        data: {
            id: 'order-001',
            customerId: customer1.id,
            customerName: customer1.name,
            vendorId: vendor1.id,
            shopName: 'Elegance Rentals',
            items: JSON.stringify([
                {
                    productId: 'prod-001',
                    productName: 'Chanel Tweed Jacket',
                    productImage: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400',
                    vendorId: vendor1.id,
                    vendorShopName: 'Elegance Rentals',
                    size: 'M',
                    quantity: 1,
                    rentalDays: 3,
                    rentalStartDate: '2024-12-20',
                    rentalEndDate: '2024-12-23',
                    pricePerDay: 45,
                    subtotal: 135,
                    depositTotal: 200,
                },
            ]),
            totalAmount: 335,
            status: 'Returned',
            rentalStartDate: '2024-12-20',
            rentalEndDate: '2024-12-23',
            paymentMethod: 'Card',
            feedback: JSON.stringify({
                rating: 5,
                review: 'Absolutely stunning jacket! Perfect fit and arrived in immaculate condition.',
                tags: ['Great Quality', 'Perfect Fit', 'On-time Delivery'],
                itemIndex: 0,
                itemName: 'Chanel Tweed Jacket',
                submittedAt: '2024-12-24T10:00:00.000Z',
            }),
            orderDate: new Date('2024-12-19'),
        },
    });

    const order2 = await prisma.order.create({
        data: {
            id: 'order-002',
            customerId: customer1.id,
            customerName: customer1.name,
            vendorId: vendor2.id,
            shopName: 'Formal Affair',
            items: JSON.stringify([
                {
                    productId: 'prod-003',
                    productName: 'Tom Ford Tuxedo',
                    productImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400',
                    vendorId: vendor2.id,
                    vendorShopName: 'Formal Affair',
                    size: 'L',
                    quantity: 1,
                    rentalDays: 2,
                    rentalStartDate: '2025-01-10',
                    rentalEndDate: '2025-01-12',
                    pricePerDay: 80,
                    subtotal: 160,
                    depositTotal: 350,
                },
            ]),
            totalAmount: 510,
            status: 'Active',
            rentalStartDate: '2025-01-10',
            rentalEndDate: '2025-01-12',
            paymentMethod: 'UPI',
            orderDate: new Date('2025-01-09'),
        },
    });

    console.log('✓ Created 2 sample orders');

    console.log('\n✅ Database seeded successfully!\n');
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
