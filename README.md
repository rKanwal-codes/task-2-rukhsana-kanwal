# Project 2 — Sales Orders Backend API
DecodeLabs Full Stack Internship | Batch 2026

A simple RESTful backend API built with **Node.js + Express**.
It manages "Orders" (from the Product-Sales-Region dataset used in Project 1)
with full CRUD-style endpoints, input validation, and proper HTTP status codes.

## Tech Used
- Node.js
- Express.js
- In-memory JSON data store (orders.json) — no database needed for this milestone

## Folder Contents
- `server.js` — main API server with all routes
- `orders.json` — sample dataset (200 orders) used as the in-memory database
- `package.json` — project dependencies

## How to Run (Step by Step)

### 1. Install Node.js
Download from https://nodejs.org if not already installed (LTS version).
Check installation:
```
node -v
npm -v
```

### 2. Open the project folder in terminal
```
cd path/to/project2
```

### 3. Install dependencies
```
npm install
```
This downloads Express (listed in package.json).

### 4. Start the server
```
npm start
```
or
```
node server.js
```

You should see:
```
Server is running at http://localhost:3000
```

### 5. Test the API
Open in browser, or use Postman / curl / Thunder Client (VS Code extension):

**Health check**
```
GET http://localhost:3000/
```

**List all orders**
```
GET http://localhost:3000/api/orders
```

**Filter by region or product**
```
GET http://localhost:3000/api/orders?region=East
GET http://localhost:3000/api/orders?product=Laptop
```

**Pagination**
```
GET http://localhost:3000/api/orders?page=2&limit=10
```

**Get a single order**
```
GET http://localhost:3000/api/orders/REG100000
```

**Create a new order (POST)**
Body (JSON):
```json
{
  "Region": "East",
  "Product": "Laptop",
  "Quantity": 5,
  "UnitPrice": 200,
  "Salesperson": "Sara",
  "CustomerName": "Cust 9999"
}
```
Send this as raw JSON in Postman with header `Content-Type: application/json`
to:
```
POST http://localhost:3000/api/orders
```

**Update an order (PUT)**
```
PUT http://localhost:3000/api/orders/REG100000
```
Body: any fields you want to change, e.g. `{ "Quantity": 10 }`

**Delete an order**
```
DELETE http://localhost:3000/api/orders/REG100000
```

## Validation Rules
- `Region`, `Product`, `Quantity`, `UnitPrice`, `Salesperson` are required
- `Quantity` and `UnitPrice` must be positive numbers
- `Region` must be one of: East, West, North, South, Central
- Invalid requests return `400 Bad Request` with details
- Missing orders return `404 Not Found`

## Status Codes Used
| Code | Meaning |
|------|---------|
| 200  | Success (GET, PUT, DELETE) |
| 201  | Created (POST success) |
| 400  | Bad Request (validation failed) |
| 404  | Not Found (invalid ID or route) |
| 500  | Internal Server Error |

## Notes
- This is a stateless REST API — every request is independent
- Data resets to the original 200 sample orders every time the server restarts (since it's in-memory)
- Built following REST naming convention: resources are nouns (`/orders`), HTTP methods are verbs (GET/POST/PUT/DELETE)
