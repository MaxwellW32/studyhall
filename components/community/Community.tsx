"use client"
import { community, post, usablePost } from '@/types'
import React, { useEffect, useState } from 'react'
import styles from "./style.module.css"
import DisplayPost from '../post/Post'
import MakePost from '../post/MakePost'
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import DisplayAllPosts from '../post/DisplayAllPosts'
import { getPostsFromCommunity } from '@/utility/serverFunctions/handlePosts'

export default function Community({ seenCommunity, inPreviewMode = false }: { seenCommunity: community, inPreviewMode?: boolean }) {

  const [posts, postsSet] = useState<usablePost[] | undefined>()

  useEffect(() => {
    const loadPosts = async () => {
      let seenPosts: post[] = await getPostsFromCommunity(seenCommunity.id)

      seenPosts.forEach(eachPost => {
        if (eachPost.imageUrls) eachPost.imageUrls = JSON.parse(eachPost.imageUrls)
        if (eachPost.videoUrls) eachPost.videoUrls = JSON.parse(eachPost.videoUrls)
      })

      postsSet(seenPosts as usablePost[])
    }
    loadPosts()
  }, [])
  return (
    <div className={styles.communityMainDiv} style={{ minHeight: inPreviewMode ? "auto" : "100vh", borderRadius: inPreviewMode ? "2rem" : "0px" }}>
      {inPreviewMode ? (
        <>
          <div style={{ display: "grid", gap: "1rem" }}>
            <p>Name: {seenCommunity.name}</p>
            <p>Description: {seenCommunity.description}</p>
            <p>Top 3 Posts</p>
          </div>
        </>
      ) : (
        <>
          <p>Hey there welcome to {seenCommunity.name}</p>
          <p>Description: {seenCommunity.description}</p>
          {/* fetch data show resutls as post */}
          {/* <DisplayPost seenPost={}/> */}
          <br />
          <br />
          <br />

          {posts && <DisplayAllPosts posts={posts} />}

          <MakePost passedCommunityId={seenCommunity.id} passedStudySessionId={null} />
        </>
      )}
    </div>
  )
}
