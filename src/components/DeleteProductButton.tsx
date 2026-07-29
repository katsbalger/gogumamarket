"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("정말 삭제하시겠어요? 삭제한 상품은 복구할 수 없습니다.")) return;

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("products").delete().eq("id", productId);

    if (error) {
      alert("삭제 중 문제가 발생했습니다.");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-60 transition-colors"
    >
      삭제
    </button>
  );
}
