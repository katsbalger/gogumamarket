export type OrderStatus = "pending" | "paid" | "failed";

export type Order = {
  id: string;
  order_id: string;
  product_id: string;
  buyer_id: string;
  amount: number;
  status: OrderStatus;
  payment_key: string | null;
  created_at: string;
};
