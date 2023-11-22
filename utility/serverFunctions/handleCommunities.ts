"use server"

import { community, communitySchema, newCommunity } from "@/types";
import { communities, posts, comments, replies } from "@/db/schema"
import { eq, desc, asc } from "drizzle-orm";
import { usableDb } from "@/db";
import { authOptions } from '@/lib/auth/auth-options'
import { getServerSession } from "next-auth";
import { v4 as uuidv4 } from "uuid"



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

    return result
}

export async function addCommunity(seenCommunity: newCommunity) {

    const session = await getServerSession(authOptions)
    if (!session) throw new Error("No session")

    const finalCommunity: community = {
        ...seenCommunity,
        id: uuidv4(),
        memberCount: 0,
        userId: session.user.id
    }

    communitySchema.parse(finalCommunity)

    await usableDb.insert(communities).values(finalCommunity);
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