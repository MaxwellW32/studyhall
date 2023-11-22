import { reply } from '@/types'
import React from 'react'
import Reply from './Reply'

export default function DisplayAllReplies({ replies }: { replies: reply[] }) {
    return (
        <div>
            <h2>Replies:</h2>

            <div>
                {replies.map(eachReply => {
                    return (
                        <Reply key={eachReply.id} seenReply={eachReply} />
                    )
                })}
            </div>
        </div>
    )
}
