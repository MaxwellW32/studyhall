import { comment } from '@/types'
import React from 'react'
import Moment from 'react-moment'

export default function Comment({ seenComment }: { seenComment: comment }) {
    return (
        <div>
            <p> comment id{seenComment.id}</p>
            <p>from: {seenComment.fromUser?.username}</p>
            <p>posted: {<Moment fromNow>{seenComment.datePosted}</Moment>}</p>
            <p>likes: {seenComment.likes}</p>
            <p>message: {seenComment.message}</p>
            <p>from post: {seenComment.postId}</p>
        </div>
    )
}
