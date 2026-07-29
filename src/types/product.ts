export type ProductStatus = "판매중" | "예약중" | "판매완료";

export const PRODUCT_CATEGORIES = [
  "디지털기기",
  "생활가전",
  "가구/인테리어",
  "유아동",
  "의류",
  "도서/티켓/음반",
  "스포츠/레저",
  "게임/취미",
  "뷰티/미용",
  "기타",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export type Product = {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  status: ProductStatus;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  username: string;
  created_at: string;
};
