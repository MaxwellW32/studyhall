import { post } from '@/types'
import React from 'react'
import Post from './Post'
import styles from "./style.module.css"

export default function DisplayAllPosts({ posts, inPreviewMode }: { posts: post[], inPreviewMode?: boolean }) {
    return (
        <div className={styles.DisplayAllPostsMainDiv}>
            <p>Displaying seen posts</p>

            {posts.map(eachPost => {
                return (
                    <Post seenPost={eachPost} key={eachPost.id} inPreviewMode={inPreviewMode} />
                )
            })}

        </div>
    )
}
