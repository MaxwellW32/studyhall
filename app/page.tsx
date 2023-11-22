"use client"

import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { getAllCommunities } from "@/utility/serverFunctions/handleCommunities";
import { community } from "@/types";
import Community from "@/components/community/Community";
import { useRouter } from 'next/navigation'
import Link from "next/link";

export default function App() {
  const router = useRouter()

  const [communityOffset, communityOffsetSet] = useState(0)
  const [communityLimit, communityLimitSet] = useState(50)

  const { data: communities, isLoading, error } = useQuery({
    queryKey: ["seenCommunities", communityLimit, communityOffset],
    queryFn: async () => await getAllCommunities(communityLimit, communityOffset),
    refetchOnWindowFocus: false
  })

  if (isLoading) return <div>Loading...</div>

  if (error) return <div>{error.message}</div>

  if (!communities) return <div>No Communities</div>

  return (
    <main>
      <h1>Study Hall</h1>

        <Link href={"/newCommunity"}>
      <button>
      Add a community
      </button>
        </Link>

      <div style={{ display: "grid", gap: "1rem" }}>
        {communities?.map((eachCommunity: community) => {
          return (
            <div key={eachCommunity.id} onClick={() => { router.push(`/community/${eachCommunity.id}/${eachCommunity.name.toLowerCase().replace(/ /g, '_')}`) }}>
              <Community seenCommunity={eachCommunity} inPreviewMode={true} />
            </div>
          )
        })}
      </div>
    </main>
  )
}




















// <button onClick={() => {
//         addCommunityMutation({
//           id: uuidv4(),
//           description: "second community",
//           name: "Second community",
//           userId: "b4aa351c-3f84-4b73-b581-ef5836fdf500"
//         })
//       }}>Submit new community</button>

//       <button onClick={() =>
//         updateCommunityMutation({
//           id: " ",
//           description: "brand new community",
//           name: "First community",
//           userId: "b4aa351c-3f84-4b73-b581-ef5836fdf500"
//         })}
//       >Submit update community</button>

      
//             <button onClick={() =>
//                 deleteToDoMutation({
//                     id: selectedID,
//                 })}
//             >Submit delete todo</button>

//       <button onClick={() => {
//         addUser({
//           id: "b4aa351c-3f84-4b73-b581-ef5836fdf500",
//           username: `AdminMax`,
//           firstName: "Maxwell",
//           lastName: null,
//           password: "mmm",
//           email: null
//         })
//       }}>add new user</button>

//       <button onClick={() => {
//         updateUser({
//             id: "b4aa351c-3f84-4b73-b581-ef5836fdf500",
//             username: "AdminMax",
//             firstName: "Maxwell",
//             lastName: null
//         })
//       }}>update user</button>