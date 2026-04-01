# Smart Inventory & Order Management System

A web application to manage products, stock levels, customer orders, and fulfillment workflows with validation and conflict handling.

---

## 1. Authentication

- User Signup & Login
- Email + Password authentication
- After login → redirect to Dashboard
- Demo Login button (pre-filled credentials)

---

## 2. Product & Category Setup

### Categories
Users can create product categories:
- Category Name (e.g., Electronics, Grocery, Clothing)

### Products
Users can add products manually with the following fields:
- Product Name
- Category
- Price
- Stock Quantity
- Minimum Stock Threshold (e.g., 5 units)

**Status:**
- Active
- Out of Stock

---

## 3. Order Management

Users can:
- Create new orders
- Update order status
- Cancel orders
- View orders (by date or status)

Each order includes:
- Customer Name
- List of Products (multiple items)
- Quantity per product
- Total Price (auto-calculated)

**Order Status:**
- Pending
- Confirmed
- Shipped
- Delivered
- Cancelled

---

## 4. Stock Handling Rules

- Deduct stock automatically when placing an order
- If requested quantity exceeds stock:
  - Show warning:  
    **"Only X items available in stock"**
  - Prevent order confirmation if stock is insufficient
- If stock becomes 0:
  - Product status → **Out of Stock**

---

## 5. Restock Queue (Low Stock Management)

If product stock goes below threshold:
- Automatically add to **Restock Queue**

**Queue Rules:**
- Ordered by lowest stock first
- Show priority:
  - High
  - Medium
  - Low

Users can:
- Update stock manually (Restock)
- Remove item from queue once restocked

---

## 6. Conflict Detection

While creating/updating orders:
- Prevent duplicate product entries in the same order
- Prevent ordering inactive products

Show messages like:
- “This product is already added to the order.”
- “This product is currently unavailable.”

---

## 7. Dashboard

Display key insights:
- Total Orders Today
- Pending vs Completed Orders
- Low Stock Items Count
- Revenue Today

**Product Summary Example:**
- iPhone 13 — 3 left (Low Stock)
- T-Shirt — 20 available (OK)

---

## 8. Activity Log

Track recent system actions (latest 5–10):

**Examples:**
- 10:15 AM — Order #1023 created by user
- 10:20 AM — Stock updated for “iPhone 13”
- 10:30 AM — Product “Headphone” added to Restock Queue
- 11:00 AM — Order #1023 marked as Shipped

---

## Bonus (Optional but Valuable)

- Search & filter products/orders
- Pagination for large datasets
- Simple analytics chart (orders or revenue)
- Role-based access (Admin / Manager)

---

## Tech Stack

You are free to use any frontend and backend technology stack.

---

## Deployment

Must be deployed (Frontend + Backend) and accessible via a live URL.

### Provide:
- Live URL
- GitHub Repository
- README (setup + features)
