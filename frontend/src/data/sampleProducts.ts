import { Product } from '@/types';

export const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium quality wireless headphones with noise cancellation and 30-hour battery life.',
    price: 2999,
    originalPrice: 4999,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    category: 'Electronics',
    stock: 15,
    rating: 4.5,
    reviews: 128,
    brand: 'TechPro',
    features: ['Noise Cancellation', '30hr Battery', 'Wireless', 'Fast Charging'],
    specifications: {
      'Battery Life': '30 hours',
      'Connectivity': 'Bluetooth 5.0',
      'Weight': '250g',
      'Warranty': '1 year'
    }
  },
  {
    id: '2',
    name: 'Smart Fitness Watch',
    description: 'Advanced fitness tracking watch with heart rate monitor, GPS, and waterproof design.',
    price: 8999,
    originalPrice: 12999,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    category: 'Electronics',
    stock: 8,
    rating: 4.8,
    reviews: 342,
    brand: 'FitTech',
    features: ['Heart Rate Monitor', 'GPS Tracking', 'Waterproof', 'Sleep Tracking'],
    specifications: {
      'Display': '1.4" AMOLED',
      'Battery': '7 days',
      'Water Resistance': '5ATM',
      'Sensors': 'Heart Rate, GPS, Accelerometer'
    }
  },
  {
    id: '3',
    name: 'Organic Cotton T-Shirt',
    description: 'Comfortable organic cotton t-shirt in various colors. Eco-friendly and sustainable.',
    price: 799,
    originalPrice: 1299,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    category: 'Clothing',
    stock: 25,
    rating: 4.3,
    reviews: 89,
    brand: 'EcoWear',
    features: ['100% Organic Cotton', 'Sustainable', 'Comfortable Fit', 'Multiple Colors'],
    specifications: {
      'Material': '100% Organic Cotton',
      'Fit': 'Regular',
      'Care': 'Machine Washable',
      'Origin': 'India'
    }
  },
  {
    id: '4',
    name: 'Professional Camera Lens',
    description: '50mm f/1.8 prime lens perfect for portrait photography with beautiful bokeh effect.',
    price: 15999,
    image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=400&fit=crop',
    category: 'Electronics',
    stock: 5,
    rating: 4.9,
    reviews: 67,
    brand: 'CameraTech',
    features: ['f/1.8 Aperture', 'Portrait Photography', 'Bokeh Effect', 'Professional Grade'],
    specifications: {
      'Focal Length': '50mm',
      'Aperture': 'f/1.8',
      'Mount': 'Canon EF',
      'Weight': '160g'
    }
  },
  {
    id: '5',
    name: 'Ceramic Coffee Mug Set',
    description: 'Beautiful set of 4 ceramic coffee mugs with elegant design. Perfect for your morning coffee.',
    price: 1499,
    originalPrice: 2199,
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=400&h=400&fit=crop',
    category: 'Home & Kitchen',
    stock: 30,
    rating: 4.6,
    reviews: 234,
    brand: 'HomeEssentials',
    features: ['Set of 4', 'Ceramic Material', 'Elegant Design', 'Dishwasher Safe'],
    specifications: {
      'Material': 'Ceramic',
      'Capacity': '350ml each',
      'Set': '4 pieces',
      'Care': 'Dishwasher Safe'
    }
  },
  {
    id: '6',
    name: 'Gaming Mechanical Keyboard',
    description: 'RGB backlit mechanical keyboard with blue switches, perfect for gaming and typing.',
    price: 4599,
    originalPrice: 6999,
    image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=400&fit=crop',
    category: 'Electronics',
    stock: 12,
    rating: 4.7,
    reviews: 156,
    brand: 'GameTech',
    features: ['Mechanical Switches', 'RGB Backlight', 'Gaming Optimized', 'Durable Build'],
    specifications: {
      'Switch Type': 'Blue Mechanical',
      'Backlighting': 'RGB',
      'Connection': 'USB-C',
      'Layout': 'Full Size'
    }
  },
  {
    id: '7',
    name: 'Yoga Mat Premium',
    description: 'Non-slip premium yoga mat with excellent grip and cushioning for all yoga practices.',
    price: 2299,
    originalPrice: 3499,
    image: 'https://images.unsplash.com/photo-1506629905607-c38b5c01e4d7?w=400&h=400&fit=crop',
    category: 'Sports & Fitness',
    stock: 18,
    rating: 4.4,
    reviews: 92,
    brand: 'YogaEssentials',
    features: ['Non-Slip Surface', 'Extra Cushioning', 'Eco-Friendly', 'Portable'],
    specifications: {
      'Thickness': '6mm',
      'Material': 'TPE',
      'Size': '183cm x 61cm',
      'Weight': '1.2kg'
    }
  },
  {
    id: '8',
    name: 'Skincare Set - Natural',
    description: 'Complete natural skincare set with cleanser, toner, serum, and moisturizer.',
    price: 3999,
    originalPrice: 5999,
    image: 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400&h=400&fit=crop',
    category: 'Beauty & Personal Care',
    stock: 22,
    rating: 4.8,
    reviews: 189,
    brand: 'NaturalGlow',
    features: ['All Natural', 'Complete Set', 'Suitable for All Skin Types', 'Cruelty Free'],
    specifications: {
      'Set Includes': 'Cleanser, Toner, Serum, Moisturizer',
      'Skin Type': 'All Types',
      'Size': 'Full Size Products',
      'Ingredients': '100% Natural'
    }
  },
  {
    id: '9',
    name: 'Smart Home Speaker',
    description: 'Voice-controlled smart speaker with excellent sound quality and smart home integration.',
    price: 6999,
    originalPrice: 9999,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    category: 'Electronics',
    stock: 0, // Out of stock
    rating: 4.6,
    reviews: 278,
    brand: 'SmartTech',
    features: ['Voice Control', 'Smart Home Integration', 'Premium Sound', 'Multiple Colors'],
    specifications: {
      'Voice Assistant': 'Built-in',
      'Connectivity': 'WiFi, Bluetooth',
      'Power': '15W',
      'Compatibility': 'iOS, Android'
    }
  },
  {
    id: '10',
    name: 'Cooking Pot Set',
    description: 'Stainless steel cooking pot set with non-stick coating. Perfect for all cooking needs.',
    price: 3599,
    originalPrice: 5299,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
    category: 'Home & Kitchen',
    stock: 3, // Low stock
    rating: 4.5,
    reviews: 145,
    brand: 'KitchenPro',
    features: ['Stainless Steel', 'Non-Stick Coating', 'Set of 5', 'Dishwasher Safe'],
    specifications: {
      'Material': 'Stainless Steel',
      'Set Size': '5 pieces',
      'Coating': 'Non-Stick',
      'Compatibility': 'Gas, Electric, Induction'
    }
  },
  {
    id: '11',
    name: 'Milk packet | Pala Packet',
    description: 'Organic Milk .',
    price: 10,
    originalPrice: 20,
    image: '/milk.jpeg',
    category: 'Home & Kitchen',
    stock: 3, // Low stock
    rating: 4.5,
    reviews: 145,
    brand: 'Heritage',
    features: ['Organic', 'Non-Light', 'High Fat', 'Safe For Children and Adults'],
    specifications: {
      'Substance': 'Liquid',
      'Set Size': '1 piece',
      'Coating': 'Plastic',
      'Compatibility': 'Gas, Electric, Induction'
    }
  }
];

export const getProductById = (id: string): Product | undefined => {
  return sampleProducts.find(product => product.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  return sampleProducts.filter(product => product.category === category);
};

export const searchProducts = (query: string): Product[] => {
  const lowercaseQuery = query.toLowerCase();
  return sampleProducts.filter(product =>
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.description.toLowerCase().includes(lowercaseQuery) ||
    product.category.toLowerCase().includes(lowercaseQuery) ||
    product.brand?.toLowerCase().includes(lowercaseQuery)
  );
};