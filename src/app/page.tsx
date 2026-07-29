import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import { PRODUCT_CATEGORIES } from "@/types/product";
import type { Product } from "@/types/product";

type SearchParams = { q?: string; category?: string };

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q, category } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (q) {
    query = query.ilike("title", `%${q}%`);
  }
  if (category && category !== "전체") {
    query = query.eq("category", category);
  }

  const { data: products } = await query;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <form action="/" method="GET" className="mb-4">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="어떤 물건을 찾고 있나요?"
          className="w-full rounded-full border border-orange-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
        />
        {category && <input type="hidden" name="category" value={category} />}
      </form>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        <CategoryChip label="전체" active={!category || category === "전체"} q={q} />
        {PRODUCT_CATEGORIES.map((c) => (
          <CategoryChip key={c} label={c} active={category === c} q={q} />
        ))}
      </div>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {(products as Product[]).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-24 text-center text-neutral-400">
          <span className="text-4xl">🍠</span>
          <p className="text-sm">등록된 상품이 없어요.</p>
          <Link href="/products/new" className="text-sm font-medium text-orange-600 hover:underline">
            첫 상품을 등록해보세요
          </Link>
        </div>
      )}
    </div>
  );
}

function CategoryChip({
  label,
  active,
  q,
}: {
  label: string;
  active: boolean;
  q?: string;
}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (label !== "전체") params.set("category", label);
  const href = params.toString() ? `/?${params.toString()}` : "/";

  return (
    <Link
      href={href}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "border-orange-500 bg-orange-500 text-white"
          : "border-neutral-200 bg-white text-neutral-600 hover:border-orange-300"
      }`}
    >
      {label}
    </Link>
  );
}
