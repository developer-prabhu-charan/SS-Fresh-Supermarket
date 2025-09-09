const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const axios = require('axios');
const Product = require('./models/Product');
const Customer = require('./models/Customer');
const Order = require('./models/Order');
const OutOfStock = require('./models/OutOfStock');

// Helper function to convert id to _id for MongoDB queries
const convertIdToObjectId = (id) => {
  // Check if the id is a valid ObjectId format
  if (mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  return id; // Return as-is if not a valid ObjectId
};

const app = express();
app.use(cors());
app.use(express.json());

// Diagnostic route to confirm running server version
const fs = require('fs');
app.get('/__server_version', (req, res) => {
  try {
    const stat = fs.statSync(__filename);
    res.json({ pid: process.pid, file: __filename, mtime: stat.mtime });
  } catch (e) {
    res.json({ pid: process.pid });
  }
});

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));



const sendTelegramNotification = async (order) => {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // Check if both credentials are set
    if (!botToken || !chatId) {
      console.warn('Telegram bot credentials not configured. Skipping notification.');
      return;
    }

    // Construct the list of items for the message
    const itemsList = (order.products || []).map(p => {
        // Use optional chaining for safe access
        const name = p.productId?.name || 'Unknown Product';
        const price = p.productId?.price || 0;
        const total = price * p.quantity;
        return `- ${name} (Qty: ${p.quantity}) - ₹${total.toFixed(2)}`;
    }).join('\n');

    // ⭐ KEY CHANGE: Add the maps link to the message
    const mapsLink = order.location?.mapsLink ? `[View on Google Maps](${order.location.mapsLink})` : '';

    const message = `
🛒 *NEW ORDER RECEIVED*
*Order ID:* \`${order._id}\`
*Customer:* ${order.customer_name || 'N/A'}
*Phone:* \`${order.phone || 'N/A'}\`
*Total Amount:* ₹${(order.total || 0).toFixed(2)}
*Payment Method:* ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Pay via QR Code'}
*Address:* ${order.address || 'N/A'}
*Location:* ${order.location?.city || 'N/A'} ${mapsLink}

*Items:*
${itemsList || 'No items listed'}
    `;

    await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown'
    });

    console.log('Telegram notification sent successfully.');
  } catch (error) {
    console.error('Failed to send Telegram notification:', error.message);
  }
};

