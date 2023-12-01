"use client"

import { comment, reply } from '@/types'
import React, { useEffect, useState } from 'react'
import Moment from 'react-moment'
import MakeReply from '../reply/MakeReply'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getCommentReplies } from '@/utility/serverFunctions/handleReplies'
import getNiceUsername from '@/utility/useful/getNiceUsername'
import { checkLikedCommentAlready, getSpecificComment, likeComment } from '@/utility/serverFunctions/handleComments'
import Reply from '../reply/Reply'
import { useAtom } from 'jotai'
import { screenSizeGlobal } from '../home/AtomLoader'
import { toast } from 'react-hot-toast'

export default function Comment({ seenComment }: { seenComment: comment }) {
    const [screenSize,] = useAtom(screenSizeGlobal)
    const queryClient = useQueryClient()

    const [replyLimiter, replyLimiterSet] = useState(1) //5

    const [viewingReplies, viewingRepliesSet] = useState(false)
    const [hasNextPage, hasNextPageSet] = useState(false)

    const { data: commentData, isLoading: commentIsLoading, error: commentError } = useQuery({
        initialData: seenComment,
        queryKey: ["comment", seenComment.id],
        queryFn: async () => getSpecificComment(seenComment.id),
        staleTime: Infinity
    })

    const { mutate: likeCommentMutation } = useMutation({
        mutationFn: likeComment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["comment", seenComment.id] })
        },
        onError: (err: Error) => {
            toast.error(err.message)
        }
    })

    const searchReplies = async ({ pageParam }: { pageParam: number }) => {
        let seenReplies = await getCommentReplies(seenComment.id, replyLimiter + 1, pageParam)

        if (seenReplies[replyLimiter] !== undefined) {
            hasNextPageSet(true)
            replyLimiterSet(5)
            seenReplies.splice(replyLimiter, 1)
        } else {
            hasNextPageSet(false)
        }

        return seenReplies
    }

    const { data: replyData, error: replyError, fetchNextPage, } = useInfiniteQuery({
        queryKey: ["replies", seenComment.id],
        initialData: () => {
            if (seenComment.replies) {
                return {
                    pageParams: [0],
                    pages: [seenComment.replies]
                }
            }
        },
        initialPageParam: seenComment.replies?.length ?? 0,
        queryFn: searchReplies,
        getNextPageParam: (prevData, allPages) => {
            //count all comments for offset
            let replyCount = allPages.reduce((accumulator, eachReplyArr) => accumulator + eachReplyArr.length, 0);

            //future offset
            return hasNextPage ? replyCount : undefined
        },
        refetchOnWindowFocus: false,
    })



    const [likedCommentAlready, likedCommentAlreadySet] = useState<boolean>()

    //check if liked already
    useEffect(() => {
        if (!commentData) return

        const checkIfLiked = async () => {
            likedCommentAlreadySet(await checkLikedCommentAlready(commentData.id))
        }
        checkIfLiked()

    }, [commentData])

    if (commentData === undefined) return <p>Not seeing comment</p>

    return (
        <div style={{ backgroundColor: "#444", padding: '1rem', borderRadius: "1rem", display: "grid" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "grid", gap: ".5rem", gridTemplateColumns: "auto 1fr", alignItems: "center", }}>
                <div style={{ display: "flex", alignItems: "center", gap: ".3rem" }}>
                    {commentData.likes > 0 && <p>{commentData.likes}</p>}

                    <svg onClick={(e) => {
                        e.stopPropagation();
                        !likedCommentAlready && likeCommentMutation(commentData.id)
                    }} style={{
                        fill: commentData.likes ?
                            likedCommentAlready ? "gold" : "var(--highlightedColor)"
                            : ""
                    }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z" />
                    </svg>
                </div>

                {commentData.fromUser && getNiceUsername("u/", commentData.fromUser)}
            </div>

            <Moment fromNow style={{ marginLeft: "auto" }}>{commentData.datePosted}</Moment>

            <p style={{ marginTop: ".5rem" }}>{commentData.message}</p>

            <MakeReply seenCommentId={commentData.id} replyingToUserId={commentData.userId} />

            {replyData?.pages && viewingReplies && (
                <div style={{ borderRadius: "1rem", marginTop: "1rem", display: "grid", gap: "1rem" }}>
                    {replyData.pages.map(eachReplyArr => {

                        if (eachReplyArr.length > 0) {
                            return eachReplyArr.map(eachReply => {
                                return (
                                    <Reply key={eachReply.id} seenReply={eachReply} />
                                )
                            })
                        }
                    })}
                </div>
            )}

            {replyData && replyData.pages[0].length > 0 && !viewingReplies && <p className='wordLink' onClick={() => { viewingRepliesSet(true) }}>View Replies</p>}

            {viewingReplies &&
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                    {hasNextPage && <p className='wordLink' onClick={(e) => { e.stopPropagation(); fetchNextPage() }}>More Replies</p>}

                    <p className='wordLink' onClick={(e) => { e.stopPropagation(); viewingRepliesSet(false) }}>Hide Replies</p>
                </div>
            }
        </div>

    )
}
