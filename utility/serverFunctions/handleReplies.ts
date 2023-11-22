"use server"

import { comment, commentsSchema, reply, replySchema } from "@/types";
import { v4 as uuidv4 } from "uuid"
import * as schema from "@/db/schema"
import { connect } from "@planetscale/database"
import { config } from "@/db/config"
import { comments, users, replies } from "@/db/schema"
import { drizzle } from "drizzle-orm/planetscale-serverless"
import { eq, desc } from "drizzle-orm";


export async function getAllCommentReplies(commentId: string) {

    const conn = connect(config)

    const db = drizzle(conn, { schema });

    const results = await db.query.replies.findMany({
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

    const conn = connect(config)
    const db = drizzle(conn)

    await db.insert(replies).values(seenReply);
}


export async function updateReply(newReply: reply) {

    replySchema.parse(newReply)

    const conn = connect(config)
    const db = drizzle(conn)

    await db.update(replies)
        .set(newReply)
        .where(eq(replies.id, newReply.id));
}


export async function deleteComment(seenId: string) {

    replySchema.pick({ id: true }).parse(seenId)

    const conn = connect(config)
    const db = drizzle(conn)

    await db.delete(replies).where(eq(replies.id, seenId));
}