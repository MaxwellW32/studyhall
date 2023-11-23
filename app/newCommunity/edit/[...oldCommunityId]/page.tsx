import MakeCommunity from "@/components/community/MakeCommunity";
import { community } from "@/types";
import { getSpecificCommunity } from "@/utility/serverFunctions/handleCommunities";
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth/auth-options'


export default async function EditCommunity({ params }: { params: { oldCommunityId: string[] } }) {
    const seenCommunityId = params.oldCommunityId[0]

    const foundCommunity: (community | undefined) = await getSpecificCommunity(seenCommunityId)

    if (!foundCommunity) return <p>Community Not Found</p>

    return <MakeCommunity oldCommunity={foundCommunity} />
}
