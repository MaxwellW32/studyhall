"use client"

import { authorizedMemberList, studySession, user } from '@/types'
import styles from "./page.module.css";
import react, { useEffect, useMemo, useRef, useState } from "react";
import { Peer } from "peerjs";
import type { DataConnection, MediaConnection } from "peerjs";
import { v4 as uuidV4 } from "uuid"
import { retreiveFromLocalStorage, saveToLocalStorage } from '@/utility/savestorage';
import { changeStudySessionsServObj, readStudySessionsServObj, removeUserFromstudySessionsServObj } from '@/utility/serverFunctions/handlestudySessions';
import { wait } from '@/utility/useful/NiceFunctions';
import { toast } from 'react-hot-toast';
import { defaultImage, inProduction } from '@/utility/globalState';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { authOptions } from '@/lib/auth/auth-options';
import { Session } from 'next-auth';
import Moment from 'react-moment';
import Image from 'next/image';
import { useQueries, useQuery } from '@tanstack/react-query';
import { getSpecificUser } from '@/utility/serverFunctions/handleUsers';



type chatMessage = {
    message: string,
    postedBy: Pick<user, "id" | "name" | "image" | "username">,
    datePosted: Date,
    additionalMedia: {
        data: Uint8Array,
        type: string,
        name: string
    } | null
    authenticated: boolean,
}

type canvasInfo = {
    hey: string
}

type chatData = {
    for: "chat",
    data: chatMessage
}

type canvasData = {
    for: "canvas",
    data: canvasInfo
}

type peerData = chatData | canvasData;


