"use client"

import { user } from "@/types";
import { defaultImage } from "@/utility/globalState";
import Moment from "react-moment";

//show user is a page
export default function ShowUser({ seenUser }: { seenUser: user }) {

    return (
        <div>
            <ul>
                <li></li>
                <li></li>
                <li></li>
            </ul>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
                <div></div>
                <div></div>
                <div style={{ display: "grid", gap: "1rem" }}>
                    <img src={seenUser.image ?? defaultImage} />

                    <p>{seenUser.username}</p>

                    <p>Account made <Moment from={new Date}>{seenUser.createdAt}</Moment></p>
                </div>
            </div>
        </div>
    )
}
