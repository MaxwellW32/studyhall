"use client"
import { reply } from '@/types'
import { getAllCommentReplies } from '@/utility/serverFunctions/handleReplies'
import React, { useState } from 'react'
import Moment from 'react-moment'
import MakeReply from './MakeReply'

export default function Reply({ seenReply }: { seenReply: reply }) {

    return (
        <div>
            <p>from: {seenReply.fromUser?.username}</p>
            <p>replying to: {seenReply.replyingToUser?.username}</p>

            <p>posted: {<Moment fromNow>{seenReply.datePosted}</Moment>}</p>
            <p>likes: {seenReply.likes}</p>
            <p>message: {seenReply.message}</p>

            {seenReply.fromUser?.id && <MakeReply seenCommentId={seenReply.commentId} replyingToUserId={seenReply.fromUser.id} />}
        </div>
    )
}
