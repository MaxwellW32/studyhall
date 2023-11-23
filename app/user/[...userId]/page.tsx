import ShowUser from '@/components/user/ShowUser'
import { user } from '@/types'
import { getSpecificUser } from '@/utility/serverFunctions/handleUsers'

export default async function CommunityPageLoader({ params }: { params: { userId: string[] } }) {

    const seenUserId = params.userId[0]

    const foundUser: (user | undefined) = await getSpecificUser(seenUserId, "id")

    if (!foundUser) return <p>user Not Found</p>


    return (
        <ShowUser seenUser={foundUser} />
    )
}
