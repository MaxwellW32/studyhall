import { usablePost } from '@/types'
import React from 'react'
import Post from './Post'
import styles from "./style.module.css"

export default function DisplayAllPosts({ posts }: { posts: usablePost[] }) {
    return (
        <div className={styles.DisplayAllPostsMainDiv}>
            <p>Displaying seen posts</p>

            {posts.map(eachPost => {
                return (
                    <Post seenPost={eachPost} key={eachPost.id} />
                )
            })}

        </div>
    )
}
