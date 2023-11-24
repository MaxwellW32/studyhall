import { comment } from '@/types'
import React from 'react'
import Comment from './Comment'

export default function DisplayAllComments({ comments, commentPages }: { comments?: comment[], commentPages?: comment[][] }) {
    return (
        <div style={{ backgroundColor: "#777", padding: "1rem", borderRadius: "1rem", marginTop: "1rem", display: "grid", gap: "1rem" }}>
            {comments ? comments.map(eachComment => {
                return (
                    <Comment key={eachComment.id} seenComment={eachComment} />
                )
            }) : commentPages?.map(eachCommentArr => {
                return eachCommentArr.map(eachComment => {
                    return (
                        <Comment key={eachComment.id} seenComment={eachComment} />
                    )
                })
            })}
        </div>
    )
}
