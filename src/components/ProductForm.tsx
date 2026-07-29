"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PRODUCT_CATEGORIES } from "@/types/product";
import type { Product, ProductStatus } from "@/types/product";

const STATUS_OPTIONS: ProductStatus[] = ["판매중", "예약중", "판매완료"];

export default function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [title, setTitle] = useState(product?.title ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [category, setCategory] = useState(product?.category ?? PRODUCT_CATEGORIES[0]);
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? "판매중");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(product?.image_url ?? null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const priceNumber = Number(price);
    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }
    if (!Number.isFinite(priceNumber) || priceNumber < 0) {
      setError("가격을 올바르게 입력해주세요.");
      return;
    }
    if (priceNumber > 100_000_000_000) {
      setError("가격은 1,000억원 이하로 입력해주세요.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("로그인이 필요합니다.");
      setLoading(false);
      return;
    }

    let imageUrl = product?.image_url ?? null;

    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, imageFile);

      if (uploadError) {
        setError("이미지 업로드에 실패했습니다.");
        setLoading(false);
        return;
      }

      imageUrl = supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
    }

    if (isEdit && product) {
      const { error: updateError } = await supabase
        .from("products")
        .update({
          title: title.trim(),
          description: description.trim(),
          price: priceNumber,
          category,
          status,
          image_url: imageUrl,
        })
        .eq("id", product.id);

      if (updateError) {
        setError("수정 중 문제가 발생했습니다.");
        setLoading(false);
        return;
      }

      router.push(`/products/${product.id}`);
      router.refresh();
      return;
    }

    const { data: inserted, error: insertError } = await supabase
      .from("products")
      .insert({
        seller_id: user.id,
        title: title.trim(),
        description: description.trim(),
        price: priceNumber,
        category,
        image_url: imageUrl,
      })
      .select("id")
      .single();

    if (insertError || !inserted) {
      setError("등록 중 문제가 발생했습니다.");
      setLoading(false);
      return;
    }

    router.push(`/products/${inserted.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">사진</label>
        <label className="flex aspect-square w-40 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-orange-300 bg-orange-50 text-neutral-400 hover:bg-orange-100">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="미리보기" className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm">+ 사진 추가</span>
          )}
          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </label>
      </div>

      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-neutral-700">
          제목
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
        />
      </div>

      <div>
        <label htmlFor="category" className="mb-1 block text-sm font-medium text-neutral-700">
          카테고리
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
        >
          {PRODUCT_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="price" className="mb-1 block text-sm font-medium text-neutral-700">
          가격 (원)
        </label>
        <input
          id="price"
          type="number"
          inputMode="numeric"
          min={0}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0"
          required
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
        />
      </div>

      {isEdit && (
        <div>
          <label htmlFor="status" className="mb-1 block text-sm font-medium text-neutral-700">
            거래 상태
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProductStatus)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-neutral-700">
          상품 설명
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          placeholder="상품 상태, 거래 방법 등을 자세히 적어주세요."
          className="w-full resize-none rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60 transition-colors"
      >
        {loading ? "저장 중..." : isEdit ? "수정 완료" : "등록하기"}
      </button>
    </form>
  );
}
