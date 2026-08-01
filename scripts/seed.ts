import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";

import { loadEnv } from "../src/lib/env";
import type { DemoSection } from "./demo-content";

loadEnv();

const { db } = await import("../src/db");
const {
  categories,
  comments,
  pages,
  postTags,
  posts,
  settings,
  subscribers,
  tags,
  users,
} = await import("../src/db/schema");
const { readingMinutes, slugify, stripHtml } = await import("../src/lib/utils");
const {
  demoCategories,
  demoComments,
  demoPages,
  demoPosts,
  demoSubscribers,
  demoTags,
} = await import("./demo-content");

const force = process.argv.includes("--force");

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(9, 30, 0, 0);
  return d;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function sectionsToHtml(sections: DemoSection[]) {
  const chunks: string[] = [];

  for (const section of sections) {
    if (section.heading) chunks.push(`<h2>${escapeHtml(section.heading)}</h2>`);
    for (const paragraph of section.body) {
      chunks.push(`<p>${escapeHtml(paragraph)}</p>`);
    }
    if (section.list?.length) {
      chunks.push(
        `<ul>${section.list.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`,
      );
    }
    if (section.quote) {
      chunks.push(`<blockquote><p>${escapeHtml(section.quote)}</p></blockquote>`);
    }
  }

  return chunks.join("\n");
}

