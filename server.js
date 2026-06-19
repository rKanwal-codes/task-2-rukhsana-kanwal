// ============================================
// DecodeLabs Internship - Project 2
// Backend API Development
// ============================================

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// ---- Load initial data (acts as our in-memory "database") ----
const DATA_FILE = path.join(__dirname, 'orders.json');
let orders = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));

// Helper: generate a new unique Order ID
function generateOrderId() {
  const maxId = orders.reduce((max, o) => {
    const num = parseInt(o.OrderID.replace('REG', ''), 10);
    return num > max ? num : max;
  }, 100000);
  return 'REG' + (maxId + 1);
}

// Helper: validate incoming order data
function validateOrder(body) {
  const errors = [];
  const requiredFields = ['Region', 'Product', 'Quantity', 'UnitPrice', 'Salesperson'];

  requiredFields.forEach(field => {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      errors.push(`Field "${field}" is required.`);
    }
  });

  if (body.Quantity !== undefined && (typeof body.Quantity !== 'number' || body.Quantity <= 0)) {
    errors.push('"Quantity" must be a positive number.');
  }

  if (body.UnitPrice !== undefined && (typeof body.UnitPrice !== 'number' || body.UnitPrice <= 0)) {
    errors.push('"UnitPrice" must be a positive number.');
  }

  const validRegions = ['East', 'West', 'North', 'South', 'Central'];
  if (body.Region !== undefined && !validRegions.includes(body.Region)) {
    errors.push(`"Region" must be one of: ${validRegions.join(', ')}`);
  }

  return errors;
}

// ============================================
// ROUTES
// ============================================

// Root - simple welcome / health check
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'DecodeLabs Project 2 - Sales Orders API is running.',
    endpoints: {
      'GET /api/orders': 'List all orders (supports ?region=, ?product=, ?page=, ?limit=)',
      'GET /api/orders/:id': 'Get a single order by OrderID',
      'POST /api/orders': 'Create a new order',
      'PUT /api/orders/:id': 'Update an existing order',
      'DELETE /api/orders/:id': 'Delete an order'
    }
  });
});

// GET /api/orders - list all orders, with optional filters & pagination
app.get('/api/orders', (req, res) => {
  let result = [...orders];

  const { region, product, page = 1, limit = 20 } = req.query;

  if (region) {
    result = result.filter(o => o.Region.toLowerCase() === region.toLowerCase());
  }
  if (product) {
    result = result.filter(o => o.Product.toLowerCase() === product.toLowerCase());
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const start = (pageNum - 1) * limitNum;
  const paginated = result.slice(start, start + limitNum);

  res.status(200).json({
    total: result.length,
    page: pageNum,
    limit: limitNum,
    data: paginated
  });
});

// GET /api/orders/:id - get a single order
app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.OrderID === req.params.id);

  if (!order) {
    return res.status(404).json({ error: `Order with ID "${req.params.id}" not found.` });
  }

  res.status(200).json(order);
});

// POST /api/orders - create a new order
app.post('/api/orders', (req, res) => {
  const errors = validateOrder(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed.', details: errors });
  }

  const newOrder = {
    OrderID: generateOrderId(),
    Date: req.body.Date || new Date().toISOString().split('T')[0],
    Region: req.body.Region,
    Product: req.body.Product,
    Quantity: req.body.Quantity,
    UnitPrice: req.body.UnitPrice,
    StoreLocation: req.body.StoreLocation || 'N/A',
    CustomerType: req.body.CustomerType || 'Retail',
    Discount: req.body.Discount || 0,
    Salesperson: req.body.Salesperson,
    TotalPrice: req.body.Quantity * req.body.UnitPrice * (1 - (req.body.Discount || 0)),
    PaymentMethod: req.body.PaymentMethod || 'Cash',
    Promotion: req.body.Promotion || null,
    Returned: 0,
    CustomerName: req.body.CustomerName || 'Guest'
  };

  orders.push(newOrder);

  res.status(201).json({
    message: 'Order created successfully.',
    data: newOrder
  });
});

// PUT /api/orders/:id - update an existing order
app.put('/api/orders/:id', (req, res) => {
  const index = orders.findIndex(o => o.OrderID === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: `Order with ID "${req.params.id}" not found.` });
  }

  orders[index] = { ...orders[index], ...req.body };

  res.status(200).json({
    message: 'Order updated successfully.',
    data: orders[index]
  });
});

// DELETE /api/orders/:id - delete an order
app.delete('/api/orders/:id', (req, res) => {
  const index = orders.findIndex(o => o.OrderID === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: `Order with ID "${req.params.id}" not found.` });
  }

  const deleted = orders.splice(index, 1);

  res.status(200).json({
    message: 'Order deleted successfully.',
    data: deleted[0]
  });
});

// ============================================
// 404 handler - for unknown routes
// ============================================
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ============================================
// 500 handler - catch unexpected server errors
// ============================================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error.' });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
