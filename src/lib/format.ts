export function formatPrice(price: number) {
  return `₩${price.toLocaleString("ko-KR")}`;
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
