"use client"
import type { updateUserType, user } from "@/types";
import { checUsernameIsAvailable, updateUser } from "@/utility/serverFunctions/handleUsers";
import { useRef, useState } from "react";
import { toast } from "react-hot-toast";

//show user is a page
export default function EditUser({ seenUser }: { seenUser: user }) {

    const initialUserObj: updateUserType = {
        image: seenUser.image,
        name: seenUser.name,
        username: seenUser.username,
        country: seenUser.country,
        educationLevel: seenUser.educationLevel,
        fieldOfStudy: seenUser.fieldOfStudy,
        interests: seenUser.interests
    }

    const [userObj, userObjSet] = useState({ ...initialUserObj })

    const [usableInterests, usableInterestsSet] = useState<string[] | null>(initialUserObj.interests ? JSON.parse(initialUserObj.interests) : null)

    const submit = async () => {
        try {
            await updateUser(userObj)
        } catch (error) {
            toast.error("had trouble updating")
        }
    }

    const [userNameErr, userNameErrset] = useState(false)
    const userNameInputTimeout = useRef<NodeJS.Timeout | undefined>()

    return (
        <div>
            <h3 style={{ margin: "1rem" }}>Edit User Info {seenUser.name}</h3>

            <div style={{ display: "grid" }}>
                <label>Name</label>
                <input type="text" value={userObj.name ?? ""} onChange={(e) => {
                    userObjSet(prevUserObj => {
                        prevUserObj.name = e.target.value
                        return { ...prevUserObj }
                    })
                }} />

                <label>User Name</label>
                <input type="text" value={userObj.username} onChange={(e) => {
                    if (userNameInputTimeout.current) clearTimeout(userNameInputTimeout.current)


                    userNameInputTimeout.current = setTimeout(async () => {

                        if (userObj.username !== initialUserObj.username) {
                            const usernameAvailable = await checUsernameIsAvailable({ username: userObj.username })

                            if (usernameAvailable) {
                                toast.success(`Username ${userObj.username} Available`)
                                userNameErrset(false)
                            } else {
                                toast.error("Username Not Available")
                                userNameErrset(true)
                            }
                        } else {
                            userNameErrset(false)
                        }
                    }, 1500)

                    userObjSet(prevUserObj => {
                        prevUserObj.username = e.target.value
                        return { ...prevUserObj }
                    })
                }} placeholder="Enter a username" />

                <label>Image</label>
                <div style={{ display: "grid", gridTemplateColumns: "20fr 1fr", alignItems: "center", gap: "1rem" }}>
                    <input type="text" value={userObj.image ?? ""} onChange={(e) => {
                        userObjSet(prevUserObj => {
                            prevUserObj.image = e.target.value
                            return { ...prevUserObj }
                        })
                    }} placeholder="Please enter an image link" />

                    {userObj.image && <img src={userObj.image} alt="ShowImageExample" />}
                </div>

                <label>Country</label>
                <input type="text" value={userObj.country ?? ""} onChange={(e) => {
                    userObjSet(prevUserObj => {
                        prevUserObj.country = e.target.value
                        return { ...prevUserObj }
                    })
                }} placeholder="where are your representing?" />

                <label>Education Level</label>
                <input type="text" value={userObj.educationLevel ?? ""} onChange={(e) => {
                    userObjSet(prevUserObj => {
                        prevUserObj.educationLevel = e.target.value
                        return { ...prevUserObj }
                    })
                }} placeholder="what is your education level?" />

                <label>Field Of Study</label>
                <input type="text" value={userObj.fieldOfStudy ?? ""} onChange={(e) => {
                    userObjSet(prevUserObj => {
                        prevUserObj.fieldOfStudy = e.target.value
                        return { ...prevUserObj }
                    })
                }} placeholder="what is your field of study/major?" />

                <label>Interests</label>
                <input type="text" value={userObj.interests ?? ""} onChange={(e) => {
                    userObjSet(prevUserObj => {
                        prevUserObj.interests = e.target.value
                        return { ...prevUserObj }
                    })
                }} placeholder="what are your interests?" />
            </div>

            <button disabled={userNameErr} style={{ backgroundColor: userNameErr ? "red" : "", margin: "1rem" }} onClick={submit}>Submit</button>
        </div>
    )
}
