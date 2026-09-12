import type { OrderStatus } from "@/lib/constants";
import type { ShippingMethod } from "@/lib/shipping";

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  gallery: string[];
  category: string;
  brand: string | null;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  /** Promedio de reseñas (0 si todavía no tiene). */
  ratingAverage: number;
  ratingCount: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface Review {
  id: number;
  productId: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
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
  customerAddress: string | null;
  customerProvince: string | null;
  customerCity: string | null;
  customerPostalCode?: string | null;
  shippingMethod: ShippingMethod;
  shippingCost: number;
  subtotalAmount: number;
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
