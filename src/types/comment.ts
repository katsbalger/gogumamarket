export type Comment = {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  profiles: { username: string } | null;
};
