"use server"

import { newStudySession, studySession, studySessionSchema } from "@/types";
import { studySessions, usersToStudySessions } from "@/db/schema"
import { eq, desc, asc, sql } from "drizzle-orm";
import { usableDb } from "@/db";
import { authOptions } from '@/lib/auth/auth-options'
import { getServerSession } from "next-auth";
import { v4 as uuidv4 } from "uuid"
import { redirect } from "next/navigation";


export async function getAllStudySessions(seenLimit: number, seenOffset: number) {

    const results = await usableDb.query.studySessions.findMany({
        limit: seenLimit,
        offset: seenOffset,
    });

    return results
}

export async function getSpecificStudySession(seenStudySessionId: string): Promise<studySession | undefined> {

    const result = await usableDb.query.studySessions.findFirst({
        where: eq(studySessions.id, seenStudySessionId)
    });

    return result
}

export async function addStudySession(seenStudySession: newStudySession) {
    const session = await getServerSession(authOptions)
    if (!session) throw new Error("No session")

    const newId = uuidv4()
    const finalStudySession: studySession = {
        ...seenStudySession,
        id: newId,
        userId: session.user.id
    }

    studySessionSchema.parse(finalStudySession)

    await usableDb.insert(studySessions).values(finalStudySession);

    redirect(`/studySession/${newId}`)
}

export async function updateStudySession(seenStudySession: Omit<studySession, "userId">) {

    studySessionSchema.omit({ userId: true }).parse(seenStudySession)

    const validateSeenSession = await getSpecificStudySession(seenStudySession.id)
    if (!validateSeenSession) throw new Error("Couldn't validate")

    const session = await getServerSession(authOptions)
    if (!session) throw new Error("No session")

    if (validateSeenSession.userId !== session.user.id) throw new Error("Not correct user to update this session")

    await usableDb.update(studySessions)
        .set({
            name: seenStudySession.name,
            allowAll: seenStudySession.allowAll,
            authorizedMemberList: seenStudySession.authorizedMemberList
        })
        .where(eq(studySessions.id, seenStudySession.id));

    redirect(`/studySession/${seenStudySession.id}`)

}

export async function deleteStudySession(seenStudySession: Pick<studySession, "id">) {
    const session = await getServerSession(authOptions)

    studySessionSchema.pick({ id: true }).parse(seenStudySession)

    await usableDb.delete(studySessions).where(eq(studySessions.id, seenStudySession.id));
}

const studySessionsServObj: {
    //each key is a study session
    [key: string]: {
        members: {
            //each key is a user id either local or official
            [key: string]: {
                peerId: string | undefined
            }
        },
        version: string
    }
} = {}

export async function changeStudySessionsServObj(studySessionId: string, userId: string, peerId: string, versionStr: string) {

    if (!studySessionsServObj[studySessionId]) {
        studySessionsServObj[studySessionId] = {
            members: {},
            version: uuidv4(),
        };
    }

    // Check if the member exists, if not, initialize it
    if (!studySessionsServObj[studySessionId].members[userId]) {
        studySessionsServObj[studySessionId].members[userId] = {
            peerId: undefined,
        };
    }

    // Update the peerId and version
    studySessionsServObj[studySessionId].members[userId].peerId = peerId;
    studySessionsServObj[studySessionId].version = versionStr;
}

export async function readStudySessionsServObj(studySessionId: string) {
    return { studySessionInfo: studySessionsServObj[studySessionId] }
}

export async function getStudySessionMembers(studySessionId: string, seenLimit: number, seenOffset: number) {


    const results = await usableDb.query.usersToStudySessions.findMany({
        limit: seenLimit,
        offset: seenOffset,
        where: eq(usersToStudySessions.studySessionId, studySessionId),
        with: {
            user: {
                columns: {
                    id: true,
                    username: true,
                    image: true
                }
            }
        }
    });

    return results
}



