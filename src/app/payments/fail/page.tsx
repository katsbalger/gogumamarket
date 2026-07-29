import Link from "next/link";

type SearchParams = { message?: string };

export default async function PaymentFailPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { message } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
      <span className="text-5xl">😢</span>
      <h1 className="text-lg font-bold text-neutral-900">결제에 실패했습니다</h1>
      <p className="text-sm text-neutral-500">
        {message ?? "결제가 취소되었거나 오류가 발생했습니다."}
      </p>
      <Link
        href="/"
        className="mt-4 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
      >
        홈으로
      </Link>
    </div>
  );
}
