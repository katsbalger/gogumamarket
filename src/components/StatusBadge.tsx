import type { ProductStatus } from "@/types/product";

const STYLES: Record<ProductStatus, string> = {
  판매중: "bg-orange-500 text-white",
  예약중: "bg-amber-100 text-amber-700",
  판매완료: "bg-neutral-200 text-neutral-500",
};

export default function StatusBadge({ status }: { status: ProductStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[status]}`}
    >
      {status}
    </span>
  );
}
