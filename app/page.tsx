"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect, useRef } from "react"
import { addCommunity, deleteCommunity, getAllCommunities, updateCommunity } from "@/utility/serverFunctions/handleCommunities";
import { ZodError } from "zod-validation-error";
import { community } from "@/types";
import { v4 as uuidv4 } from "uuid"
import Community from "@/components/community/Community";
import { addUser, updateUser } from "@/utility/serverFunctions/handleUsers";
import { useRouter } from 'next/navigation'
import useSeenErrors from "@/utility/useful/useSeenErrors";
// import { signOut } from 'next-auth/react';

export default function App() {
  const queryClient = useQueryClient()
  const router = useRouter()

  const [seenErrInput, seenErrInputSet] = useState<Error | ZodError | undefined>()
  const seenErrors = useSeenErrors(seenErrInput)

  const [communityOffset, communityOffsetSet] = useState(0)
  const [communityLimit, communityLimitSet] = useState(50)


  const { data: communities, isLoading, error } = useQuery({
    queryKey: ["seenCommunities", communityLimit, communityOffset],
    queryFn: async () => await getAllCommunities(communityLimit, communityOffset),
    refetchOnWindowFocus: false
  })

  const { mutate: addCommunityMutation } = useMutation({
    mutationFn: addCommunity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seenCommunities"] })
    },
    onError: (err: Error | ZodError) => {
      seenErrInputSet(err)
    }
  })

  const { mutate: updateCommunityMutation } = useMutation({
    mutationFn: updateCommunity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seenCommunities"] })
    },
    onError: (err) => {
      seenErrInputSet(err)
    }
  })

  const { mutate: deleteToDoMutation } = useMutation({
    mutationFn: deleteCommunity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seenCommunities"] })
    },
    onError: (err) => {
      seenErrInputSet(err)
    }
  })


  if (isLoading) return <div>Loading...</div>

  if (error) return <div>{error.message}</div>

  return (
    <main>
      {seenErrors}

      <h1>Study Hall</h1>

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