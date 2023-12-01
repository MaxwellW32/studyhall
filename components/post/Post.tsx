"use client"
import { post, comment } from '@/types'
import React, { useEffect, useState, useMemo, useRef } from 'react'
import styles from "./style.module.css"
import DisplayYTVideo from '@/utility/useful/DisplayYTVideo'
import DisplayImage from '@/utility/useful/DisplayImage'
import Moment from 'react-moment';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import MakeComment from '../comment/MakeComment'
import { getPostComments } from '@/utility/serverFunctions/handleComments'
import Link from 'next/link'
import { checkLikedPostAlready, getSpecificPost, likePost } from '@/utility/serverFunctions/handlePosts'
import getNiceUsername from '@/utility/useful/getNiceUsername'
import getNiceUrl from '@/utility/useful/getNiceUrl'
import { toast } from 'react-hot-toast'
import Comment from '../comment/Comment'
import { useAtom } from 'jotai'
import { screenSizeGlobal } from '../home/AtomLoader'

export default function Post({ seenPost, fullScreen = true }: { seenPost: post, fullScreen?: boolean }) {
    const [screenSize,] = useAtom(screenSizeGlobal)
    const queryClient = useQueryClient()

    const [commentLimiter, commentLimiterSet] = useState(1) //15

    const [hasNextPage, hasNextPageSet] = useState(false)
    const [viewingComments, viewingCommentsSet] = useState(false)

    const { data: postData, isLoading: postIsLoading, error: postError } = useQuery({
        initialData: seenPost,
        queryKey: ["post", seenPost.id],
        queryFn: async () => getSpecificPost(seenPost.id),
        staleTime: Infinity
    })

    const { mutate: likePostMutation } = useMutation({
        mutationFn: likePost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["post", seenPost.id] })
        },
        onMutate: async () => {
            // // Cancel any outgoing refetches
            // // (so they don't overwrite our optimistic update)
            // await queryClient.cancelQueries({ queryKey: ["posts", seenPost.communityId] })

            // // Snapshot the previous value
            // const previousPostData = queryClient.getQueryData(["posts", seenPost.communityId])

            // // Optimistically update to the new value
            // queryClient.setQueryData(['todos'], (old) => [...old, newTodo])

            // // Return a context object with the snapshotted value
            // return { previousPostData }

            // const previousPosts = queryClient.getQueryData(["posts", seenPost.communityId])
            // console.log(`$prevposts`, previousPosts);

        },
        onError: (err: Error) => {
            toast.error(err.message)
        }
    })



    const [likedPostAlready, likedPostAlreadySet] = useState<boolean>()

    //check if member
    useEffect(() => {
        if (!postData) return

        const checkIfLiked = async () => {
            likedPostAlreadySet(await checkLikedPostAlready(seenPost.id))
        }
        checkIfLiked()

    }, [postData])



    const searchComments = async ({ pageParam }: { pageParam: number }) => {
        const seenComments = await getPostComments(seenPost.id, commentLimiter + 1, pageParam)

        if (seenComments[commentLimiter] !== undefined) {
            hasNextPageSet(true)
            commentLimiterSet(15)
            seenComments.splice(commentLimiter, 1)
        } else {
            hasNextPageSet(false)
        }

        return seenComments
    }
    const { data: infCommentData, error: commentError, fetchNextPage, } = useInfiniteQuery({
        queryKey: ["comments", seenPost.id],
        initialData: () => {
            if (postData?.comments) {
                return {
                    pageParams: [0],
                    pages: [postData.comments]
                }
            }
        },
        initialPageParam: postData?.comments?.length ?? 0,
        queryFn: searchComments,
        getNextPageParam: (prevData, allPages) => {

            //count all comments for offset
            let commentCount = allPages.reduce((accumulator, eachCommentArr) => accumulator + eachCommentArr.length, 0);

            //future offset
            return hasNextPage ? commentCount : undefined
        },
        refetchOnWindowFocus: false,
    })

    const usableVideoUrls = useMemo(() => {
        return postData?.videoUrls ? JSON.parse(postData.videoUrls) as string[] : null
    }, [postData?.videoUrls])

    const usableImageUrls = useMemo(() => {
        return postData?.imageUrls ? JSON.parse(postData.imageUrls) as string[] : null
    }, [postData?.imageUrls])

    if (postData === undefined) return <p>Not seeing post</p>

    return (
        <div className={styles.postMainDiv}>
            {postData.forCommunity && fullScreen && <Link className='showUnderline' href={getNiceUrl("community", postData.forCommunity.id, postData.forCommunity.name)}>sh/{postData.forCommunity.name}</Link>}

            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center" }}>
                {postData.author && getNiceUsername("u/", postData.author)}

                <Moment style={{ marginLeft: screenSize.phone ? "auto" : "" }} fromNow>{postData.datePosted}</Moment>
            </div>

            <div style={{ display: "flex", gap: ".5rem", alignItems: 'center' }}>
                {postData.likes > 0 && <p style={{ marginRight: "-.2rem" }}>{postData.likes}</p>}

                <svg onClick={(e) => {
                    e.stopPropagation();
                    !likedPostAlready && likePostMutation(postData.id)
                }} style={{
                    fill: postData.likes ?
                        likedPostAlready ? "gold" : "var(--highlightedColor)"
                        : ""
                }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z" />
                </svg>

                <h3>{postData.title}</h3>
            </div>

            <p>{postData.message}</p>

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

            <MakeComment seenPostId={postData.id} />

            {infCommentData?.pages && viewingComments && (
                <div style={{ padding: !screenSize.phone ? "1rem" : "", borderRadius: "1rem", marginTop: "1rem", display: "grid", gap: "1rem" }}>
                    {infCommentData.pages.map(eachCommentArr => {

                        if (eachCommentArr.length > 0) {
                            return eachCommentArr.map(eachComment => {
                                return <Comment key={eachComment.id} seenComment={eachComment} />
                            })
                        }
                    })}
                </div>
            )}

            {infCommentData && infCommentData.pages[0].length > 0 && !viewingComments && <p className='wordLink' onClick={(e) => { viewingCommentsSet(true); e.stopPropagation() }}>View comments</p>}

            {viewingComments &&
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                    {hasNextPage && <p className='wordLink' onClick={(e) => { e.stopPropagation(); fetchNextPage() }}>More Comments</p>}

                    <p className='wordLink' onClick={(e) => { e.stopPropagation(); viewingCommentsSet(false) }}>Hide comments</p>
                </div>
            }
        </div>
    )
}
