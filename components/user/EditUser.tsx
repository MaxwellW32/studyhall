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
        username: seenUser.username
    }

    const [userObj, userObjSet] = useState({ ...initialUserObj })


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
            <h3>Edit User Info {seenUser.name}</h3>

            <div style={{ display: "grid" }}>
                <label>Name</label>
                <input type="text" value={userObj.name ?? ""} onChange={(e) => {
                    userObjSet(prevUSerObj => {
                        prevUSerObj.name = e.target.value
                        return { ...prevUSerObj }
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

                    userObjSet(prevUSerObj => {
                        prevUSerObj.username = e.target.value
                        return { ...prevUSerObj }
                    })
                }} />

                <label>Image</label>
                <div style={{ display: "grid", gridTemplateColumns: "20fr 1fr", alignItems: "center", gap: "1rem" }}>
                    <input type="text" value={userObj.image ?? ""} onChange={(e) => {
                        userObjSet(prevUSerObj => {
                            prevUSerObj.image = e.target.value
                            return { ...prevUSerObj }
                        })
                    }} placeholder="Please enter an image link" />

                    {userObj.image && <img src={userObj.image} alt="ShowImageExample" />}
                </div>

            </div>

            <button disabled={userNameErr} style={{ backgroundColor: userNameErr ? "red" : "", margin: "1rem" }} onClick={submit}>Submit</button>
        </div>
    )
}
