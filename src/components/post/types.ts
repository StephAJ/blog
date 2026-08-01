export type CardAuthor = {
  id: number;
  name: string;
  slug: string;
  avatarUrl: string | null;
  bio?: string | null;
};

export type CardCategory = {
  id: number;
  name: string;
  slug: string;
  color: string;
};

export type CardPost = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  coverAlt: string | null;
  publishedAt: Date | null;
  readingMinutes: number;
  views: number;
  author: CardAuthor;
  category: CardCategory | null;
  postTags?: { tag: { id: number; name: string; slug: string } }[];
};
