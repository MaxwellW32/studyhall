import { user } from "@/types";

//show user is a page
export default function ShowUser({ seenUser }: { seenUser: user }) {

    return (
        <div>
            <p>Seeing user {seenUser.name}</p>
        </div>
    )
}