// Product CRUD
app.post('/api/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.json(product);
  } catch (err) {
    console.error('Product creation failed:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});
// ⭐ NEW: Route to get a single product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(convertIdToObjectId(req.params.id));
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error('Failed to fetch product:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error('Failed to fetch products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});
// Update product fields (admin)
app.patch('/api/products/:id', async (req, res) => {
  try {
    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.price !== undefined) updates.price = req.body.price;
    if (req.body.originalPrice !== undefined) updates.originalPrice = req.body.originalPrice;
    if (req.body.stock !== undefined) updates.stock = req.body.stock;
    if (req.body.imageUrl !== undefined) updates.imageUrl = req.body.imageUrl;
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.available !== undefined) updates.available = req.body.available;
    if (req.body.featured !== undefined) updates.featured = req.body.featured;
    if (req.body.details !== undefined) updates.details = req.body.details;
    if (req.body.specifications !== undefined) updates.specifications = req.body.specifications;
    if (req.body.availability !== undefined) updates.availability = req.body.availability;
    if (req.body.category !== undefined) updates.category = req.body.category;
    
    const product = await Product.findByIdAndUpdate(convertIdToObjectId(req.params.id), { $set: updates }, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error('Product update failed:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is live 🚀" });
});

// Add PUT route for full product updates (admin dashboard)
app.put('/api/products/:id', async (req, res) => {
  try {
    console.log('PUT /api/products/:id - Received data:', req.body);
    console.log('Product ID:', req.params.id);

    // Filter and validate the update data
    const allowedFields = {
      name: req.body.name,
      category: req.body.category,
      price: req.body.price,
      originalPrice: req.body.originalPrice,
      stock: req.body.stock,
      imageUrl: req.body.imageUrl,
      description: req.body.description,
      available: req.body.available,
      featured: req.body.featured,
      details: req.body.details,
      specifications: req.body.specifications,
      availability: req.body.availability
    };

    // Remove undefined values and convert empty strings to null for optional fields
    const updateData = Object.fromEntries(
      Object.entries(allowedFields).filter(([_, value]) => value !== undefined)
    );

    // Convert empty strings to null for optional string fields
    if (updateData.imageUrl === '') updateData.imageUrl = null;
    if (updateData.description === '') updateData.description = null;
    if (updateData.details === '') updateData.details = null;
    if (updateData.specifications === '') updateData.specifications = null;

    console.log('Processed update data:', updateData);

    const product = await Product.findByIdAndUpdate(convertIdToObjectId(req.params.id), { $set: updateData }, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    console.log('Updated product:', product);
    res.json(product);
  } catch (err) {
    console.error('Product update failed:', err);
    res.status(500).json({ error: 'Failed to update product', details: err.message });
  }
});
// Delete product (admin)
app.delete('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(convertIdToObjectId(req.params.id));
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Product delete failed:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Track out-of-stock searches from frontend
app.post('/api/out-of-stock', async (req, res) => {
  try {
    const { searchTerm } = req.body;
    
    if (!searchTerm || searchTerm.trim().length === 0) {
      return res.status(400).json({ error: 'Search term is required' });
    }

    // Get user info if logged in
    let userId = null;
    const auth = req.headers.authorization;
    if (auth) {
      try {
        const jwt = require('jsonwebtoken');
        const token = auth.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
        userId = decoded.id;
      } catch (tokenError) {
        // Token invalid, continue without user ID
      }
    }

    // Create out-of-stock record
    const outOfStockRecord = new OutOfStock({
      searchTerm: searchTerm.trim(),
      username: userId,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.connection.remoteAddress,
      sessionId: req.headers['x-session-id'] // Optional session tracking
    });

    await outOfStockRecord.save();
    console.log(`Out-of-stock search tracked: "${searchTerm}" by user: ${userId || 'anonymous'}`);

    res.json({ success: true, message: 'Search term tracked' });

  } catch (error) {
    console.error('Failed to track out-of-stock search:', error);
    res.status(500).json({ error: 'Failed to track search' });
  }
});

// Customer registration/login (simple example)
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

app.post('/api/customers', async (req, res) => {
  try {
    // Expect only firstName (or name), phone and password
    const { firstName, phone, password, address } = req.body;
    const name = firstName || req.body.name || '';
    if (!phone || !password || !name) return res.status(400).json({ error: 'name, phone and password are required' });
    const existing = await Customer.findOne({ phone });
    if (existing) return res.status(400).json({ error: 'Phone already registered' });
    // Store password as plain text (per request). NOTE: insecure.
    const customer = new Customer({ name, phone, password, address });
    await customer.save();
    res.json({ id: customer._id, name: customer.name, phone: customer.phone });
  } catch (err) {
    console.error('Registration failed:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    // Accept identifier as phone or name
    const { identifier, password, mobile } = req.body;
    const ident = identifier || mobile || req.body.email || req.body.mobile;
    if (!ident || !password) return res.status(400).json({ error: 'identifier (phone or name) and password are required' });

    // Try to find by phone first
    let user = await Customer.findOne({ phone: ident });
    if (!user) {
      // fallback to name (case-insensitive)
      user = await Customer.findOne({ name: { $regex: `^${ident}$`, $options: 'i' } });
    }
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    // Compare plaintext passwords (per request). NOTE: this is insecure.
    if (user.password !== password) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, phone: user.phone }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, phone: user.phone } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});
// Verify token and return user
app.get('/api/me', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'No token' });
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    const user = await Customer.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});
// ... (previous code)

app.get('/api/customers/:id/orders', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).select('name');
    const name = customer ? customer.name : null;

    const orConditions = [ { customer: req.params.id } ];
    if (name) {
      orConditions.push({ customer: name });
      orConditions.push({ 'customer._id': req.params.id });
      orConditions.push({ 'customer.id': req.params.id });
    }

    // Populate product details
    const orders = await Order.find({ $or: orConditions })
      .populate('products.productId') // Add this line to populate product details
      .sort({ createdAt: -1 })
      .limit(5);
      
    res.json(orders);
  } catch (err) {
    console.error('Failed to fetch customer orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// ... (rest of the code)

// Lookup customer by phone or name - returns most recent order/customer info for autofill
app.get('/api/customers/lookup', async (req, res) => {
  try {
    const { phone, name } = req.query;
    if (!phone && !name) return res.status(400).json({ error: 'phone or name query parameter required' });

    // Try to find a Customer first (if phone stored there)
    if (phone) {
      const cust = await Customer.findOne({ phone: phone.toString() }).select('name phone address');
      if (cust) return res.json({ source: 'customer', name: cust.name, phone: cust.phone, address: cust.address });
    }

    // Fallback: find the most recent Order that matches the phone or name
    const orderQuery = {};
    if (phone) orderQuery.phone = phone.toString();
    if (name) {
      orderQuery.$or = [ { customerName: { $regex: name.toString(), $options: 'i' } }, { userId: { $regex: name.toString(), $options: 'i' } } ];
    }
    const recent = await Order.findOne(orderQuery).sort({ createdAt: -1 });
    if (recent) {
      return res.json({
        source: 'order',
        name: recent.customerName || recent.userId || null,
        phone: recent.phone || null,
        address: recent.address || null,
        location: recent.location || null
      });
    }

    res.status(404).json({ error: 'No customer/order found' });
  } catch (err) {
    console.error('Customer lookup failed:', err);
    res.status(500).json({ error: 'Lookup failed' });
  }
});

// Get all orders (for debugging / admin)
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('products.productId') // Add this line to populate product details
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order (admin) - allow updating status and address/location fields
app.put('/api/orders/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updates = {};
    if (req.body.status !== undefined) updates.status = req.body.status;
    if (req.body.address !== undefined) updates.address = req.body.address;
    if (req.body.mapLink !== undefined) updates.mapLink = req.body.mapLink;
    if (req.body.location !== undefined) updates.location = req.body.location;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No updatable fields provided' });
    }

  // Use the raw collection update to bypass schema strictness so fields like `status` are persisted
  const objectId = convertIdToObjectId(id);
  await Order.collection.updateOne({ _id: objectId }, { $set: updates });
  const order = await Order.findById(objectId);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
  } catch (err) {
    console.error('Failed to update order:', err);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Get out-of-stock searches (for admin analytics)
app.get('/api/out-of-stock', async (req, res) => {
  try {
    const { limit = 100, page = 1, searchTerm } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let query = {};
    if (searchTerm) {
      query.searchTerm = { $regex: searchTerm, $options: 'i' };
    }
    
    const outOfStockSearches = await OutOfStock.find(query)
      .populate('username', 'name email')
      .sort({ searchedAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await OutOfStock.countDocuments(query);
    
    res.json({
      searches: outOfStockSearches,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    console.error('Failed to fetch out-of-stock searches:', err);
    res.status(500).json({ error: 'Failed to fetch out-of-stock searches' });
  }
});

// Get out-of-stock search analytics (most searched terms)
app.get('/api/out-of-stock/analytics', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const analytics = await OutOfStock.aggregate([
      {
        $match: {
          searchedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$searchTerm',
          count: { $sum: 1 },
          lastSearched: { $max: '$searchedAt' },
          uniqueUsers: { $addToSet: '$username' }
        }
      },
      {
        $project: {
          searchTerm: '$_id',
          count: 1,
          lastSearched: 1,
          uniqueUserCount: { $size: '$uniqueUsers' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 50
      }
    ]);
    
    res.json({
      period: `${days} days`,
      analytics
    });
  } catch (err) {
    console.error('Failed to fetch out-of-stock analytics:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Order creation
app.post('/api/orders', async (req, res) => {
  try {
    // If request includes a valid JWT, use that customer id to set the order.customer
    const auth = req.headers.authorization;
    if (auth) {
      try {
        const token = auth.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
        if (decoded && decoded.id) {
          req.body.customer = decoded.id;
        }
      } catch (e) {
        // ignore token errors and proceed with provided customer value
      }
    }

    const order = new Order(req.body);
    await order.save();
    
    // ⭐ NEW: Send Telegram notification after saving the order
    // Ensure you fetch populated product data if necessary for the notification
    const populatedOrder = await Order.findById(order._id).populate('products.productId');
    if (populatedOrder) {
        sendTelegramNotification(populatedOrder);
    }
    
    res.json(order);
  } catch (err) {
    console.error('Order creation failed:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));
