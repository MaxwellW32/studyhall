"use server"

import { newReply, reply, replySchema } from "@/types";
import { replies } from "@/db/schema"
import { eq, desc } from "drizzle-orm";
import { usableDb } from "@/db";
import { authOptions } from '@/lib/auth/auth-options'
import { getServerSession } from "next-auth";
import { v4 as uuidv4 } from "uuid"

export async function getCommentReplies(commentId: string, seenLimit: number) {

    const results = await usableDb.query.replies.findMany({
        where: eq(replies.commentId, commentId),
        orderBy: [desc(replies.likes)],
        limit: seenLimit,
        with: {
            fromUser: true,
            replyingToUser: true
        }
    });

    return results
}

export async function addReply(seenReply: newReply) {

    const session = await getServerSession(authOptions)
    if (!session) throw new Error("No session")

    const newReply: reply = {
        ...seenReply,
        id: uuidv4(),
        userId: session.user.id,
        datePosted: new Date(),
        likes: null
    }

    replySchema.parse(newReply)

    await usableDb.insert(replies).values(newReply);
}


export async function updateReply(newReply: Pick<reply, "id" | "message">) {

    replySchema.parse(newReply.id)


    await usableDb.update(replies)
        .set({
            message: newReply.message
        })
        .where(eq(replies.id, newReply.id));
}


export async function deleteComment(seenId: string) {

    replySchema.pick({ id: true }).parse(seenId)


    await usableDb.delete(replies).where(eq(replies.id, seenId));
}