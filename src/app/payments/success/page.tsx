import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type SearchParams = { paymentKey?: string; orderId?: string; amount?: string };

function ResultCard({
  emoji,
  title,
  message,
  productId,
}: {
  emoji: string;
  title: string;
  message: string;
  productId?: string;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
      <span className="text-5xl">{emoji}</span>
      <h1 className="text-lg font-bold text-neutral-900">{title}</h1>
      <p className="text-sm text-neutral-500">{message}</p>
      <Link
        href={productId ? `/products/${productId}` : "/"}
        className="mt-4 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
      >
        {productId ? "상품으로 돌아가기" : "홈으로"}
      </Link>
    </div>
  );
}

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { paymentKey, orderId, amount } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!paymentKey || !orderId || !amount) {
    return (
      <ResultCard emoji="⚠️" title="잘못된 접근입니다" message="결제 정보를 확인할 수 없습니다." />
    );
  }

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("order_id", orderId)
    .single();

  if (!order || order.buyer_id !== user.id) {
    return (
      <ResultCard emoji="⚠️" title="주문을 찾을 수 없습니다" message="주문 정보가 일치하지 않습니다." />
    );
  }

  if (order.status === "paid") {
    return (
      <ResultCard
        emoji="✅"
        title="결제가 완료되었습니다"
        message="이미 처리된 주문이에요."
        productId={order.product_id}
      />
    );
  }

  if (String(order.amount) !== amount) {
    await supabase.rpc("fail_order", { p_order_id: orderId });
    return (
      <ResultCard
        emoji="⚠️"
        title="결제 금액이 일치하지 않습니다"
        message="주문을 다시 시도해주세요."
        productId={order.product_id}
      />
    );
  }

  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) {
    return (
      <ResultCard
        emoji="⚠️"
        title="결제 설정 오류"
        message="서버에 결제 시크릿 키가 설정되지 않았습니다."
        productId={order.product_id}
      />
    );
  }

  const basicAuth = Buffer.from(`${secretKey}:`).toString("base64");
  const confirmRes = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ paymentKey, orderId, amount: Number(amount) }),
  });

  if (!confirmRes.ok) {
    const errJson = (await confirmRes.json().catch(() => null)) as { message?: string } | null;
    await supabase.rpc("fail_order", { p_order_id: orderId });
    return (
      <ResultCard
        emoji="😢"
        title="결제 승인에 실패했습니다"
        message={errJson?.message ?? "잠시 후 다시 시도해주세요."}
        productId={order.product_id}
      />
    );
  }

  await supabase.rpc("complete_order", { p_order_id: orderId, p_payment_key: paymentKey });

  return (
    <ResultCard
      emoji="🍠"
      title="결제가 완료되었습니다"
      message="구매해주셔서 감사합니다."
      productId={order.product_id}
    />
  );
}
