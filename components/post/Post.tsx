"use client"
import { post, comment } from '@/types'
import React, { useEffect, useState, useMemo } from 'react'
import styles from "./style.module.css"
import DisplayYTVideo from '@/utility/useful/DisplayYTVideo'
import DisplayImage from '@/utility/useful/DisplayImage'
import Moment from 'react-moment';
import { useQuery } from "@tanstack/react-query"
import DisplayAllComments from '../comment/DisplayAllComments'
import MakeComment from '../comment/MakeComment'
import { getPostComments } from '@/utility/serverFunctions/handleComments'
import Link from 'next/link'

export default function Post({ seenPost, inPreviewMode }: { seenPost: post, inPreviewMode?: boolean }) {

    const [commentOffset, commentOffsetSet] = useState(1)

    // const { data: comments, isLoading } = useQuery({
    //     queryKey: ["seenComments", seenPost.id, commentOffset],
    //     queryFn: async () => await getPostComments(seenPost.id, commentOffset),
    //     refetchOnWindowFocus: false
    // })


    // const { data: community } = useQuery({
    //     queryKey: ["seenCommunity"],
    //     queryFn: async () => await getPostComments(seenPost.id, commentOffset),
    //     refetchOnWindowFocus: false
    // })


    const usableVideoUrls = useMemo(() => {
        return seenPost.videoUrls ? JSON.parse(seenPost.videoUrls) as string[] : null
    }, [seenPost.videoUrls])

    const usableImageUrls = useMemo(() => {
        return seenPost.imageUrls ? JSON.parse(seenPost.imageUrls) as string[] : null
    }, [seenPost.videoUrls])


    return (
        <div className={styles.postMainDiv}>

            {seenPost.forCommunity && <Link href={`/community/${seenPost.forCommunity?.id}/${seenPost.forCommunity?.name.toLowerCase().replace(/ /g, '_')}`}>{seenPost.forCommunity?.name}</Link>}

            {inPreviewMode ? (
                <>
                    <p>Title: {seenPost.title}</p>
                    <p>message: {seenPost.message}</p>
                    <p>likes {seenPost.likes}</p>
                    <p>Posted by: {seenPost.author && <span>{seenPost.author.name}<span style={{ color: "blue" }}>({seenPost.author.username})</span></span>}</p>

                </>
            ) : (
                <>
                    <p>Title: {seenPost.title}</p>
                    <p>Posted by: {seenPost.author && <span>{seenPost.author.name}<span style={{ color: "blue" }}>({seenPost.author.username})</span></span>}</p>
                    <p>post id {seenPost.id}</p>
                    <p>message: {seenPost.message}</p>
                    <p>posted: <Moment fromNow>{seenPost.datePosted}</Moment></p>
                    <p>likes {seenPost.likes}</p>

                    <p>images</p>
                    {usableImageUrls &&
                        <div className={styles.imgCont} style={{ height: inPreviewMode ? "50px" : "400px" }}>
                            {usableImageUrls.map((eachUrl, eachUrlIndex) => {
                                return (
                                    <DisplayImage key={eachUrlIndex} imageID={eachUrl} />
                                )
                            })}
                        </div>
                    }


                    <p>videos</p>
                    {usableVideoUrls && <div className={styles.ytVideoCont} style={{ height: inPreviewMode ? "100px" : "auto" }}>
                        {usableVideoUrls.map((eachUrl, eachUrlIndex) => {
                            return (
                                <DisplayYTVideo key={eachUrlIndex} videoId={eachUrl} />
                            )
                        })}
                    </div>
                    }

                    <MakeComment seenPostId={seenPost.id} />

                    {seenPost.comments && (
                        <>
                            <DisplayAllComments comments={seenPost.comments} />
                            <button onClick={() => commentOffsetSet(prev => prev + 5)}>Show More Comments</button>
                        </>
                    )}

                </>)}

        </div>
    )
}
