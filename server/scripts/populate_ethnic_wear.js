const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const newProducts = [
    {
        name: "Maharaja Silk Kurta Set",
        category: "Ethnic Wear",
        description: "An exquisite hand-embroidered silk kurta set for young gentlemen. Featuring traditional floral motifs and a regal silhouette, this ensemble is designed for grand wedding celebrations and festive ceremonies.",
        pricePerDay: 1500,
        retailPrice: 15000,
        securityDeposit: 3000,
        stockQuantity: 5,
        availableQuantity: 5,
        sizes: ["S", "M", "L", "XL"],
        images: ["https://images.unsplash.com/photo-1632215165922-a9b014389f41?auto=format&fit=crop&q=80&w=1080"],
        subAdminId: "vendor-003"
    },
    {
        name: "Midnight Velvet Tuxedo",
        category: "Formal Affair",
        description: "A sharp, tailored blue-velvet tuxedo for boys. Crafted from premium wool-blend fabric with satin lapels, this sophisticated outfit brings timeless elegance to any gala or black-tie event.",
        pricePerDay: 2500,
        retailPrice: 22000,
        securityDeposit: 5000,
        stockQuantity: 3,
        availableQuantity: 3,
        sizes: ["M", "L", "XL"],
        images: ["https://images.unsplash.com/photo-1519255282436-07850020edcc?auto=format&fit=crop&q=80&w=1080"],
        subAdminId: "vendor-003"
    },
    {
        name: "Royal Maroon Benarasi Saree",
        category: "Ethnic Wear",
        description: "A masterpiece of Indian craftsmanship, this maroon silk saree features intricate gold zari work and a heavy pallu. Perfect for brides and luxury wedding guests seeking a majestic and traditional look.",
        pricePerDay: 4500,
        retailPrice: 85000,
        securityDeposit: 10000,
        stockQuantity: 2,
        availableQuantity: 2,
        sizes: ["One Size"],
        images: ["https://images.unsplash.com/photo-1610030469614-257a0709b1f0?auto=format&fit=crop&q=80&w=1080"],
        subAdminId: "vendor-003"
    },
    {
        name: "Sun-Kissed Zardosi Lehenga",
        category: "Indian Wedding",
        description: "A breathtaking yellow and maroon lehenga choli set adorned with ornate sequins and Zardosi embroidery. This high-fashion ensemble captures the vibrant spirit of Indian weddings with a luxurious, modern twist.",
        pricePerDay: 5500,
        retailPrice: 120000,
        securityDeposit: 15000,
        stockQuantity: 2,
        availableQuantity: 2,
        sizes: ["S", "M", "L"],
        images: ["https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=1080"],
        subAdminId: "vendor-003"
    },
    {
        name: "Ivory Imperial Sherwani",
        category: "Indian Wedding",
        description: "A classic ivory sherwani designed for the modern groom. Featuring a structured fit, delicate threadwork, and artisanal buttons, this piece embodies the pinnacle of royal Indian menswear.",
        pricePerDay: 6500,
        retailPrice: 150000,
        securityDeposit: 20000,
        stockQuantity: 1,
        availableQuantity: 1,
        sizes: ["M", "L", "XL"],
        images: ["https://images.unsplash.com/photo-1597113366853-9a93ad3fed2e?auto=format&fit=crop&q=80&w=1080"],
        subAdminId: "vendor-003"
    }
];

async function main() {
    console.log('--- Starting Seeding ---');
    for (const product of newProducts) {
        const created = await prisma.product.create({
            data: product
        });
        console.log(`Created product: ${created.name} (${created.id})`);
    }
    console.log('--- Seeding Finished ---');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
