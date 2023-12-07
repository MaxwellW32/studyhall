import { authOptions } from '@/lib/auth/auth-options'
import { studySession } from '@/types'
import { getPublicStudySessions, getUserStudySessionsJoined, getUserStudySessionsMade } from '@/utility/serverFunctions/handlestudySessions'
import HandleSearch from '@/utility/useful/HandleSearch'
import NiceStudySessionDisplay from '@/utility/useful/NiceStudySessionDisplay'
import ShowMore from '@/utility/useful/ShowMore'
import { getServerSession } from 'next-auth'
import Link from 'next/link'


export default async function page() {
    const session = await getServerSession(authOptions)

    let userStudySessionsMade: studySession[] | undefined = undefined
    let userStudySessionsJoined: studySession[] = []
    let publicStudySessions: studySession[] = await getPublicStudySessions()

    if (session && session.user) {
        userStudySessionsMade = await getUserStudySessionsMade(session.user.id)
        userStudySessionsJoined = await getUserStudySessionsJoined(session.user.id)
    }

    return (
        <div style={{ backgroundColor: "#333", display: "flex", gap: "1rem", flexDirection: "column" }}>
            <Link href={`/newStudySession`} style={{ margin: "1rem 1rem 0rem auto" }}>
                <button>New Study Session</button>
            </Link>

            {userStudySessionsMade !== undefined && (
                <ShowMore title='Study Sessions Created By You' titleStyles={{ fontSize: "1.3rem", fontWeight: "bold" }} startOpened={true}>

                    {userStudySessionsMade.map(eachSession => {
                        return (
                            <NiceStudySessionDisplay key={eachSession.id} seenStudySession={eachSession} />
                        )
                    })}
                </ShowMore>
            )}

            {userStudySessionsJoined.length > 0 && (
                <ShowMore title='Study Sessions Joined' titleStyles={{ fontSize: "1.3rem", fontWeight: "bold" }} startOpened={true}>
                    {userStudySessionsJoined.map(eachSession => {
                        return (
                            <NiceStudySessionDisplay key={eachSession.id} seenStudySession={eachSession} />
                        )
                    })}
                </ShowMore>
            )}

            <ShowMore title='Search Sessions' titleStyles={{ fontSize: "1.3rem", fontWeight: "bold" }}>
                <HandleSearch />
            </ShowMore>

            {publicStudySessions.length > 0 && (
                <div style={{ backgroundColor: "#444", padding: "1rem" }}>
                    <h3>Public Study Sessions</h3>

                    <div style={{ display: "grid", gap: "1rem", padding: "1rem" }}>
                        {publicStudySessions.map(eachSession => {
                            return (
                                <NiceStudySessionDisplay key={eachSession.id} seenStudySession={eachSession} />
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
