import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const DATA_DIR = path.join(__dirname, 'data');

function readJSON(filename) {
  const filepath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filepath)) return [];
  return JSON.parse(fs.readFileSync(filepath, 'utf8'));
}

function writeJSON(filename, data) {
  const filepath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

// Owner Routes
app.post('/api/owner/login', (req, res) => {
  const { username, password } = req.body;
  const config = readJSON('config.json');
  if (config.owner.username === username && config.owner.password === password) {
    return res.json({ success: true, token: 'owner-token-' + uuidv4() });
  }
  res.status(401).json({ success: false, message: 'Invalid credentials' });
});

app.post('/api/owner/change-password', (req, res) => {
  const { username, currentPassword, newPassword } = req.body;
  const config = readJSON('config.json');
  if (config.owner.username !== username || config.owner.password !== currentPassword) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  config.owner.password = newPassword;
  if (req.body.newUsername) config.owner.username = req.body.newUsername;
  writeJSON('config.json', config);
  res.json({ success: true });
});

app.post('/api/owner/update-pricing', (req, res) => {
  const { followers, likes, comments, shares } = req.body;
  const config = readJSON('config.json');
  config.pricing = { followers, likes, comments, shares };
  writeJSON('config.json', config);
  res.json({ success: true });
});

app.post('/api/owner/add-admin', (req, res) => {
  const { username, password } = req.body;
  const admins = readJSON('admins.json');
  if (admins.find(a => a.username === username)) {
    return res.status(400).json({ success: false, message: 'Admin already exists' });
  }
  const uniqueLink = `/order/${username}`;
  const admin = {
    id: uuidv4(),
    username,
    password,
    uniqueLink,
    paymentMethod: null,
    accountNumber: null,
    accountName: null,
    createdAt: new Date().toISOString()
  };
  admins.push(admin);
  writeJSON('admins.json', admins);
  res.json({ success: true, admin });
});

app.post('/api/owner/remove-admin', (req, res) => {
  const { adminId } = req.body;
  let admins = readJSON('admins.json');
  admins = admins.filter(a => a.id !== adminId);
  writeJSON('admins.json', admins);
  res.json({ success: true });
});

app.get('/api/owner/admins', (req, res) => {
  const admins = readJSON('admins.json');
  const orders = readJSON('orders.json');
  const enriched = admins.map(a => ({
    ...a,
    totalOrders: orders.filter(o => o.adminId === a.id).length,
    completedOrders: orders.filter(o => o.adminId === a.id && o.status === 'completed').length,
    pendingOrders: orders.filter(o => o.adminId === a.id && o.status === 'pending').length
  }));
  res.json(enriched);
});

app.get('/api/owner/orders', (req, res) => {
  const orders = readJSON('orders.json');
  const admins = readJSON('admins.json');
  const enriched = orders.map(o => {
    const admin = admins.find(a => a.id === o.adminId);
    return { ...o, adminUsername: admin ? admin.username : 'Unknown' };
  });
  res.json(enriched);
});

app.get('/api/owner/reviews', (req, res) => {
  const reviews = readJSON('reviews.json');
  const orders = readJSON('orders.json');
  const admins = readJSON('admins.json');
  const enriched = reviews.map(r => {
    const order = orders.find(o => o.id === r.orderId);
    const admin = admins.find(a => a.id === (order ? order.adminId : null));
    return { ...r, adminUsername: admin ? admin.username : 'Unknown' };
  });
  res.json(enriched);
});

app.get('/api/owner/complaints', (req, res) => {
  res.json(readJSON('complaints.json'));
});

app.get('/api/owner/stats', (req, res) => {
  const orders = readJSON('orders.json');
  const admins = readJSON('admins.json');
  const reviews = readJSON('reviews.json');
  res.json({
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    totalAdmins: admins.length,
    totalReviews: reviews.length
  });
});

// Admin Routes
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const admins = readJSON('admins.json');
  const admin = admins.find(a => a.username === username && a.password === password);
  if (!admin) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  res.json({ success: true, admin });
});

app.post('/api/admin/setup-payment', (req, res) => {
  const { adminId, paymentMethod, accountNumber, accountName } = req.body;
  const admins = readJSON('admins.json');
  const idx = admins.findIndex(a => a.id === adminId);
  if (idx === -1) return res.status(404).json({ success: false });
  admins[idx].paymentMethod = paymentMethod;
  admins[idx].accountNumber = accountNumber;
  admins[idx].accountName = accountName;
  writeJSON('admins.json', admins);
  res.json({ success: true, admin: admins[idx] });
});

