"use server"

import { comment, commentsSchema, newComment } from "@/types";
import { comments, users, replies } from "@/db/schema"
import { eq, desc } from "drizzle-orm";
import { usableDb } from "@/db/index";
import { authOptions } from '@/lib/auth/auth-options'
import { getServerSession } from "next-auth";
import { v4 as uuidv4 } from "uuid"

export async function getPostComments(seenPostId: string, limitAmt: number) {

    const results = await usableDb.query.comments.findMany({
        where: eq(comments.postId, seenPostId),
        orderBy: [desc(comments.likes)],
        limit: limitAmt,
        with: {
            fromUser: true
        }
    });

    return results
}

export async function addComment(seenComment: newComment) {


    const session = await getServerSession(authOptions)
    if (!session) throw new Error("No session")

    const newComment: comment = {
        ...seenComment,
        id: uuidv4(),
        userId: session.user.id,
        datePosted: new Date(),
        likes: null
    }

    commentsSchema.parse(newComment)

    await usableDb.insert(comments).values(newComment);
}

export async function getCommentUser(commentUserId: string) {

    const results = await usableDb.select()
        .from(users)
        .where(eq(users.id, commentUserId))

    return results[0]
}

export async function updateComment(newComment: Pick<comment, 'id' | "message">) {

    commentsSchema.parse(newComment.id)

    await usableDb.update(comments)
        .set({
            message: newComment.message
        })
        .where(eq(comments.id, newComment.id));
}

export async function deleteComment(seenId: string) {

    commentsSchema.pick({ id: true }).parse(seenId)

    await usableDb.delete(comments).where(eq(comments.id, seenId));
}