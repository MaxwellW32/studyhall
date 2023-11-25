import { reply } from '@/types'
import React from 'react'
import Reply from './Reply'

export default function DisplayAllReplies({ replies }: { replies: reply[] }) {
    return (
        <div style={{ borderRadius: "1rem", display: "grid", gap: "1rem" }}>
            {replies.map(eachReply => {
                return (
                    <Reply key={eachReply.id} seenReply={eachReply} />
                )
            })}
        </div>
    )
}
