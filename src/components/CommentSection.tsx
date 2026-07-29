"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/format";
import type { Comment } from "@/types/comment";

export default function CommentSection({
  productId,
  initialComments,
  currentUserId,
}: {
  productId: string;
  initialComments: Comment[];
  currentUserId: string | null;
}) {
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function clearImage() {
    setImageFile(null);
    setPreviewUrl(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if ((!content.trim() && !imageFile) || !currentUserId) return;

    setError(null);
    setLoading(true);
    const supabase = createClient();

    let imageUrl: string | null = null;
    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `${currentUserId}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("comment-images")
        .upload(path, imageFile);

      if (uploadError) {
        setError("이미지 업로드에 실패했습니다.");
        setLoading(false);
        return;
      }

      imageUrl = supabase.storage.from("comment-images").getPublicUrl(path).data.publicUrl;
    }

    const { error: insertError } = await supabase.from("comments").insert({
      product_id: productId,
      author_id: currentUserId,
      content: content.trim(),
      image_url: imageUrl,
    });

    if (insertError) {
      setError("댓글 등록 중 문제가 발생했습니다.");
      setLoading(false);
      return;
    }

    setContent("");
    clearImage();
    setLoading(false);
    router.refresh();
  }

  async function handleDelete(commentId: string) {
    if (!confirm("댓글을 삭제하시겠어요?")) return;

    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (deleteError) {
      alert("삭제 중 문제가 발생했습니다.");
      return;
    }

    setComments((prev) => prev.filter((c) => c.id !== commentId));
    router.refresh();
  }

  return (
    <div className="mt-8 border-t border-orange-100 pt-6">
      <h2 className="mb-4 text-sm font-bold text-neutral-900">
        댓글 {comments.length}
      </h2>

      <div className="flex flex-col gap-4">
        {comments.length === 0 && (
          <p className="text-sm text-neutral-400">첫 댓글을 남겨보세요.</p>
        )}

        {comments.map((comment) => (
          <div key={comment.id} className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <span className="font-medium text-neutral-700">
                  {comment.profiles?.username ?? "알 수 없음"}
                </span>
                <span>{formatDate(comment.created_at)}</span>
              </div>
              {comment.content && (
                <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-700">
                  {comment.content}
                </p>
              )}
              {comment.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={comment.image_url}
                  alt="댓글 이미지"
                  className="mt-2 max-h-48 max-w-[200px] rounded-lg border border-orange-100 object-cover"
                />
              )}
            </div>
            {currentUserId === comment.author_id && (
              <button
                onClick={() => handleDelete(comment.id)}
                className="shrink-0 text-xs text-neutral-400 hover:text-red-500"
              >
                삭제
              </button>
            )}
          </div>
        ))}
      </div>

      {currentUserId ? (
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-2">
          {previewUrl && (
            <div className="relative w-24">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="첨부 이미지 미리보기"
                className="h-24 w-24 rounded-lg border border-orange-200 object-cover"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-700 text-xs text-white"
                aria-label="이미지 제거"
              >
                ×
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="댓글을 남겨보세요"
              className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
            <label className="flex cursor-pointer items-center justify-center rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-500 hover:bg-neutral-50">
              📷
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
            <button
              type="submit"
              disabled={loading || (!content.trim() && !imageFile)}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-60 transition-colors"
            >
              등록
            </button>
          </div>
        </form>
      ) : (
        <p className="mt-5 text-sm text-neutral-400">
          <Link href="/login" className="font-medium text-orange-600 hover:underline">
            로그인
          </Link>{" "}
          후 댓글을 남길 수 있어요.
        </p>
      )}

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
