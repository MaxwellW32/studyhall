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
import { likePost } from '@/utility/serverFunctions/handlePosts'
import getNiceUsername from '@/utility/useful/getNiceUsername'
import getNiceUrl from '@/utility/useful/getNiceUrl'

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
                    {seenPost.author && <>{getNiceUsername("u/", seenPost.author)}</>}

                    <div style={{ display: "flex", gap: ".5rem", alignItems: 'center' }}>
                        {seenPost.likes && <p style={{ marginRight: "-.2rem" }}>{seenPost.likes}</p>}

                        <svg onClick={(e) => { e.stopPropagation(); likePost(seenPost.id) }} style={{ fill: seenPost.likes ? "var(--highlightedColor)" : "" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z" />
                        </svg>

                        <h3>{seenPost.title}</h3>
                    </div>

                    <p>{seenPost.message}</p>

                </>
            ) : (
                <>
                    <div style={{ display: "flex", gap: "1rem" }}>
                        {seenPost.author && <>{getNiceUsername("u/", seenPost.author)}</>}
                        <p className='timeText'><Moment fromNow>{seenPost.datePosted}</Moment></p>
                    </div>

                    <div style={{ display: "flex", gap: ".5rem", alignItems: 'center' }}>
                        {seenPost.likes && <p style={{ marginRight: "-.2rem" }}>{seenPost.likes}</p>}

                        <svg onClick={(e) => { e.stopPropagation(); likePost(seenPost.id) }} style={{ fill: seenPost.likes ? "var(--highlightedColor)" : "" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z" />
                        </svg>

                        <h3>{seenPost.title}</h3>
                    </div>

                    <p>{seenPost.message}</p>

                    {usableImageUrls &&
                        <>
                            <p>images</p>

                            <div className={styles.imgCont} style={{ height: inPreviewMode ? "50px" : "400px" }}>
                                {usableImageUrls.map((eachUrl, eachUrlIndex) => {
                                    return (
                                        <DisplayImage key={eachUrlIndex} imageID={eachUrl} />
                                    )
                                })}
                            </div>
                        </>

                    }


                    {usableVideoUrls &&
                        <>
                            <p>videos</p>

                            <div className={styles.ytVideoCont} style={{ height: inPreviewMode ? "100px" : "auto" }}>
                                {usableVideoUrls.map((eachUrl, eachUrlIndex) => {
                                    return (
                                        <DisplayYTVideo key={eachUrlIndex} videoId={eachUrl} />
                                    )
                                })}
                            </div>
                        </>
                    }

                    <MakeComment seenPostId={seenPost.id} />

                    {seenPost.comments && seenPost.comments.length > 0 && (
                        <>
                            <DisplayAllComments comments={seenPost.comments} />
                            <button onClick={() => commentOffsetSet(prev => prev + 5)}>Show More Comments</button>
                        </>
                    )}

                </>)}

        </div>
    )
}
