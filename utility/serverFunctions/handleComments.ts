"use server"

import { comment, commentsSchema, newComment, user } from "@/types";
import { comments, users, replies } from "@/db/schema"
import { eq, desc } from "drizzle-orm";
import { usableDb } from "@/db/index";
import { authOptions } from '@/lib/auth/auth-options'
import { getServerSession } from "next-auth";
import { v4 as uuidv4 } from "uuid"
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sql } from 'drizzle-orm'

export async function getPostComments(seenPostId: string, limitAmt: number, offsetAmt: number): Promise<comment[]> {

    const results = await usableDb.query.comments.findMany({
        where: eq(comments.postId, seenPostId),
        orderBy: [desc(comments.likes)],
        limit: limitAmt,
        offset: offsetAmt,
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
        datePosted: new Date,
        likes: 0
    }

    commentsSchema.parse(newComment)

    await usableDb.insert(comments).values(newComment);
}

export async function getCommentUser(commentUserId: string): Promise<user> {

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

export async function likeComment(commentId: string) {

    const session = await getServerSession(authOptions)
    if (!session) redirect("/api/auth/signIn")

    await usableDb.update(comments)
        .set({ likes: sql`${comments.likes} + 1` })
        .where(eq(comments.id, commentId));

    revalidatePath("/")
}

export async function deleteComment(seenId: string) {

    commentsSchema.pick({ id: true }).parse(seenId)

    await usableDb.delete(comments).where(eq(comments.id, seenId));
}