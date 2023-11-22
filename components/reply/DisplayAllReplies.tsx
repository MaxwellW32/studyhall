import { reply } from '@/types'
import React from 'react'
import Reply from './Reply'

export default function DisplayAllReplies({ replies }: { replies: reply[] }) {
    return (
        <div>
            <p>Replies:</p>

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
