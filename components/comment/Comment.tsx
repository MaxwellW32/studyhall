"use client"

import { comment, reply } from '@/types'
import React, { useState } from 'react'
import Moment from 'react-moment'
import MakeReply from '../reply/MakeReply'
import DisplayAllReplies from '../reply/DisplayAllReplies'
import { useQuery } from "@tanstack/react-query"
import { getAllCommentReplies } from '@/utility/serverFunctions/handleReplies'

export default function Comment({ seenComment }: { seenComment: comment }) {

    const [getReplies, getRepliesSet] = useState(false)

    const { data: replies, isLoading, error } = useQuery<reply[]>({
        queryKey: ["seenReplies"],
        enabled: getReplies,
        queryFn: async () => await getAllCommentReplies(seenComment.id),
        refetchOnWindowFocus: false
    })

    if (error) return <p>Couldn't fetch replies</p>


    return (
        <div>
            <p> comment id{seenComment.id}</p>
            <p>from: {seenComment.fromUser?.username}</p>
            <p>posted: {<Moment fromNow>{seenComment.datePosted}</Moment>}</p>
            <p>likes: {seenComment.likes}</p>
            <p>message: {seenComment.message}</p>
            <p>from post: {seenComment.postId}</p>

            <MakeReply seenCommentId={seenComment.id} replyingToUserId={seenComment.userId} />

            {getReplies ? (
                <>
                    {replies && <DisplayAllReplies replies={replies} />}
                </>
            ) : (
                <>
                    {seenComment.replies && <DisplayAllReplies replies={seenComment.replies} />}
                </>
            )}

            {!getReplies && <button onClick={() => getRepliesSet(true)}>Show More Replies</button>}
        </div>
    )
}
