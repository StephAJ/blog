import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

const now = sql`(unixepoch())`;

/* ------------------------------------------------------------------ */
/* Users                                                               */
/* ------------------------------------------------------------------ */
export const users = sqliteTable(
  "users",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    role: text("role", { enum: ["admin", "author"] })
      .notNull()
      .default("author"),
    bio: text("bio"),
    avatarUrl: text("avatar_url"),
    twitter: text("twitter"),
    website: text("website"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(now),
  },
  (t) => [
    uniqueIndex("users_email_idx").on(t.email),
    uniqueIndex("users_slug_idx").on(t.slug),
  ],
);

/* ------------------------------------------------------------------ */
/* Taxonomy                                                            */
/* ------------------------------------------------------------------ */
export const categories = sqliteTable(
  "categories",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    /** Hex colour used for the badge / accents on the public site. */
    color: text("color").notNull().default("#d9482b"),
    coverImage: text("cover_image"),
    position: integer("position").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(now),
  },
  (t) => [uniqueIndex("categories_slug_idx").on(t.slug)],
);

export const tags = sqliteTable(
  "tags",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(now),
  },
  (t) => [uniqueIndex("tags_slug_idx").on(t.slug)],
);

/* ------------------------------------------------------------------ */
/* Posts                                                               */
/* ------------------------------------------------------------------ */
export const posts = sqliteTable(
  "posts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    excerpt: text("excerpt"),
    /** Sanitised HTML produced by the admin editor. */
    content: text("content").notNull().default(""),
    /** Plain-text mirror of `content`, used for search + reading time. */
    contentText: text("content_text").notNull().default(""),
    coverImage: text("cover_image"),
    coverAlt: text("cover_alt"),
    categoryId: integer("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    authorId: integer("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status", { enum: ["draft", "published"] })
      .notNull()
      .default("draft"),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    pinned: integer("pinned", { mode: "boolean" }).notNull().default(false),
    allowComments: integer("allow_comments", { mode: "boolean" })
      .notNull()
      .default(true),
    views: integer("views").notNull().default(0),
    readingMinutes: integer("reading_minutes").notNull().default(1),

    /* SEO */
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    ogImage: text("og_image"),
    canonicalUrl: text("canonical_url"),
    noindex: integer("noindex", { mode: "boolean" }).notNull().default(false),

    publishedAt: integer("published_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(now),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(now),
  },
  (t) => [
    uniqueIndex("posts_slug_idx").on(t.slug),
    index("posts_status_published_idx").on(t.status, t.publishedAt),
    index("posts_category_idx").on(t.categoryId),
    index("posts_author_idx").on(t.authorId),
  ],
);

export const postTags = sqliteTable(
  "post_tags",
  {
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.postId, t.tagId] }),
    index("post_tags_tag_idx").on(t.tagId),
  ],
);

/* ------------------------------------------------------------------ */
/* Static pages (About, Contact, Privacy …)                            */
/* ------------------------------------------------------------------ */
export const pages = sqliteTable(
  "pages",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    content: text("content").notNull().default(""),
    metaDescription: text("meta_description"),
    status: text("status", { enum: ["draft", "published"] })
      .notNull()
      .default("published"),
    showInFooter: integer("show_in_footer", { mode: "boolean" })
      .notNull()
      .default(true),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(now),
  },
  (t) => [uniqueIndex("pages_slug_idx").on(t.slug)],
);

/* ------------------------------------------------------------------ */
/* Comments                                                            */
/* ------------------------------------------------------------------ */
export const comments = sqliteTable(
  "comments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    parentId: integer("parent_id"),
    authorName: text("author_name").notNull(),
    authorEmail: text("author_email").notNull(),
    website: text("website"),
    content: text("content").notNull(),
    status: text("status", { enum: ["pending", "approved", "spam"] })
      .notNull()
      .default("pending"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(now),
  },
  (t) => [
    index("comments_post_idx").on(t.postId, t.status),
    index("comments_status_idx").on(t.status),
  ],
);

