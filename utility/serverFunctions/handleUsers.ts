"use server"

import { updateUserType, user, userSchema } from "@/types";
import { users } from "@/db/schema"
import { drizzle } from "drizzle-orm/planetscale-serverless"
import { eq, like } from "drizzle-orm";
import { usableDb } from "@/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";


export async function getAllUsers() {
    const results = await usableDb.select()
        .from(users)

    return results
}

export async function getSpecificUser(seenStr: string, option: "id" | "username") {
    if (option === "id") {
        const user = await usableDb.query.users.findFirst({
            where: eq(users.id, seenStr),
        });

        return user

    } else if (option === "username") {
        const user = await usableDb.query.users.findFirst({
            where: like(users.username, `%${seenStr}%`),
        });

        return user
    }
}

export async function addUser(seenUser: user) {

    userSchema.parse(seenUser)

    await usableDb.insert(users).values(seenUser);
}

export async function getPostUser(postUserId: string) {
    const results = await usableDb.select()
        .from(users)
        .where(eq(users.id, postUserId))

    return results[0]
}

export async function updateUser(seenUser: updateUserType) {

    userSchema.omit({ id: true, email: true, createdAt: true, updatedAt: true, emailVerified: true }).parse(seenUser)

    const session = await getServerSession(authOptions)
    if (!session) throw new Error("No session")

    await usableDb.update(users)
        .set({
            name: seenUser.name,
            username: seenUser.username,
            image: seenUser.image,
            country: seenUser.country,
            educationLevel: seenUser.educationLevel,
            fieldOfStudy: seenUser.fieldOfStudy,
            interests: seenUser.interests,
            updatedAt: new Date
        })
        .where(eq(users.id, session.user.id));
}

export async function deleteUser(seenId: string) {

    userSchema.pick({ id: true }).parse(seenId)

    await usableDb.delete(users).where(eq(users.id, seenId));
}

export async function getUserCommunities(seenId: string) {

    userSchema.pick({ id: true }).parse(seenId)

    await usableDb.delete(users).where(eq(users.id, seenId));
}

export async function checUsernameIsAvailable(seenUserName: Pick<user, "username">) {

    userSchema.pick({ username: true }).parse(seenUserName)

    const result = await usableDb.query.users.findFirst({
        where: eq(users.username, seenUserName.username),
    });

    if (result !== undefined) return false

    return true
}