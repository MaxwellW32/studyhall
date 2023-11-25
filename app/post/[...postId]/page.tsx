import { post } from '@/types'
import { getSpecificPost } from '@/utility/serverFunctions/handlePosts'
import Post from "@/components/post/Post"

export default async function CommunityPageLoader({ params }: { params: { postId: string[] } }) {

    const seenPostId = params.postId[0]

    const foundPost: (post | undefined) = await getSpecificPost(seenPostId)

    if (!foundPost) return <p>Post Not Found</p>

    console.log(`$called here`);
    return (
        <Post seenPost={foundPost} />
    )
}
