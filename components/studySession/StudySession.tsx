"use client"

import { authorizedMemberList, studySession, user } from '@/types'
import styles from "./page.module.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { Peer } from "peerjs"; Peer
import type { DataConnection } from "peerjs";
import { v4 as uuidV4 } from "uuid"
import { retreiveFromLocalStorage, saveToLocalStorage } from '@/utility/savestorage';
import { changeStudySessionsServObj, readStudySessionsServObj } from '@/utility/serverFunctions/handlestudySessions';
import { wait } from '@/utility/useful/NiceFunctions';

export default function StudySession({ seenStudySession, signedInUserId }: { seenStudySession: studySession, signedInUserId?: string }) {
    const [peer] = useState<Peer>(new Peer)

    const sendConnections = useRef<DataConnection[]>([])

    const lastSavedVersionNumber = useRef("")
    const lastSavedPeerIdsSeen = useRef<string[]>([])


    const [peerConnected, peerConnectedSet] = useState(false)
    const [roomFull, roomFullSet] = useState(false)

    const [currentMessage, currentMessageSet] = useState("")
    const [chat, chatSet] = useState<string[]>([])

    const [authorizedMemberList, authorizedMemberListSet] = useState<authorizedMemberList | null>(seenStudySession.authorizedMemberList ? JSON.parse(seenStudySession.authorizedMemberList) : null)

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

    const userInAutorizedList = useMemo(() => {
        if (!authorizedMemberList) return false

        const userInAuthorizedList = authorizedMemberList[localUserId]

        if (userInAuthorizedList !== undefined) return true

        return false
    }, [authorizedMemberList])


    //handle peer events
    const mounted = useRef(false)
    useEffect(() => {
        if (mounted.current) return
        mounted.current = true

        peer.on("open", (peerId) => {
            changeStudySessionsServObj(seenStudySession.id, localUserId, peerId, uuidV4())
        })

        //receive the connections
        peer.on('connection', (conn) => {
            peerConnectedSet(true)

            conn.on('data', (data) => {
                chatSet(prevMessages => [data as string, ...prevMessages])
            });
        });


        serverPingLoop()
    }, [])


    const serverLoopInterval = useRef<undefined | NodeJS.Timeout>(undefined)
    const serverLoopTime = useRef(5000)

    const serverPingLoop = () => {

        if (serverLoopInterval.current) {
            clearInterval(serverLoopInterval.current)
            serverLoopInterval.current = undefined
        }

        serverLoopInterval.current = setInterval(async () => {

            //ask server if any changess
            const response = await readStudySessionsServObj(seenStudySession.id)
            console.log(`$response`, response);

            //changes happened do something
            if (!response.studySessionInfo) return

            if (response.studySessionInfo.version !== lastSavedVersionNumber.current) {

                console.log(`$changes happened on server`);
                lastSavedVersionNumber.current = response.studySessionInfo.version

                const usersFromServer = response.studySessionInfo.members

                //someone can join the session
                const peerIdsNotSeenOnMyEnd: string[] = []//peer ids
                Object.entries(usersFromServer).forEach(eachEntry => {
                    if (!lastSavedPeerIdsSeen.current.includes(eachEntry[1].peerId) && eachEntry[0] !== localUserId) {
                        peerIdsNotSeenOnMyEnd.push(eachEntry[1].peerId)
                    }
                })

                //someone can leave the session
                const peerIdsNotSeenOnServerEnd: string[] = []
                lastSavedPeerIdsSeen.current.forEach(eachPeerId => {
                    //user disconnected from server clear locally

                    let foundInArr = false
                    Object.entries(usersFromServer).forEach(eachEntry => {
                        if (eachEntry[1].peerId === eachPeerId) {
                            foundInArr = true
                        }
                    })

                    if (!foundInArr) {
                        peerIdsNotSeenOnServerEnd.push(eachPeerId)
                    }
                })







                //connect to each peer
                peerIdsNotSeenOnMyEnd.forEach(eachPeerId => {
                    lastSavedPeerIdsSeen.current.push(eachPeerId)
                    connectToPeer(eachPeerId)
                })

                //disconenct old peers
                peerIdsNotSeenOnServerEnd.forEach(eachPeerId => {
                    console.log(`$close connection for `, eachPeerId);

                    sendConnections.current.forEach(eachConnection => {
                        if (eachConnection.peer === eachPeerId) {
                            eachConnection.close()
                        }
                    })
                })




                //handle room full, stop loop
                if (response.studySessionInfo.roomFull !== roomFull) {

                    if (response.studySessionInfo.roomFull) {
                        serverLoopTime.current = 30000
                        roomFullSet(true)
                    } else {
                        roomFullSet(false)
                        serverLoopTime.current = 5000
                    }

                    serverPingLoop()
                }
            }

        }, serverLoopTime.current)
    }



    const sendMessage = () => {
        sendConnections.current.forEach(eachConnection => {
            eachConnection.send(currentMessage);
        })

        chatSet(prevMessages => [currentMessage, ...prevMessages])
        currentMessageSet("")
    }

    const connectToPeer = (peerId: string) => {
        sendConnections.current.push(peer.connect(peerId))

        peerConnectedSet(true)
    }

    const disconnectFromPeers = () => {
        sendConnections.current.forEach(eachConnection => {
            eachConnection.close()
        })
    }

    return (
        <div>
            <p>Here in study session</p>

            {peerConnected && <p style={{ color: 'green' }}>Connected</p>}

            <p>Your id {peer?.id}</p>

            {roomFull && <p>Room closed off</p>}

            {peerConnected &&
                <>
                    <button onClick={disconnectFromPeers}>Disconnect</button>

                    {userInAutorizedList && authorizedMemberList && authorizedMemberList[localUserId].role === ("host" || "coHost") && (
                        <button onClick={() => {
                            changeStudySessionsServObj(seenStudySession.id, localUserId, peer.id, uuidV4(), !roomFull)
                        }}>{roomFull ? "Open Up Room" : "Room Full?"}</button>
                    )}
                </>
            }

            {peerConnected && (
                <div style={{ backgroundColor: "#0f0" }}>
                    <p>chat room</p>

                    <div style={{ display: "grid", gap: ".5rem", maxHeight: "100px", overflowY: "auto" }}>
                        {chat.map((eachMessage, eachMessageIndex) => {
                            return <p style={{ backgroundColor: "#fff", color: "#000", padding: "1rem" }} key={eachMessageIndex}>{eachMessage}</p>
                        })}
                    </div>

                    <input value={currentMessage} onChange={(e) => { currentMessageSet(e.target.value) }} onKeyDown={(e) => { if (e.key === "Enter") sendMessage() }} type="text" placeholder="Enter your message" />

                    <button onClick={sendMessage}>Send Message</button>
                </div>
            )}
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
