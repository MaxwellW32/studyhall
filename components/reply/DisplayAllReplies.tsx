import { reply } from '@/types'
import React from 'react'
import Reply from './Reply'

export default function DisplayAllReplies({ replies }: { replies: reply[] }) {
    return (
        <div style={{ backgroundColor: "#333", padding: '1rem', borderRadius: "1rem", display: replies.length > 0 ? "block" : "none" }}>
            {replies.map(eachReply => {
                return (
                    <Reply key={eachReply.id} seenReply={eachReply} />
                )
            })}

            <p className='wordLink'>more replies</p>
        </div>
    )
}
