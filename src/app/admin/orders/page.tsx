import { AdminOrdersClient } from "@/app/admin/orders/AdminOrdersClient";
import { listOrders } from "@/lib/orders";

export default async function AdminOrdersPage() {
  const orders = await listOrders({ archived: false });
  return <AdminOrdersClient initialOrders={orders} />;
}
