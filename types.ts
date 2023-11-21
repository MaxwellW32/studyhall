import { z } from "zod";
//remember that sql values are nullable by default
// have to state that you want nullable values in Z.schema


//community
export const communitySchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().min(1),
    userId: z.string(),
})
export type community = z.infer<typeof communitySchema>















//user
export const userSchema = z.object({
    id: z.string().min(1),
    username: z.string().min(1),
    firstName: z.string().min(1).nullable(),
    lastName: z.string().min(1).nullable(),
})
export type user = z.infer<typeof userSchema>



















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
export type post = z.infer<typeof postSchema>

//usable always means my strings are arrays / objects now
export type usablePost = Omit<post, "videoUrls" | "imageUrls"> & {
    videoUrls: null | string[],
    imageUrls: null | string[]
}