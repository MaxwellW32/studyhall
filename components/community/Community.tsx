"use client"
import { community, post } from '@/types'
import React, { Fragment, useEffect, useMemo, useState } from 'react'
import styles from "./style.module.css"
import MakePost from '../post/MakePost'
import {
  useInfiniteQuery,
  useMutation, useQuery, useQueryClient,
} from "@tanstack/react-query"
import { deleteCommunity, getCommunityMembers, joinCommunity } from "@/utility/serverFunctions/handleCommunities";
import { getTopPosts } from '@/utility/serverFunctions/handlePosts'
import { useInView } from 'react-intersection-observer'
import Link from 'next/link'
import { signIn, useSession } from 'next-auth/react';
import getNiceUrl from '@/utility/useful/getNiceUrl'
import { toast } from 'react-hot-toast'
import Post from '../post/Post'
import { useRouter } from 'next/navigation'
import getNiceUsername from '@/utility/useful/getNiceUsername'
import { isAMemberOfCommunity, saveCommunitiesJoined } from '@/utility/savestorage'

export default function Community({ seenCommunity, fullScreen = true }: { seenCommunity: community, fullScreen?: boolean }) {
  const queryClient = useQueryClient()
  const { ref, inView } = useInView()
  const { data: session } = useSession()
  const router = useRouter()

  const [postLimit] = useState(50)

  const searchPosts = async ({ pageParam }: { pageParam: number }) => {
    //param is the post offset
    const seenPosts = await getTopPosts(seenCommunity.id, postLimit, pageParam)

    return seenPosts
  }

  const { data: postsData, error: postsError, fetchNextPage, hasNextPage, } = useInfiniteQuery({
    queryKey: ['posts', seenCommunity.id],
    enabled: fullScreen,
    initialData: () => {
      if (seenCommunity.posts) {
        return {
          pageParams: [0],
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

      return postCount + (postLimit - 1)
    },
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (hasNextPage && inView) {
      fetchNextPage()
    }
  }, [inView, hasNextPage])

  // const { data: members, isLoading, error } = useQuery({
  //   queryKey: ["members", seenCommunity.id, memberOffset],
  //   queryFn: async () => await getAllCommunities(communityLimit, communityOffset),
  //   refetchOnWindowFocus: false
  // })

  const [memberLimit] = useState(15)

  const [ViewCommunityMembers, ViewCommunityMembersSet] = useState(false)

  const searchMembers = async ({ pageParam }: { pageParam: number }) => {
    //param is the post offset
    const seenMembers = await getCommunityMembers(seenCommunity.id, memberLimit, pageParam)

    return seenMembers
  }

  const { data: membersData, error: membersError, fetchNextPage: fetchMembersNextPage, hasNextPage: MembersHasNextPage, } = useInfiniteQuery({
    queryKey: ['members', seenCommunity.id],
    enabled: ViewCommunityMembers,
    initialPageParam: 0,
    queryFn: searchMembers,
    getNextPageParam: (prevData, allPages) => {
      let memberCount = 0

      allPages.forEach(eachMEmberArr => {
        eachMEmberArr.forEach(eachMember => {
          if (eachMember.userId) {
            memberCount++
          }
        })
      })

      if (memberCount < memberLimit) {
        return undefined
      }

      return memberCount + (memberLimit - 1)
    },
    refetchOnWindowFocus: false,
  })


  const { mutate: deleteCommunityMutation } = useMutation({
    mutationFn: deleteCommunity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seenCommunities"] })
    },
    onError: (err) => {
    }
  })

  const [viewingSettings, viewingSettingsSet] = useState(false)

  const [isAMember, isAMemberSet] = useState(false)
  useEffect(() => {
    if (session) {
      isAMemberSet(isAMemberOfCommunity(seenCommunity.id, session.user.id))
    }

  }, [seenCommunity])

  return (
    <div className={styles.communityMainDiv} style={{ borderRadius: "2rem", display: "grid", padding: "1rem" }}>
      {seenCommunity && !fullScreen && <Link className='showUnderline' href={getNiceUrl("community", seenCommunity.id, seenCommunity.name)}>sh/{seenCommunity.name}</Link>}

      {fullScreen &&
        <div style={{ backgroundColor: "#888", padding: "1rem", display: "grid", marginBottom: "2rem" }}>

          {seenCommunity.userId === session?.user.id &&
            <div style={{ justifySelf: 'flex-end', display: "flex", gap: "1rem", position: "relative" }}>
              <svg onClick={() => viewingSettingsSet(prev => !prev)} xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z" /></svg>

              {viewingSettings && (
                <div style={{ display: "grid", gap: "1rem", backgroundColor: "#aaa", position: "absolute", top: "2rem", right: 0, width: "min(400px, 100vw)", justifyItems: "center", padding: "2rem 1rem", borderRadius: "1rem" }}>
                  <Link href={`/newCommunity/edit/${seenCommunity.id}`}>
                    <button>Update community</button>
                  </Link>

                  <Link href={`/newCommunity/edit/${seenCommunity.id}`}>
                    <button>Delete community</button>
                  </Link>
                </div>
              )}
            </div>
          }

          <h3>Welcome to {seenCommunity.name}</h3>

          <p style={{ maxWidth: "700px", marginBottom: "1rem" }}>{seenCommunity.description}</p>

          <div style={{ justifySelf: "flex-end", display: "grid", justifyItems: "center", position: "relative" }}>
            {ViewCommunityMembers && (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", height: "70vh", width: "min(300px, 70%)", position: "fixed", top: "50%", left: "50%", translate: "-50% -40%", backgroundColor: "#222", padding: "1rem", overflowY: "auto", borderRadius: "1rem", }}>
                <svg onClick={(() => ViewCommunityMembersSet(false))} style={{ marginLeft: "auto" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" /></svg>

                {membersData?.pages &&
                  membersData.pages.map(eachMemberArr => {

                    if (eachMemberArr.length > 0) {

                      return eachMemberArr.map(eachMember => (
                        <div key={eachMember.userId}>
                          {getNiceUsername("u/", eachMember.user)}
                        </div>
                      ))
                    }
                  })
                }

                {MembersHasNextPage && <p style={{ marginTop: "auto" }} onClick={() => fetchMembersNextPage()}>Load More</p>}
              </div>
            )}

            {seenCommunity.memberCount > 0 && <p className='showUnderline' style={{ justifySelf: "center" }} onClick={() => ViewCommunityMembersSet(prev => !prev)}>{seenCommunity.memberCount} {seenCommunity.memberCount > 1 ? "Members" : "Member"}</p>}

            {isAMember ? (
              <button>
                Subscribed
              </button>
            ) : (
              <button onClick={() => {
                if (!session) return signIn()

                saveCommunitiesJoined(seenCommunity.id, session.user.id)
              }}>Subscribe</button>
            )}
          </div>
        </div>
      }

      {postsData?.pages &&
        <div className={styles.DisplayAllPostsMainDiv} style={{ display: "grid", gap: "1rem" }}>
          {postsData.pages.map(eachPostArr => {

            if (eachPostArr.length > 0) {

              return (fullScreen ? eachPostArr : eachPostArr.slice(0, 3)).map(eachPost => (
                <div key={eachPost.id} onClick={(e) => { e.stopPropagation(); router.push(getNiceUrl("post", eachPost.id, eachPost.title)) }}>
                  <Post seenPost={eachPost} fullScreen={false} />
                </div>
              ))
            }
          })}
        </div>
      }

      {(postsData && postsData.pages[0].length === 0) && <p style={{ color: "gold" }}>Make The First Post!😊</p>}

      {((postsData && postsData.pages[0].length === 0) || fullScreen) && <MakePost passedCommunity={seenCommunity} passedStudySession={null} />}

      {fullScreen &&
        <>
          {/* //hidden button to reload */}
          <div style={{ translate: "0px -400px", opacity: 0, userSelect: "none", pointerEvents: "none" }} ref={ref}></div>

          {!hasNextPage && <h3 style={{ textAlign: "center", padding: "1rem" }}>Time to add more posts 😅</h3>}
        </>
      }
    </div>
  )
}

