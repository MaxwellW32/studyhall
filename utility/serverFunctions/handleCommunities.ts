"use server"

import { community, communitySchema, newCommunity } from "@/types";
import { communities, posts, comments, replies, usersToCommunities } from "@/db/schema"
import { eq, desc, asc, sql } from "drizzle-orm";
import { usableDb } from "@/db";
import { authOptions } from '@/lib/auth/auth-options'
import { getServerSession } from "next-auth";
import { v4 as uuidv4 } from "uuid"
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";


export async function getAllCommunities(seenLimit: number, seenOffset: number) {

    const results = await usableDb.query.communities.findMany({
        orderBy: [desc(communities.memberCount)],
        limit: seenLimit,
        offset: seenOffset,
        with: {
            posts: {
                orderBy: [desc(posts.likes)],
                limit: 3,
                with: {
                    author: true,
                    // comments: {
                    //     orderBy: [desc(comments.likes)],
                    //     limit: 1,
                    //     with: {
                    //         fromUser: true,
                    //         replies: {
                    //             orderBy: [desc(replies.likes)],
                    //             limit: 1,
                    //         }
                    //     }
                    // }
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
                orderBy: [desc(posts.likes)],
                limit: 50,
                with: {
                    author: true,
                    // comments: {
                    //     orderBy: [desc(comments.likes)],
                    //     limit: 1,
                    //     with: {
                    //         fromUser: true,
                    //         replies: {
                    //             orderBy: [desc(replies.likes)],
                    //             limit: 1,
                    //         }
                    //     }
                    // }
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

export async function updateCommunity(seenCommunity: Omit<community, "memberCount" | "userId">) {

    communitySchema.omit({ memberCount: true, userId: true }).parse(seenCommunity)

    await usableDb.update(communities)
        .set({
            name: seenCommunity.name,
            description: seenCommunity.description,
        })
        .where(eq(communities.id, seenCommunity.id));
}

export async function deleteCommunity(seenCommunity: Pick<community, "id">) {
    const session = await getServerSession(authOptions)

    communitySchema.pick({ id: true }).parse(seenCommunity)

    await usableDb.delete(communities).where(eq(communities.id, seenCommunity.id));

    redirect("/")
}

export async function joinCommunity(communityId: string) {

    const session = await getServerSession(authOptions)
    if (!session) redirect(`/api/auth/signIn`)

    await usableDb.insert(usersToCommunities).values({
        userId: session.user.id,
        communityId: communityId,
    });

    await usableDb.update(communities)
        .set({
            memberCount: sql`${communities.memberCount} + 1`,
        })
        .where(eq(communities.id, communityId));


    revalidatePath(`/community/${communityId}`)
}


export async function getCommunityMembers(communityId: string, seenLimit: number, seenOffset: number) {


    const results = await usableDb.query.usersToCommunities.findMany({
        limit: seenLimit,
        offset: seenOffset,
        where: eq(usersToCommunities.communityId, communityId),
        with: {
            user: {
                columns: {
                    id: true,
                    username: true,
                    image: true
                }
            }
        }
    });

    return results
}

export async function getMemberCommunitiesForStorageObj(userId: string) {
    //local storage function only to replenish client side comm array - rarely ran
    console.log(`$called third`);
    const results = await usableDb.query.usersToCommunities.findMany({
        where: eq(usersToCommunities.userId, userId)
    });

    return results.map(eachResult => {
        console.log(`$called in loop `, eachResult.communityId);
        return eachResult.communityId
    })
}



//good plan but doesnt work at scale
// export async function isSubscribedToCommunity(communityId: string) {

//     if (!session) return false

//     const results = await usableDb.query.usersToCommunities.findMany({
//         where: eq(usersToCommunities.communityId, communityId),
//     });

//     if (!results) return false

//     results.forEach(eachUsersToCommunitiesObj => {
//         if (eachUsersToCommunitiesObj.userId === session.user.id) return true
//     });

//     return false
// }
