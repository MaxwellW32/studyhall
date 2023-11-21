import { usablePost, user } from '@/types'
import React, { useEffect, useState } from 'react'
import styles from "./style.module.css"
import DisplayYTVideo from '@/utility/useful/DisplayYTVideo'
import DisplayImage from '@/utility/useful/DisplayImage'
import { getPostUser } from '@/utility/serverFunctions/handleUsers'
import Moment from 'react-moment';

export default function DisplayPost({ seenPost }: { seenPost: usablePost }) {
    //nice
    const [seenAuthor, seenAuthorset] = useState<user | undefined>()

    useEffect(() => {
        const findUser = async () => {
            seenAuthorset(await getPostUser(seenPost.userId))
        }
        findUser()
    }, [])
    return (
        <div className={styles.postMainDiv}>

            <p>Posted by: {seenAuthor && <span>{seenAuthor.firstName}<span style={{ color: "blue" }}>({seenAuthor.username})</span></span>}</p>

            <p>post id {seenPost.id}</p>
            <p>message: {seenPost.message}</p>
            <p>posted: <Moment fromNow>{seenPost.datePosted}</Moment></p>
            <p>likes {seenPost.likes}</p>

            <p>images</p>
            {seenPost.imageUrls &&
                <div className={styles.imgCont}>
                    {seenPost.imageUrls.map((eachUrl, eachUrlIndex) => {
                        return (
                            <DisplayImage key={eachUrlIndex} imageID={eachUrl} />
                        )
                    })}
                </div>
            }

            <p>videos</p>
            {seenPost.videoUrls &&
                <div className={styles.ytVideoCont}>
                    {seenPost.videoUrls.map((eachUrl, eachUrlIndex) => {
                        return (
                            <DisplayYTVideo key={eachUrlIndex} videoId={eachUrl} />
                        )
                    })}
                </div>
            }

            <p>Replies: { }</p>
        </div>
    )
}
