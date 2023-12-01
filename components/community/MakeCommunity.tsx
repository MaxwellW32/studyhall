"use client"
import React from 'react'
import { commentsSchema, community, newComment, newCommunity } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect, useRef, useMemo } from "react"
import { addCommunity, updateCommunity } from "@/utility/serverFunctions/handleCommunities";
import { ZodError } from "zod-validation-error";
import useSeenErrors from "@/utility/useful/useSeenErrors";
import styles from "./style.module.css"
import { useRouter } from 'next/navigation';
import getNiceUrl from '@/utility/useful/getNiceUrl';

const initialCommunityObj: newCommunity = {
    name: "",
    description: "",
}

export default function MakeCommunity({ oldCommunity }: { oldCommunity?: community }) {
    const router = useRouter()
    const [seenErrInput, seenErrInputSet] = useState<Error | ZodError | undefined>()
    const seenErrors = useSeenErrors(seenErrInput)

    const [communityObj, communityObjSet] = useState<newCommunity>(oldCommunity ? { ...oldCommunity } : { ...initialCommunityObj })

    const queryClient = useQueryClient()

    const { mutate: addCommunityMutation } = useMutation({
        mutationFn: addCommunity,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["seenCommunities"] })
            router.push("/")
        },
        onError: (err: Error | ZodError) => {
            seenErrInputSet(err)
        }
    })

    const { mutate: updateCommunityMutation } = useMutation({
        mutationFn: updateCommunity,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["seenCommunities"] })
            router.push(getNiceUrl("community", oldCommunity!.id, communityObj!.name))
        },
        onError: (err: Error | ZodError) => {
            seenErrInputSet(err)
        }
    })



    const handleSubmit = () => {
        if (oldCommunity) {
            //update
            updateCommunityMutation({ ...communityObj, id: oldCommunity.id })
        } else {
            //new
            addCommunityMutation(communityObj)
        }

        //reset
        communityObjSet({ ...initialCommunityObj })
    }

    return (
        <div className={styles.makeCommunityMainDiv}>
            {seenErrors}

            <h1 style={{ margin: "1rem" }}>Let&apos;s Add Something To The World!</h1>

            <label>Community Name</label>
            <input type='text' value={communityObj.name} onChange={(e) => {
                communityObjSet(prevObj => {
                    const newObj = { ...prevObj }
                    newObj.name = e.target.value
                    return newObj
                })
            }} placeholder='Please enter a name' />

            <label>Description</label>
            <input type='text' value={communityObj.description} onChange={(e) => {
                communityObjSet(prevObj => {
                    const newObj = { ...prevObj }
                    newObj.description = e.target.value
                    return newObj
                })
            }} placeholder='Please enter a desctiprion' />

            <button onClick={handleSubmit}>{oldCommunity ? "Update Community" : "Add Community"}</button>
        </div>
    )
}
