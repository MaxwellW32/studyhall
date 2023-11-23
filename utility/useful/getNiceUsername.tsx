
export default function getNiceUsername(initialText: string, name: string | undefined | null, username: string | undefined) {
    return (
        <>
            {username && <p>{initialText}{name}<span style={{ color: "grey" }}>({username})</span></p>}
        </>
    )
}
