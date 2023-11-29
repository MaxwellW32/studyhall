"use client"
import { post, comment } from '@/types'
import React, { useEffect, useState, useMemo, useRef } from 'react'
import styles from "./style.module.css"
import DisplayYTVideo from '@/utility/useful/DisplayYTVideo'
import DisplayImage from '@/utility/useful/DisplayImage'
import Moment from 'react-moment';
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import MakeComment from '../comment/MakeComment'
import { getPostComments } from '@/utility/serverFunctions/handleComments'
import Link from 'next/link'
import { likePost } from '@/utility/serverFunctions/handlePosts'
import getNiceUsername from '@/utility/useful/getNiceUsername'
import getNiceUrl from '@/utility/useful/getNiceUrl'
import { toast } from 'react-hot-toast'
import Comment from '../comment/Comment'

export default function Post({ seenPost, fullScreen = true }: { seenPost: post, fullScreen?: boolean }) {

    const [commentLimiter, commentLimiterSet] = useState(15)

    const [viewingComments, viewingCommentsSet] = useState(false)
    const [postHasComments, postHasCommentsSet] = useState(false)

    useEffect(() => {
        const checkComment = async () => {
            const seenComment = await getPostComments(seenPost.id, 1, 0)
            if (Array.isArray(seenComment)) {
                postHasCommentsSet(true)
            }
        }
        checkComment()
    }, [])

    const searchComments = async ({ pageParam }: { pageParam: number }) => {
        const seenComments = await getPostComments(seenPost.id, commentLimiter, pageParam)
        return seenComments
    }

    const { data: commentData, error: commentError, fetchNextPage, hasNextPage, } = useInfiniteQuery({
        queryKey: ["comments", seenPost.id],
        enabled: viewingComments,
        initialPageParam: 0,
        queryFn: searchComments,
        getNextPageParam: (prevData, allPages) => {

            if (prevData.length !== commentLimiter) {
                //check if last data matches what we expected
                return undefined
            }

            //count all comments for offset
            let commentCount = 0
            allPages.forEach(eachCommentArr => commentCount += eachCommentArr.length)

            //future offset
            return commentCount
        },
        refetchOnWindowFocus: false,
    })

    const usableVideoUrls = useMemo(() => {
        return seenPost.videoUrls ? JSON.parse(seenPost.videoUrls) as string[] : null
    }, [seenPost.videoUrls])

    const usableImageUrls = useMemo(() => {
        return seenPost.imageUrls ? JSON.parse(seenPost.imageUrls) as string[] : null
    }, [seenPost.videoUrls])

    return (
        <div className={styles.postMainDiv}>
            {seenPost.forCommunity && <Link className='showUnderline' href={getNiceUrl("community", seenPost.forCommunity.id, seenPost.forCommunity.name)}>sh/{seenPost.forCommunity.name}</Link>}

            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                {seenPost.author && getNiceUsername("u/", seenPost.author)}

                <p className='timeText'><Moment fromNow>{seenPost.datePosted}</Moment></p>
            </div>

            <div style={{ display: "flex", gap: ".5rem", alignItems: 'center' }}>
                {seenPost.likes > 0 && <p style={{ marginRight: "-.2rem" }}>{seenPost.likes}</p>}

                <svg onClick={(e) => { e.stopPropagation(); likePost(seenPost.id) }} style={{ fill: seenPost.likes ? "var(--highlightedColor)" : "" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z" />
                </svg>

                <h3>{seenPost.title}</h3>
            </div>

            <p>{seenPost.message}</p>

            {usableImageUrls && fullScreen &&
                <div style={{ marginBlock: "1rem" }}>
                    <h3>images</h3>

                    <div className={`${styles.imgCont} noScrollBar`} style={{ height: "400px" }}>
                        {usableImageUrls.map((eachUrl, eachUrlIndex) => {
                            return (
                                <DisplayImage key={eachUrlIndex} imageID={eachUrl} />
                            )
                        })}
                    </div>
                </div>
            }

            {usableVideoUrls && fullScreen &&
                <>
                    <h3>videos</h3>

                    <div className={`${styles.ytVideoCont} noScrollBar`} style={{ display: "grid", marginBottom: "1rem" }}>
                        {usableVideoUrls.map((eachUrl, eachUrlIndex) => {
                            return (
                                <DisplayYTVideo key={eachUrlIndex} videoId={eachUrl} />
                            )
                        })}
                    </div>
                </>
            }

            <MakeComment seenPostId={seenPost.id} />

            {commentData?.pages && viewingComments && (
                <div style={{ padding: "1rem", borderRadius: "1rem", marginTop: "1rem", display: "grid", gap: "1rem" }}>
                    {commentData.pages.map(eachCommentArr => {

                        if (eachCommentArr.length > 0) {
                            return eachCommentArr.map(eachComment => {
                                return <Comment key={eachComment.id} seenComment={eachComment} />
                            })
                        }
                    })}
                </div>
            )}

            {postHasComments && !viewingComments && <p className='wordLink' onClick={(e) => { viewingCommentsSet(true); e.stopPropagation() }}>View comments</p>}

            {viewingComments &&
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                    {hasNextPage && <p className='wordLink' onClick={(e) => { e.stopPropagation(); fetchNextPage() }}>More Comments</p>}

                    <p className='wordLink' onClick={(e) => { e.stopPropagation(); viewingCommentsSet(false) }}>Hide comments</p>
                </div>
            }
        </div>
    )
}
