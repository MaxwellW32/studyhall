import EditUser from '@/components/user/EditUser'
import { user } from '@/types'
import { getSpecificUser } from '@/utility/serverFunctions/handleUsers'
import { getServerSession } from 'next-auth'

export default async function CommunityPageLoader({ params }: { params: { userId: string[] } }) {

    const seenUserId = params.userId[0]

    const foundUser: (user | undefined) = await getSpecificUser(seenUserId, "id")

    if (!foundUser) return <p>user Not Found</p>

    const session = await getServerSession()
    // if (!session) return <p>No session</p>

    if (foundUser.id !== session?.user.id) {
        setTimeout(() => {
        }, 4000);
        return <p>Cannot view this page</p>
    }


    return (
        <EditUser seenUser={foundUser} />
    )
}
