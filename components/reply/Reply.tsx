"use client"
import { reply } from '@/types'
import { getCommentReplies, likeReply } from '@/utility/serverFunctions/handleReplies'
import React, { useState } from 'react'
import Moment from 'react-moment'
import MakeReply from './MakeReply'
import getNiceUsername from '@/utility/useful/getNiceUsername'

export default function Reply({ seenReply }: { seenReply: reply }) {

    return (
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "flex-start", gap: "1rem", backgroundColor: "#333", padding: "1rem", borderRadius: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: ".3rem" }}>
                {seenReply.likes > 0 && <p>{seenReply.likes}</p>}

                <svg onClick={(e) => { e.stopPropagation(); likeReply(seenReply.id) }} style={{ fill: seenReply.likes ? "var(--highlightedColor)" : "" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z" />
                </svg>
            </div>

            <div>
                <div style={{ display: "flex", gap: '1rem', alignItems: "center" }}>
                    {seenReply.fromUser ? <>{getNiceUsername("u/", seenReply.fromUser)}</> : <p>u/CommentUser</p>}

                    <p style={{ fontWeight: "bold" }}>replying to @{seenReply?.replyingTo}</p>

                    <p className='timeText'>{<Moment fromNow>{seenReply.datePosted}</Moment>}</p>
                </div>


                <p>message: {seenReply.message}</p>

                {seenReply.fromUser?.id && <MakeReply fromReply={true} seenCommentId={seenReply.commentId} replyingTo={seenReply.fromUser.id} />}
            </div>
        </div>
    )
}
