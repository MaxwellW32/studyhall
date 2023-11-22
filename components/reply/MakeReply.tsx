"use client"
import { reply } from '@/types'
import React, { useRef, useState } from 'react'
import { v4 as uuidv4 } from "uuid"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ZodError } from 'zod-validation-error'
import useSeenErrors from '@/utility/useful/useSeenErrors'
import { addReply } from '@/utility/serverFunctions/handleReplies'


export default function MakeReply({ seenCommentId, replyingToUserId }: { seenCommentId: string, replyingToUserId: string }) {
    const queryClient = useQueryClient()

    const [seenErrInput, seenErrInputSet] = useState<Error | ZodError | undefined>()
    const seenErrors = useSeenErrors(seenErrInput)

    const { mutate: addReplyMutation } = useMutation({
        mutationFn: addReply,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["seenReplies"] })
        },
        onError: (err: Error | ZodError) => {
            seenErrInputSet(err)
        }
    })

    const replyInitialValues: reply = {
        id: uuidv4(),
        userId: "b4aa351c-3f84-4b73-b581-ef5836fdf500",
        commentId: seenCommentId,
        replyingToUserId: replyingToUserId,
        datePosted: new Date(),
        message: "",
        likes: null
    }


    const [replyObj, replyObjSet] = useState<reply>({ ...replyInitialValues })

    const handleSubmit = () => {
        const localReplyObj = { ...replyObj }
        addReplyMutation(localReplyObj)

        //reset
        replyObjSet({ ...replyInitialValues })
    }

    return (
        <div>
            {seenErrors}

            <label htmlFor='replyMessage'>Add Reply</label>
            <input id='replyMessage' type='text' value={replyObj.message} onChange={(e) => replyObjSet(prevObj => {
                const newObj = { ...prevObj }
                newObj.message = e.target.value
                return newObj
            })} placeholder='Enter a reply' />

            <button onClick={handleSubmit}>send reply</button>
        </div>
    )
}
