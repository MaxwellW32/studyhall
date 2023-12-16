"use client"

import { useQuery } from '@tanstack/react-query'
import React, { useRef, useState } from 'react'
import { getStudySessionByName } from '../serverFunctions/handlestudySessions'
import NiceStudySessionDisplay from './NiceStudySessionDisplay'

export default function HandleSearch() {
    const [searchInput, searchInputSet] = useState("")
    const [search, searchSet] = useState("")

    const typingTimeOut = useRef<undefined | NodeJS.Timeout>(undefined)

    const [limit] = useState(15)
    const [offset, offsetSet] = useState(0)

    const { data: searchData, isLoading, error } = useQuery({
        queryKey: ["search", search, limit, offset],
        queryFn: () => getStudySessionByName(search, limit, offset),
        refetchOnWindowFocus: false,
        enabled: search !== ""
    })

    return (
        <div style={{}}>
            <div style={{ display: "grid", position: "relative" }}>
                <input style={{ padding: "1rem 3rem 1rem 1rem" }} placeholder='Search...' type='text' value={searchInput}
                    onChange={(e) => {
                        searchInputSet(e.target.value)

                        if (typingTimeOut.current) clearTimeout(typingTimeOut.current); typingTimeOut.current = undefined

                        if (typingTimeOut.current !== undefined) return

                        //search
                        typingTimeOut.current = setTimeout(() => {
                            searchSet(searchInput)
                        }, 1000);
                    }}
                />

                <svg style={{ position: "absolute", top: "50%", right: 0, marginRight: "1rem", fill: "#fff", translate: "0 -50%" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" /></svg>
            </div>

            {error && (
                <p>Error searching</p>
            )}

            <div style={{ backgroundColor: "#333", height: "300px", display: "grid", gridTemplateRows: "1fr auto" }}>
                {searchData && (
                    <>
                        <div className='niceScrollbar' style={{ display: "flex", flexDirection: "column", gap: ".3rem", padding: "1rem", overflowY: "auto" }}>
                            {searchData && searchData.map(eachSession => {
                                return <NiceStudySessionDisplay key={eachSession.id} seenStudySession={eachSession} />
                            })}
                        </div>

                        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                            {offset >= limit &&
                                <button onClick={() => {
                                    offsetSet(prev => {
                                        let newOffset = prev - limit

                                        if (newOffset < 0) {
                                            newOffset = 0
                                        }

                                        return newOffset
                                    })
                                }}>Previous</button>
                            }

                            {searchData.length >= limit &&
                                <button onClick={() => { offsetSet(prev => prev + limit) }}>Next</button>
                            }
                        </div>
                    </>
                )}
                {isLoading && <p>Loading</p>}
            </div>
        </div>
    )
}