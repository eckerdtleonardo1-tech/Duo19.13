import type { CategoryValue, OrderStatus } from "@/lib/constants";

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  gallery: string[];
  category: CategoryValue;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  image: string;
  stock: number;
  qty: number;
}

export interface OrderItem {
  id: number;
  productId: number | null;
  productName: string;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: number;
  userId: number | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  customerAddress: string;
  customerProvince: string;
  customerCity: string;
  totalAmount: number;
  status: OrderStatus;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

export interface Provincia {
  id: string;
  nombre: string;
}

export interface Localidad {
  id: string;
  nombre: string;
}
