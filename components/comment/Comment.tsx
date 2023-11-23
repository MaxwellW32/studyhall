"use client"

import { comment, reply } from '@/types'
import React, { useState } from 'react'
import Moment from 'react-moment'
import MakeReply from '../reply/MakeReply'
import DisplayAllReplies from '../reply/DisplayAllReplies'
import { useQuery } from "@tanstack/react-query"
import { getCommentReplies } from '@/utility/serverFunctions/handleReplies'
import getNiceUsername from '@/utility/useful/getNiceUsername'
import { likeComment } from '@/utility/serverFunctions/handleComments'

export default function Comment({ seenComment }: { seenComment: comment }) {

    const [replyLimit, replyLimitSet] = useState(1)

    const { data: replies, isLoading, error } = useQuery<reply[]>({
        queryKey: ["seenReplies", seenComment.id, replyLimit],
        queryFn: async () => await getCommentReplies(seenComment.id, replyLimit),
        refetchOnWindowFocus: false
    })

    if (error) return <p>Couldn&apos;t fetch replies</p>

    return (
        <div style={{ display: "grid", gap: ".5rem", gridTemplateColumns: "auto 1fr", alignItems: "flex-start", backgroundColor: "#444", padding: '1rem', borderRadius: "1rem" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: ".3rem" }}>
                {seenComment.likes > 0 && <p>{seenComment.likes}</p>}

                <svg onClick={(e) => { e.stopPropagation(); likeComment(seenComment.id) }} style={{ fill: seenComment.likes ? "var(--highlightedColor)" : "" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z" />
                </svg>
            </div>

            <div>
                <div style={{ display: "flex", gap: "1rem" }}>
                    {seenComment.fromUser ? <>{getNiceUsername("u/", seenComment.fromUser)}</> : <p>u/CommentUser</p>}
                    <p className='timeText'><Moment fromNow>{seenComment.datePosted}</Moment></p>
                </div>

                <p>{seenComment.message}</p>

                <MakeReply seenCommentId={seenComment.id} replyingToUserId={seenComment.userId} />

                {replies && <DisplayAllReplies replies={replies} />}
            </div>
        </div>
    )
}
