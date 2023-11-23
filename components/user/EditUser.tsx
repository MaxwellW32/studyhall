import { user } from "@/types";

//show user is a page
export default function EditUser({ seenUser }: { seenUser: user }) {

    return (
        <div>
            <p>Seeing user to edit {seenUser.name}</p>
        </div>
    )
}
