import { comment } from '@/types'
import React from 'react'
import Comment from './Comment'

export default function DisplayAllComments({ comments }: { comments: comment[] }) {
    console.log(`$c`, comments);
    return (
        <>
            {comments.length > 0 &&
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
            }
        </>
    )
}
