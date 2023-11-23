import EditUser from '@/components/user/EditUser'
import { authOptions } from '@/lib/auth/auth-options'
import { user } from '@/types'
import { getSpecificUser } from '@/utility/serverFunctions/handleUsers'
import { getServerSession } from 'next-auth'
import { signIn } from 'next-auth/react'

export default async function CommunityPageLoader({ params }: { params: { userId: string[] } }) {

    const seenUserId = params.userId[0]

    const foundUser: (user | undefined) = await getSpecificUser(seenUserId, "id")
    if (!foundUser) return <p>user Not Found</p>

    const session = await getServerSession(authOptions)
    if (foundUser.id !== session?.user.id) {
        return <p>Cannot view this page</p>
    }

    return (
        <EditUser seenUser={foundUser} />
    )
}
