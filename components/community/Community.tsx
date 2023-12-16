"use client"
import { community, post } from '@/types'
import React, { Fragment, useEffect, useMemo, useState } from 'react'
import styles from "./style.module.css"
import MakePost from '../post/MakePost'
import {
  useInfiniteQuery,
  useMutation, useQuery, useQueryClient,
} from "@tanstack/react-query"
import { deleteCommunity, getCommunityMembers, getSpecificCommunity, isAMemberOfCommunity, joinCommunity } from "@/utility/serverFunctions/handleCommunities";
import { getTopPosts } from '@/utility/serverFunctions/handlePosts'
import { useInView } from 'react-intersection-observer'
import Link from 'next/link'
import { signIn, useSession } from 'next-auth/react';
import getNiceUrl from '@/utility/useful/getNiceUrl'
import { toast } from 'react-hot-toast'
import Post from '../post/Post'
import { useRouter } from 'next/navigation'
import getNiceUsername from '@/utility/useful/getNiceUsername'
import { screenSizeGlobal } from '../home/AtomLoader'
import { useAtom } from 'jotai'

export default function Community({ seenCommunity, fullScreen = true }: { seenCommunity: community, fullScreen?: boolean }) {
  const queryClient = useQueryClient()
  const { ref, inView } = useInView()
  const { data: session } = useSession()
  const router = useRouter()
  const [screenSize,] = useAtom(screenSizeGlobal)



  const { data: communityData, isLoading: communityIsLoading, error: communityError } = useQuery({
    initialData: seenCommunity,
    queryKey: ["community", seenCommunity.id],
    queryFn: async () => getSpecificCommunity(seenCommunity.id),
    staleTime: Infinity
  })

  const { mutate: joinCommunityMutation } = useMutation({
    mutationFn: joinCommunity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community", seenCommunity.id] })
    },
    onError: (err: Error) => {
      toast.error(err.message)
    }
  })

  const [isAMember, isAMemberSet] = useState<boolean>()

  //check if member
  useEffect(() => {
    if (!communityData) return
    const checkIfMember = async () => {
      isAMemberSet(await isAMemberOfCommunity(communityData.id))
    }
    checkIfMember()

  }, [communityData])


  const [postLimit] = useState(30)

  const searchPosts = async ({ pageParam }: { pageParam: number }) => {
    //param is the post offset
    const seenPosts = await getTopPosts(seenCommunity.id, postLimit, pageParam)

    return seenPosts
  }
  const { data: postsData, error: postsError, fetchNextPage, hasNextPage, } = useInfiniteQuery({
    queryKey: ['posts', seenCommunity.id],
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

      if (prevData.length == 0) {
        return undefined
      }

      let postCount = allPages.reduce((accumulator, eachPostArray) => accumulator + eachPostArray.length, 0)

      return postCount
    },
    refetchOnWindowFocus: false,
    staleTime: Infinity
  })

  //fetch more posts in view
  useEffect(() => {
    if (hasNextPage && inView) {
      fetchNextPage()
    }
  }, [inView, hasNextPage])



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
      queryClient.invalidateQueries({ queryKey: ["communities"] })
      toast.success("Successfully deleted community")
    },
    onError: (err) => {
      toast.error(err.message)
    }
  })

  const [viewingSettings, viewingSettingsSet] = useState(false)

  const [userWantsToDelete, userWantsToDeleteSet] = useState(false)

  if (communityData === undefined) return <p>Not seeing community</p>

  return (
    <div className={styles.communityMainDiv} style={{ borderRadius: "2rem", display: "grid", padding: !screenSize.phone ? "1rem" : "1rem 0rem 0rem 0rem" }}>
      {communityData && !fullScreen && <Link style={{ margin: screenSize.phone ? "0rem 1rem 1rem 1rem" : "0rem 1rem 1rem 0rem", fontWeight: "bold" }} className='showUnderline' href={getNiceUrl("community", communityData.id, communityData.name)}>sh/{communityData.name}</Link>}

      {fullScreen &&
        <div style={{ backgroundColor: "#888", padding: "1rem", display: "grid", marginBottom: "2rem", position: "relative" }}>
          {viewingSettings && (
            <div style={{ display: "grid", gap: "1rem", backgroundColor: "#aaa", position: "absolute", top: "0px", right: "0px", width: "min(400px, 100%)", justifyItems: "center", padding: "2rem 1rem", borderBottomLeftRadius: "1rem", zIndex: 1 }}>
              <Link href={`/newCommunity/edit/${communityData.id}`}>
                <button>Update community</button>
              </Link>

              <button onClick={() => { userWantsToDeleteSet(true) }}>Delete community</button>
              {userWantsToDelete &&
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <p style={{ gridColumn: "1/-1" }}>Are you sure you want to delete?</p>
                  <button onClick={() => { deleteCommunityMutation({ id: communityData.id }) }}>Yes</button>
                  <button onClick={() => userWantsToDeleteSet(false)}>No</button>
                </div>
              }
            </div>
          )}

          {communityData.userId === session?.user.id &&
            <div style={{ justifySelf: 'flex-end', display: "flex", gap: "1rem", position: "relative" }}>
              <svg style={{ zIndex: 2, position: "relative" }} onClick={() => viewingSettingsSet(prev => !prev)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z" /></svg>
            </div>
          }

          <h3>Welcome to {communityData.name}</h3>

          <p style={{ maxWidth: "700px", marginBottom: "1rem" }}>{communityData.description}</p>

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

            {communityData.memberCount > 0 && <p className='showUnderline' style={{ justifySelf: "center" }} onClick={() => ViewCommunityMembersSet(prev => !prev)}>{communityData.memberCount} {communityData.memberCount > 1 ? "Members" : "Member"}</p>}


            {isAMember !== undefined && <>
              {isAMember ? (
                <button>
                  Subscribed
                </button>
              ) : (
                <button onClick={() => {
                  if (!session) return signIn()

                  joinCommunityMutation(communityData.id)
                }}>Subscribe</button>
              )}
            </>}
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

      {(postsData && postsData.pages[0].length === 0) && <p style={{ color: "gold", margin: !screenSize.desktop ? "1rem" : "" }}>Make The First Post!😊</p>}

      {((postsData && postsData.pages[0].length === 0) || fullScreen) && <MakePost passedCommunity={communityData} passedStudySession={null} />}

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

