"use client"
import { community, post } from '@/types'
import React, { Fragment, useEffect, useState } from 'react'
import styles from "./style.module.css"
import MakePost from '../post/MakePost'
import {
  useMutation, useQuery, useQueryClient,
} from "@tanstack/react-query"
import DisplayAllPosts from '../post/DisplayAllPosts'
import { deleteCommunity } from "@/utility/serverFunctions/handleCommunities";
import { getTopPosts } from '@/utility/serverFunctions/handlePosts'
import { useInView } from 'react-intersection-observer'
import Link from 'next/link'
import getNiceUsername from '@/utility/useful/getNiceUsername'
import { useSession } from 'next-auth/react';
import getNiceUrl from '@/utility/useful/getNiceUrl'

export default function Community({ seenCommunity, inPreviewMode }: { seenCommunity: community, inPreviewMode?: boolean }) {
  const queryClient = useQueryClient()
  const { ref, inView } = useInView()

  const [postQueryEnabled, postQueryEnabledSet] = useState(false)

  const [postLimit, postLimitSet] = useState(seenCommunity.posts?.length ?? 1)
  const [postOffset, postOffsetSet] = useState(0)

  const { data: posts, isLoading, error } = useQuery({
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

  const { data: session } = useSession()

  return (
    <div className={styles.communityMainDiv} style={{ minHeight: inPreviewMode ? "auto" : "100vh", borderRadius: inPreviewMode ? "2rem" : "0px", display: "grid" }}>
      {inPreviewMode ? (
        <>
          <div style={{ display: "grid", gap: "1rem" }}>

            <Link className='showUnderline' style={{ display: "inline", justifySelf: "flex-start" }} href={getNiceUrl("community", seenCommunity.id, seenCommunity.name)}>
              sh/{seenCommunity.name}
            </Link>

            {seenCommunity.posts && <DisplayAllPosts posts={seenCommunity.posts} inPreviewMode={inPreviewMode} />}
          </div>
        </>
      ) : (
        <>
          <div style={{ backgroundColor: "#888", padding: "1rem", display: "grid", marginBottom: "2rem" }}>
            <h3>Welcome to {seenCommunity.name}</h3>

            <p style={{ maxWidth: "700px", marginBottom: "1rem" }}>{seenCommunity.description}</p>

            {seenCommunity.userId === session?.user.id && <div style={{ justifySelf: 'flex-end', display: "flex", gap: "1rem" }}>
              <Link href={`/newCommunity/edit/${seenCommunity.id}`}>
                <button>Update community</button>
              </Link>

              <Link href={`/newCommunity/edit/${seenCommunity.id}`}>
                <button>Delete community</button>
              </Link>
            </div>}
          </div>

          {postQueryEnabled ? (
            <>
              {posts && <DisplayAllPosts posts={posts} />}
            </>
          ) : (
            <>
              {seenCommunity.posts && <DisplayAllPosts posts={seenCommunity.posts} />}
            </>
          )}

          <MakePost passedCommunity={seenCommunity} passedStudySession={null} />

          <button style={{ marginTop: "3rem" }} onClick={() => {
            postQueryEnabledSet(true)
            postLimitSet(prev => prev + 2)
          }}>More Posts</button>
        </>
      )}
    </div>
  )
}