app.get('/api/admin/orders/:adminId', (req, res) => {
  const orders = readJSON('orders.json');
  const adminOrders = orders.filter(o => o.adminId === req.params.adminId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(adminOrders);
});

app.post('/api/admin/complete-order', (req, res) => {
  const { orderId, message } = req.body;
  const orders = readJSON('orders.json');
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx === -1) return res.status(404).json({ success: false });
  orders[idx].status = 'completed';
  orders[idx].completedAt = new Date().toISOString();
  if (message) orders[idx].adminMessage = message;
  writeJSON('orders.json', orders);
  res.json({ success: true, order: orders[idx] });
});

app.post('/api/admin/send-message', (req, res) => {
  const { orderId, message } = req.body;
  const orders = readJSON('orders.json');
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx === -1) return res.status(404).json({ success: false });
  orders[idx].adminMessage = message;
  writeJSON('orders.json', orders);
  res.json({ success: true });
});

app.get('/api/admin/stats/:adminId', (req, res) => {
  const orders = readJSON('orders.json');
  const adminOrders = orders.filter(o => o.adminId === req.params.adminId);
  res.json({
    totalOrders: adminOrders.length,
    pendingOrders: adminOrders.filter(o => o.status === 'pending').length,
    completedOrders: adminOrders.filter(o => o.status === 'completed').length
  });
});

// User Routes
app.get('/api/services', (req, res) => {
  const config = readJSON('config.json');
  res.json({
    services: [
      { id: 'followers', name: 'Followers', price: config.pricing.followers, unit: 'per 1' },
      { id: 'likes', name: 'Likes', price: config.pricing.likes, unit: 'per 1' },
      { id: 'comments', name: 'Comments', price: config.pricing.comments, unit: 'per 1' },
      { id: 'shares', name: 'Shares', price: config.pricing.shares, unit: 'per 1' }
    ],
    currency: config.site.currency
  });
});

app.post('/api/calculate-price', (req, res) => {
  const { service, quantity } = req.body;
  const config = readJSON('config.json');
  const price = config.pricing[service] * parseInt(quantity);
  res.json({ price, currency: config.site.currency });
});

app.post('/api/place-order', (req, res) => {
  const { tiktokUsername, service, quantity, price, transactionId, screenshot, adminLink } = req.body;
  const admins = readJSON('admins.json');
  
  let adminId = null;
  if (adminLink) {
    const targetAdmin = admins.find(a => a.uniqueLink === adminLink || adminLink.includes(a.username));
    if (targetAdmin) adminId = targetAdmin.id;
  }
  
  if (!adminId && admins.length > 0) {
    const randomAdmin = admins[Math.floor(Math.random() * admins.length)];
    adminId = randomAdmin.id;
  }

  const order = {
    id: uuidv4(),
    tiktokUsername,
    service,
    quantity: parseInt(quantity),
    price,
    transactionId,
    screenshot,
    adminId,
    status: 'pending',
    adminMessage: null,
    createdAt: new Date().toISOString(),
    completedAt: null
  };

  const orders = readJSON('orders.json');
  orders.push(order);
  writeJSON('orders.json', orders);
  res.json({ success: true, order });
});

app.get('/api/order-status/:orderId', (req, res) => {
  const orders = readJSON('orders.json');
  const order = orders.find(o => o.id === req.params.orderId);
  if (!order) return res.status(404).json({ success: false });
  res.json(order);
});

app.post('/api/submit-review', (req, res) => {
  const { orderId, rating, comment, userName } = req.body;
  const review = {
    id: uuidv4(),
    orderId,
    rating,
    comment,
    userName,
    createdAt: new Date().toISOString()
  };
  const reviews = readJSON('reviews.json');
  reviews.push(review);
  writeJSON('reviews.json', reviews);
  res.json({ success: true });
});

app.post('/api/submit-complaint', (req, res) => {
  const { userName, message, orderId, adminUsername } = req.body;
  const complaint = {
    id: uuidv4(),
    userName,
    message,
    orderId,
    adminUsername,
    createdAt: new Date().toISOString()
  };
  const complaints = readJSON('complaints.json');
  complaints.push(complaint);
  writeJSON('complaints.json', complaints);
  res.json({ success: true });
});

app.get('/api/admin/by-link/:link', (req, res) => {
  const admins = readJSON('admins.json');
  const link = decodeURIComponent(req.params.link);
  const admin = admins.find(a => a.uniqueLink === link || a.username === link);
  if (!admin) return res.status(404).json({ success: false });
  res.json({ success: true, admin });
});

// Serve static files
app.use(express.static(path.join(__dirname, '../dist')));

// Catch-all route
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
