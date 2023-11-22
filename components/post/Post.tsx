import { post } from '@/types'
import React, { useEffect, useState, useMemo } from 'react'
import styles from "./style.module.css"
import DisplayYTVideo from '@/utility/useful/DisplayYTVideo'
import DisplayImage from '@/utility/useful/DisplayImage'
import Moment from 'react-moment';
import { useQuery } from "@tanstack/react-query"
import DisplayAllComments from '../comment/DisplayAllComments'
import MakeComment from '../comment/MakeComment'
import { getPostComments } from '@/utility/serverFunctions/handleComments'

export default function DisplayPost({ seenPost, inPreviewMode }: { seenPost: post, inPreviewMode?: boolean }) {
    const [getComments, getCommentsSet] = useState(false)

    const { data: comments, isLoading } = useQuery({
        queryKey: ["seenComments"],
        enabled: getComments,
        queryFn: async () => await getPostComments(seenPost.id),
        refetchOnWindowFocus: false
    })

    const usableVideoUrls = useMemo(() => {
        return JSON.parse(seenPost.videoUrls ?? "[]") as string[]
    }, [seenPost.videoUrls])

    const usableImageUrls = useMemo(() => {
        return JSON.parse(seenPost.imageUrls ?? "[]") as string[]
    }, [seenPost.videoUrls])


    return (
        <div className={styles.postMainDiv}>
            {inPreviewMode ? (
                <>
                    <p>message: {seenPost.message}</p>
                    <p>likes {seenPost.likes}</p>
                    <p>Posted by: {seenPost.author && <span>{seenPost.author.firstName}<span style={{ color: "blue" }}>({seenPost.author.username})</span></span>}</p>

                </>
            ) : (
                <>
                    <p>Posted by: {seenPost.author && <span>{seenPost.author.firstName}<span style={{ color: "blue" }}>({seenPost.author.username})</span></span>}</p>
                    <p>post id {seenPost.id}</p>
                    <p>message: {seenPost.message}</p>
                    <p>posted: <Moment fromNow>{seenPost.datePosted}</Moment></p>
                    <p>likes {seenPost.likes}</p>

                    <p>images</p>
                    <div className={styles.imgCont} style={{ height: inPreviewMode ? "50px" : "400px" }}>
                        {usableImageUrls.map((eachUrl, eachUrlIndex) => {
                            return (
                                <DisplayImage key={eachUrlIndex} imageID={eachUrl} />
                            )
                        })}
                    </div>


                    <p>videos</p>
                    <div className={styles.ytVideoCont} style={{ height: inPreviewMode ? "100px" : "auto" }}>
                        {usableVideoUrls.map((eachUrl, eachUrlIndex) => {
                            return (
                                <DisplayYTVideo key={eachUrlIndex} videoId={eachUrl} />
                            )
                        })}
                    </div>

                    <MakeComment seenPostId={seenPost.id} />

                    {!getComments && <button onClick={() => getCommentsSet(true)}>Show Comments</button>}

                    {getComments ? (
                        <>
                            {comments && <DisplayAllComments comments={comments} />}
                        </>
                    ) : (
                        <>
                            {seenPost.comments && <DisplayAllComments comments={seenPost.comments} />}
                        </>
                    )}

                </>)}

        </div>
    )
}
