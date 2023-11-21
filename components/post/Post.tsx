import { post, user } from '@/types'
import React, { useEffect, useState, useMemo } from 'react'
import styles from "./style.module.css"
import DisplayYTVideo from '@/utility/useful/DisplayYTVideo'
import DisplayImage from '@/utility/useful/DisplayImage'
import { getPostUser } from '@/utility/serverFunctions/handleUsers'
import Moment from 'react-moment';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import DisplayAllComments from '../comment/DisplayAllComments'
import MakeComment from '../comment/MakeComment'

export default function DisplayPost({ seenPost, inPreviewMode }: { seenPost: post, inPreviewMode?: boolean }) {

    const { data: seenAuthor, isLoading } = useQuery({
        queryKey: ["seenAuthor"],
        queryFn: async () => await getPostUser(seenPost.userId),
        refetchOnWindowFocus: false
    })

    const usableVideoUrls = useMemo(() => {
        return JSON.parse(seenPost.videoUrls ?? "[]") as string[]
    }, [seenPost.videoUrls])

    const usableImageUrls = useMemo(() => {
        return JSON.parse(seenPost.imageUrls ?? "[]") as string[]
    }, [seenPost.videoUrls])


    return (
        <div className={styles.postMainDiv}>

            {isLoading ? <p>Loading author...</p> : (
                <p>Posted by: {seenAuthor && <span>{seenAuthor.firstName}<span style={{ color: "blue" }}>({seenAuthor.username})</span></span>}</p>
            )}

            <p>post id {seenPost.id}</p>
            <p>message: {seenPost.message}</p>
            <p>posted: <Moment fromNow>{seenPost.datePosted}</Moment></p>
            <p>likes {seenPost.likes}</p>

            <p>images</p>
            <div className={styles.imgCont}>
                {usableImageUrls.map((eachUrl, eachUrlIndex) => {
                    return (
                        <DisplayImage key={eachUrlIndex} imageID={eachUrl} />
                    )
                })}
            </div>


            <p>videos</p>
            <div className={styles.ytVideoCont}>
                {usableVideoUrls.map((eachUrl, eachUrlIndex) => {
                    return (
                        <DisplayYTVideo key={eachUrlIndex} videoId={eachUrl} />
                    )
                })}
            </div>

            <MakeComment seenPostId={seenPost.id} seenReplyId={null} />

            {seenPost.comments && <DisplayAllComments comments={seenPost.comments} />}

        </div>
    )
}
