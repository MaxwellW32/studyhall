"use client"

import { comment, reply } from '@/types'
import React, { useState } from 'react'
import Moment from 'react-moment'
import MakeReply from '../reply/MakeReply'
import DisplayAllReplies from '../reply/DisplayAllReplies'
import { useQuery } from "@tanstack/react-query"
import { getCommentReplies } from '@/utility/serverFunctions/handleReplies'

export default function Comment({ seenComment }: { seenComment: comment }) {

    const [replyOffset, replyOffsetSet] = useState(1)

    const { data: replies, isLoading, error } = useQuery<reply[]>({
        queryKey: ["seenReplies", seenComment.id, replyOffset],
        queryFn: async () => await getCommentReplies(seenComment.id, replyOffset),
        refetchOnWindowFocus: false
    })

    if (error) return <p>Couldn&apos;t fetch replies</p>

    return (
        <div style={{ paddingLeft: "2rem" }}>
            <p> comment id{seenComment.id}</p>
            <p>from: {seenComment.fromUser?.username}</p>
            <p>posted: {<Moment fromNow>{seenComment.datePosted}</Moment>}</p>
            <p>likes: {seenComment.likes}</p>
            <p>message: {seenComment.message}</p>
            <p>from post: {seenComment.postId}</p>

            <MakeReply seenCommentId={seenComment.id} replyingToUserId={seenComment.userId} />

            <div style={{ paddingLeft: "1rem" }}>
                {replies && (
                    <>
                        <DisplayAllReplies replies={replies} />
                        <button onClick={() => replyOffsetSet(prev => prev + 15)}>Show More Replies</button>
                    </>
                )}
            </div>
        </div>
    )
}
