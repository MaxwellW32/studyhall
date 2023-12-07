"use client"
import { authorizedMemberList, authorizedMemberListRoles, newStudySession, studySession, user } from '@/types'
import { getSpecificUser } from '@/utility/serverFunctions/handleUsers'
import { addStudySession, updateStudySession } from '@/utility/serverFunctions/handlestudySessions'
import getNiceDisplayUser from '@/utility/useful/getNiceDisplayUser'
import React, { useEffect, useState } from 'react'

export default function MakeStudySession({ oldStudySession }: { oldStudySession?: studySession }) {

    const initialStudySessionObj: newStudySession = {
        name: "",
        authorizedMemberList: null,
        allowAll: false,
        isPublic: false
    }

    const [studySessionObj, studySessionObjSet] = useState(oldStudySession ? { ...oldStudySession } : { ...initialStudySessionObj })

    const [authorizedMemberList, authorizedMemberListSet] = useState<authorizedMemberList | null>(oldStudySession ?
        oldStudySession.authorizedMemberList !== null ? JSON.parse(oldStudySession.authorizedMemberList) : null
        : null)

    const [currentUserSearch, currentUserSearchSet] = useState("") //handles input

    const [currentUser, currentUserSet] = useState<user>()
    const [userDisplayList, userDisplayListSet] = useState<{
        [key: string]: user
    }>()

    const handleRoleSwitch = (userId: string, option: authorizedMemberListRoles) => {

        authorizedMemberListSet(prevAuthMembers => {
            const newAuthMembers = prevAuthMembers ? { ...prevAuthMembers } : {}

            newAuthMembers[userId] = {
                role: option
            }

            return newAuthMembers
        })
    }

    const handleSubmit = async () => {
        const localStudySessionObj = studySessionObj

        //add current logged in user
        if (authorizedMemberList !== null) localStudySessionObj.authorizedMemberList = JSON.stringify(authorizedMemberList)

        if (oldStudySession) {
            //update
            updateStudySession({
                authorizedMemberList: localStudySessionObj.authorizedMemberList,
                allowAll: localStudySessionObj.allowAll,
                id: (localStudySessionObj as studySession).id,
                name: localStudySessionObj.name,
                isPublic: localStudySessionObj.isPublic
            })

        } else {
            //new
            addStudySession(localStudySessionObj)
        }
    }

    //load up display users on mount
    useEffect(() => {
        if (!oldStudySession || !authorizedMemberList) return

        const getDisplayUsers = async () => {
            const localUserDisplayList: {
                [key: string]: user
            } = {}

            for (const eachUserId of Object.keys(authorizedMemberList)) {
                const seenUser = await getSpecificUser(eachUserId, "id");

                if (seenUser) localUserDisplayList[eachUserId] = seenUser
            }

            userDisplayListSet(localUserDisplayList)
        }

        getDisplayUsers()
    }, [])



    return (
        <div style={{ display: "grid" }}>

            {oldStudySession ? <p>Update study session</p> : <p>create a new study session</p>}

            <label htmlFor='studySession'>StudySession Name</label>
            <input id='studySession' value={studySessionObj.name}
                onChange={(e) => {
                    studySessionObjSet((prevObj) => {
                        const newObj = { ...prevObj }
                        newObj.name = e.target.value
                        return newObj
                    })
                }}
                placeholder='Enter a name you like'
            />

            <label>Open Study Session To Everyone?</label>
            <button onClick={() => {
                studySessionObjSet((prevObj) => {
                    const newObj = { ...prevObj }
                    newObj.allowAll = !newObj.allowAll
                    return newObj
                })
            }}>{studySessionObj.allowAll.toString()}</button>

            <label>Is Study Session Public?</label>
            <button onClick={() => {
                studySessionObjSet((prevObj) => {
                    const newObj = { ...prevObj }
                    newObj.isPublic = !newObj.isPublic
                    return newObj
                })
            }}>{studySessionObj.isPublic.toString()}</button>




            <label htmlFor='studySessionAuthMembers'>Study Session Authorized Members</label>

            {currentUser && (
                <div>
                    {getNiceDisplayUser(currentUser)}

                    <button onClick={() => {
                        authorizedMemberListSet(prevAuthMembers => {
                            const newAuthMembers = prevAuthMembers ? { ...prevAuthMembers } : {}

                            newAuthMembers[currentUser.id] = {
                                role: "normal"
                            }

                            return newAuthMembers
                        })

                        userDisplayListSet(prevUsersColl => {
                            const newUsersColl = prevUsersColl ? { ...prevUsersColl } : {}

                            newUsersColl[currentUser.id] = currentUser

                            return newUsersColl
                        })
                    }}>Add</button>
                </div>
            )}

            <div>
                <input id='studySessionAuthMembers' value={currentUserSearch}
                    onChange={(e) => { currentUserSearchSet(e.target.value) }}
                    placeholder='Search for a username'
                />

                <button onClick={async () => {
                    if (!currentUserSearch) return
                    const seenUser = await getSpecificUser(currentUserSearch, "username")
                    currentUserSet(seenUser)
                }}>Search</button>
            </div>



            {authorizedMemberList && (
                <div style={{ display: "grid", gap: "1rem" }}>
                    {Object.entries(authorizedMemberList).map((eachAuthMemberEntry) => {
                        return (
                            <div key={eachAuthMemberEntry[0]}>
                                <p onClick={() => {
                                    //remove from authorized member list
                                    //remove from user display list

                                    authorizedMemberListSet(prevAuthMembers => {
                                        const newAuthMembers = prevAuthMembers ? { ...prevAuthMembers } : {}

                                        delete newAuthMembers[eachAuthMemberEntry[0]]

                                        return newAuthMembers
                                    })

                                    userDisplayListSet(prevUsersColl => {
                                        const newUsersColl = prevUsersColl ? { ...prevUsersColl } : {}

                                        delete newUsersColl[eachAuthMemberEntry[0]]

                                        return newUsersColl
                                    })

                                }}>x</p>

                                {userDisplayList && getNiceDisplayUser(userDisplayList[eachAuthMemberEntry[0]])}

                                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1rem" }}>
                                    <button onClick={() => { handleRoleSwitch(eachAuthMemberEntry[0], "host") }} style={{ backgroundColor: eachAuthMemberEntry[1].role === "host" ? "blue" : "" }}>Make Host</button>
                                    <button onClick={() => { handleRoleSwitch(eachAuthMemberEntry[0], "coHost") }} style={{ backgroundColor: eachAuthMemberEntry[1].role === "coHost" ? "blue" : "" }}>Make Co Host</button>
                                    <button onClick={() => { handleRoleSwitch(eachAuthMemberEntry[0], "normal") }} style={{ backgroundColor: eachAuthMemberEntry[1].role === "normal" ? "blue" : "" }}>Normal</button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}



            <button onClick={handleSubmit}>Submit</button>
        </div>
    )
}
