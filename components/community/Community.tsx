"use client"
import { community } from '@/types'
import React, { useEffect, useState } from 'react'
import styles from "./style.module.css"
import DisplayPost from '../post/Post'
import MakePost from '../post/MakePost'
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import DisplayAllPosts from '../post/DisplayAllPosts'
// import { getPostsFromCommunity } from '@/utility/serverFunctions/handlePosts'
import { addCommunity, deleteCommunity, getAllCommunities, updateCommunity } from "@/utility/serverFunctions/handleCommunities";

export default function Community({ seenCommunity, inPreviewMode }: { seenCommunity: community, inPreviewMode?: boolean }) {
  const queryClient = useQueryClient()

  // const { data: posts, isLoading, error } = useQuery({
  //   queryKey: ["seenPosts"],
  //   queryFn: async () => await getPostsFromCommunity(seenCommunity.id).then(postArr => postArr.map(eachPost => {
  //     return { ...eachPost, imageUrls: eachPost.imageUrls ? JSON.parse(eachPost.imageUrls) : eachPost.imageUrls, videoUrls: eachPost.videoUrls ? JSON.parse(eachPost.videoUrls) : eachPost.videoUrls }
  //   })),
  //   refetchOnWindowFocus: false
  // })


  const { mutate: updateCommunityMutation } = useMutation({
    mutationFn: updateCommunity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seenCommunities"] })
    },
    onError: (err) => {
    }
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
          <p>Hey there welcome to {seenCommunity.name}</p>
          <p>Description: {seenCommunity.description}</p>

          {seenCommunity.posts && <DisplayAllPosts posts={seenCommunity.posts} />}

          <MakePost passedCommunityId={seenCommunity.id} passedStudySessionId={null} />
        </>
      )}
    </div>
  )
}
