"use client"
import { user } from "@/types";
import Link from "next/link";
import getNiceUrl from "./getNiceUrl";
import Image from "next/image";
import { defaultImage } from "../globalState";

export default function getNiceUsername(initialText: string, userInfo: user) {
    return (
        <Link style={{ display: "flex", alignItems: "center" }} onClick={(e) => e.stopPropagation()} href={getNiceUrl("user", userInfo.id, userInfo.name ?? "")}>

            <Image style={{ borderRadius: "50%", marginRight: ".5rem" }} alt='profile image' src={userInfo.image ?? defaultImage} width={30} height={30} className='profileImage' />

            {initialText}{userInfo.name} <span className='showUnderline' style={{ color: "grey" }}>({userInfo.username})</span>
        </Link>
    )
}
