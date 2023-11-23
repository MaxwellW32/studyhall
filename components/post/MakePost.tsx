"use client"
import { community, newPost, post, studySession } from '@/types'
import { addPost } from '@/utility/serverFunctions/handlePosts'
import React, { useRef, useState } from 'react'
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ZodError } from 'zod-validation-error'
import useSeenErrors from '@/utility/useful/useSeenErrors'
import DisplayYTVideo from '@/utility/useful/DisplayYTVideo'
import DisplayImage from '@/utility/useful/DisplayImage'
import { toast } from 'react-hot-toast'



export default function MakePost({ passedCommunity, passedStudySession }: { passedCommunity: community | null, passedStudySession: studySession | null }) {
    const queryClient = useQueryClient()

    const [seenErrInput, seenErrInputSet] = useState<Error | ZodError | undefined>()
    const seenErrors = useSeenErrors(seenErrInput)

    const { mutate: addPostMutation } = useMutation({
        mutationFn: addPost,
        onSuccess: () => {
            toast.success("Posted!")
            queryClient.invalidateQueries({ queryKey: ["seenPosts"] })
        },
        onError: (err: Error | ZodError) => {
            seenErrInputSet(err)
        }
    })

    const postInitialValues: newPost = {
        communityId: passedCommunity?.id ?? null,
        studySessionId: passedStudySession?.id ?? null,
        title: "",
        message: null,
        videoUrls: null,
        imageUrls: null
    }

    const [postObj, postObjSet] = useState({ ...postInitialValues })

    const videoInputRef = useRef<HTMLInputElement>(null!)
    const imageInputRef = useRef<HTMLInputElement>(null!)

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

        creatingPostSet(false)
    }

    const [creatingPost, creatingPostSet] = useState(false)

    const hanldeAddVideo = () => {
        if (!videoUrlInput) return
        usableVideoUrlsSet(prev => [...prev, videoUrlInput])
        videoUrlInputSet("")
        videoInputRef.current.focus()
    }

    const hanldeAddImage = () => {
        if (!imageUrlInput) return
        usableImageUrlsSet(prev => [...prev, imageUrlInput])
        imageUrlInputSet("")
        imageInputRef.current.focus()
    }

    return (
        <div style={{ display: "grid", padding: "1rem", backgroundColor: "#333" }}>
            {creatingPost ? <h3>Add to {passedCommunity?.name ?? "Community"}</h3> : <h3>Want to add a post?</h3>}
            {seenErrors}

            {creatingPost &&
                <>
                    <label htmlFor='titleIdentifier'>Title</label>
                    <input id='titleIdentifier' type='text' value={postObj.title}
                        onChange={(e) => postObjSet(prevPostObj => {
                            const newPostObj = { ...prevPostObj }
                            newPostObj.title = e.target.value

                            return newPostObj
                        })} placeholder='Enter a title' />
                    <label htmlFor='messagesIdentifier'>Message</label>
                </>
            }

            <input id='messagesIdentifier' type='text' value={postObj.message ?? ""}
                onChange={(e) => postObjSet(prevPostObj => {
                    const newPostObj = { ...prevPostObj }
                    newPostObj.message = e.target.value

                    return newPostObj
                })}
                placeholder='Message to the world'
                onClick={() => {
                    creatingPostSet(true)
                }} />


            {creatingPost &&
                <>
                    <label htmlFor='videoIndentifier'>Videos</label>

                    <div style={{ display: "flex" }}>
                        <input style={{ flex: 1 }} ref={videoInputRef} id='videoIndentifier' type='text' value={videoUrlInput}
                            onChange={(e) => {
                                videoUrlInputSet(e.target.value)
                            }}
                            placeholder='Enter a Video Url'
                            onKeyDown={(e) => {
                                if (e.key !== "Enter") return
                                hanldeAddVideo()
                            }}
                        />

                        <button onClick={hanldeAddVideo}>Add Video</button>
                    </div>


                    {usableVideoUrls.length > 0 &&
                        <div className='noScrollBar' style={{ padding: "1rem", display: "grid", gridAutoColumns: "150px", gridAutoFlow: "column", gap: "1rem", overflowX: "auto" }}>
                            {usableVideoUrls.map((eachVideoUrl, eachVideoUrlIndex) => {

                                return (
                                    <div key={eachVideoUrlIndex}>
                                        <div className='highlightMouseOver' style={{ height: "10px", borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem" }} onClick={() => usableVideoUrlsSet(prevUrls => {
                                            const newUrls = prevUrls.filter((e, urlIndex) => urlIndex !== eachVideoUrlIndex)

                                            return newUrls
                                        })}></div>
                                        <DisplayYTVideo videoId={eachVideoUrl} key={eachVideoUrlIndex} />
                                    </div>
                                )
                            })}
                        </div>
                    }


                    <label htmlFor='imageIndentifier'>Images</label>

                    <div style={{ display: "flex" }}>
                        <input style={{ flex: 1 }} ref={imageInputRef} id='imageIndentifier' type='text' value={imageUrlInput}
                            onChange={(e) => {
                                imageUrlInputSet(e.target.value)
                            }}
                            placeholder='Enter an Image Link'
                            onKeyDown={(e) => {
                                if (e.key !== "Enter") return
                                hanldeAddImage()
                            }} />

                        <button onClick={hanldeAddImage}>Add Image</button>
                    </div>

                    {usableImageUrls.length > 0 &&
                        <div className='noScrollBar' style={{ padding: "1rem", display: "grid", gridAutoColumns: "200px", gridAutoFlow: "column", gap: "1rem", overflowX: "auto" }}>
                            {usableImageUrls.map((eachImageUrl, eachImageUrlIndex) => {

                                return (
                                    <div key={eachImageUrlIndex}>
                                        <div className='highlightMouseOver' style={{ height: "10px", borderTopLeftRadius: "1rem", borderTopRightRadius: "1rem" }} onClick={() =>
                                            usableImageUrlsSet(prevUrls => {
                                                const newUrls = prevUrls.filter((e, urlIndex) => urlIndex !== eachImageUrlIndex)

                                                return newUrls
                                            })}></div>
                                        <DisplayImage imageID={eachImageUrl} key={eachImageUrlIndex} />
                                    </div>
                                )
                            })}
                        </div>
                    }
                </>
            }


            <button style={{ margin: "1rem" }} role="submit" onClick={handleSubmit}>Submit post</button>
        </div>
    )
}
