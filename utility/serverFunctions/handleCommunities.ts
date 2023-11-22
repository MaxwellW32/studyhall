"use server"

import { community, communitySchema } from "@/types";
import { communities, posts, comments, replies } from "@/db/schema"
import { eq, desc, asc } from "drizzle-orm";
import { usableDb } from "@/db";


export async function getAllCommunities(seenLimit: number, seenOffset: number) {
    const results = await usableDb.query.communities.findMany({
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

    const result = await usableDb.query.communities.findFirst({
        where: eq(communities.id, seenCommunityID),
        with: {
            posts: {
                orderBy: [desc(posts.datePosted)],
                limit: 50,
                with: {
                    author: true
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

    await usableDb.insert(communities).values(seenCommunity);
}

export async function updateCommunity(seenCommunity: community) {

    communitySchema.parse(seenCommunity)

    await usableDb.update(communities)
        .set(seenCommunity)
        .where(eq(communities.id, seenCommunity.id));
}

export async function deleteCommunity(seenId: string) {

    communitySchema.pick({ id: true }).parse(seenId)

    await usableDb.delete(communities).where(eq(communities.id, seenId));
}