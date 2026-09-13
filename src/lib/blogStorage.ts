import { db } from "@/lib/db";
import { uiConfigs } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { INITIAL_BLOG_POSTS, BlogPost } from "@/data/blogs";

const BLOG_CONFIG_ID = "site_blog_posts";

export async function getStoredBlogPosts(): Promise<BlogPost[]> {
  try {
    const existing = await db
      .select()
      .from(uiConfigs)
      .where(eq(uiConfigs.id, BLOG_CONFIG_ID))
      .limit(1);

    if (existing.length > 0 && existing[0].spec) {
      try {
        const parsed = JSON.parse(existing[0].spec);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {}
    }
  } catch (error) {
    console.error("Error reading blog posts from db:", error);
  }
  return INITIAL_BLOG_POSTS;
}

export async function saveStoredBlogPosts(posts: BlogPost[]): Promise<boolean> {
  try {
    const serialized = JSON.stringify(posts);
    const existing = await db
      .select()
      .from(uiConfigs)
      .where(eq(uiConfigs.id, BLOG_CONFIG_ID))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(uiConfigs)
        .set({ spec: serialized, type: "blog_posts", targetId: "blog_page" })
        .where(eq(uiConfigs.id, BLOG_CONFIG_ID));
    } else {
      await db.insert(uiConfigs).values({
        id: BLOG_CONFIG_ID,
        type: "blog_posts",
        targetId: "blog_page",
        spec: serialized,
      });
    }
    return true;
  } catch (error) {
    console.error("Error saving blog posts to db:", error);
    return false;
  }
}
