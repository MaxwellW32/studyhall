"use client"
import { newReply, reply } from '@/types'
import React, { useRef, useState } from 'react'
import { v4 as uuidv4 } from "uuid"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ZodError } from 'zod-validation-error'
import useSeenErrors from '@/utility/useful/useSeenErrors'
import { addReply } from '@/utility/serverFunctions/handleReplies'


export default function MakeReply({ seenCommentId, replyingToUserId, fromReply }: { seenCommentId: string, replyingToUserId: string, fromReply?: boolean }) {
    const queryClient = useQueryClient()

    const [seenErrInput, seenErrInputSet] = useState<Error | ZodError | undefined>()
    const seenErrors = useSeenErrors(seenErrInput)

    const { mutate: addReplyMutation } = useMutation({
        mutationFn: addReply,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["replies", seenCommentId] })
        },
        onError: (err: Error | ZodError) => {
            seenErrInputSet(err)
        }
    })

    const replyInitialValues: newReply = {
        commentId: seenCommentId,
        replyingToUserId: replyingToUserId,
        message: "",
    }


    const [replyObj, replyObjSet] = useState({ ...replyInitialValues })
    const [readyToReply, readyToReplySet] = useState(false)

    const handleSubmit = () => {
        const localReplyObj = { ...replyObj }
        addReplyMutation(localReplyObj)

        //reset
        replyObjSet({ ...replyInitialValues })
        readyToReplySet(false)
    }

    return (
        <>
            {readyToReply ?
                <div>
                    {seenErrors}

                    <input id='replyMessage' type='text' value={replyObj.message} onChange={(e) => replyObjSet(prevObj => {
                        const newObj = { ...prevObj }
                        newObj.message = e.target.value
                        return newObj
                    })} placeholder={fromReply ? "Reply to user" : "Reply to comment"} />

                    <button onClick={handleSubmit}>reply</button>
                </div>
                :
                <div style={{ display: "flex", gap: ".3rem", cursor: "pointer", margin: '.5rem' }} onClick={(e) => { e.stopPropagation(); readyToReplySet(true) }}>
                    <svg className='replySvg' xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M512 240c0 114.9-114.6 208-256 208c-37.1 0-72.3-6.4-104.1-17.9c-11.9 8.7-31.3 20.6-54.3 30.6C73.6 471.1 44.7 480 16 480c-6.5 0-12.3-3.9-14.8-9.9c-2.5-6-1.1-12.8 3.4-17.4l0 0 0 0 0 0 0 0 .3-.3c.3-.3 .7-.7 1.3-1.4c1.1-1.2 2.8-3.1 4.9-5.7c4.1-5 9.6-12.4 15.2-21.6c10-16.6 19.5-38.4 21.4-62.9C17.7 326.8 0 285.1 0 240C0 125.1 114.6 32 256 32s256 93.1 256 208z" /></svg>
                    <p>{fromReply ? "Reply to user" : "Reply to comment"}</p>
                </div>
            }
        </>
    )
}
