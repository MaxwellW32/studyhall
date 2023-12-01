"use client"
import { reply } from '@/types'
import { checkLikedReplyAlready, getCommentReplies, getSpecificReply, likeReply } from '@/utility/serverFunctions/handleReplies'
import React, { useEffect, useState } from 'react'
import Moment from 'react-moment'
import MakeReply from './MakeReply'
import getNiceUsername from '@/utility/useful/getNiceUsername'
import { useAtom } from 'jotai'
import { screenSizeGlobal } from '../home/AtomLoader'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'

export default function Reply({ seenReply }: { seenReply: reply }) {
    const [screenSize,] = useAtom(screenSizeGlobal)
    const queryClient = useQueryClient()

    const { data: replyData, isLoading: replyIsLoading, error: replyError } = useQuery({
        initialData: seenReply,
        queryKey: ["reply", seenReply.id],
        queryFn: async () => getSpecificReply(seenReply.id),
        staleTime: Infinity
    })

    const { mutate: likeReplyMutation } = useMutation({
        mutationFn: likeReply,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reply", seenReply.id] })
        },
        onError: (err: Error) => {
            toast.error(err.message)
        }
    })

    const [likedReplyAlready, likedReplyAlreadySet] = useState<boolean>()

    //check if liked already
    useEffect(() => {
        if (!replyData) return

        const checkIfLiked = async () => {
            likedReplyAlreadySet(await checkLikedReplyAlready(replyData.id))
        }
        checkIfLiked()

    }, [replyData])


    if (replyData === undefined) return <p>Not seeing reply</p>

    return (
        <div style={{ backgroundColor: "#333", padding: "1rem", borderRadius: "1rem", overflowX: "hidden", display: "grid" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <p style={{ fontWeight: "bold" }} className='smallText'>replying to @{replyData.replyingToUser?.username ?? "User"}</p>

                <Moment fromNow>{replyData.datePosted}</Moment>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "center", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: ".3rem" }}>
                    {replyData.likes > 0 && <p>{replyData.likes}</p>}

                    <svg onClick={(e) => {
                        e.stopPropagation();
                        !likedReplyAlready && likeReplyMutation(replyData.id)
                    }} style={{
                        fill: replyData.likes ?
                            likedReplyAlready ? "gold" : "var(--highlightedColor)"
                            : ""
                    }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z" />
                    </svg>
                </div>

                {replyData.fromUser && getNiceUsername("u/", replyData.fromUser)}
            </div>

            <p>{replyData.message}</p>

            {replyData.fromUser?.id && <MakeReply fromReply={true} seenCommentId={replyData.commentId} replyingToUserId={replyData.fromUser.id} />}
        </div>

    )
}
