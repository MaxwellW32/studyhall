"use server"

import { community, communitySchema, post, postSchema, usablePost } from "@/types";
import { v4 as uuidv4 } from "uuid"
import { connect } from "@planetscale/database"
import { config } from "@/db/config"
import { posts } from "@/db/schema"
import { drizzle } from "drizzle-orm/planetscale-serverless"
import { eq } from "drizzle-orm";


export async function getAllPosts() {
    const conn = connect(config)
    const db = drizzle(conn)

    const results = await db.select()
        .from(posts)

    return results
}

export async function getPostsFromCommunity(communityId: string) {
    const conn = connect(config)
    const db = drizzle(conn)

    const results = await db.select()
        .from(posts)
        .where(eq(posts.communityId, communityId))

    return results
}

export async function addPost(seenPost: usablePost) {
    console.log(`$hi there`, JSON.stringify(seenPost));

    const newPost: post = { ...seenPost, imageUrls: seenPost.imageUrls ? JSON.stringify(seenPost.imageUrls) : seenPost.imageUrls, videoUrls: seenPost.videoUrls ? JSON.stringify(seenPost.videoUrls) : seenPost.videoUrls }
    newPost.datePosted = new Date()
    newPost.userId = "b4aa351c-3f84-4b73-b581-ef5836fdf500"
    postSchema.parse(newPost)

    const conn = connect(config)
    const db = drizzle(conn)

    await db.insert(posts).values(newPost);
}

export async function updatePost(seenPost: post) {

    postSchema.parse(seenPost)

    const conn = connect(config)
    const db = drizzle(conn)

    await db.update(posts)
        .set(seenPost)
        .where(eq(posts.id, seenPost.id));
}

export async function deletePost(seenPostId: string) {

    postSchema.pick({ id: true }).parse(seenPostId)

    const conn = connect(config)
    const db = drizzle(conn)

    await db.delete(posts).where(eq(posts.id, seenPostId));
}