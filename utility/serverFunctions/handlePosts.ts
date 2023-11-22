"use server"

import { post, postSchema } from "@/types";
import * as schema from '@/db/schema';
import { posts } from "@/db/schema"
import { eq } from "drizzle-orm";
import { usableDb } from "@/db";


export async function getAllPosts() {

    const results = await usableDb.query.posts.findMany();
    return results
}

export async function addPost(seenPost: post) {
    const newPost = seenPost
    newPost.datePosted = new Date()
    newPost.userId = "b4aa351c-3f84-4b73-b581-ef5836fdf500" //auth script soon

    postSchema.parse(newPost)



    await usableDb.insert(posts).values(newPost);
}

export async function updatePost(seenPost: post) {

    postSchema.parse(seenPost)



    await usableDb.update(posts)
        .set(seenPost)
        .where(eq(posts.id, seenPost.id));
}

export async function deletePost(seenPostId: string) {

    postSchema.pick({ id: true }).parse(seenPostId)



    await usableDb.delete(posts).where(eq(posts.id, seenPostId));
}