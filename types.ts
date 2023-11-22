import { z } from "zod";
//remember that sql values are nullable by default
// have to state that you want nullable values in Z.schema


//community
export const communitySchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    memberCount: z.number(),
    description: z.string().min(1),
    userId: z.string()
})
export type community = z.infer<typeof communitySchema> & {
    createdBy?: user,
    posts?: post[],
    members?: user[],
    tags?: tag[]
}

export type newCommunity = Omit<community, "id" | "memberCount" | "userId">









//study sessions
export const studySessionSchema = z.object({
    id: z.string().min(1),
    userId: z.string().min(1),
    name: z.string().min(1),
    authorizedMemberList: z.string().min(1).nullable()
})
export type studySession = z.infer<typeof studySessionSchema> & {
    createdBy?: user,
    posts?: post[],
    members?: user[],
}







export const userSchema = z.object({
    id: z.string().min(1),
    username: z.string().min(1),
    email: z.string().min(1),
    createdAt: z.date(),
    updatedAt: z.date(),
    name: z.string().min(1).nullable(),
    emailVerified: z.date().nullable(),
    image: z.string().min(1).nullable(),
})

export type user = z.infer<typeof userSchema> & {
    posts?: post[],
    communitiesMade?: community[],
    studySessionsMade?: studySession[],
    communitiesJoined?: community[],
    studySessionsJoined?: studySession[],
    comments?: comment[],
    replies?: reply[]
}








//posts
export const postSchema = z.object({
    id: z.string().min(1),
    userId: z.string().min(1),
    communityId: z.string().min(1).nullable(),
    studySessionId: z.string().min(1).nullable(),
    likes: z.number().nullable(),
    datePosted: z.date(),
    message: z.string().min(1).nullable(),
    videoUrls: z.string().min(1).nullable(),
    imageUrls: z.string().min(1).nullable(),
})
export type post = z.infer<typeof postSchema> & {
    author?: user,
    forCommunity?: community,
    forStudySession?: studySession,
    tags?: tag[],
    comments?: comment[]
}








//comments
export const commentsSchema = z.object({
    id: z.string().min(1),
    userId: z.string().min(1),
    postId: z.string().min(1),
    datePosted: z.date(),
    message: z.string().min(1),
    likes: z.number().nullable()
})
export type comment = z.infer<typeof commentsSchema> & {
    parentPost?: post,
    fromUser?: user,
    replies?: reply[],
}




//reply
export const replySchema = z.object({
    id: z.string().min(1),
    userId: z.string().min(1),
    replyingToUserId: z.string().min(1),
    commentId: z.string().min(1),
    datePosted: z.date(),
    message: z.string().min(1),
    likes: z.number().nullable()
})
export type reply = z.infer<typeof replySchema> & {
    fromComment?: comment,
    fromUser?: user,
    replyingToUser?: user
}











//tags
export const tagSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
})
export type tag = z.infer<typeof tagSchema> & {
    forCommunity?: community[],
    forPosts?: post[]
}












// //tagsToCommunities
// export const tagsToCommunitiesSchema = z.object({
//     pk: z.string().min(1),
//     tagId: z.string().min(1),
//     communityId: z.string().min(1)
// })
// export type tagsToCommunities = z.infer<typeof tagsToCommunitiesSchema> & {
//     tag: tag | undefined,
//     community: community | undefined
// }










// //tagsToPosts
// export const tagsToPostsSchema = z.object({
//     pk: z.string().min(1),
//     tagId: z.string().min(1),
//     postId: z.string().min(1)
// })
// export type tagsToPosts = z.infer<typeof tagsToPostsSchema> & {
//     tag: tag | undefined,
//     post: post | undefined
// }