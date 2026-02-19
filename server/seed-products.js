const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Seeding Demo Products ---');

    // First, find a sub-admin to assign these products to
    const subAdmin = await prisma.user.findFirst({
        where: { role: 'Sub-Admin' }
    });

    if (!subAdmin) {
        console.error('No Sub-Admin found. Please create a Sub-Admin user first.');
        return;
    }

    const products = [
        {
            name: 'Sabyasachi Heritage Lehengas',
            category: 'Wedding Attire',
            description: 'Hand-embroidered silk lehenga with intricate zardosi work. By Heritage Couture.',
            pricePerDay: 1500,
            retailPrice: 8500,
            securityDeposit: 2000,
            stockQuantity: 2,
            availableQuantity: 2,
            sizes: ['S', 'M', 'L'],
            images: [
                'https://images.unsplash.com/photo-1583391733956-6c7827011d04?q=80&w=800',
                'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800',
                'https://images.unsplash.com/photo-1621236304192-f75604107197?q=80&w=800'
            ],
            subAdminId: subAdmin.id
        },
        {
            name: 'Louis Vuitton Capucines Bag',
            category: 'Luxury Bags',
            description: 'The iconic Capucines MM in Taurillon leather. From Elite Rentals.',
            pricePerDay: 450,
            retailPrice: 5200,
            securityDeposit: 1000,
            stockQuantity: 1,
            availableQuantity: 1,
            sizes: ['One Size'],
            images: [
                'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800',
                'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800'
            ],
            subAdminId: subAdmin.id
        },
        {
            name: 'Rolex Datejust 41',
            category: 'Watches',
            description: 'Oystersteel and White Gold Datejust with a blue fluted dial. By Timepiece Lounge.',
            pricePerDay: 300,
            retailPrice: 12000,
            securityDeposit: 2500,
            stockQuantity: 1,
            availableQuantity: 1,
            sizes: ['One Size'],
            images: [
                'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=800',
                'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?q=80&w=800',
                'https://images.unsplash.com/photo-1547996160-81dfa63595dd?q=80&w=800'
            ],
            subAdminId: subAdmin.id
        },
        {
            name: 'Armani Velvet Evening Suit',
            category: "Men's Suits",
            description: 'Midnight blue velvet tuxedo with silk lapels. By Suited Perfection.',
            pricePerDay: 250,
            retailPrice: 1800,
            securityDeposit: 500,
            stockQuantity: 3,
            availableQuantity: 3,
            sizes: ['M', 'L', 'XL'],
            images: [
                'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800',
                'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?q=80&w=800'
            ],
            subAdminId: subAdmin.id
        },
        {
            name: 'Manolo Blahnik Hangisi Pumps',
            category: 'Footwear',
            description: 'Crystal-buckled satin pumps in cobalt blue. From Step into Luxury.',
            pricePerDay: 120,
            retailPrice: 995,
            securityDeposit: 300,
            stockQuantity: 4,
            availableQuantity: 4,
            sizes: ['37', '38', '39', '40'],
            images: [
                'https://images.unsplash.com/photo-1543163521-1bf539c55bb2?q=80&w=800',
                'https://images.unsplash.com/photo-1512374382149-433a72b9a5a5?q=80&w=800'
            ],
            subAdminId: subAdmin.id
        },
        {
            name: 'Christian Dior Book Tote',
            category: 'Luxury Bags',
            description: 'Signature Oblique embroidery in burgundy. From Elite Rentals.',
            pricePerDay: 200,
            retailPrice: 3500,
            securityDeposit: 800,
            stockQuantity: 2,
            availableQuantity: 2,
            sizes: ['One Size'],
            images: [
                'https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=800',
                'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800'
            ],
            subAdminId: subAdmin.id
        },
        {
            name: 'Cartier Love Bracelet',
            category: 'Jewelry',
            description: '18K Yellow Gold Love Bracelet. From Golden Glow.',
            pricePerDay: 180,
            retailPrice: 6900,
            securityDeposit: 1500,
            stockQuantity: 1,
            availableQuantity: 1,
            sizes: ['16', '17', '18'],
            images: [
                'https://images.unsplash.com/photo-1515562141207-7a88fb0537bf?q=80&w=800',
                'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800'
            ],
            subAdminId: subAdmin.id
        }
    ];

    for (const product of products) {
        const created = await prisma.product.create({
            data: product
        });
        console.log(`Created: ${created.name}`);
    }

    console.log('--- Seeding Complete ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