export default function StudySession({ seenStudySession, session }: { seenStudySession: studySession, session?: Session }) {
    //have a local object
    //will have username, picture
    const [peer] = useState<Peer>(() => {

        if (inProduction) return new Peer


        fetch(`/api/peer/peerServer`)

        return new Peer(uuidV4(), {
            host: "localhost",
            port: 9000,
            path: "/myPeerServer",
        })
    })

    const sendConnections = useRef<DataConnection[]>([])

    const chatRef = useRef<HTMLDivElement>(null!)

    // const [roomFull, roomFullSet] = useState(false)

    const [currentMessage, currentMessageSet] = useState("")
    const [chat, chatSet] = useState<chatMessage[]>([])

    const authorizedMemberList = useMemo<authorizedMemberList | null>(() => {
        return seenStudySession.authorizedMemberList ? JSON.parse(seenStudySession.authorizedMemberList) : null
    }, [seenStudySession.authorizedMemberList])

    const [localUserId] = useState(() => {
        let localid = ""

        if (session) {
            localid = session.user.id
        } else {
            const seenIdFromStorage = retreiveFromLocalStorage("localUserId")

            if (seenIdFromStorage !== null) {
                localid = seenIdFromStorage


            } else {
                //save to local storage
                const newLocalUserId = uuidV4()

                localid = newLocalUserId

                saveToLocalStorage("localUserId", newLocalUserId)
            }
        }

        return localid
    })

    // const seenUser = {}
    const { data: seenUser } = useQuery({
        queryKey: ["seenUserStudySession"],
        queryFn: () => session ? getSpecificUser(session.user.id, "id") : null,
        refetchOnWindowFocus: false
    })

    const userRole = useMemo<"host" | "coHost" | "normal">(() => {
        //no list everyone is normal except host
        if (!authorizedMemberList) {
            if (session && session.user.id === seenStudySession.userId) {
                return "host"
            } else {
                return "normal"
            }
        }

        //user exists on list - give em the role they want
        if (authorizedMemberList[localUserId] !== undefined) {
            return authorizedMemberList[localUserId].role
        }

        //host was not specific on auth list - give host
        if (session && session.user.id === seenStudySession.userId && authorizedMemberList[seenStudySession.userId] === undefined) {
            return "host"
        }

        return "normal"

    }, [authorizedMemberList])

    const isUserInAuthorizedList = useMemo(() => {
        if (!authorizedMemberList) return false

        const userInAuthorizedList = authorizedMemberList[localUserId]

        if (userInAuthorizedList !== undefined) return true

        return false
    }, [authorizedMemberList])

    const [userWantsToScroll, userWantsToScrollSet] = useState(false)

    const [refresher, refresherSet] = useState(false)

    const localStream = useRef<undefined | MediaStream>(undefined);

    const callRef = useRef<null | MediaConnection>(null);

    const remoteVideosRef = useRef<HTMLVideoElement[]>([]);

    const myVideoRef = useRef<HTMLVideoElement>(null!);
    const [myVideoConnected, myVideoConnectedSet] = useState(false)

    const remoteVideosCont = useRef<HTMLDivElement>(null!);

    const [viewMode, viewModeSet] = useState<"chatMode" | "videoMode" | "videoModeSmall">("chatMode")

    const [blobUploaded, blobUploadedSet] = useState<{
        data: Blob,
        name: string,
    } | null>(null)
    const [showingMoreOptionsMenu, showingMoreOptionsMenuSet] = useState(false)



    //handle peer events
    const mounted = useRef(false)
    useEffect(() => {
        if (mounted.current) return
        mounted.current = true

        console.log(`$ran opening useeffect`);

        peer.on("open", () => {
            updateAndReadMembers()
            toast.success("peer opened")
        })

        peer.on("close", () => {
            disconnectConnections()
            toast.success("peer closed")
        })

        //receive the connections
        peer.on('connection', (conn) => {

            conn.on('open', () => {
                toast.success("new connection opened")
                console.log(`$connection open - established to `, conn.peer);
                connectToPeer(conn.peer)//relay received connection to send connections
            });

            conn.on('data', (data) => {
                console.log(`$seen data`, data);
                const seenData = data as peerData

                if (seenData.for === "chat") {
                    chatSet(prevMessages => [...prevMessages, seenData.data])
                }
            });

            conn.on('close', () => {
                console.log(`$seen a conn closed`, conn.peer);
                toast.success("seen a conn closed")
                sendConnections.current = sendConnections.current.filter(eachConnection => eachConnection.peer !== conn.peer)
                refresherSet(prev => !prev)
            });
        });

        //handle video calls
        peer.on("call", async (call) => {
            callRef.current = call
            toast.success("seeing someone calling")

            const callerVideo = document.createElement("video")

            await turnOnWebCam()
            call.answer(localStream.current) //send em my video stream

            call.on("stream", (userVideoStream) => {
                toast.success("received the video call")
                addRemoteVideoStream(callerVideo, userVideoStream)
            })

            call.on("close", () => {
                callerVideo.remove()

                toast.success("seen a vid close")
                console.log(`$seen a vid close receive`);
            })
        })

        peer.on("error", (err) => {
            console.log(`$peer err bounds`, err.message);

            //delete errored peers from connected list
            const regex = /peer (\w{8}-\w{4}-\w{4}-\w{4}-\w{12})/;
            const match = regex.exec(err.message);
            if (match) {
                const extrPeerId = match[1];
                //remove from connected list
                sendConnections.current = sendConnections.current.filter(eachConnection => eachConnection.peer !== extrPeerId)
                refresherSet(prev => !prev)
            }
        })
    }, [])

    //snap chat on new message
    useEffect(() => {
        if (chat.length < 1 || userWantsToScroll) return

        chatRef.current.scrollTop = chatRef.current.scrollHeight
    }, [chat, userWantsToScroll])


    const updateAndReadMembers = async () => {
        //write current info to server
        const firstResponse = await changeStudySessionsServObj(seenStudySession.id, localUserId, peer.id)
        console.log(`$firstResponse`, firstResponse.complete);

        //check members
        const response = await readStudySessionsServObj(seenStudySession.id)
        console.log(`$response`, response);

        if (!response.studySessionInfo) {
            setTimeout(() => {
                console.log(`$couldnt get response studysessinfo, trying again`);
                updateAndReadMembers()
            }, 5000)
            return
        }

        const usersFromServer = response.studySessionInfo.members

        //connect to all other users seen
        Object.entries(usersFromServer).forEach(eachEntry => {//user id - userObjwPeer
            if (eachEntry[0] !== localUserId) {
                connectToPeer(eachEntry[1].peerId)
            }
        })
    }

    const sendMessage = async () => {
        const finalMessage: chatMessage = {
            message: currentMessage,
            datePosted: new Date,
            authenticated: seenUser ? true : false,
            additionalMedia: blobUploaded ? {
                data: new Uint8Array(await blobUploaded.data.arrayBuffer()),
                type: blobUploaded.data.type,
                name: blobUploaded.name
            } : null,
            postedBy: {
                id: localUserId,
                image: seenUser?.image ?? null,
                username: seenUser?.username ?? "Anon",
                name: session?.user.name ?? "Anonymous Joe"
            }
        }

        console.log(`$sent data`, finalMessage);

        //sending

        const dataToSend: peerData = {
            for: "chat",
            data: finalMessage
        }

        sendConnections.current.forEach(eachConnection => {
            eachConnection.send(dataToSend);
        })



        chatSet(prevMessages => [...prevMessages, finalMessage])

        currentMessageSet("")
        blobUploadedSet(null)
    }

    const connectToPeer = (peerId: string) => {
        //only add to connArr if not there already

        const inArrayCheck = sendConnections.current.find(eachConn => eachConn.peer === peerId)

        if (inArrayCheck === undefined) {
            sendConnections.current.push(peer.connect(peerId))
            refresherSet(prev => !prev)
        }
    }

    const turnOnWebCam = async () => {
        localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        myVideoRef.current.srcObject = localStream.current;

        myVideoRef.current.muted = true

        myVideoRef.current.addEventListener("loadedmetadata", () => {
            myVideoRef.current.play()
        })

        myVideoConnectedSet(true)
    }

    const disconnectConnections = () => {
        console.log(`$ran disconnect connections`);

        sendConnections.current.forEach(eachConnection => {
            eachConnection.close()
        })

        removeUserFromstudySessionsServObj(seenStudySession.id, localUserId)
        // peer.disconnect()
        sendConnections.current = []
        refresherSet(prev => !prev)
    }

    const disconnectVideo = () => {
        callRef.current?.close()

        localStream.current?.getTracks().forEach(function (track) {
            track.stop();
        });

        myVideoConnectedSet(false)
    }

    const handleUnload = (e: BeforeUnloadEvent) => {
        // Cancel the event
        e.preventDefault();

        // Chrome requires returnValue to be set
        e.returnValue = '';

        // Display a confirmation dialog
        let confirmationMessage = 'Are you sure you want to leave?';
        (e || window.event).returnValue = confirmationMessage; // Standard for most browsers

        if (window.confirm(confirmationMessage)) {
            // Call your cleanup function here
            disconnectConnections();
        }

        return confirmationMessage; // For some older browsers
    }




    //camera
    const makeVideoCall = async () => {

        // myVideoRef.current.muted = true //mut my video

        await turnOnWebCam()

        //send data across
        sendConnections.current.forEach(eachConnection => {
            if (localStream.current === undefined) return

            callRef.current = peer.call(eachConnection.peer, localStream.current);

            const remoteVideo = document.createElement("video")

            callRef.current.on("stream", (remoteVideoStream) => {
                console.log(`$remoteVideoStream`, remoteVideoStream);
                toast.success("adding new video stream")
                addRemoteVideoStream(remoteVideo, remoteVideoStream)
            })

            callRef.current.on("close", () => {
                remoteVideo.remove()

                toast.success("seen a video closed")
                console.log(`$seen a vid close send`);
            })
        })
    }

    const addRemoteVideoStream = (video: HTMLVideoElement, stream: MediaStream) => {
        remoteVideosRef.current.push(video)

        video.srcObject = stream;

        video.addEventListener("loadedmetadata", () => {
            video.play()
        })

        remoteVideosCont.current.append(video)
    }


    return (
        <div style={{ display: "grid", gridTemplateRows: "auto 1fr" }}>
            {/* top menu */}
            <div style={{ display: "flex", padding: "1rem", gap: "1rem", alignItems: "center", height: "3rem", borderBottom: "1px solid #000" }}>
                {sendConnections.current.length > 0 && (
                    <>
                        <p style={{ color: "#0f0" }}>{sendConnections.current.length} {sendConnections.current.length === 1 ? "other person" : "People"} online</p>
                        <p onClick={disconnectConnections}>Disconnect</p>
                    </>
                )}

                {userRole === ("host" || "coHost") && (
                    <Link href={`/newStudySession/edit/${seenStudySession.id}`} style={{ marginLeft: "auto" }}>
                        <svg style={{ fill: "#000" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z" /></svg>
                    </Link>
                )}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap" }}>
                {/* videos */}
                <div style={{ flex: "2 1 min(600px, 100%)", maxHeight: "70vh", overflowY: "auto" }}>
                    {!myVideoConnected && (
                        <div onClick={makeVideoCall} style={{ display: "flex", gap: ".5rem", alignItems: "center", paddingLeft: "1rem   " }}>
                            <p>Video Call</p>

                            <svg style={{ fill: "#000" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M0 128C0 92.7 28.7 64 64 64H320c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128zM559.1 99.8c10.4 5.6 16.9 16.4 16.9 28.2V384c0 11.8-6.5 22.6-16.9 28.2s-23 5-32.9-1.6l-96-64L416 337.1V320 192 174.9l14.2-9.5 96-64c9.8-6.5 22.4-7.2 32.9-1.6z" /></svg>
                        </div>
                    )}
                    {myVideoConnected && <button onClick={disconnectVideo}>Close Video</button>}

                    {myVideoConnected && <p>My Cam</p>}
                    <video style={{ display: !myVideoConnected ? "none" : "", aspectRatio: "1/1", width: "min(150px,100%)", objectFit: "cover" }} ref={myVideoRef}></video>


                    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(min(250px, 100%), 1fr))`, gridAutoRows: "250px", columnGap: "1rem" }} ref={remoteVideosCont}>
                    </div>
                </div>

                {/* chat */}
                <div style={{ flex: "1 1 min(250px, 100%)", backgroundColor: "#999", display: "grid", gridTemplateRows: "1fr auto" }}>
                    <div ref={chatRef} style={{ maxHeight: "70vh", overflowY: "auto", border: "1px solid #000", borderTop: "none" }}
                        onScroll={() => {
                            const calcScrollTop = chatRef.current.scrollHeight - chatRef.current.clientHeight
                            const isAtBottom = calcScrollTop > (chatRef.current.scrollTop - 10) && calcScrollTop < (chatRef.current.scrollTop + 10)

                            // Update state based on user scroll position
                            userWantsToScrollSet(!isAtBottom);
                        }}>

                        {chat.map((chatObj, eachMessageIndex) => {
                            console.log(`$chatObj`, chatObj);

                            let blobObj = chatObj.additionalMedia ? {
                                data: new Blob([chatObj.additionalMedia.data], { type: chatObj.additionalMedia.type }),
                                name: chatObj.additionalMedia.name
                            } : null;


                            console.log(`$blob`, blobObj);

                            return (
                                <div style={{ backgroundColor: "#fff", color: "#000", padding: "1rem", borderTop: "1px solid #000" }} key={eachMessageIndex}>
                                    <p style={{ textAlign: "end" }}><Moment fromNow>{chatObj.datePosted}</Moment></p>


                                    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: ".5rem" }}>
                                        <Image style={{ aspectRatio: "1/1", width: "2rem", borderRadius: "50%" }} width={400} height={400} alt={`${chatObj.postedBy.name}'s profile pic`} src={chatObj.postedBy.image ?? defaultImage} />

                                        <div>
                                            <p style={{ color: chatObj.authenticated ? "gold" : "" }}>{chatObj.postedBy.username}</p>

                                            {blobObj !== null && (
                                                <>
                                                    {blobObj.data.type.startsWith(`image/`) ? (
                                                        <>
                                                            <img src={URL.createObjectURL(blobObj.data)} alt={`${blobObj.name} image sent`} style={{ height: "auto", width: "100%" }} />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <a href={URL.createObjectURL(blobObj.data)} download="file">{blobObj.name} - download</a>
                                                        </>
                                                    )}

                                                    {/* {chatObj.additionalMedia.type.startsWith(`audio/`) ? (<></>) : null}
                                                    {chatObj.additionalMedia.type.startsWith(`video/`) ? (<></>) : null}
                                                    {chatObj.additionalMedia.type.startsWith(`application/`) ? (<></>) : null} */}
                                                </>
                                            )}

                                            <p>{chatObj.message}</p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* input */}
                    <div style={{ display: "grid", gridTemplateColumns: "3rem 1fr auto", position: "relative", alignItems: "center" }}>
                        {blobUploaded && (
                            <div style={{ position: "absolute", top: 0, left: "3rem", padding: "1rem", translate: "0 -100%", height: "10rem", backgroundColor: "wheat" }}>
                                {blobUploaded.data.type.startsWith(`image/`) ? (
                                    <>
                                        <img src={URL.createObjectURL(blobUploaded.data)} alt={`${blobUploaded.name} preview`} style={{ maxHeight: '100%', objectFit: "cover" }} />
                                    </>
                                ) : (
                                    <>
                                        <a href={URL.createObjectURL(blobUploaded.data)} download="file">{blobUploaded.name} - download</a>
                                    </>
                                )}

                                {/* {blobUploaded.data.type.startsWith(`audio/`) ? (<></>) : null}
                                {blobUploaded.data.type.startsWith(`video/`) ? (<></>) : null}
                                {blobUploaded.data.type.startsWith(`application/`) ? (<></>) : null} */}
                            </div>
                        )}



                        <div onClick={() => showingMoreOptionsMenuSet(prev => !prev)} style={{ display: !showingMoreOptionsMenu ? "none" : "", position: "absolute", top: 0, left: 0, padding: "1rem", backgroundColor: "beige", translate: "0 -100%", gap: "1rem" }}>
                            <input type="file" placeholder='Upload' onChange={(e) => {
                                if (!e.target.files) return

                                const uploadedFile = e.target.files[0]
                                const blob = new Blob([uploadedFile], { type: uploadedFile.type })

                                console.log(`$uploadedFile`, uploadedFile);

                                blobUploadedSet(prev => {
                                    if (prev) {
                                        prev.data = blob
                                        prev.name = uploadedFile.name

                                        return { ...prev }
                                    } else {
                                        return { data: blob, name: uploadedFile.name }
                                    }
                                });
                            }} />
                        </div>

                        <div onClick={() => showingMoreOptionsMenuSet(prev => !prev)} style={{ backgroundColor: "#222", height: "100%", width: "100%", padding: ".5rem", display: "grid", alignItems: "center", justifyItems: "center" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z" /></svg>
                        </div>

                        <input value={currentMessage} onChange={(e) => { currentMessageSet(e.target.value) }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && currentMessage !== "") sendMessage()
                            }} type="text" placeholder="Enter your message" />

                        <button style={{}} onClick={sendMessage}>Send</button>
                    </div>
                </div>
            </div>
        </div>
    );
}