"use client"
import { post, usablePost } from '@/types'
import { addPost } from '@/utility/serverFunctions/handlePosts'
import React, { useRef, useState } from 'react'
import { v4 as uuidv4 } from "uuid"



export default function MakePost({ passedCommunityId, passedStudySessionId }: { passedCommunityId: null | string, passedStudySessionId: null | string }) {

    const postInitialValues: usablePost = {
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

    const [postObj, postObjSet] = useState<usablePost>({ ...postInitialValues })

    const videoUrlInput = useRef("")
    const imageUrlInput = useRef("")

    return (
        <div>
            <p>MakePost</p>
            <div>

                <label htmlFor='messagesIdentifier'>Messages</label>
                <input id='messagesIdentifier' type='text' value={postObj.message ?? ""}
                    onChange={(e) => postObjSet(prevPostObj => {
                        const newPostObj = { ...prevPostObj }
                        newPostObj.message = e.target.value

                        return newPostObj
                    })} />


                <label htmlFor='videoIndentifier'>Videos</label>
                <input id='videoIndentifier' type='text' onChange={(e) => videoUrlInput.current = e.target.value} placeholder='Enter a video Url' />

                <button onClick={() => postObjSet(prevPostObj => {
                    const newPostObj = { ...prevPostObj }

                    if (!newPostObj.videoUrls) newPostObj.videoUrls = []

                    newPostObj.videoUrls = [videoUrlInput.current, ...newPostObj.videoUrls]

                    return newPostObj
                })}>Submit Video</button>

                {postObj.videoUrls &&
                    <div>
                        {postObj.videoUrls.map((eachVideoUrl, eachVideoUrlIndex) => {
                            return (
                                <div key={eachVideoUrlIndex}>
                                    <p onClick={() => postObjSet(prevPostObj => {
                                        const newPostObj = { ...prevPostObj }

                                        newPostObj.videoUrls = newPostObj.videoUrls!.filter((e, urlIndex) => urlIndex !== eachVideoUrlIndex)

                                        return newPostObj
                                    })}>X</p>
                                    {eachVideoUrl}
                                </div>
                            )
                        })}
                    </div>}


                <label htmlFor='imageIndentifier'>Images</label>
                <input id='imageIndentifier' type='text' onChange={(e) => imageUrlInput.current = e.target.value} placeholder='Enter an Image Link' />

                <button onClick={() => postObjSet(prevPostObj => {
                    const newPostObj = { ...prevPostObj }

                    if (!newPostObj.imageUrls) newPostObj.imageUrls = []

                    newPostObj.imageUrls = [imageUrlInput.current, ...newPostObj.imageUrls]

                    return newPostObj
                })}>Submit Image</button>

                {postObj.imageUrls &&
                    <div>
                        {postObj.imageUrls.map((eachImageUrl, eachImageUrlIndex) => {
                            return (
                                <div key={eachImageUrlIndex}>
                                    <p onClick={() => postObjSet(prevPostObj => {
                                        const newPostObj = { ...prevPostObj }

                                        newPostObj.imageUrls = newPostObj.imageUrls!.filter((e, urlIndex) => urlIndex !== eachImageUrlIndex)

                                        return newPostObj
                                    })}>X</p>
                                    {eachImageUrl}
                                </div>
                            )
                        })}
                    </div>}


                <button role="submit" onClick={() => addPost(postObj)}>Submit</button>
            </div>
        </div>
    )
}
