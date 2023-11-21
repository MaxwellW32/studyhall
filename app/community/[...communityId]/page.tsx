import Community from '@/components/community/Community'
import { getSpecificCommunity } from '@/utility/serverFunctions/handleCommunities'
import React from 'react'

export default async function CommunityPageLoader({ params }: { params: { communityId: string[] } }) {

    const seenCommunityId = params.communityId[0]

    const foundCommunity = await getSpecificCommunity(seenCommunityId)
    if (!foundCommunity) return <p>Community Not Found</p>

    return (
        <Community seenCommunity={foundCommunity} />
    )
}
