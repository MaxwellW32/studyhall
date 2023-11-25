"use client"
import React, { useState, useEffect } from 'react'
import { signOut, signIn } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { defaultImage } from '@/utility/globalState';
import { user } from '@/types';

export default function NavBar({ seenUser }: { seenUser?: user }) {
    const [showingMore, showingMoreSet] = useState(false)

    return (
        <div style={{ display: "flex", justifyContent: "space-between", padding: ".3rem 1rem", backgroundColor: "#777", alignItems: "center", position: "relative", zIndex: "999" }}>
            <Link href={"/"}>
                <svg style={{ width: "1.7rem" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z" /></svg>            </Link>

            <Image alt='shlogo' src={require(`@/public/sh logo.png`).default.src} width={50} height={50} />

            <div>
                {seenUser ?
                    (
                        <div style={{ position: "relative" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "auto auto auto", gap: ".3rem", alignItems: "center", cursor: "pointer" }} onClick={() => showingMoreSet(prev => !prev)}>
                                <Link onClick={(e) => e.stopPropagation()} href={`/user/${seenUser.id}`}>
                                    <Image alt='profile image' src={seenUser.image ?? defaultImage} width={30} height={30} className='profileImage' />
                                </Link>

                                {seenUser.name && <p>{seenUser.name}</p>}

                                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" /></svg>
                            </div>

                            {showingMore &&
                                <ul style={{ position: "absolute", backgroundColor: "#333", width: "20vw", right: "-1rem", padding: "1rem", display: "grid", gap: "1rem" }} onClick={() => showingMoreSet(false)}>
                                    <button onClick={() => { signOut() }}>Sign Out</button>

                                    <Link style={{ display: "flex", alignItems: 'center', gap: ".3rem" }} href={`/user/${seenUser.id}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><path d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464H398.7c-8.9-63.3-63.3-112-129-112H178.3c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3z" /></svg>

                                        Profile
                                    </Link>

                                </ul>
                            }
                        </div>
                    ) :

                    <button onClick={() => { signIn() }}>Sign In</button>}
            </div>
        </div>
    )
}
