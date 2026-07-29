"use client";

import { useState } from "react";
import { loadTossPayments } from "@tosspayments/tosspayments-sdk";
import { createClient } from "@/lib/supabase/client";

const TOSS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

export default function BuyButton({
  productId,
  currentUserId,
}: {
  productId: string;
  currentUserId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBuy() {
    if (!TOSS_CLIENT_KEY) {
      setError("결제 기능이 아직 설정되지 않았습니다. 관리자에게 문의해주세요.");
      return;
    }

    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error: rpcError } = await supabase
      .rpc("create_order", { p_product_id: productId })
      .single();

    if (rpcError || !data) {
      setError(rpcError?.message ?? "주문 생성에 실패했습니다.");
      setLoading(false);
      return;
    }

    const order = data as { order_id: string; amount: number; order_name: string };

    try {
      const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
      const payment = tossPayments.payment({ customerKey: currentUserId });

      await payment.requestPayment({
        method: "CARD",
        amount: { value: order.amount, currency: "KRW" },
        orderId: order.order_id,
        orderName: order.order_name,
        successUrl: `${window.location.origin}/payments/success`,
        failUrl: `${window.location.origin}/payments/fail`,
      });
    } catch {
      // 사용자가 결제창을 닫거나 취소한 경우 등 - 별도 안내 없이 버튼만 복구
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleBuy}
        disabled={loading}
        className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-60 transition-colors"
      >
        {loading ? "결제창으로 이동 중..." : "구매하기"}
      </button>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