async function main() {
  const existing = await db.select({ n: sql<number>`count(*)` }).from(posts);
  if ((existing[0]?.n ?? 0) > 0 && !force) {
    console.log(
      "Database already contains posts. Re-run with --force to wipe and reseed.",
    );
    process.exit(0);
  }

  if (force) {
    console.log("Clearing existing content…");
    await db.delete(postTags);
    await db.delete(comments);
    await db.delete(posts);
    await db.delete(tags);
    await db.delete(categories);
    await db.delete(pages);
    await db.delete(subscribers);
    await db.delete(users);
    await db.delete(settings);
  }

  /* ---------------------------------------------------------------- */
  /* Admin user                                                        */
  /* ---------------------------------------------------------------- */
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@stephenarthur.org";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const adminName = process.env.ADMIN_NAME ?? "Stephen Arthur";

  const [admin] = await db
    .insert(users)
    .values({
      email: adminEmail.toLowerCase(),
      passwordHash: await bcrypt.hash(adminPassword, 12),
      name: adminName,
      slug: slugify(adminName),
      role: "admin",
      bio: "Writing about technology, design and the systems that connect them. Ex-engineer, permanent generalist, occasional photographer.",
      twitter: "stephenarthur",
      website: "https://stephenarthur.org",
    })
    .onConflictDoUpdate({
      target: users.email,
      set: { name: adminName },
    })
    .returning();

  console.log(`✓ Admin user: ${admin.email}`);

  /* ---------------------------------------------------------------- */
  /* Settings                                                          */
  /* ---------------------------------------------------------------- */
  await db
    .insert(settings)
    .values({
      id: 1,
      siteName: "Stephen Arthur",
      tagline: "Notes on technology, design and doing careful work.",
      description:
        "Long-form writing on software, design and the habits that surround them. New essays roughly weekly.",
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://blog.stephenarthur.org",
      copyright: `© ${new Date().getFullYear()} Stephen Arthur. All rights reserved.`,
      footerNote:
        "Written by hand, published on a domain I own. No sponsored posts, ever.",
      aboutHeading: "About the author",
      aboutText:
        "I write about how software actually gets built — the decisions, the trade-offs and the parts nobody puts in the conference talk.",
      aboutImage: "https://picsum.photos/seed/author-portrait/400/400",
      twitterUrl: "https://twitter.com/stephenarthur",
      twitterHandle: "@stephenarthur",
      githubUrl: "https://github.com/stephenarthur",
      linkedinUrl: "https://linkedin.com/in/stephenarthur",
      instagramUrl: "https://instagram.com/stephenarthur",
      contactEmail: "hello@stephenarthur.org",
      postsPerPage: 9,
      commentsEnabled: true,
      commentsAutoApprove: false,
      newsletterEnabled: true,
      adsTxt: "# Add your AdSense line here once approved, e.g.\n# google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0",
    })
    .onConflictDoNothing();

  console.log("✓ Site settings");

  /* ---------------------------------------------------------------- */
  /* Categories + tags                                                 */
  /* ---------------------------------------------------------------- */
  const categoryIds = new Map<string, number>();
  for (const [index, category] of demoCategories.entries()) {
    const [row] = await db
      .insert(categories)
      .values({ ...category, position: index })
      .onConflictDoUpdate({
        target: categories.slug,
        set: { name: category.name, color: category.color },
      })
      .returning();
    categoryIds.set(category.name, row.id);
  }
  console.log(`✓ ${demoCategories.length} categories`);

  const tagIds = new Map<string, number>();
  for (const name of demoTags) {
    const [row] = await db
      .insert(tags)
      .values({ name, slug: slugify(name) })
      .onConflictDoUpdate({ target: tags.slug, set: { name } })
      .returning();
    tagIds.set(name, row.id);
  }
  console.log(`✓ ${demoTags.length} tags`);

  /* ---------------------------------------------------------------- */
  /* Posts                                                             */
  /* ---------------------------------------------------------------- */
  const postIds = new Map<string, number>();

  for (const demo of demoPosts) {
    const html = sectionsToHtml(demo.sections);
    const text = stripHtml(html);
    const published = daysAgo(demo.daysAgo);

    const [row] = await db
      .insert(posts)
      .values({
        title: demo.title,
        slug: demo.slug,
        excerpt: demo.excerpt,
        content: html,
        contentText: text,
        coverImage: demo.cover,
        coverAlt: demo.title,
        categoryId: categoryIds.get(demo.category) ?? null,
        authorId: admin.id,
        status: "published",
        featured: demo.featured ?? false,
        pinned: demo.pinned ?? false,
        views: demo.views,
        readingMinutes: readingMinutes(text),
        metaDescription: demo.excerpt,
        publishedAt: published,
        createdAt: published,
        updatedAt: published,
      })
      .onConflictDoUpdate({
        target: posts.slug,
        set: { title: demo.title, content: html, contentText: text },
      })
      .returning();

    postIds.set(demo.slug, row.id);

    await db.delete(postTags).where(eq(postTags.postId, row.id));
    for (const tagName of demo.tags) {
      const tagId = tagIds.get(tagName);
      if (tagId) {
        await db.insert(postTags).values({ postId: row.id, tagId }).onConflictDoNothing();
      }
    }
  }
  console.log(`✓ ${demoPosts.length} published posts`);

  /* A couple of drafts so the admin list has something to filter. */
  const draftDefinitions = [
    {
      title: "Why our incident reviews stopped being useful (and how we fixed them)",
      excerpt:
        "Blameless postmortems that produce no change are just a longer way of saying nothing happened.",
      category: "Business",
    },
    {
      title: "A field guide to reading other people's codebases",
      excerpt:
        "Start at the entry point, follow one request all the way through, and resist the urge to fix anything for a week.",
      category: "Technology",
    },
  ];

  for (const draft of draftDefinitions) {
    const html = `<p>${escapeHtml(draft.excerpt)}</p><p>Draft — still working through the argument.</p>`;
    await db
      .insert(posts)
      .values({
        title: draft.title,
        slug: slugify(draft.title),
        excerpt: draft.excerpt,
        content: html,
        contentText: stripHtml(html),
        categoryId: categoryIds.get(draft.category) ?? null,
        authorId: admin.id,
        status: "draft",
        readingMinutes: 1,
      })
      .onConflictDoNothing();
  }
  console.log(`✓ ${draftDefinitions.length} drafts`);

  /* ---------------------------------------------------------------- */
  /* Pages                                                             */
  /* ---------------------------------------------------------------- */
  for (const page of demoPages) {
    await db
      .insert(pages)
      .values({ ...page, content: page.content.trim(), status: "published" })
      .onConflictDoUpdate({
        target: pages.slug,
        set: { title: page.title, content: page.content.trim() },
      });
  }
  console.log(`✓ ${demoPages.length} pages`);

  /* ---------------------------------------------------------------- */
  /* Comments + subscribers                                            */
  /* ---------------------------------------------------------------- */
  for (const comment of demoComments) {
    const postId = postIds.get(comment.postSlug);
    if (!postId) continue;
    await db.insert(comments).values({
      postId,
      authorName: comment.authorName,
      authorEmail: comment.authorEmail,
      website: comment.website,
      content: comment.content,
      status: comment.status,
      createdAt: daysAgo(comment.daysAgo),
    });
  }
  console.log(`✓ ${demoComments.length} comments`);

  for (const [index, email] of demoSubscribers.entries()) {
    await db
      .insert(subscribers)
      .values({ email, createdAt: daysAgo(index * 3 + 1) })
      .onConflictDoNothing();
  }
  console.log(`✓ ${demoSubscribers.length} subscribers`);

  console.log("\nDone. Sign in at /admin/login");
  console.log(`  email:    ${adminEmail}`);
  console.log(`  password: ${adminPassword}`);
}

await main();
process.exit(0);
