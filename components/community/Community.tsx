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

  const [postLimit] = useState(50)

  const searchPosts = async ({ pageParam }: { pageParam: number }) => {
    console.log(`$called with`, pageParam);
    //param is the post offset
    const seenPosts = await getTopPosts(seenCommunity.id, postLimit, pageParam)

    return seenPosts
  }

  const { data, error, fetchNextPage, hasNextPage, } = useInfiniteQuery({
    queryKey: ['posts'],
    initialData: () => {
      if (seenCommunity.posts) {
        return {
          pageParams: [seenCommunity.posts.length],
          pages: [seenCommunity.posts]
        }
      }
    },
    initialPageParam: seenCommunity.posts?.length ?? 0,//offset start
    queryFn: searchPosts,
    getNextPageParam: (prevData, allPages) => {
      let postCount = 0

      allPages.forEach(eachPostArr => {
        eachPostArr.forEach(eachPost => {
          if (eachPost.id) {
            postCount++
          }
        })
      })

      if (prevData.length == 0) {
        return undefined
      }

      console.log(`$end LINE`);
      return postCount + (postLimit - 1)
    },
    refetchOnWindowFocus: false,
    staleTime: 5000
  })

  console.log(`$data`, data);

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
    if (hasNextPage && inView) {
      console.log(`$called again`);
      fetchNextPage()
    }
  }, [inView, hasNextPage])

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

          {data?.pages && <DisplayAllPosts pagesArr={data.pages} />}

          <MakePost passedCommunity={seenCommunity} passedStudySession={null} />

          {/* //hidden button to reload */}
          <div style={{ translate: "0px -400px", opacity: 0, userSelect: "none", pointerEvents: "none" }} ref={ref}></div>

          {!hasNextPage && <h3 style={{ textAlign: "center", padding: "1rem" }}>Time to add more posts 😅</h3>}
        </>
      )}
    </div>
  )
}

