"use client"
import { newPost, post } from '@/types'
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

    const postInitialValues: newPost = {
        communityId: passedCommunityId,
        studySessionId: passedStudySessionId,
        message: null,
        videoUrls: null,
        imageUrls: null
    }

    const [postObj, postObjSet] = useState({ ...postInitialValues })


    const [videoUrlInput, videoUrlInputSet] = useState("")
    const [usableVideoUrls, usableVideoUrlsSet] = useState<string[]>([])

    const [imageUrlInput, imageUrlInputSet] = useState("")
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
                <input id='videoIndentifier' type='text' value={videoUrlInput}
                    onChange={(e) => {
                        videoUrlInputSet(e.target.value)
                    }}
                    placeholder='Enter a video Url' />

                <button onClick={() => {
                    if (!videoUrlInput) return
                    usableVideoUrlsSet(prev => [...prev, videoUrlInput])
                    videoUrlInputSet("")

                }}>Add Video</button>

                <div>
                    {usableVideoUrls.map((eachVideoUrl, eachVideoUrlIndex) => {

                        return (
                            <div key={eachVideoUrlIndex}>
                                <p onClick={() => usableVideoUrlsSet(prevUrls => {
                                    const newUrls = prevUrls.filter((e, urlIndex) => urlIndex !== eachVideoUrlIndex)

                                    return newUrls
                                })}>X</p>
                                <DisplayYTVideo videoId={eachVideoUrl} key={eachVideoUrlIndex} />
                            </div>
                        )
                    })}
                </div>


                <label htmlFor='imageIndentifier'>Images</label>
                <input id='imageIndentifier' type='text' value={imageUrlInput}
                    onChange={(e) => {
                        imageUrlInputSet(e.target.value)
                    }}
                    placeholder='Enter an Image Link' />

                <button onClick={() => {
                    if (!imageUrlInput) return
                    usableImageUrlsSet(prev => [...prev, imageUrlInput])
                    imageUrlInputSet("")
                }}>Add Image</button>

                <div>
                    {usableImageUrls.map((eachImageUrl, eachImageUrlIndex) => {

                        return (
                            <div key={eachImageUrlIndex}>
                                <p onClick={() => usableImageUrlsSet(prevUrls => {
                                    const newUrls = prevUrls.filter((e, urlIndex) => urlIndex !== eachImageUrlIndex)

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
