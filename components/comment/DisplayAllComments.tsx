import { comment } from '@/types'
import React from 'react'
import Comment from './Comment'

export default function DisplayAllComments({ comments }: { comments: comment[] }) {
    return (
        <div style={{ backgroundColor: "#777", padding: "1rem", borderRadius: "1rem", marginTop: "1rem", display: comments.length > 0 ? "grid" : "none", gap: "1rem" }}>

            {comments.map(eachComment => {
                return (
                    <Comment key={eachComment.id} seenComment={eachComment} />
                )
            })}

            <p style={{ fontStyle: 'italic' }}>More Comments</p>
        </div>
    )
}
