"use server"

import { newPost, post, postSchema } from "@/types";
import * as schema from '@/db/schema';
import { posts } from "@/db/schema"
import { eq } from "drizzle-orm";
import { usableDb } from "@/db";
import { authOptions } from '@/lib/auth/auth-options'
import { getServerSession } from "next-auth";
import { v4 as uuidv4 } from "uuid"

export async function getAllPosts() {

    const results = await usableDb.query.posts.findMany();
    return results
}

export async function addPost(seenPost: newPost) {

    const session = await getServerSession(authOptions)
    if (!session) throw new Error("No session")

    const newPost: post = {
        ...seenPost,
        id: uuidv4(),
        userId: session.user.id,
        datePosted: new Date(),
        likes: null
    }

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