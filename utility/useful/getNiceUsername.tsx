import { user } from "@/types";
import Link from "next/link";
import getNiceUrl from "./getNiceUrl";

export default function getNiceUsername(initialText: string, userInfo: user) {
    return (
        <p>{initialText}{userInfo.name}
            <Link style={{ color: "grey" }} className='showUnderline' href={getNiceUrl("user", userInfo.id, userInfo.name ?? "")}>
                ({userInfo.username})
            </Link>
        </p>
    )
}
