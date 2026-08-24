import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seedProducts = [
  {
    name: "iPhone 16 Pro Max",
    storage: "256GB",
    color: "Natural",
    batteryCondition: 92,
    physicalCondition: "IMPECABLE" as const,
    cost: 720,
    salePrice: 900,
    daysAgo: 1,
  },
  {
    name: "iPhone 16 Pro",
    storage: "512GB",
    color: "Natural",
    batteryCondition: 90,
    physicalCondition: "EXCELENTE" as const,
    cost: 650,
    salePrice: 800,
    daysAgo: 2,
  },
  {
    name: "iPhone 15",
    storage: "128GB",
    color: "Black",
    batteryCondition: 90,
    physicalCondition: "MUY_BUENO" as const,
    cost: 320,
    salePrice: 415,
    daysAgo: 3,
  },
  {
    name: "iPhone 15",
    storage: "128GB",
    color: "Pink",
    batteryCondition: 87,
    physicalCondition: "EXCELENTE" as const,
    cost: 340,
    salePrice: 450,
    daysAgo: 4,
  },
  {
    name: "iPhone 14 Plus",
    storage: "256GB",
    color: "Lila",
    batteryCondition: 87,
    physicalCondition: "MUY_BUENO" as const,
    cost: 360,
    salePrice: 470,
    daysAgo: 5,
  },
  {
    name: "iPhone 14",
    storage: "128GB",
    color: "Yellow",
    batteryCondition: 84,
    physicalCondition: "BUENO" as const,
    cost: 280,
    salePrice: 370,
    daysAgo: 6,
  },
  {
    name: "iPhone 13",
    storage: "128GB",
    color: "Negro",
    batteryCondition: 100,
    physicalCondition: "IMPECABLE" as const,
    cost: 240,
    salePrice: 320,
    daysAgo: 7,
  },
  {
    name: "iPhone 11",
    storage: "128GB",
    color: "Blanco",
    batteryCondition: 100,
    physicalCondition: "EXCELENTE" as const,
    cost: 110,
    salePrice: 160,
    daysAgo: 8,
  },
];

const soldSeeds = [
  {
    name: "iPhone 14 Pro",
    storage: "128GB",
    color: "Space Black",
    batteryCondition: 88,
    physicalCondition: "EXCELENTE" as const,
    cost: 450,
    salePrice: 580,
    soldPrice: 560,
    channel: "INSTAGRAM" as const,
    daysAgoSold: 0,
  },
  {
    name: "iPhone 13 Pro",
    storage: "256GB",
    color: "Graphite",
    batteryCondition: 91,
    physicalCondition: "MUY_BUENO" as const,
    cost: 380,
    salePrice: 490,
    soldPrice: 480,
    channel: "CLIENTE" as const,
    daysAgoSold: 2,
  },
  {
    name: "iPhone 12",
    storage: "128GB",
    color: "Blue",
    batteryCondition: 85,
    physicalCondition: "BUENO" as const,
    cost: 180,
    salePrice: 250,
    soldPrice: 240,
    channel: "FACEBOOK_MARKETPLACE" as const,
    daysAgoSold: 5,
  },
  {
    name: "MacBook Air M1",
    storage: "256GB",
    color: "Space Gray",
    batteryCondition: null,
    physicalCondition: "EXCELENTE" as const,
    cost: 420,
    salePrice: 550,
    soldPrice: 530,
    channel: "REFERIDO" as const,
    daysAgoSold: 8,
    type: "MACBOOK" as const,
  },
  {
    name: "iPhone SE 2022",
    storage: "64GB",
    color: "Red",
    batteryCondition: 93,
    physicalCondition: "IMPECABLE" as const,
    cost: 120,
    salePrice: 180,
    soldPrice: 170,
    channel: "OTRO" as const,
    daysAgoSold: 12,
  },
];

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function placeholder(name: string) {
  const label = encodeURIComponent(name.split(" ").slice(0, 2).join(" "));
  return `https://placehold.co/120x120/1a1a1a/2ecc71/png?text=${label}&font=inter`;
}

async function main() {
  await prisma.sale.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.appCounter.deleteMany();

  let code = 0;

  for (const item of seedProducts) {
    code += 1;
    await prisma.product.create({
      data: {
        internalCode: `EP-${String(code).padStart(4, "0")}`,
        type: "IPHONE",
        name: item.name,
        storage: item.storage,
        color: item.color,
        batteryCondition: item.batteryCondition,
        physicalCondition: item.physicalCondition,
        cost: item.cost,
        salePrice: item.salePrice,
        description: null,
        status: "AVAILABLE",
        createdAt: daysAgo(item.daysAgo),
        images: {
          create: [
            {
              url: placeholder(item.name),
              isPrimary: true,
              sortOrder: 0,
            },
          ],
        },
      },
    });
  }

  for (const item of soldSeeds) {
    code += 1;
    const product = await prisma.product.create({
      data: {
        internalCode: `EP-${String(code).padStart(4, "0")}`,
        type: item.type ?? "IPHONE",
        name: item.name,
        storage: item.storage,
        color: item.color,
        batteryCondition: item.batteryCondition,
        physicalCondition: item.physicalCondition,
        cost: item.cost,
        salePrice: item.salePrice,
        status: "SOLD",
        createdAt: daysAgo(item.daysAgoSold + 10),
        images: {
          create: [{ url: placeholder(item.name), isPrimary: true, sortOrder: 0 }],
        },
        sale: {
          create: {
            soldPrice: item.soldPrice,
            channel: item.channel,
            soldAt: daysAgo(item.daysAgoSold),
          },
        },
      },
    });
    void product;
  }

  await prisma.appCounter.create({
    data: { id: "product", value: code },
  });

  console.log(`Seeded ${code} products (${seedProducts.length} available).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
