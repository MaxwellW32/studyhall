import { studySession } from "@/types";
import { getSpecificStudySession } from "@/utility/serverFunctions/handlestudySessions";
import MakeStudySession from "@/components/studySession/MakeStudySession";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { redirect } from "next/navigation";




export default async function Page({ params }: { params: { oldStudySessionId: string[] } }) {
    const seenStudySessionId = params.oldStudySessionId[0]

    const foundStudySessionId: (studySession | undefined) = await getSpecificStudySession(seenStudySessionId)

    if (!foundStudySessionId) return <p>Study Session Not Found To Update</p>

    const session = await getServerSession(authOptions)
    if (!session) redirect(`/api/auth/signin`)

    //validate correct user
    if (foundStudySessionId.userId !== session.user.id) return <p>Not allowed to edit this page</p>

    return <MakeStudySession oldStudySession={foundStudySessionId} />
}
