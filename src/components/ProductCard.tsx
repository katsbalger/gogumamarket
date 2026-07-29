import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/types/product";
import StatusBadge from "./StatusBadge";

export default function ProductCard({ product }: { product: Product }) {
  const isSold = product.status !== "판매중";

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-orange-100 bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-orange-50">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.title}
            className={`h-full w-full object-cover transition-transform group-hover:scale-105 ${isSold ? "opacity-50" : ""}`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl">🍠</div>
        )}
        {product.status !== "판매중" && (
          <div className="absolute left-2 top-2">
            <StatusBadge status={product.status} />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <span className="text-xs text-neutral-400">{product.category}</span>
        <h3 className="line-clamp-2 text-sm font-medium text-neutral-800">
          {product.title}
        </h3>
        <p className="mt-auto text-base font-bold text-neutral-900">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}
