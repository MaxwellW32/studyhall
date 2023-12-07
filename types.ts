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

export type newCommunity = Pick<community, "name" | "description">









//study sessions
export const studySessionSchema = z.object({
    id: z.string().min(1),
    userId: z.string().min(1),
    name: z.string().min(1),
    authorizedMemberList: z.string().min(1).nullable(),//asigns roles only
    allowAll: z.boolean(),
    isPublic: z.boolean(),
    createdAt: z.date()
})
export type studySession = z.infer<typeof studySessionSchema> & {
    createdBy?: user,
    posts?: post[],
    members?: user[],
}
export type newStudySession = Omit<studySession, "id" | "userId" | "createdAt">

export type authorizedMemberListRoles = "host" | "coHost" | "normal"
export type authorizedMemberList = {
    [key: string]: {
        role: authorizedMemberListRoles
    }
}










//each type can have a read - full object expected
//a new - whats needed to provide new
//an update - all needed to update
// educationLevel: varchar("education_level", { length: 255 }),
// fieldOfStudy: varchar("field_of_study", { length: 255 }),
// country: varchar("country", { length: 255 }),
// interests: text("interests"),

export const userSchema = z.object({
    id: z.string().min(1),
    username: z.string().min(1),
    email: z.string().min(1),
    createdAt: z.date(),
    updatedAt: z.date(),
    name: z.string().min(1).nullable(),
    emailVerified: z.date().nullable(),
    image: z.string().min(1).nullable(),
    educationLevel: z.string().min(1).nullable(),
    fieldOfStudy: z.string().min(1).nullable(),
    country: z.string().min(1).nullable(),
    interests: z.string().min(1).nullable(),
})

export type user = z.infer<typeof userSchema> & {
    posts?: post[],
    communitiesMade?: community[],

    studySessionsMade?: studySession[],
    communitiesJoined?: community[],
    studySessionsJoined?: studySession[],
    comments?: comment[],

    likedPosts?: post[],
    likedComments?: comment[],
    likedReplies?: reply[],

    replies?: reply[]
}

export type updateUserType = Pick<user, "name" | "username" | "image">



//posts
export const postSchema = z.object({
    id: z.string().min(1),
    userId: z.string().min(1),
    title: z.string().min(1),
    communityId: z.string().min(1).nullable(),
    studySessionId: z.string().min(1).nullable(),
    likes: z.number(),
    datePosted: z.date(),
    message: z.string().min(1).nullable(),
    videoUrls: z.string().min(1).nullable(),
    imageUrls: z.string().min(1).nullable(),
})
export type post = z.infer<typeof postSchema> & {
    author?: user,
    forCommunity?: community | null,
    forStudySession?: studySession | null,
    tags?: tag[],
    comments?: comment[],
    likedByUsers?: user[]
}

export type newPost = Pick<post, "communityId" | "studySessionId" | "message" | "videoUrls" | "imageUrls" | "title">







//comments
export const commentsSchema = z.object({
    id: z.string().min(1),
    userId: z.string().min(1),
    postId: z.string().min(1),
    datePosted: z.date(),
    message: z.string().min(1),
    likes: z.number()
})
export type comment = z.infer<typeof commentsSchema> & {
    parentPost?: post,
    fromUser?: user,
    replies?: reply[],
    likedByUsers?: user[]
}

export type newComment = Pick<comment, "postId" | "message">








//reply
export const replySchema = z.object({
    id: z.string().min(1),
    userId: z.string().min(1),
    replyingToUserId: z.string().min(1),
    commentId: z.string().min(1),
    datePosted: z.date(),
    message: z.string().min(1),
    likes: z.number()
})
export type reply = z.infer<typeof replySchema> & {
    fromComment?: comment,
    fromUser?: user,
    replyingToUser?: user,
    likedByUsers?: user[]
}
export type newReply = Pick<reply, "replyingToUserId" | "commentId" | "message">











//tags
export const tagSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
})
export type tag = z.infer<typeof tagSchema> & {
    forCommunity?: community[],
    forPosts?: post[]
}
