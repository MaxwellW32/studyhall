"use server"

import { reply, replySchema } from "@/types";
import { replies } from "@/db/schema"
import { eq, desc } from "drizzle-orm";
import { usableDb } from "@/db";


export async function getAllCommentReplies(commentId: string) {

    const results = await usableDb.query.replies.findMany({
        where: eq(replies.commentId, commentId),
        orderBy: [desc(replies.likes)],
        limit: 50,
        with: {
            fromUser: true,
            replyingToUser: true
        }
    });

    return results
}

export async function addReply(seenReply: reply) {

    replySchema.parse(seenReply)


    await usableDb.insert(replies).values(seenReply);
}


export async function updateReply(newReply: reply) {

    replySchema.parse(newReply)


    await usableDb.update(replies)
        .set(newReply)
        .where(eq(replies.id, newReply.id));
}


export async function deleteComment(seenId: string) {

    replySchema.pick({ id: true }).parse(seenId)


    await usableDb.delete(replies).where(eq(replies.id, seenId));
}