"use client"
import { newReply, reply } from '@/types'
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

    const replyInitialValues: newReply = {
        commentId: seenCommentId,
        replyingToUserId: replyingToUserId,
        message: "",
    }


    const [replyObj, replyObjSet] = useState({ ...replyInitialValues })

    const handleSubmit = () => {
        const localReplyObj = { ...replyObj }
        addReplyMutation(localReplyObj)

        //reset
        replyObjSet({ ...replyInitialValues })
    }

    return (
        <div>
            {seenErrors}

            <input id='replyMessage' type='text' value={replyObj.message} onChange={(e) => replyObjSet(prevObj => {
                const newObj = { ...prevObj }
                newObj.message = e.target.value
                return newObj
            })} placeholder='Enter a reply' />

            <button onClick={handleSubmit}>send reply</button>
        </div>
    )
}
