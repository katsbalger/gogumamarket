import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatPrice } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import DeleteProductButton from "@/components/DeleteProductButton";
import CommentSection from "@/components/CommentSection";
import type { Product } from "@/types/product";
import type { Comment } from "@/types/comment";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single<Product>();

  if (!product) {
    notFound();
  }

  const { data: seller } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", product.seller_id)
    .single();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOwner = user?.id === product.seller_id;

  const { data: comments } = await supabase
    .from("comments")
    .select("id, content, image_url, created_at, author_id, profiles(username)")
    .eq("product_id", product.id)
    .order("created_at", { ascending: true });

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="aspect-square w-full overflow-hidden rounded-xl bg-orange-50">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-6xl">🍠</div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <StatusBadge status={product.status} />
            <span className="text-xs text-neutral-400">{product.category}</span>
          </div>

          <h1 className="text-xl font-bold text-neutral-900">{product.title}</h1>
          <p className="text-2xl font-extrabold text-orange-600">
            {formatPrice(product.price)}
          </p>

          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <span>{seller?.username ?? "알 수 없음"}</span>
            <span>·</span>
            <span>{formatDate(product.created_at)}</span>
          </div>

          <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
            {product.description || "등록된 상품 설명이 없습니다."}
          </p>

          {isOwner && (
            <div className="mt-4 flex gap-2">
              <Link
                href={`/products/${product.id}/edit`}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
              >
                수정
              </Link>
              <DeleteProductButton productId={product.id} />
            </div>
          )}
        </div>
      </div>

      <CommentSection
        productId={product.id}
        initialComments={(comments as Comment[] | null) ?? []}
        currentUserId={user?.id ?? null}
      />
    </div>
  );
}
