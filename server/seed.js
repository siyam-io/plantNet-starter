const { MongoClient } = require('mongodb');
const dns = require('dns');
const fs = require('fs');
const path = require('path');
dns.setDefaultResultOrder('ipv4first');

// Load .env manually
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      process.env[key] = value.trim();
    }
  });
const MONGODB_URI = "mongodb://yt:MNuNg1eKCoTi9cau@cluster0-shard-00-00.kgw4w.mongodb.net:27017,cluster0-shard-00-01.kgw4w.mongodb.net:27017,cluster0-shard-00-02.kgw4w.mongodb.net:27017/plantNet?ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

const plants = [
  {
    name: "Snake Plant (Sansevieria)",
    category: "Indoor",
    description: "Extremely resilient indoor plant known for its air-purifying qualities. Requires very low maintenance and infrequent watering.",
    image: "https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?q=80&w=400&auto=format&fit=crop",
    price: 25.0,
    quantity: 15,
    seller: {
      name: "Siyam Ahmed",
      image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop",
      email: "ssiyam563@gmail.com"
    }
  },
  {
    name: "Fiddle Leaf Fig",
    category: "Indoor",
    description: "A popular indoor tree featuring large, glossy violin-shaped leaves. Prefers bright, indirect sunlight.",
    image: "https://images.unsplash.com/photo-1597055181300-e3633a207518?q=80&w=400&auto=format&fit=crop",
    price: 45.0,
    quantity: 8,
    seller: {
      name: "Siyam Ahmed",
      image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop",
      email: "ssiyam563@gmail.com"
    }
  },
  {
    name: "Golden Pothos",
    category: "Indoor",
    description: "Fast-growing trailing vine with heart-shaped variegated leaves. Perfect for hanging baskets or climbing poles.",
    image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=400&auto=format&fit=crop",
    price: 18.0,
    quantity: 20,
    seller: {
      name: "Siyam Ahmed",
      image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop",
      email: "ssiyam563@gmail.com"
    }
  },
  {
    name: "Red Rose Bush",
    category: "Flowering",
    description: "Classic outdoor flowering shrub that produces beautiful crimson blossoms with a sweet fragrance.",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400&auto=format&fit=crop",
    price: 30.0,
    quantity: 12,
    seller: {
      name: "Siyam Ahmed",
      image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop",
      email: "ssiyam563@gmail.com"
    }
  },
  {
    name: "Aloe Vera",
    category: "Succulent",
    description: "Medicinal succulent containing soothing gel inside its thick, fleshy leaves. Thrives in dry and sunny conditions.",
    image: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?q=80&w=400&auto=format&fit=crop",
    price: 15.0,
    quantity: 25,
    seller: {
      name: "Siyam Ahmed",
      image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop",
      email: "ssiyam563@gmail.com"
    }
  },
  {
    name: "Boston Fern",
    category: "Outdoor",
    description: "Lush fern with graceful, arching fronds. Performs best in shaded outdoor spots or patios with high humidity.",
    image: "https://images.unsplash.com/photo-1545241047-6083a3684587?q=80&w=400&auto=format&fit=crop",
    price: 22.0,
    quantity: 10,
    seller: {
      name: "Siyam Ahmed",
      image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop",
      email: "ssiyam563@gmail.com"
    }
  }
];

async function seed() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db("plantNet");
    const plantsCollection = db.collection("plantsDb");

    console.log("Clearing existing plants database...");
    await plantsCollection.deleteMany({});
    
    console.log("Seeding mock plants...");
    const result = await plantsCollection.insertMany(plants);
    console.log(`Successfully seeded ${result.insertedCount} plants!`);
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    await client.close();
    process.exit(0);
  }
}

seed();
