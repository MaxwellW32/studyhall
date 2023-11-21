"use server"

import { community, communitySchema } from "@/types";
import { v4 as uuidv4 } from "uuid"
import { connect } from "@planetscale/database"
import { config } from "@/db/config"
import { communities } from "@/db/schema"
import { drizzle } from "drizzle-orm/planetscale-serverless"
import { eq } from "drizzle-orm";
import { ZodError } from "zod";


export async function getAllCommunities() {
    console.log(`$ran get all communities`);

    const conn = connect(config)
    const db = drizzle(conn)

    const results = await db.select()
        .from(communities)

    // .leftJoin(reminders, eq(reminders.todoid, todos.id)) //keep for now as reminder

    return results
}



export async function getSpecificCommunity(seenCommunityID: string) {
    const conn = connect(config)
    const db = drizzle(conn)

    const result = await db.select()
        .from(communities)
        .where(eq(communities.id, seenCommunityID))

    return result[0]
}

export async function addCommunity(seenCommunity: community) {
    communitySchema.parse(seenCommunity)

    const conn = connect(config)
    const db = drizzle(conn)

    await db.insert(communities).values(seenCommunity);
}


export async function updateCommunity(seenCommunity: community) {

    communitySchema.parse(seenCommunity)

    const conn = connect(config)
    const db = drizzle(conn)

    await db.update(communities)
        .set(seenCommunity)
        .where(eq(communities.id, seenCommunity.id));
}



export async function deleteCommunity(seenId: string) {

    communitySchema.pick({ id: true }).parse(seenId)

    const conn = connect(config)
    const db = drizzle(conn)

    await db.delete(communities).where(eq(communities.id, seenId));
}