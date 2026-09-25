import { AppUser, Order, OrderStatus, Product, Recipe } from './types';

const apiBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  const payload = (await response.json().catch(() => null)) as { error?: string } | null;
  if (!response.ok) {
    throw new ApiError(payload?.error || 'Não foi possível concluir a operação.', response.status);
  }

  return payload as T;
}

export const api = {
  health: () => request<{ status: string }>('/api/health'),
  products: () => request<{ products: Product[] }>('/api/products'),
  recipes: () => request<{ recipes: Recipe[] }>('/api/recipes'),
  verifyUser: (user: Pick<AppUser, 'email' | 'role'>) =>
    request<{ authenticated: boolean }>('/api/auth/verify', {
      method: 'POST',
      body: JSON.stringify(user),
    }),
  checkout: (items: unknown[], token: string) =>
    request<{ checkoutUrl?: string }>('/api/payments/checkout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ items }),
    }),
  orders: (token: string) =>
    request<{ orders: Order[] }>('/api/orders', {
      headers: { Authorization: `Bearer ${token}` },
    }),
  createOrder: (order: Order, token: string) =>
    request<{ order: Order }>('/api/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(order),
    }),
  updateOrderStatus: (orderId: string, status: OrderStatus, token: string) =>
    request<{ order: Order }>(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    }),
};
