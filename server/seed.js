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
        // ELEGANCE RENTALS (vendor-001)
        {
            id: 'prod-001',
            subAdminId: 'vendor-001',
            name: 'Midnight Blue Tuxedo', // Renamed from mockData to match
            category: 'Wedding Attire',
            pricePerDay: 75,
            securityDeposit: 150,
            description: 'Elegant 3-piece midnight blue tuxedo with satin lapels. Perfect for weddings, galas, and black-tie events.',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600',
                'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600',
            ]),
            stockQuantity: 5,
            availableQuantity: 4,
            sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
            createdAt: new Date('2024-02-01T00:00:00.000Z'),
        },
        {
            id: 'prod-002',
            subAdminId: 'vendor-001',
            name: 'Ivory Wedding Gown',
            category: 'Wedding Attire',
            pricePerDay: 120,
            securityDeposit: 300,
            description: 'Stunning A-line ivory wedding gown with lace bodice and flowing chiffon skirt.',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1519657337289-077653f724ed?w=600',
                'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600',
            ]),
            stockQuantity: 3,
            availableQuantity: 2,
            sizes: JSON.stringify(['XS', 'S', 'M', 'L']),
            createdAt: new Date('2024-02-05T00:00:00.000Z'),
        },
        {
            id: 'prod-003',
            subAdminId: 'vendor-001',
            name: 'Classic Black Tuxedo',
            category: 'Wedding Attire',
            pricePerDay: 65,
            securityDeposit: 130,
            description: 'Timeless classic black tuxedo with peak lapels.',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1598808503746-f34c53b9323e?w=600',
                'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600',
            ]),
            stockQuantity: 8,
            availableQuantity: 7,
            sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
            createdAt: new Date('2024-02-10T00:00:00.000Z'),
        },
        {
            id: 'prod-004',
            subAdminId: 'vendor-001',
            name: 'Blush Bridesmaid Dress',
            category: 'Wedding Attire',
            pricePerDay: 45,
            securityDeposit: 90,
            description: 'Elegant floor-length blush pink bridesmaid dress.',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600',
                'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600',
            ]),
            stockQuantity: 6,
            availableQuantity: 5,
            sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL']),
            createdAt: new Date('2024-02-15T00:00:00.000Z'),
        },
        {
            id: 'prod-005',
            subAdminId: 'vendor-001',
            name: 'Champagne Evening Gown',
            category: 'Wedding Attire',
            pricePerDay: 95,
            securityDeposit: 200,
            description: 'Breathtaking champagne-colored evening gown with sequined bodice.',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1566479179817-c0a3e3e4e0a8?w=600',
                'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600',
            ]),
            stockQuantity: 4,
            availableQuantity: 3,
            sizes: JSON.stringify(['XS', 'S', 'M', 'L']),
            createdAt: new Date('2024-02-20T00:00:00.000Z'),
        },
        {
            id: 'prod-006',
            subAdminId: 'vendor-001',
            name: 'Navy Blue Suit',
            category: 'Wedding Attire',
            pricePerDay: 55,
            securityDeposit: 110,
            description: 'Sharp navy blue 2-piece suit perfect for wedding guests.',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600',
                'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600',
            ]),
            stockQuantity: 7,
            availableQuantity: 6,
            sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
            createdAt: new Date('2024-02-25T00:00:00.000Z'),
        },
        {
            id: 'prod-007',
            subAdminId: 'vendor-001',
            name: 'Emerald Cocktail Dress',
            category: 'Wedding Attire',
            pricePerDay: 50,
            securityDeposit: 100,
            description: 'Stunning emerald green cocktail dress with wrap silhouette.',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600',
                'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600',
            ]),
            stockQuantity: 5,
            availableQuantity: 4,
            sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL']),
            createdAt: new Date('2024-03-01T00:00:00.000Z'),
        },
        // FORMAL AFFAIR (vendor-002)
        {
            id: 'prod-008',
            subAdminId: 'vendor-002',
            name: 'Charcoal Power Blazer',
            category: 'Blazers',
            pricePerDay: 40,
            securityDeposit: 80,
            description: 'Sharp charcoal grey blazer with structured shoulders.',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600',
                'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600',
            ]),
            stockQuantity: 10,
            availableQuantity: 8,
            sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
            createdAt: new Date('2024-02-01T00:00:00.000Z'),
        },
        {
            id: 'prod-009',
            subAdminId: 'vendor-002',
            name: 'Camel Double-Breasted Blazer',
            category: 'Blazers',
            pricePerDay: 45,
            securityDeposit: 90,
            description: 'Luxurious camel-colored double-breasted blazer.',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1598808503746-f34c53b9323e?w=600',
                'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600',
            ]),
            stockQuantity: 6,
            availableQuantity: 5,
            sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
            createdAt: new Date('2024-02-08T00:00:00.000Z'),
        },
        {
            id: 'prod-010',
            subAdminId: 'vendor-002',
            name: 'Pinstripe Business Suit',
            category: 'Blazers',
            pricePerDay: 60,
            securityDeposit: 120,
            description: 'Classic navy pinstripe 3-piece business suit.',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600',
                'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600',
            ]),
            stockQuantity: 5,
            availableQuantity: 4,
            sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
            createdAt: new Date('2024-02-15T00:00:00.000Z'),
        },
        {
            id: 'prod-011',
            subAdminId: 'vendor-002',
            name: 'Velvet Dinner Jacket',
            category: 'Blazers',
            pricePerDay: 55,
            securityDeposit: 110,
            description: 'Luxurious midnight blue velvet dinner jacket.',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600',
                'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600',
            ]),
            stockQuantity: 4,
            availableQuantity: 3,
            sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
            createdAt: new Date('2024-02-22T00:00:00.000Z'),
        },
        {
            id: 'prod-012',
            subAdminId: 'vendor-002',
            name: 'White Linen Blazer',
            category: 'Blazers',
            pricePerDay: 35,
            securityDeposit: 70,
            description: 'Crisp white linen blazer for summer events.',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600',
                'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600',
            ]),
            stockQuantity: 8,
            availableQuantity: 7,
            sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
            createdAt: new Date('2024-03-01T00:00:00.000Z'),
        },
        {
            id: 'prod-013',
            subAdminId: 'vendor-002',
            name: 'Burgundy Sport Coat',
            category: 'Blazers',
            pricePerDay: 38,
            securityDeposit: 75,
            description: 'Rich burgundy sport coat with subtle texture.',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1598808503746-f34c53b9323e?w=600',
                'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600',
            ]),
            stockQuantity: 6,
            availableQuantity: 5,
            sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
            createdAt: new Date('2024-03-08T00:00:00.000Z'),
        },
        {
            id: 'prod-014',
            subAdminId: 'vendor-002',
            name: 'Tweed Heritage Blazer',
            category: 'Blazers',
            pricePerDay: 42,
            securityDeposit: 85,
            description: 'Classic British tweed blazer in herringbone pattern.',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600',
                'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600',
            ]),
            stockQuantity: 5,
            availableQuantity: 4,
            sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
            createdAt: new Date('2024-03-15T00:00:00.000Z'),
        },
        // ACCESSORY AVENUE (vendor-003)
        {
            id: 'prod-015',
            subAdminId: 'vendor-003',
            name: 'Classic Oxford Dress Shoes',
            category: 'Shoes',
            pricePerDay: 25,
            securityDeposit: 50,
            description: 'Timeless black Oxford dress shoes in genuine leather.',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
                'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600',
            ]),
            stockQuantity: 10,
            availableQuantity: 8,
            sizes: JSON.stringify(['7', '8', '9', '10', '11', '12']),
            createdAt: new Date('2024-02-01T00:00:00.000Z'),
        },
        {
            id: 'prod-016',
            subAdminId: 'vendor-003',
            name: 'Strappy Gold Heels',
            category: 'Shoes',
            pricePerDay: 30,
            securityDeposit: 60,
            description: 'Glamorous strappy gold heels with 4-inch stiletto.',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600',
                'https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=600',
            ]),
            stockQuantity: 8,
            availableQuantity: 6,
            sizes: JSON.stringify(['5', '6', '7', '8', '9']),
            createdAt: new Date('2024-02-08T00:00:00.000Z'),
        },
        {
            id: 'prod-017',
            subAdminId: 'vendor-003',
            name: 'Luxury Leather Belt Collection',
            category: 'Accessories',
            pricePerDay: 10,
            securityDeposit: 20,
            description: 'Set of 3 premium leather belts in black, brown, and tan.',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',
                'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600',
            ]),
            stockQuantity: 15,
            availableQuantity: 12,
            sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
            createdAt: new Date('2024-02-15T00:00:00.000Z'),
        },
        {
            id: 'prod-018',
            subAdminId: 'vendor-003',
            name: 'Diamond Stud Earrings',
            category: 'Accessories',
            pricePerDay: 35,
            securityDeposit: 200,
            description: 'Elegant diamond stud earrings (0.5 carat each).',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600',
                'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600',
            ]),
            stockQuantity: 5,
            availableQuantity: 4,
            sizes: JSON.stringify(['One Size']),
            createdAt: new Date('2024-02-22T00:00:00.000Z'),
        },
        {
            id: 'prod-019',
            subAdminId: 'vendor-003',
            name: 'Designer Clutch Bag',
            category: 'Accessories',
            pricePerDay: 20,
            securityDeposit: 80,
            description: 'Elegant satin clutch bag with gold chain strap.',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600',
                'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600',
            ]),
            stockQuantity: 8,
            availableQuantity: 7,
            sizes: JSON.stringify(['One Size']),
            createdAt: new Date('2024-03-01T00:00:00.000Z'),
        },
        {
            id: 'prod-020',
            subAdminId: 'vendor-003',
            name: 'Silk Tie Collection',
            category: 'Accessories',
            pricePerDay: 8,
            securityDeposit: 15,
            description: 'Premium silk tie collection featuring 5 classic patterns.',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1589756823695-278bc923f962?w=600',
                'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600',
            ]),
            stockQuantity: 20,
            availableQuantity: 18,
            sizes: JSON.stringify(['One Size']),
            createdAt: new Date('2024-03-08T00:00:00.000Z'),
        },
        {
            id: 'prod-021',
            subAdminId: 'vendor-003',
            name: 'Ankle Strap Heels',
            category: 'Shoes',
            pricePerDay: 28,
            securityDeposit: 55,
            description: 'Elegant black ankle strap heels with 3-inch block heel.',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=600',
                'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600',
            ]),
            stockQuantity: 7,
            availableQuantity: 6,
            sizes: JSON.stringify(['5', '6', '7', '8', '9', '10']),
            createdAt: new Date('2024-03-15T00:00:00.000Z'),
        },
        {
            id: 'prod-022',
            subAdminId: 'vendor-003',
            name: 'Gold Cufflinks Set',
            category: 'Accessories',
            pricePerDay: 12,
            securityDeposit: 40,
            description: 'Sophisticated gold cufflinks set with 4 pairs.',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600',
                'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600',
            ]),
            stockQuantity: 12,
            availableQuantity: 10,
            sizes: JSON.stringify(['One Size']),
            createdAt: new Date('2024-03-22T00:00:00.000Z'),
        },
        {
            id: 'prod-023',
            subAdminId: 'vendor-003',
            name: 'Brogue Dress Shoes',
            category: 'Shoes',
            pricePerDay: 22,
            securityDeposit: 45,
            description: 'Classic tan brogue dress shoes with wingtip detailing.',
            images: JSON.stringify([
                'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600',
                'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
            ]),
            stockQuantity: 9,
            availableQuantity: 8,
            sizes: JSON.stringify(['7', '8', '9', '10', '11', '12']),
            createdAt: new Date('2024-03-29T00:00:00.000Z'),
        },
    ];

    for (const p of productsData) {
        await prisma.product.create({ data: p });
    }
    console.log(`✓ Created ${productsData.length} products`);

    // ─── Orders ──────────────────────────────────────────────────────────────
    const ordersData = [
        {
            id: 'order-001',
            customerId: 'user-001',
            customerName: 'James Wilson',
            vendorId: 'vendor-001',
            shopName: 'Elegance Rentals',
            totalAmount: 300,
            status: 'Returned',
            orderDate: new Date('2024-11-10T00:00:00.000Z'),
            paymentMethod: 'Credit Card',
            items: JSON.stringify([{
                productId: 'prod-001',
                productName: 'Midnight Blue Tuxedo',
                vendorId: 'vendor-001',
                vendorShopName: 'Elegance Rentals',
                quantity: 1,
                size: 'L',
                rentalStartDate: '2024-11-15',
                rentalEndDate: '2024-11-19',
                rentalDays: 4,
                subtotal: 300,
                deposit: 150
            }])
        },
        {
            id: 'order-002',
            customerId: 'user-002',
            customerName: 'Emma Thompson',
            vendorId: 'vendor-001',
            shopName: 'Elegance Rentals',
            totalAmount: 450,
            status: 'Returned',
            orderDate: new Date('2024-12-15T00:00:00.000Z'),
            paymentMethod: 'PayPal',
            items: JSON.stringify([
                {
                    productId: 'prod-002',
                    productName: 'Ivory Wedding Gown',
                    vendorId: 'vendor-001',
                    vendorShopName: 'Elegance Rentals',
                    quantity: 1,
                    size: 'S',
                    rentalStartDate: '2024-12-20',
                    rentalEndDate: '2024-12-23',
                    rentalDays: 3,
                    subtotal: 360,
                    deposit: 300
                },
                {
                    productId: 'prod-016',
                    productName: 'Strappy Gold Heels',
                    vendorId: 'vendor-003',
                    vendorShopName: 'Accessory Avenue',
                    quantity: 1,
                    size: '7',
                    rentalStartDate: '2024-12-20',
                    rentalEndDate: '2024-12-23',
                    rentalDays: 3,
                    subtotal: 90,
                    deposit: 60
                }
            ])
        },
        {
            id: 'order-003',
            customerId: 'user-001',
            customerName: 'James Wilson',
            vendorId: 'vendor-002',
            shopName: 'Formal Affair',
            totalAmount: 120,
            status: 'Returned',
            orderDate: new Date('2025-01-05T00:00:00.000Z'),
            paymentMethod: 'Credit Card',
            items: JSON.stringify([{
                productId: 'prod-008',
                productName: 'Charcoal Power Blazer',
                vendorId: 'vendor-002',
                vendorShopName: 'Formal Affair',
                quantity: 1,
                size: 'M',
                rentalStartDate: '2025-01-10',
                rentalEndDate: '2025-01-13',
                rentalDays: 3,
                subtotal: 120,
                deposit: 80
            }])
        },
        {
            id: 'order-004',
            customerId: 'user-003',
            customerName: 'Raj Patel',
            vendorId: 'vendor-002',
            shopName: 'Formal Affair',
            totalAmount: 425,
            status: 'Active',
            orderDate: new Date('2026-02-15T00:00:00.000Z'),
            paymentMethod: 'Credit Card',
            items: JSON.stringify([
                {
                    productId: 'prod-010',
                    productName: 'Pinstripe Business Suit',
                    vendorId: 'vendor-002',
                    vendorShopName: 'Formal Affair',
                    quantity: 1,
                    size: 'L',
                    rentalStartDate: '2026-02-20',
                    rentalEndDate: '2026-02-25',
                    rentalDays: 5,
                    subtotal: 300,
                    deposit: 120
                },
                {
                    productId: 'prod-015',
                    productName: 'Classic Oxford Dress Shoes',
                    vendorId: 'vendor-003',
                    vendorShopName: 'Accessory Avenue',
                    quantity: 1,
                    size: '10',
                    rentalStartDate: '2026-02-20',
                    rentalEndDate: '2026-02-25',
                    rentalDays: 5,
                    subtotal: 125,
                    deposit: 50
                }
            ])
        },
        {
            id: 'order-005',
            customerId: 'user-001',
            customerName: 'James Wilson',
            vendorId: 'vendor-001',
            shopName: 'Elegance Rentals',
            totalAmount: 260,
            status: 'Active',
            orderDate: new Date('2026-02-14T00:00:00.000Z'),
            paymentMethod: 'Cash on Delivery',
            items: JSON.stringify([{
                productId: 'prod-003',
                productName: 'Classic Black Tuxedo',
                vendorId: 'vendor-001',
                vendorShopName: 'Elegance Rentals',
                quantity: 1,
                size: 'M',
                rentalStartDate: '2026-02-18',
                rentalEndDate: '2026-02-22',
                rentalDays: 4,
                subtotal: 260,
                deposit: 130
            }])
        }
    ];

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

