"use client"
import { comment, newComment } from '@/types'
import React, { useRef, useState } from 'react'
import { v4 as uuidv4 } from "uuid"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ZodError } from 'zod-validation-error'
import useSeenErrors from '@/utility/useful/useSeenErrors'
import { addComment } from '@/utility/serverFunctions/handleComments'
import { toast } from 'react-hot-toast'


export default function MakeComment({ seenPostId }: { seenPostId: string }) {
    const queryClient = useQueryClient()

    const [seenErrInput, seenErrInputSet] = useState<Error | ZodError | undefined>()
    const seenErrors = useSeenErrors(seenErrInput)

    const { mutate: addCommentMutation } = useMutation({
        mutationFn: addComment,
        onSuccess: () => {
            toast.success("Commented!")
            queryClient.invalidateQueries({ queryKey: ["comments", seenPostId] })
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
    const [readyToComment, readyToCommentSet] = useState(false)

    const handleSubmit = () => {
        const localPostObj = { ...commentObj }
        addCommentMutation(localPostObj)

        //reset
        commentObjSet({ ...commentInitialValues })
        readyToCommentSet(false)
    }

    return (
        <div style={{ padding: ".5rem .5rem" }} onClick={(e) => e.stopPropagation()}>
            {readyToComment ?
                <>
                    {seenErrors}

                    <input id='commentMessage' type='text' value={commentObj.message} onChange={(e) => commentObjSet(prevObj => {
                        const newObj = { ...prevObj }
                        newObj.message = e.target.value
                        return newObj
                    })} placeholder='What do you want to say?' />

                    <button onClick={handleSubmit}>Reply</button>
                </>

                :
                <div style={{ display: "flex", gap: ".3rem", cursor: "pointer", alignItems: "center" }} onClick={(e) => { readyToCommentSet(true) }}>
                    <svg className='replySvg' xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M512 240c0 114.9-114.6 208-256 208c-37.1 0-72.3-6.4-104.1-17.9c-11.9 8.7-31.3 20.6-54.3 30.6C73.6 471.1 44.7 480 16 480c-6.5 0-12.3-3.9-14.8-9.9c-2.5-6-1.1-12.8 3.4-17.4l0 0 0 0 0 0 0 0 .3-.3c.3-.3 .7-.7 1.3-1.4c1.1-1.2 2.8-3.1 4.9-5.7c4.1-5 9.6-12.4 15.2-21.6c10-16.6 19.5-38.4 21.4-62.9C17.7 326.8 0 285.1 0 240C0 125.1 114.6 32 256 32s256 93.1 256 208z" /></svg>
                    <p>Leave a Comment</p>
                </div>
            }
        </div>
    )
}
