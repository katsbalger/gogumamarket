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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!content.trim() || !currentUserId) return;

    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error: insertError } = await supabase.from("comments").insert({
      product_id: productId,
      author_id: currentUserId,
      content: content.trim(),
    });

    if (insertError) {
      setError("댓글 등록 중 문제가 발생했습니다.");
      setLoading(false);
      return;
    }

    setContent("");
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
              <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-700">
                {comment.content}
              </p>
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
        <form onSubmit={handleSubmit} className="mt-5 flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="댓글을 남겨보세요"
            className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          />
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-60 transition-colors"
          >
            등록
          </button>
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
