import { AdminProductsClient } from "@/app/admin/products/AdminProductsClient";
import { listProducts } from "@/lib/products";

export default async function AdminProductsPage() {
  const products = await listProducts();
  return <AdminProductsClient initialProducts={products} />;
}
