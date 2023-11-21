import { post } from '@/types'
import React from 'react'
import Post from './Post'
import styles from "./style.module.css"

const previewStyles = {
    display: "grid"
}
export default function DisplayAllPosts({ posts, inPreviewMode }: { posts: post[], inPreviewMode?: boolean }) {

    return (
        <div className={styles.DisplayAllPostsMainDiv} style={{ ...(inPreviewMode ? previewStyles : {}) }}>
            {posts.map(eachPost => {
                return (
                    <Post seenPost={eachPost} key={eachPost.id} inPreviewMode={inPreviewMode} />
                )
            })}
        </div>
    )
}
