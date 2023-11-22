import { comment } from '@/types'
import React from 'react'
import Comment from './Comment'

export default function DisplayAllComments({ comments }: { comments: comment[] }) {
    return (
        <div>
            <h2>comments:</h2>

            <div>
                {comments.map(eachComment => {
                    return (
                        <Comment key={eachComment.id} seenComment={eachComment} />
                    )
                })}
            </div>
        </div>
    )
}
