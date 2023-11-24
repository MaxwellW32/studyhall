"use client"
import { community, post } from '@/types'
import React, { Fragment, useEffect, useState } from 'react'
import styles from "./style.module.css"
import MakePost from '../post/MakePost'
import {
  useInfiniteQuery,
  useMutation, useQuery, useQueryClient,
} from "@tanstack/react-query"
import DisplayAllPosts from '../post/DisplayAllPosts'
import { deleteCommunity } from "@/utility/serverFunctions/handleCommunities";
import { getTopPosts } from '@/utility/serverFunctions/handlePosts'
import { useInView } from 'react-intersection-observer'
import Link from 'next/link'
import { useSession } from 'next-auth/react';
import getNiceUrl from '@/utility/useful/getNiceUrl'

export default function Community({ seenCommunity, inPreviewMode }: { seenCommunity: community, inPreviewMode?: boolean }) {
  const queryClient = useQueryClient()
  const { ref, inView } = useInView()

  const [postLimit] = useState(2)

  const [canStartFetchingPosts, canStartFetchingPostsSet] = useState(false)

  const searchPosts = async ({ pageParam }: { pageParam: number }) => {
    //param is the post offset
    const seenPosts = await getTopPosts(seenCommunity.id, postLimit, pageParam)

    return { numCount: pageParam, seenPosts: seenPosts }
  }

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['seenPosts'],
    // initialData: {numCount: 0, seenPosts: seenCommunity.posts},
    initialPageParam: 0,//offset start
    queryFn: searchPosts,
    getNextPageParam: (prevData, allPages) => {
      return prevData.numCount + postLimit
    },
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

  useEffect(() => {
    const moreRecordsSeen = data && data.pages[data.pages.length - 1].seenPosts.length > 0
    if (inView && moreRecordsSeen) {
      fetchNextPage()

    }
  }, [inView])

  return (
    <div className={styles.communityMainDiv} style={{ minHeight: inPreviewMode ? "auto" : "100vh", borderRadius: inPreviewMode ? "2rem" : "0px", display: "grid" }}>
      {inPreviewMode ? (
        <div style={{ display: "grid", gap: "1rem", padding: "1rem" }}>

          <Link className='showUnderline' style={{ display: "inline", justifySelf: "flex-start" }} href={getNiceUrl("community", seenCommunity.id, seenCommunity.name)}>
            sh/{seenCommunity.name}
          </Link>

          {seenCommunity.posts && <DisplayAllPosts normalPostArr={seenCommunity.posts} />}
        </div>
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

          {data?.pages && <DisplayAllPosts seenObjArr={data.pages} />}

          <MakePost passedCommunity={seenCommunity} passedStudySession={null} />

          {/* //hidden button to reload */}
          <div style={{ translate: "0px -400px", opacity: 0, userSelect: "none", pointerEvents: "none" }} ref={ref}></div>
          {data?.pages[data.pages.length - 1].seenPosts.length == 0 && <h3 style={{ textAlign: "center", padding: "1rem" }}>Time to add more posts 😅</h3>}
        </>
      )}
    </div>
  )
}

