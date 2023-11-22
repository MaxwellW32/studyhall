"use client"
import { post } from '@/types'
import { addPost } from '@/utility/serverFunctions/handlePosts'
import React, { useRef, useState } from 'react'
import { v4 as uuidv4 } from "uuid"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ZodError } from 'zod-validation-error'
import useSeenErrors from '@/utility/useful/useSeenErrors'
import DisplayYTVideo from '@/utility/useful/DisplayYTVideo'
import DisplayImage from '@/utility/useful/DisplayImage'



export default function MakePost({ passedCommunityId, passedStudySessionId }: { passedCommunityId: null | string, passedStudySessionId: null | string }) {
    const queryClient = useQueryClient()

    const [seenErrInput, seenErrInputSet] = useState<Error | ZodError | undefined>()
    const seenErrors = useSeenErrors(seenErrInput)

    const { mutate: addPostMutation } = useMutation({
        mutationFn: addPost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["seenPosts"] })
        },
        onError: (err: Error | ZodError) => {
            seenErrInputSet(err)
        }
    })

    const postInitialValues: post = {
        id: uuidv4(),
        userId: "",
        communityId: passedCommunityId,
        studySessionId: passedStudySessionId,
        likes: null,
        datePosted: new Date(),
        message: null,
        videoUrls: null,
        imageUrls: null
    }

    const [postObj, postObjSet] = useState<post>({ ...postInitialValues })


    const [usableVideoUrls, usableVideoUrlsSet] = useState<string[]>([])
    const [usableImageUrls, usableImageUrlsSet] = useState<string[]>([])

    const handleSubmit = () => {
        const localPostObj = { ...postObj }

        if (usableVideoUrls.length > 0) localPostObj.videoUrls = JSON.stringify(usableVideoUrls)
        if (usableImageUrls.length > 0) localPostObj.imageUrls = JSON.stringify(usableImageUrls)

        addPostMutation(localPostObj)


        //reset
        postObjSet({ ...postInitialValues })
        usableVideoUrlsSet([])
        usableImageUrlsSet([])
    }

    return (
        <div>
            <p>MakePost</p>
            {seenErrors}

            <div>

                <label htmlFor='messagesIdentifier'>Messages</label>
                <input id='messagesIdentifier' type='text' value={postObj.message ?? ""}
                    onChange={(e) => postObjSet(prevPostObj => {
                        const newPostObj = { ...prevPostObj }
                        newPostObj.message = e.target.value

                        return newPostObj
                    })} />


                <label htmlFor='videoIndentifier'>Videos</label>
                <input id='videoIndentifier' type='text' value={usableVideoUrls[usableVideoUrls.length - 1]}
                    onChange={(e) => {
                        usableVideoUrlsSet(prevUrls => {
                            const newUrls = [...prevUrls]
                            newUrls[usableVideoUrls.length - 1] = e.target.value
                            return newUrls
                        })
                    }}
                    placeholder='Enter a video Url' />

                <button onClick={() => {
                    usableVideoUrlsSet(prev => [...prev, ""])
                }}>Add Video</button>

                <div>
                    {usableVideoUrls.map((eachVideoUrl, eachVideoUrlIndex) => {
                        return (
                            <div key={eachVideoUrlIndex}>
                                <p onClick={() => usableVideoUrlsSet(prevUrls => {
                                    const newUrls = [...prevUrls]

                                    newUrls.filter((e, urlIndex) => urlIndex !== eachVideoUrlIndex)

                                    return newUrls
                                })}>X</p>
                                <DisplayYTVideo videoId={eachVideoUrl} key={eachVideoUrlIndex} />
                            </div>
                        )
                    })}
                </div>


                <label htmlFor='imageIndentifier'>Images</label>
                <input id='imageIndentifier' type='text' value={usableImageUrls[usableImageUrls.length - 1]}
                    onChange={(e) => {
                        usableImageUrlsSet(prevUrls => {
                            const newUrls = [...prevUrls]
                            newUrls[usableImageUrls.length - 1] = e.target.value
                            return newUrls
                        })
                    }}
                    placeholder='Enter an Image Link' />

                <button onClick={() => {
                    usableImageUrlsSet(prev => [...prev, ""])
                }}>Add Image</button>

                <div>
                    {usableImageUrls.map((eachImageUrl, eachImageUrlIndex) => {
                        return (
                            <div key={eachImageUrlIndex}>
                                <p onClick={() => usableImageUrlsSet(prevUrls => {
                                    const newUrls = [...prevUrls]

                                    newUrls.filter((e, urlIndex) => urlIndex !== eachImageUrlIndex)

                                    return newUrls
                                })}>X</p>
                                <DisplayImage imageID={eachImageUrl} key={eachImageUrlIndex} />
                            </div>
                        )
                    })}
                </div>


                <button role="submit" onClick={handleSubmit}>Submit</button>
            </div>
        </div>
    )
}