/* ------------------------------------------------------------------ */
/* Newsletter                                                          */
/* ------------------------------------------------------------------ */
export const subscribers = sqliteTable(
  "subscribers",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull(),
    source: text("source").notNull().default("sidebar"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(now),
  },
  (t) => [uniqueIndex("subscribers_email_idx").on(t.email)],
);

/* ------------------------------------------------------------------ */
/* Media library                                                       */
/* ------------------------------------------------------------------ */
export const media = sqliteTable("media", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  url: text("url").notNull(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  width: integer("width"),
  height: integer("height"),
  size: integer("size").notNull().default(0),
  alt: text("alt"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(now),
});

/* ------------------------------------------------------------------ */
/* Site settings — single row, id = 1                                  */
/* ------------------------------------------------------------------ */
export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey(),

  siteName: text("site_name").notNull().default("Stephen Arthur"),
  tagline: text("tagline").notNull().default("Ideas worth the read."),
  description: text("description")
    .notNull()
    .default("A blog about technology, design and the things in between."),
  siteUrl: text("site_url").notNull().default("https://blog.stephenarthur.org"),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  defaultOgImage: text("default_og_image"),
  postsPerPage: integer("posts_per_page").notNull().default(9),
  copyright: text("copyright"),
  footerNote: text("footer_note"),

  /* Author / about box */
  aboutHeading: text("about_heading").notNull().default("About"),
  aboutText: text("about_text"),
  aboutImage: text("about_image"),

  /* Social */
  twitterUrl: text("twitter_url"),
  twitterHandle: text("twitter_handle"),
  facebookUrl: text("facebook_url"),
  instagramUrl: text("instagram_url"),
  linkedinUrl: text("linkedin_url"),
  youtubeUrl: text("youtube_url"),
  githubUrl: text("github_url"),
  contactEmail: text("contact_email"),

  /* SEO */
  metaTitleTemplate: text("meta_title_template").notNull().default("%s · %site%"),
  googleSiteVerification: text("google_site_verification"),
  bingSiteVerification: text("bing_site_verification"),
  robotsExtra: text("robots_extra"),

  /* Analytics */
  gaMeasurementId: text("ga_measurement_id"),
  gtmContainerId: text("gtm_container_id"),
  plausibleDomain: text("plausible_domain"),
  umamiWebsiteId: text("umami_website_id"),
  umamiScriptUrl: text("umami_script_url"),

  /* AdSense */
  adsenseEnabled: integer("adsense_enabled", { mode: "boolean" })
    .notNull()
    .default(false),
  adsenseClientId: text("adsense_client_id"),
  adsenseAutoAds: integer("adsense_auto_ads", { mode: "boolean" })
    .notNull()
    .default(false),
  adSlotHeader: text("ad_slot_header"),
  adSlotInArticle: text("ad_slot_in_article"),
  adSlotSidebar: text("ad_slot_sidebar"),
  adSlotFooter: text("ad_slot_footer"),
  adsTxt: text("ads_txt"),

  /* Behaviour */
  commentsEnabled: integer("comments_enabled", { mode: "boolean" })
    .notNull()
    .default(true),
  commentsAutoApprove: integer("comments_auto_approve", { mode: "boolean" })
    .notNull()
    .default(false),
  newsletterEnabled: integer("newsletter_enabled", { mode: "boolean" })
    .notNull()
    .default(true),

  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(now),
});

/* ------------------------------------------------------------------ */
/* Relations                                                           */
/* ------------------------------------------------------------------ */
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  posts: many(posts),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  postTags: many(postTags),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
  category: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id],
  }),
  postTags: many(postTags),
  comments: many(comments),
}));

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, { fields: [postTags.postId], references: [posts.id] }),
  tag: one(tags, { fields: [postTags.tagId], references: [tags.id] }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, { fields: [comments.postId], references: [posts.id] }),
}));

/* ------------------------------------------------------------------ */
/* Inferred types                                                      */
/* ------------------------------------------------------------------ */
export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Page = typeof pages.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Subscriber = typeof subscribers.$inferSelect;
export type Media = typeof media.$inferSelect;
export type Settings = typeof settings.$inferSelect;
