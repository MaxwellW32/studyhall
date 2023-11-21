"use server"

import { community, communitySchema } from "@/types";
import { v4 as uuidv4 } from "uuid"
import { connect } from "@planetscale/database"
import { config } from "@/db/config"

import * as schema from "@/db/schema"
import { communities, posts } from "@/db/schema"

import { drizzle } from "drizzle-orm/planetscale-serverless"
import { eq, desc, asc } from "drizzle-orm";
import { ZodError } from "zod";


export async function getAllCommunities(seenLimit: number, seenOffset: number) {
    const conn = connect(config)
    const db = drizzle(conn, { schema });

    const results = await db.query.communities.findMany({
        orderBy: [desc(communities.memberCount)],
        limit: seenLimit,
        offset: seenOffset,
        with: {
            posts: {
                limit: 3,
                orderBy: [desc(posts.likes)],
                with: {
                    author: true
                }
            },
        }
    });

    return results
}

export async function getSpecificCommunity(seenCommunityID: string) {
    const conn = connect(config)

    const db = drizzle(conn, { schema });

    const result = await db.query.communities.findFirst({
        where: eq(communities.id, seenCommunityID),
        with: {
            posts: {
                orderBy: [desc(posts.datePosted)],
                limit: 50,
                with: {
                    author: true,
                    comments: {
                        with: {
                            fromUser: true,
                        }
                    }
                }
            }
        }
    });

    // const results = await db.select()
    //     .from(communities)
    //     .where(eq(communities.id, seenCommunityID))
    return result
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