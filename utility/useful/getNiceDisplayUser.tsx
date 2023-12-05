import { user } from "@/types";
import Image from "next/image";
import { defaultImage } from "../globalState";

export default function getNiceDisplayUser(seenUser: user) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem" }}>
            <Image style={{ borderRadius: "50%", marginRight: ".5rem" }} alt='profile image' src={seenUser.image ?? defaultImage} width={30} height={30} className='profileImage' />
            <p>{seenUser.username}</p>
        </div>
    )
}