"use client"
import { community, post } from '@/types'
import React, { Fragment, useEffect, useState } from 'react'
import styles from "./style.module.css"
import Post from '../post/Post'
import MakePost from '../post/MakePost'
import {
  useMutation, useQuery, useQueryClient, useInfiniteQuery,
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query"
import DisplayAllPosts from '../post/DisplayAllPosts'
// import { getPostsFromCommunity } from '@/utility/serverFunctions/handlePosts'
import { addCommunity, deleteCommunity, getAllCommunities, updateCommunity } from "@/utility/serverFunctions/handleCommunities";
import { getTopPosts } from '@/utility/serverFunctions/handlePosts'
import { useInView } from 'react-intersection-observer'
import Link from 'next/link'

export default function Community({ seenCommunity, inPreviewMode }: { seenCommunity: community, inPreviewMode?: boolean }) {
  const queryClient = useQueryClient()
  const { ref, inView } = useInView()

  const [postQueryEnabled, postQueryEnabledSet] = useState(false)

  const [postLimit, postLimitSet] = useState(seenCommunity.posts?.length ?? 1)
  const [postOffset, postOffsetSet] = useState(0)

  const { data: posts, isLoading, error: posterror } = useQuery({
    enabled: postQueryEnabled,
    queryKey: ["seenPosts", postLimit, postOffset],
    queryFn: async () => await getTopPosts(seenCommunity.id, postLimit, postOffset),
    refetchOnWindowFocus: false
  })

  const { mutate: deleteCommunityMutation } = useMutation({
    mutationFn: deleteCommunity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seenCommunities"] })
    },
    onError: (err) => {
    }
  })

  return (
    <div className={styles.communityMainDiv} style={{ minHeight: inPreviewMode ? "auto" : "100vh", borderRadius: inPreviewMode ? "2rem" : "0px" }}>
      {inPreviewMode ? (
        <>
          <div style={{ display: "grid", gap: "1rem" }}>
            <p>Name: {seenCommunity.name}</p>
            <p>Description: {seenCommunity.description}</p>

            <p>Top Posts</p>

            {seenCommunity.posts && <DisplayAllPosts posts={seenCommunity.posts} inPreviewMode={inPreviewMode} />}
          </div>
        </>
      ) : (
        <>
          <div>
            {/* community header options */}
            <Link href={`/newCommunity/edit/${seenCommunity.id}`}>Update community</Link>
            <Link href={`/newCommunity/edit/${seenCommunity.id}`}>Delete community</Link>
          </div>
          <p>Hey there welcome to {seenCommunity.name}</p>
          <p>Description: {seenCommunity.description}</p>


          {postQueryEnabled ? (
            <>
              {posts && <DisplayAllPosts posts={posts} />}
            </>
          ) : (
            <>
              {seenCommunity.posts && <DisplayAllPosts posts={seenCommunity.posts} />}
            </>
          )}

          <MakePost passedCommunityId={seenCommunity.id} passedStudySessionId={null} />

          <button onClick={() => {
            postQueryEnabledSet(true)
            postLimitSet(prev => prev + 2)
          }}>Load More</button>
        </>
      )}
    </div>
  )
}
