"use server"

import { community, communitySchema } from "@/types";
import { communities, posts, comments, replies } from "@/db/schema"
import { eq, desc, asc } from "drizzle-orm";
import { db } from "@/db";


export async function getAllCommunities(seenLimit: number, seenOffset: number) {
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

    const result = await db.query.communities.findFirst({
        where: eq(communities.id, seenCommunityID),
        with: {
            posts: {
                orderBy: [desc(posts.datePosted)],
                limit: 50,
                with: {
                    author: true,
                    comments: {
                        orderBy: [desc(comments.likes)],
                        limit: 1,
                        with: {
                            fromUser: true,
                            replies: {
                                orderBy: [desc(replies.likes)],
                                limit: 1
                            },
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

    await db.insert(communities).values(seenCommunity);
}

export async function updateCommunity(seenCommunity: community) {

    communitySchema.parse(seenCommunity)

    await db.update(communities)
        .set(seenCommunity)
        .where(eq(communities.id, seenCommunity.id));
}

export async function deleteCommunity(seenId: string) {

    communitySchema.pick({ id: true }).parse(seenId)

    await db.delete(communities).where(eq(communities.id, seenId));
}