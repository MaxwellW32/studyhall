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
import { useInView } from "react-intersection-observer";
import { useAtom } from "jotai";
import { screenSizeGlobal } from "@/components/home/AtomLoader";
// import deleteAll from "@/utility/serverFunctions/handleAll";

export default function App() {
  const router = useRouter()
  const { data: session } = useSession()
  const { ref, inView } = useInView()
  const [screenSize,] = useAtom(screenSizeGlobal)

  //ensure storage obj is there for communities joined
  useEffect(() => {
    if (session) {
      validateUserCommunitiesJoinedObj(session.user.id)
    }

  }, [])

  const [communityLimit] = useState(20)

  const searchCommunities = async ({ pageParam }: { pageParam: number }) => {
    const seenCommunities = await getAllCommunities(communityLimit, pageParam)

    return seenCommunities
  }

  const { data: communityData, error: communityError, isLoading: communityIsLoading, fetchNextPage, hasNextPage: communityHasNextPage, } = useInfiniteQuery({
    queryKey: ["communities"],
    initialPageParam: 0,
    queryFn: searchCommunities,
    getNextPageParam: (prevData, allPages) => {

      if (prevData.length < communityLimit) {
        //check if last data matches what we expected
        return undefined
      }

      //count all comments for offset
      let communityCount = allPages.reduce((accumulator, eachCommunityArr) => accumulator + eachCommunityArr.length, 0);

      //future offset
      return communityCount
    },
    refetchOnWindowFocus: false,
  })

  //fetch more communities in view
  useEffect(() => {
    if (communityHasNextPage && inView) {
      fetchNextPage()
    }
  }, [inView, communityHasNextPage])

  if (communityIsLoading) return <div>Loading...</div>

  if (communityError) {
    toast.error(communityError.message)
    return <div>{communityError.message}</div>
  }

  return (
    <main style={{ padding: !screenSize.phone ? "0rem 1rem 5rem 1rem" : "", display: "grid" }}>
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


      {communityHasNextPage && <button onClick={() => { fetchNextPage() }}>Get more</button>}

      <>
        {/* //hidden button to reload */}
        <div style={{ translate: "0px -400px", opacity: 0, userSelect: "none", pointerEvents: "none" }} ref={ref}></div>

        {!communityHasNextPage && <h3 style={{ textAlign: "center", padding: "1rem" }}>Need more communities 😅</h3>}
      </>
    </main>
  )
}

























{/* <button onClick={()=>deleteAll()}>Deleting all</button> */ }