import "server-only";

import {
  and,
  countDistinct,
  desc,
  eq,
  inArray,
  like,
  lte,
  ne,
  notInArray,
  or,
  sql,
  type SQL,
} from "drizzle-orm";

import { db } from "@/db";
import {
  categories,
  comments,
  media,
  pages,
  postTags,
  posts,
  subscribers,
  tags,
  users,
} from "@/db/schema";

export type PostCard = Awaited<ReturnType<typeof getPosts>>["items"][number];
export type FullPost = NonNullable<Awaited<ReturnType<typeof getPostBySlug>>>;

const postWith = {
  author: {
    columns: { id: true, name: true, slug: true, avatarUrl: true, bio: true },
  },
  category: {
    columns: { id: true, name: true, slug: true, color: true },
  },
  postTags: { with: { tag: true } },
} as const;

/** Only posts that are published *and* whose publish date has arrived. */
function livePosts(): SQL {
  return and(
    eq(posts.status, "published"),
    lte(posts.publishedAt, new Date()),
  ) as SQL;
}

/* ------------------------------------------------------------------ */
/* Listing                                                             */
/* ------------------------------------------------------------------ */
export type PostQuery = {
  page?: number;
  perPage?: number;
  categorySlug?: string;
  tagSlug?: string;
  authorSlug?: string;
  search?: string;
  featuredOnly?: boolean;
  excludeIds?: number[];
  year?: number;
  month?: number;
  orderBy?: "recent" | "popular";
};

export async function getPosts(query: PostQuery = {}) {
  const {
    page = 1,
    perPage = 9,
    categorySlug,
    tagSlug,
    authorSlug,
    search,
    featuredOnly,
    excludeIds,
    year,
    month,
    orderBy = "recent",
  } = query;

  const filters: SQL[] = [livePosts()];

  if (categorySlug) {
    const category = await db.query.categories.findFirst({
      where: eq(categories.slug, categorySlug),
      columns: { id: true },
    });
    if (!category) return emptyPage(perPage);
    filters.push(eq(posts.categoryId, category.id));
  }

  if (tagSlug) {
    const tag = await db.query.tags.findFirst({
      where: eq(tags.slug, tagSlug),
      columns: { id: true },
    });
    if (!tag) return emptyPage(perPage);
    filters.push(
      inArray(
        posts.id,
        db
          .select({ id: postTags.postId })
          .from(postTags)
          .where(eq(postTags.tagId, tag.id)),
      ),
    );
  }

  if (authorSlug) {
    const author = await db.query.users.findFirst({
      where: eq(users.slug, authorSlug),
      columns: { id: true },
    });
    if (!author) return emptyPage(perPage);
    filters.push(eq(posts.authorId, author.id));
  }

  if (search?.trim()) {
    const term = `%${search.trim().toLowerCase()}%`;
    filters.push(
      or(
        like(sql`lower(${posts.title})`, term),
        like(sql`lower(${posts.excerpt})`, term),
        like(sql`lower(${posts.contentText})`, term),
      ) as SQL,
    );
  }

  if (featuredOnly) filters.push(eq(posts.featured, true));
  if (excludeIds?.length) filters.push(notInArray(posts.id, excludeIds));

  if (year) {
    filters.push(
      sql`strftime('%Y', ${posts.publishedAt}, 'unixepoch') = ${String(year)}`,
    );
  }
  if (year && month) {
    filters.push(
      sql`strftime('%m', ${posts.publishedAt}, 'unixepoch') = ${String(month).padStart(2, "0")}`,
    );
  }

  const where = and(...filters);

  const [{ value: total }] = await db
    .select({ value: countDistinct(posts.id) })
    .from(posts)
    .where(where);

  const items = await db.query.posts.findMany({
    where,
    with: postWith,
    orderBy:
      orderBy === "popular"
        ? [desc(posts.views), desc(posts.publishedAt)]
        : [desc(posts.pinned), desc(posts.publishedAt)],
    limit: perPage,
    offset: (page - 1) * perPage,
  });

  return {
    items,
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

function emptyPage(perPage: number) {
  return {
    items: [] as Awaited<
      ReturnType<typeof db.query.posts.findMany<{ with: typeof postWith }>>
    >,
    total: 0,
    page: 1,
    perPage,
    totalPages: 1,
  };
}

/* ------------------------------------------------------------------ */
/* Single post                                                         */
/* ------------------------------------------------------------------ */
export async function getPostBySlug(slug: string, options?: { preview?: boolean }) {
  const post = await db.query.posts.findFirst({
    where: options?.preview
      ? eq(posts.slug, slug)
      : and(eq(posts.slug, slug), livePosts()),
    with: postWith,
  });
  return post ?? null;
}

export async function getAdjacentPosts(post: { id: number; publishedAt: Date | null }) {
  if (!post.publishedAt) return { previous: null, next: null };

  const [previous] = await db.query.posts.findMany({
    where: and(
      livePosts(),
      sql`${posts.publishedAt} < ${Math.floor(post.publishedAt.getTime() / 1000)}`,
    ),
    orderBy: [desc(posts.publishedAt)],
    limit: 1,
    columns: { id: true, title: true, slug: true, coverImage: true },
  });

  const [next] = await db.query.posts.findMany({
    where: and(
      livePosts(),
      sql`${posts.publishedAt} > ${Math.floor(post.publishedAt.getTime() / 1000)}`,
    ),
    orderBy: [posts.publishedAt],
    limit: 1,
    columns: { id: true, title: true, slug: true, coverImage: true },
  });

  return { previous: previous ?? null, next: next ?? null };
}

export async function getRelatedPosts(
  post: { id: number; categoryId: number | null; postTags: { tagId: number }[] },
  limit = 3,
) {
  const tagIds = post.postTags.map((pt) => pt.tagId);

  if (tagIds.length) {
    const byTag = await db.query.posts.findMany({
      where: and(
        livePosts(),
        ne(posts.id, post.id),
        inArray(
          posts.id,
          db
            .select({ id: postTags.postId })
            .from(postTags)
            .where(inArray(postTags.tagId, tagIds)),
        ),
      ),
      with: postWith,
      orderBy: [desc(posts.publishedAt)],
      limit,
    });
    if (byTag.length >= limit) return byTag;
  }

  return db.query.posts.findMany({
    where: and(
      livePosts(),
      ne(posts.id, post.id),
      post.categoryId ? eq(posts.categoryId, post.categoryId) : undefined,
    ),
    with: postWith,
    orderBy: [desc(posts.publishedAt)],
    limit,
  });
}

export async function incrementViews(postId: number) {
  await db
    .update(posts)
    .set({ views: sql`${posts.views} + 1` })
    .where(eq(posts.id, postId));
}

/* ------------------------------------------------------------------ */
/* Widgets                                                             */
/* ------------------------------------------------------------------ */
export async function getFeaturedPosts(limit = 5) {
  const featured = await db.query.posts.findMany({
    where: and(livePosts(), eq(posts.featured, true)),
    with: postWith,
    orderBy: [desc(posts.publishedAt)],
    limit,
  });
  if (featured.length) return featured;

  return db.query.posts.findMany({
    where: livePosts(),
    with: postWith,
    orderBy: [desc(posts.publishedAt)],
    limit,
  });
}

export async function getRecentPosts(limit = 6) {
  return db.query.posts.findMany({
    where: livePosts(),
    with: postWith,
    orderBy: [desc(posts.publishedAt)],
    limit,
  });
}

export async function getPopularPosts(limit = 5) {
  return db.query.posts.findMany({
    where: livePosts(),
    with: postWith,
    orderBy: [desc(posts.views), desc(posts.publishedAt)],
    limit,
  });
}

export async function getCategoriesWithCounts() {
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      color: categories.color,
      description: categories.description,
      coverImage: categories.coverImage,
      position: categories.position,
      count: countDistinct(posts.id),
    })
    .from(categories)
    .leftJoin(posts, and(eq(posts.categoryId, categories.id), livePosts()))
    .groupBy(categories.id)
    .orderBy(categories.position, categories.name);

  return rows;
}

