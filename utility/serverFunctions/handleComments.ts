"use server"

import { comment, commentsSchema } from "@/types";
import { comments, users, replies } from "@/db/schema"
import { eq, desc } from "drizzle-orm";
import { usableDb } from "@/db/index";


export async function getPostComments(seenPostId: string, limitAmt: number) {

    const results = await usableDb.query.comments.findMany({
        where: eq(comments.postId, seenPostId),
        orderBy: [desc(comments.likes)],
        limit: limitAmt,
        with: {
            fromUser: true,
            replies: {
                orderBy: [desc(replies.likes)],
                limit: 1,
                with: { fromUser: true, replyingToUser: true }
            },
        }
    });

    return results
}

export async function addComment(seenComment: comment) {

    commentsSchema.parse(seenComment)

    await usableDb.insert(comments).values(seenComment);
}

export async function getCommentUser(commentUserId: string) {

    const results = await usableDb.select()
        .from(users)
        .where(eq(users.id, commentUserId))

    return results[0]
}

export async function updateComment(newComment: comment) {

    commentsSchema.parse(newComment)

    await usableDb.update(comments)
        .set(newComment)
        .where(eq(comments.id, newComment.id));
}

export async function deleteComment(seenId: string) {

    commentsSchema.pick({ id: true }).parse(seenId)

    await usableDb.delete(comments).where(eq(comments.id, seenId));
}