// sanityCategorySeeder.js
import sanityClient from "@sanity/client";

const client = sanityClient({
  projectId: "0d62jtoi",
  dataset: "production",
  token:
    "skVkinRc4oIHmRPbA3ZBCrqWYxN282OH2Mo0x4WHjhP1lGXZmtd3RF5AOf346WuQYkkoOBuO7wLJMDYtoeVjlKqXF6vTlDnEQO75QHGcyuz17WuxIBt9V4kzU5TBNE2VACovn8vf46YUBVujqtP3XJOO2alyExn1w53oQERRVf6apPewl1eB", // must have write access
  useCdn: false,
});

const mainCategories = [
  {
    title: "Tops",
    slug: "tops",
    description: "Running tops, t-shirts, and upper body apparel",
  },
  {
    title: "Bottoms",
    slug: "bottoms",
    description: "Running shorts, tights, and lower body apparel",
  },
  {
    title: "Outerwear",
    slug: "outerwear",
    description: "Running jackets, windbreakers, and weather protection",
  },
  {
    title: "Shoes",
    slug: "shoes",
    description: "Running shoes for road, trail, and training",
  },
  {
    title: "Accessories",
    slug: "accessories",
    description: "Hats, socks, and running accessories",
  },
];

const subcategories = [
  // Tops
  {
    title: "T-Shirts",
    slug: "t-shirts",
    description: "Performance and casual running t-shirts",
    parentSlug: "tops",
  },
  {
    title: "Long Sleeves",
    slug: "long-sleeves",
    description: "Long sleeve running tops for cooler weather",
    parentSlug: "tops",
  },
  {
    title: "Tank Tops",
    slug: "tank-tops",
    description: "Sleeveless running tops for hot weather",
    parentSlug: "tops",
  },
  {
    title: "Hoodies",
    slug: "hoodies",
    description: "Running hoodies and sweatshirts",
    parentSlug: "tops",
  },
  {
    title: "Compression",
    slug: "compression",
    description: "Compression and base layer tops",
    parentSlug: "tops",
  },

  // Bottoms
  {
    title: "Shorts",
    slug: "shorts",
    description: "Running shorts for all distances",
    parentSlug: "bottoms",
  },
  {
    title: "Tights",
    slug: "tights",
    description: "Compression tights and leggings",
    parentSlug: "bottoms",
  },
  {
    title: "Joggers",
    slug: "joggers",
    description: "Training pants and track pants",
    parentSlug: "bottoms",
  },

  // Outerwear
  {
    title: "Running Jackets",
    slug: "running-jackets",
    description: "Lightweight running jackets",
    parentSlug: "outerwear",
  },
  {
    title: "Windbreakers",
    slug: "windbreakers",
    description: "Wind-resistant running tops",
    parentSlug: "outerwear",
  },
  {
    title: "Rain Jackets",
    slug: "rain-jackets",
    description: "Waterproof running protection",
    parentSlug: "outerwear",
  },

  // Shoes
  {
    title: "Road Running",
    slug: "road-running",
    description: "Shoes for road and pavement running",
    parentSlug: "shoes",
  },
  {
    title: "Trail Running",
    slug: "trail-running",
    description: "Shoes for off-road and trail running",
    parentSlug: "shoes",
  },
  {
    title: "Training",
    slug: "training",
    description: "Multi-purpose training shoes",
    parentSlug: "shoes",
  },

  // Accessories
  {
    title: "Hats & Caps",
    slug: "hats-caps",
    description: "Running hats, caps, and beanies",
    parentSlug: "accessories",
  },
  {
    title: "Socks",
    slug: "socks",
    description: "Running socks and compression socks",
    parentSlug: "accessories",
  },
  {
    title: "Other Accessories",
    slug: "other-accessories",
    description: "Gloves, arm warmers, and other gear",
    parentSlug: "accessories",
  },
];

async function createCategory(cat, parentId = null, type = "main") {
  const doc = {
    _type: "category",
    title: cat.title,
    slug: { _type: "slug", current: cat.slug },
    description: cat.description,
    categoryType: type === "main" ? "main" : "subcategory",
    parentCategory: parentId
      ? { _type: "reference", _ref: parentId }
      : undefined,
    visibility: { navigation: true, filters: true },
    sortOrder:
      type === "main"
        ? mainCategories.findIndex((c) => c.slug === cat.slug) + 1
        : 0,
    featured:
      type === "main" && ["Tops", "Bottoms", "Shoes"].includes(cat.title),
    seo: {
      title: cat.title,
      description: cat.description,
      keywords: [cat.title.toLowerCase(), "running", "athletic"],
    },
  };

  try {
    const created = await client.createIfNotExists({ ...doc, _id: cat.slug });
    console.log(`✅ Created: ${cat.title} (${type})`);
    return created._id;
  } catch (error) {
    console.error(`❌ Error creating ${cat.title}:`, error.message);
    return null;
  }
}

async function seed() {
  console.log("🌱 Starting category seeding...");

  try {
    console.log("📝 Creating main categories...");
    const mainIds = {};
    for (const cat of mainCategories) {
      const id = await createCategory(cat, null, "main");
      if (id) mainIds[cat.slug] = id;
    }

    console.log("📝 Creating subcategories...");
    for (const sub of subcategories) {
      const parentId = mainIds[sub.parentSlug];
      if (parentId) {
        await createCategory(sub, parentId, "subcategory");
      } else {
        console.log(`⚠️ Skipping ${sub.title} - parent not found`);
      }
    }

    console.log("🎉 Category seeding complete!");
    console.log(
      `📊 Created ${Object.keys(mainIds).length} main categories and ${
        subcategories.length
      } subcategories`
    );
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  }
}

seed().catch((err) => console.error(err));
