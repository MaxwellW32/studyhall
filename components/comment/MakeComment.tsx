"use client"
import { comment } from '@/types'
import { addPost } from '@/utility/serverFunctions/handlePosts'
import React, { useRef, useState } from 'react'
import { v4 as uuidv4 } from "uuid"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ZodError } from 'zod-validation-error'
import useSeenErrors from '@/utility/useful/useSeenErrors'
import { addComment } from '@/utility/serverFunctions/handleComments'


export default function MakeComment({ seenPostId, seenReplyId }: { seenPostId: string, seenReplyId: string | null }) {
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

    const commentInitialValues: comment = {
        id: uuidv4(),
        userId: "",
        postId: seenPostId,
        datePosted: new Date(),
        message: "",
        likes: null
    }


    const [commentObj, commentObjSet] = useState<comment>({ ...commentInitialValues })

    const handleSubmit = () => {
        const localPostObj = { ...commentObj }
        addCommentMutation(localPostObj)
    }

    return (
        <div>
            {seenErrors}
            <p>MakeComment</p>

            <label htmlFor='commentMessage'></label>
            <input id='commentMessage' type='text' value={commentObj.message} onChange={(e) => commentObjSet(prevObj => {
                const newObj = { ...prevObj }
                newObj.message = e.target.value
                return newObj
            })} placeholder='' />

            <button onClick={handleSubmit}>send comment</button>
        </div>
    )
}