export async function getTagsWithCounts(limit?: number) {
  const query = db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      count: countDistinct(posts.id),
    })
    .from(tags)
    .leftJoin(postTags, eq(postTags.tagId, tags.id))
    .leftJoin(posts, and(eq(posts.id, postTags.postId), livePosts()))
    .groupBy(tags.id)
    .orderBy(desc(countDistinct(posts.id)), tags.name);

  return limit ? query.limit(limit) : query;
}

export async function getArchiveMonths() {
  return db
    .select({
      year: sql<string>`strftime('%Y', ${posts.publishedAt}, 'unixepoch')`.as("year"),
      month: sql<string>`strftime('%m', ${posts.publishedAt}, 'unixepoch')`.as("month"),
      count: countDistinct(posts.id),
    })
    .from(posts)
    .where(livePosts())
    .groupBy(sql`year`, sql`month`)
    .orderBy(desc(sql`year`), desc(sql`month`));
}

export async function getCategoryBySlug(slug: string) {
  return (
    (await db.query.categories.findFirst({ where: eq(categories.slug, slug) })) ??
    null
  );
}

export async function getTagBySlug(slug: string) {
  return (await db.query.tags.findFirst({ where: eq(tags.slug, slug) })) ?? null;
}

export async function getAuthorBySlug(slug: string) {
  return (
    (await db.query.users.findFirst({
      where: eq(users.slug, slug),
      columns: { passwordHash: false },
    })) ?? null
  );
}

export async function getAuthors() {
  return db.query.users.findMany({ columns: { passwordHash: false } });
}

