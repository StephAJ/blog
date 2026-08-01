import { loadEnv } from "../src/lib/env";

loadEnv();

const { db } = await import("../src/db");
const {
  comments,
  media,
  pages,
  postTags,
  posts,
  settings,
  subscribers,
  tags,
  users,
  categories,
} = await import("../src/db/schema");

if (!process.argv.includes("--yes")) {
  console.log(
    "This deletes every post, page, comment, tag, category, subscriber and user.\n" +
      "Re-run with --yes if that is what you want:\n\n  npm run db:reset -- --yes\n",
  );
  process.exit(0);
}

await db.delete(postTags);
await db.delete(comments);
await db.delete(posts);
await db.delete(tags);
await db.delete(categories);
await db.delete(pages);
await db.delete(subscribers);
await db.delete(media);
await db.delete(users);
await db.delete(settings);

console.log("Database emptied. Run `npm run db:seed` to start again.");
process.exit(0);
