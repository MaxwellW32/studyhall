"use server"

import { newPost, post, postSchema } from "@/types";
import * as schema from '@/db/schema';
import { posts, comments } from "@/db/schema"
import { eq, desc } from "drizzle-orm";
import { usableDb } from "@/db";
import { authOptions } from '@/lib/auth/auth-options'
import { getServerSession } from "next-auth";
import { v4 as uuidv4 } from "uuid"
import { revalidatePath } from "next/cache";

export async function getTopPosts(communityId: string, seenLimit: number, seenOffset: number) {

    const results = await usableDb.query.posts.findMany({
        where: eq(posts.communityId, communityId),
        orderBy: [desc(posts.likes)],
        limit: seenLimit,
        offset: seenOffset,
        with: {
            author: true,
            comments: {
                orderBy: [desc(comments.likes)],
                limit: 2
            }
        }
    });

    return results
}

export async function getLatestPosts(communityId: string, seenLimit: number, seenOffset: number) {

    const results = await usableDb.query.posts.findMany({
        where: eq(posts.communityId, communityId),
        orderBy: [desc(posts.datePosted)],
        limit: seenLimit,
        offset: seenOffset,
        with: {
            author: true,
            comments: {
                orderBy: [desc(comments.likes)],
                limit: 2
            }
        }
    });

    return results


}

export async function getSpecificPost(postId: string) {

    const results = await usableDb.query.posts.findFirst({
        where: eq(posts.id, postId),
        with: {
            forCommunity: true,
            author: true,
            comments: {
                limit: 10,
                with: {
                    replies: {
                        limit: 1
                    }
                }
            }
        }
    });

    return results


}

export async function addPost(seenPost: newPost) {

    const session = await getServerSession(authOptions)
    if (!session) throw new Error("No session")

    const newPost: post = {
        ...seenPost,
        id: uuidv4(),
        userId: session.user.id,
        datePosted: new Date,
        likes: null
    }

    postSchema.parse(newPost)

    await usableDb.insert(posts).values(newPost);

    revalidatePath("/")
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