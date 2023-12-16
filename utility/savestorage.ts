"use client"

import { useSession } from "next-auth/react";
import { joinCommunity } from "./serverFunctions/handleCommunities";
import { revalidatePath } from "next/cache";

export function saveToLocalStorage(keyName: any, item: any) {
    localStorage.setItem(keyName, JSON.stringify(item));
}

export function retreiveFromLocalStorage(keyName: string): any {
    const initialkeyItem = localStorage.getItem(keyName);

    if (initialkeyItem !== null) return JSON.parse(initialkeyItem);

    return null
}




type userCommunitiesJoined = {
    [key: string]: string[]
}

export async function saveCommunitiesJoined(communityId: string, userId: string) {
    //client function to save on databse usage
    //backed up to both databse and client storage, but only read from client storage - and restored if deleted

    joinCommunity(communityId)

    //read first
    const seenUserCommunitiesJoined: userCommunitiesJoined = retreiveFromLocalStorage("userCommunitiesJoined") ?? {}

    seenUserCommunitiesJoined[userId] = seenUserCommunitiesJoined[userId] ? [...seenUserCommunitiesJoined[userId].filter(eachCommId => eachCommId !== communityId), communityId] : [communityId]

    saveToLocalStorage("userCommunitiesJoined", seenUserCommunitiesJoined)
}
