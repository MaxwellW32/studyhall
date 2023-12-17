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
import { inProduction } from '@/utility/globalState';
import Link from 'next/link';

export default function StudySession({ seenStudySession, signedInUserId }: { seenStudySession: studySession, signedInUserId?: string }) {
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
    const [chat, chatSet] = useState<string[]>([])

    const authorizedMemberList = useMemo<authorizedMemberList | null>(() => {
        return seenStudySession.authorizedMemberList ? JSON.parse(seenStudySession.authorizedMemberList) : null
    }, [seenStudySession.authorizedMemberList])

    const [localUserId] = useState(() => {
        let localid = ""

        if (signedInUserId) {
            localid = signedInUserId
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

    const userRole = useMemo<"host" | "coHost" | "normal">(() => {
        //no list everyone is normal except host
        if (!authorizedMemberList) {
            if (signedInUserId && signedInUserId === seenStudySession.userId) {
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
        if (signedInUserId === seenStudySession.userId && authorizedMemberList[seenStudySession.userId] === undefined) {
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
                chatSet(prevMessages => [...prevMessages, data as string])
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

    // Register the event listener for beforeunload
    // useEffect(() => {
    //     window.addEventListener('beforeunload', handleUnload);

    //     // Clean up the event listener when the component is unmounted
    //     return () => {
    //         window.removeEventListener('beforeunload', handleUnload);
    //         sendConnections.current.length > 0 && disconnectConnections()
    //         // Additional cleanup logic if needed
    //     };
    // }, []);





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

    const sendMessage = () => {
        sendConnections.current.forEach(eachConnection => {
            eachConnection.send(currentMessage);
        })

        chatSet(prevMessages => [...prevMessages, currentMessage])
        currentMessageSet("")
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
            <div style={{ display: "flex", padding: "1rem", gap: "1rem", alignItems: "center", height: "4rem" }}>
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
                <div style={{ flex: "1 1 min(600px, 100%)" }}>

                    {myVideoConnected && <p>My Cam</p>}
                    <video style={{ display: !myVideoConnected ? "none" : "", aspectRatio: "1/1", width: "min(150px,100%)", objectFit: "cover" }} ref={myVideoRef}></video>


                    <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(min(250px, 100%), 1fr))`, gridAutoRows: "250px" }} ref={remoteVideosCont}>
                        {remoteVideosCont.current?.childNodes.length > 0 && <p>Remote videos</p>}
                    </div>

                    {!myVideoConnected && <button onClick={makeVideoCall}>Make Video Call</button>}
                    {myVideoConnected && <button onClick={disconnectVideo}>Close Video</button>}
                </div>

                <div style={{ flex: "1 1 min(250px, 100%)", backgroundColor: "#999", display: "grid", gridTemplateRows: "1fr auto" }}>
                    <div ref={chatRef} style={{ maxHeight: "60vh", overflowY: "auto", border: "1px solid #000" }}
                        onScroll={() => {
                            const calcScrollTop = chatRef.current.scrollHeight - chatRef.current.clientHeight
                            const isAtBottom = calcScrollTop > (chatRef.current.scrollTop - 10) && calcScrollTop < (chatRef.current.scrollTop + 10)

                            // Update state based on user scroll position
                            userWantsToScrollSet(!isAtBottom);
                        }}>

                        {chat.map((eachMessage, eachMessageIndex) => {
                            return <p style={{ backgroundColor: "#fff", color: "#000", padding: "1rem", borderTop: "1px solid #000" }} key={eachMessageIndex}>{eachMessage}</p>
                        })}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto" }}>
                        <input value={currentMessage} onChange={(e) => { currentMessageSet(e.target.value) }} onKeyDown={(e) => { if (e.key === "Enter" && currentMessage !== "") sendMessage() }} type="text" placeholder="Enter your message" />

                        <button style={{}} onClick={sendMessage}>Send</button>
                    </div>
                </div>
            </div>
        </div>
    );
}























































// "use client"
// import React, { useRef, useState } from 'react'
// import { db } from "@/utility/serverFunctions/handleFirebase"
// import { collection, addDoc, doc } from 'firebase/firestore';

// const servers = {
//     iceServers: [
//         {
//             urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
//         },
//     ],
//     iceCandidatePoolSize: 10,
// };

// export default function StudySession() {

//     // Global State
//     const [pc] = useState(new RTCPeerConnection(servers));

//     let localStream = useRef<null | MediaStream>(null);
//     let remoteStream = useRef<null | MediaStream>(null);

//     let remoteVideoRef = useRef<HTMLVideoElement>(null!);
//     let webCamVideoRef = useRef<HTMLVideoElement>(null!);

//     const [callInput, callInputSet] = useState("");

//     return (
//         <div>StudySession
//             <button onClick={async () => {

//                 localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//                 remoteStream.current = new MediaStream();

//                 // Push tracks from local stream to peer connection
//                 localStream.current.getTracks().forEach((track) => {
//                     pc.addTrack(track, localStream.current!);
//                 });

//                 // Pull tracks from remote stream, add to video stream
//                 pc.ontrack = (event) => {
//                     event.streams[0].getTracks().forEach((track) => {
//                         remoteStream.current!.addTrack(track);
//                     });
//                 };

//                 webCamVideoRef.current.srcObject = localStream.current;
//                 remoteVideoRef.current.srcObject = remoteStream.current;

//                 //may need to hit play

//                 // callButton.disabled = false;
//                 // answerButton.disabled = false;
//                 // webcamButton.disabled = true;
//             }}>WebCam Bttn</button>

//             <button onClick={async () => {
//                 // Reference Firestore collections for signaling
//                 const callDoc = db.collection('calls').doc();
//                 const offerCandidates = callDoc.collection('offerCandidates');
//                 const answerCandidates = callDoc.collection('answerCandidates');

//                 callInputSet(callDoc.id)

//                 // Get candidates for caller, save to db
//                 pc.onicecandidate = (event) => {
//                     event.candidate && offerCandidates.add(event.candidate.toJSON());
//                 };

//                 // Create offer
//                 const offerDescription = await pc.createOffer();
//                 await pc.setLocalDescription(offerDescription);

//                 const offer = {
//                     sdp: offerDescription.sdp,
//                     type: offerDescription.type,
//                 };

//                 await callDoc.set({ offer });

//                 // Listen for remote answer
//                 callDoc.onSnapshot((snapshot) => {
//                     const data = snapshot.data();
//                     if (!pc.currentRemoteDescription && data?.answer) {
//                         const answerDescription = new RTCSessionDescription(data.answer);
//                         pc.setRemoteDescription(answerDescription);
//                     }
//                 });

//                 // When answered, add candidate to peer connection
//                 answerCandidates.onSnapshot((snapshot) => {
//                     snapshot.docChanges().forEach((change) => {
//                         if (change.type === 'added') {
//                             const candidate = new RTCIceCandidate(change.doc.data());
//                             pc.addIceCandidate(candidate);
//                         }
//                     });
//                 });

//                 // hangupButton.disabled = false;
//             }}>Call Bttn</button>

//             <input type='text' placeholder='call input' value={callInput} onChange={(e) => { callInputSet(e.target.value) }} />

//             <button onClick={async () => {
//                 const callId = callInput;
//                 const callDoc = firestore.collection('calls').doc(callId);
//                 const answerCandidates = callDoc.collection('answerCandidates');
//                 const offerCandidates = callDoc.collection('offerCandidates');

//                 pc.onicecandidate = (event) => {
//                     event.candidate && answerCandidates.add(event.candidate.toJSON());
//                 };

//                 const callData = (await callDoc.get()).data();

//                 const offerDescription = callData.offer;
//                 await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

//                 const answerDescription = await pc.createAnswer();
//                 await pc.setLocalDescription(answerDescription);

//                 const answer = {
//                     type: answerDescription.type,
//                     sdp: answerDescription.sdp,
//                 };

//                 await callDoc.update({ answer });

//                 offerCandidates.onSnapshot((snapshot) => {
//                     snapshot.docChanges().forEach((change) => {
//                         console.log(change);
//                         if (change.type === 'added') {
//                             let data = change.doc.data();
//                             pc.addIceCandidate(new RTCIceCandidate(data));
//                         }
//                     });
//                 });
//             }}>Answer Bttn</button>

//             <video ref={webCamVideoRef}></video>
//             <video ref={remoteVideoRef}></video>

//             <button>Hang up Bttn</button>
//         </div>


//     )
// }
