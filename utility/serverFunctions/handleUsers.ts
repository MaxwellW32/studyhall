"use server"

import { user, userSchema } from "@/types";
import { users } from "@/db/schema"
import { drizzle } from "drizzle-orm/planetscale-serverless"
import { eq } from "drizzle-orm";
import { db } from "@/db";


export async function getAllUsers() {
    const results = await db.select()
        .from(users)

    return results
}

export async function getSpecificUser(seenStr: string, option: "id" | "username") {
    if (option === "id") {
        const user = await db.query.users.findFirst({
            where: eq(users.id, seenStr),
        });

        return user

    } else if (option === "username") {
        const user = await db.query.users.findFirst({
            where: eq(users.username, seenStr),
        });

        return user
    }
}


export async function addUser(seenUser: user) {

    userSchema.parse(seenUser)

    await db.insert(users).values(seenUser);
}

export async function getPostUser(postUserId: string) {
    const results = await db.select()
        .from(users)
        .where(eq(users.id, postUserId))

    return results[0]
}

export async function updateUser(seenUser: user) {

    userSchema.parse(seenUser)

    await db.update(users)
        .set(seenUser)
        .where(eq(users.id, seenUser.id));
}

export async function deleteUser(seenId: string) {

    userSchema.pick({ id: true }).parse(seenId)

    await db.delete(users).where(eq(users.id, seenId));
}