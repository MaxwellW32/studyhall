"use server"

import { comment, commentsSchema } from "@/types";
import { comments, users, replies } from "@/db/schema"
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";


export async function getPostComments(seenPostId: string) {

    const results = await db.query.comments.findMany({
        where: eq(comments.postId, seenPostId),
        orderBy: [desc(comments.likes)],
        with: {
            fromUser: true,
            replies: {
                orderBy: [desc(replies.likes)],
                limit: 1
            },
        }
    });

    return results
}

export async function addComment(seenComment: comment) {

    commentsSchema.parse(seenComment)

    await db.insert(comments).values(seenComment);
}

export async function getCommentUser(commentUserId: string) {

    const results = await db.select()
        .from(users)
        .where(eq(users.id, commentUserId))

    return results[0]
}

export async function updateComment(newComment: comment) {

    commentsSchema.parse(newComment)

    await db.update(comments)
        .set(newComment)
        .where(eq(comments.id, newComment.id));
}

export async function deleteComment(seenId: string) {

    commentsSchema.pick({ id: true }).parse(seenId)

    await db.delete(comments).where(eq(comments.id, seenId));
}