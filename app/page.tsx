"use client"

import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { getAllCommunities } from "@/utility/serverFunctions/handleCommunities";
import { community } from "@/types";
import Community from "@/components/community/Community";
import { useRouter } from 'next/navigation'
import getNiceUrl from "@/utility/useful/getNiceUrl";
import toast from 'react-hot-toast';
import { validateUserCommunitiesJoinedObj } from "@/utility/savestorage";
import { useSession } from "next-auth/react";
import { authOptions } from "@/lib/auth/auth-options";
// import deleteAll from "@/utility/serverFunctions/handleAll";

export default function App() {
  const router = useRouter()
  const { data: session } = useSession()


  useEffect(() => {
    if (session) {
      validateUserCommunitiesJoinedObj(session.user.id)
    }

  }, [])
  const [communityLimit] = useState(50)


  const searchCommunities = async ({ pageParam }: { pageParam: number }) => {
    console.log(`$pageParam`, pageParam);
    const seenCommunities = await getAllCommunities(communityLimit, pageParam)

    return seenCommunities
  }

  const { data: communityData, error: communityError, isLoading: communityIsLoading, fetchNextPage, hasNextPage, } = useInfiniteQuery({
    queryKey: ["communities"],
    initialPageParam: 0,
    queryFn: searchCommunities,
    getNextPageParam: (prevData, allPages) => {
      let communityCount = 0

      allPages.forEach(eachCommunityArr => {
        eachCommunityArr.forEach(eachCommunity => {
          if (eachCommunity.id) {
            communityCount++
          }
        })
      })

      if (communityCount < communityLimit) {
        return undefined
      }

      return communityCount + (communityLimit - 1)
    },
    refetchOnWindowFocus: false,
  })

  if (communityIsLoading) return <div>Loading...</div>

  if (communityError) {
    toast.error(communityError.message)
    return <div>{communityError.message}</div>
  }


  return (
    <main style={{ padding: "0rem 1rem 5rem 1rem", display: "grid" }}>
      <button style={{ justifySelf: "flex-end", margin: "1rem" }} onClick={() => router.push("/newCommunity")}>
        Add a community
      </button>

      {communityData?.pages &&
        <div style={{ display: "grid", gap: "3rem" }}>
          {communityData.pages.map(eachCommunityArr => {

            if (eachCommunityArr.length > 0) {
              return eachCommunityArr.map(eachCommunity => {

                return (
                  <div key={eachCommunity.id} onClick={() => { router.push(getNiceUrl("community", eachCommunity.id, eachCommunity.name)) }}>
                    <Community seenCommunity={eachCommunity} fullScreen={false} />
                  </div>
                )
              })
            }
          })}
        </div>
      }


      <button onClick={() => { fetchNextPage() }}>Get more</button>
    </main>
  )
}

























{/* <button onClick={()=>deleteAll()}>Deleting all</button> */ }