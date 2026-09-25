import { Pool } from 'pg';
import { INITIAL_PRODUCTS, RECIPES } from './src/data/mockData';
import { Order, OrderStatus, Product, Recipe } from './src/types';

const connectionString = process.env.DATABASE_URL;

export const database = connectionString
  ? new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
      max: 10,
      idleTimeoutMillis: 30_000,
    })
  : null;

export const isDatabaseConfigured = Boolean(database);

export async function initializeDatabase() {
  if (!database) return;

  await database.query(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
      unit TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
      producer_id TEXT NOT NULL,
      payload JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS recipes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      payload JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      auth0_sub TEXT UNIQUE,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('consumer', 'farmer', 'admin')),
      payload JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_id TEXT,
      status TEXT NOT NULL CHECK (status IN ('novo', 'colheita', 'em_rota', 'entregue')),
      total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
      payload JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS products_category_idx ON products (category);
    CREATE INDEX IF NOT EXISTS products_producer_idx ON products (producer_id);
  `);

  for (const product of INITIAL_PRODUCTS as Product[]) {
    await database.query(
      `INSERT INTO products (id, name, category, price, unit, stock, producer_id, payload)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [product.id, product.name, product.category, product.price, product.unit, product.stock, product.producerId, product],
    );
  }

  for (const recipe of RECIPES as Recipe[]) {
    await database.query(
      `INSERT INTO recipes (id, title, payload)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO NOTHING`,
      [recipe.id, recipe.title, recipe],
    );
  }
}

export async function listProducts(): Promise<Product[]> {
  if (!database) return INITIAL_PRODUCTS;
  const result = await database.query<{ payload: Product }>(
    'SELECT payload FROM products ORDER BY name ASC',
  );
  return result.rows.map((row) => row.payload);
}

export async function listRecipes(): Promise<Recipe[]> {
  if (!database) return RECIPES;
  const result = await database.query<{ payload: Recipe }>(
    'SELECT payload FROM recipes ORDER BY title ASC',
  );
  return result.rows.map((row) => row.payload);
}

export async function listOrders(): Promise<Order[]> {
  if (!database) return [];
  const result = await database.query<{ payload: Order }>(
    'SELECT payload FROM orders ORDER BY created_at DESC',
  );
  return result.rows.map((row) => row.payload);
}

export async function saveOrder(order: Order, customerId?: string) {
  if (!database) return order;
  await database.query(
    `INSERT INTO orders (id, customer_id, status, total_amount, payload)
     VALUES ($1, $2, $3, $4, $5)`,
    [order.id, customerId || null, order.status, order.totalAmount, order],
  );
  return order;
}

export async function changeOrderStatus(orderId: string, status: OrderStatus) {
  if (!database) return null;
  const result = await database.query<{ payload: Order }>(
    `UPDATE orders
     SET status = $2, payload = jsonb_set(payload, '{status}', to_jsonb($2::text)), updated_at = NOW()
     WHERE id = $1
     RETURNING payload`,
    [orderId, status],
  );
  return result.rows[0]?.payload || null;
}
