"use client"
import { comment, newComment } from '@/types'
import React, { useRef, useState } from 'react'
import { v4 as uuidv4 } from "uuid"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ZodError } from 'zod-validation-error'
import useSeenErrors from '@/utility/useful/useSeenErrors'
import { addComment } from '@/utility/serverFunctions/handleComments'


export default function MakeComment({ seenPostId }: { seenPostId: string }) {
    const queryClient = useQueryClient()

    const [seenErrInput, seenErrInputSet] = useState<Error | ZodError | undefined>()
    const seenErrors = useSeenErrors(seenErrInput)

    const { mutate: addCommentMutation } = useMutation({
        mutationFn: addComment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["seenComments"] })
        },
        onError: (err: Error | ZodError) => {
            seenErrInputSet(err)
        }
    })

    const commentInitialValues: newComment = {
        postId: seenPostId,
        message: "",
    }


    const [commentObj, commentObjSet] = useState({ ...commentInitialValues })

    const handleSubmit = () => {
        const localPostObj = { ...commentObj }
        addCommentMutation(localPostObj)

        //reset
        commentObjSet({ ...commentInitialValues })
    }

    return (
        <div onClick={(e) => e.stopPropagation()}>
            {seenErrors}

            <input id='commentMessage' type='text' value={commentObj.message} onChange={(e) => commentObjSet(prevObj => {
                const newObj = { ...prevObj }
                newObj.message = e.target.value
                return newObj
            })} placeholder='Enter a comment' />

            <button onClick={handleSubmit}>Add comment</button>
        </div>
    )
}
