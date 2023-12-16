import { studySession } from "@/types";
import { getSpecificStudySession, joinStudySession } from "@/utility/serverFunctions/handlestudySessions";
import StudySession from "@/components/studySession/StudySession";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { redirect } from "next/navigation";


export default async function Page({ params }: { params: { studySessionId: string[] } }) {
    const seenStudySessionId = params.studySessionId[0]

    const foundStudySession: (studySession | undefined) = await getSpecificStudySession(seenStudySessionId)

    if (!foundStudySession) return <p>Study Session Not Found</p>

    //check if on list
    const session = await getServerSession(authOptions)

    //on list or not
    if (!foundStudySession.allowAll) {
        if (!session) redirect(`/api/auth/signin`)

        const memberList = foundStudySession.authorizedMemberList ? JSON.parse(foundStudySession.authorizedMemberList) : {}

        if (session.user.id in memberList) {
            //allowed
        } else {
            //not allowed
            //check if they created the thing - always allowed
            if (foundStudySession.userId !== session.user.id) {
                return <p>Not allowed to join this study session</p>
            }
        }
    }

    //user id - peer id
    if (session) {
        //join study session
        joinStudySession(foundStudySession.id)
    }

    return <StudySession seenStudySession={foundStudySession} signedInUserId={session ? session.user.id : undefined} />
}