/* ------------------------------------------------------------------ */
/* Pages                                                               */
/* ------------------------------------------------------------------ */
export async function getPageBySlug(slug: string) {
  return (
    (await db.query.pages.findFirst({
      where: and(eq(pages.slug, slug), eq(pages.status, "published")),
    })) ?? null
  );
}

export async function getFooterPages() {
  return db.query.pages.findMany({
    where: and(eq(pages.status, "published"), eq(pages.showInFooter, true)),
    columns: { title: true, slug: true },
  });
}

/* ------------------------------------------------------------------ */
/* Comments                                                            */
/* ------------------------------------------------------------------ */
export async function getApprovedComments(postId: number) {
  return db.query.comments.findMany({
    where: and(eq(comments.postId, postId), eq(comments.status, "approved")),
    orderBy: [comments.createdAt],
  });
}

export async function getCommentCount(postId: number) {
  const [row] = await db
    .select({ value: countDistinct(comments.id) })
    .from(comments)
    .where(and(eq(comments.postId, postId), eq(comments.status, "approved")));
  return row?.value ?? 0;
}

/* ------------------------------------------------------------------ */
/* Sitemap / feeds                                                     */
/* ------------------------------------------------------------------ */
export async function getAllPublishedSlugs() {
  return db
    .select({
      slug: posts.slug,
      updatedAt: posts.updatedAt,
      publishedAt: posts.publishedAt,
    })
    .from(posts)
    .where(livePosts())
    .orderBy(desc(posts.publishedAt));
}

export async function getFeedPosts(limit = 20) {
  return db.query.posts.findMany({
    where: livePosts(),
    with: postWith,
    orderBy: [desc(posts.publishedAt)],
    limit,
  });
}

/* ------------------------------------------------------------------ */
/* Admin                                                               */
/* ------------------------------------------------------------------ */
export async function getAdminStats() {
  const [published] = await db
    .select({ value: countDistinct(posts.id) })
    .from(posts)
    .where(eq(posts.status, "published"));
  const [drafts] = await db
    .select({ value: countDistinct(posts.id) })
    .from(posts)
    .where(eq(posts.status, "draft"));
  const [views] = await db
    .select({ value: sql<number>`coalesce(sum(${posts.views}), 0)` })
    .from(posts);
  const [pendingComments] = await db
    .select({ value: countDistinct(comments.id) })
    .from(comments)
    .where(eq(comments.status, "pending"));
  const [subscriberCount] = await db
    .select({ value: countDistinct(subscribers.id) })
    .from(subscribers);
  const [categoryCount] = await db
    .select({ value: countDistinct(categories.id) })
    .from(categories);

  return {
    published: published?.value ?? 0,
    drafts: drafts?.value ?? 0,
    views: Number(views?.value ?? 0),
    pendingComments: pendingComments?.value ?? 0,
    subscribers: subscriberCount?.value ?? 0,
    categories: categoryCount?.value ?? 0,
  };
}

export async function getAdminPosts(options: {
  status?: "draft" | "published";
  search?: string;
  page?: number;
  perPage?: number;
}) {
  const { status, search, page = 1, perPage = 20 } = options;
  const filters: SQL[] = [];

  if (status) filters.push(eq(posts.status, status));
  if (search?.trim()) {
    filters.push(like(sql`lower(${posts.title})`, `%${search.trim().toLowerCase()}%`));
  }

  const where = filters.length ? and(...filters) : undefined;

  const [{ value: total }] = await db
    .select({ value: countDistinct(posts.id) })
    .from(posts)
    .where(where);

  const items = await db.query.posts.findMany({
    where,
    with: postWith,
    orderBy: [desc(posts.updatedAt)],
    limit: perPage,
    offset: (page - 1) * perPage,
  });

  return { items, total, page, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function getAdminPost(id: number) {
  return (
    (await db.query.posts.findFirst({ where: eq(posts.id, id), with: postWith })) ??
    null
  );
}

export async function getAdminComments(status?: "pending" | "approved" | "spam") {
  return db.query.comments.findMany({
    where: status ? eq(comments.status, status) : undefined,
    orderBy: [desc(comments.createdAt)],
    with: { post: { columns: { title: true, slug: true } } },
    limit: 200,
  });
}

export async function getMediaLibrary(limit = 120) {
  return db.query.media.findMany({ orderBy: [desc(media.createdAt)], limit });
}

export async function getSubscribers() {
  return db.query.subscribers.findMany({ orderBy: [desc(subscribers.createdAt)] });
}

export async function getRecentActivity(limit = 6) {
  return db.query.posts.findMany({
    orderBy: [desc(posts.updatedAt)],
    limit,
    columns: {
      id: true,
      title: true,
      slug: true,
      status: true,
      updatedAt: true,
      views: true,
    },
  });
}
