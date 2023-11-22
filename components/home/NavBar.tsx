"use client"
import React, { useState, useEffect } from 'react'
import { signOut, signIn, useSession } from 'next-auth/react';
import Link from 'next/link';


export default function NavBar() {
    const { data: session } = useSession()

    return (
        <div>
            <Link href={"/"}>
                <button>Home</button>
            </Link>
            <div></div>
            <div>
                {session ? <button onClick={() => { signOut() }}>Sign Out</button> : <button onClick={() => { signIn() }}>Sign In</button>}
            </div>
        </div>
    )
}
