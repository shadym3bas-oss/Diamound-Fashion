
export type Customer = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  created_at: string;
};

export type Order = {
  id: string;
  order_number: number;
  customer_id: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  customers: {
      name: string;
      phone?: string | null;
  } | null;
  order_items: {
      price: number;
      quantity: number;
  }[];
};

export type OrderItem = {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    price: number;
    created_at: string;
};

export type Invoice = {
    id: string;
    order_id: string;
    total: number;
    issued_at: string;
};

export type Return = {
    id: string;
    order_id: string;
    reason?: string | null;
    created_at: string;
};

export type ReturnItem = {
    id: string;
    return_id: string;
    product_id: string;
    quantity: number;
};
