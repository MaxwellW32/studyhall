"use client"
import { post } from '@/types'
import React, { useState, useEffect } from 'react'
import Post from './Post'
import styles from "./style.module.css"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import getNiceUrl from '@/utility/useful/getNiceUrl'

const previewStyles = {
    display: "grid"
}
export default function DisplayAllPosts({ pagesArr, inPreviewMode, normalPostArr }: {
    inPreviewMode?: boolean,
    pagesArr?: post[][],
    normalPostArr?: post[]
}) {
    const router = useRouter()

    return (
        <div className={styles.DisplayAllPostsMainDiv} style={{ ...(inPreviewMode ? previewStyles : {}) }}>
            {normalPostArr ?
                (
                    <>
                        {normalPostArr.map((eachPost) => {
                            return (
                                <div key={eachPost.id} onClick={(e) => {
                                    e.stopPropagation()
                                    router.push(getNiceUrl("post", eachPost.id, eachPost.title))
                                }}>
                                    <Post seenPost={eachPost} inPreviewMode={inPreviewMode} />
                                </div>
                            )
                        })}
                    </>
                ) : (
                    <>
                        {pagesArr?.map(eachPostArr => {
                            return eachPostArr.map(eachPost => {
                                return (
                                    <div key={eachPost.id} onClick={(e) => {
                                        e.stopPropagation()
                                        router.push(getNiceUrl("post", eachPost.id, eachPost.title))
                                    }}>
                                        <Post seenPost={eachPost} inPreviewMode={inPreviewMode} />
                                    </div>
                                )
                            })
                        })}
                    </>
                )}
        </div>
    )
}

