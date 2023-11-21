"use server"

import { user, userSchema } from "@/types";
import { v4 as uuidv4 } from "uuid"
import { connect } from "@planetscale/database"
import { config } from "@/db/config"
import { users } from "@/db/schema"
import { drizzle } from "drizzle-orm/planetscale-serverless"
import { eq } from "drizzle-orm";


export async function getAllUsers() {
    const conn = connect(config)
    const db = drizzle(conn)

    const results = await db.select()
        .from(users)

    return results
}

export async function addUser(seenUser: user) {

    userSchema.parse(seenUser)

    const conn = connect(config)
    const db = drizzle(conn)

    await db.insert(users).values(seenUser);
}

export async function getPostUser(postUserId: string) {
    const conn = connect(config)
    const db = drizzle(conn)

    const results = await db.select()
        .from(users)
        .where(eq(users.id, postUserId))

    return results[0]
}

export async function updateUser(seenUser: user) {

    userSchema.parse(seenUser)

    const conn = connect(config)
    const db = drizzle(conn)

    await db.update(users)
        .set(seenUser)
        .where(eq(users.id, seenUser.id));
}

export async function deleteUser(seenId: string) {

    userSchema.pick({ id: true }).parse(seenId)

    const conn = connect(config)
    const db = drizzle(conn)

    await db.delete(users).where(eq(users.id, seenId));
}