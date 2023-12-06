"use client"

import { authorizedMemberList, studySession, user } from '@/types'
import styles from "./page.module.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { Peer } from "peerjs";
import type { DataConnection } from "peerjs";
import { v4 as uuidV4 } from "uuid"
import { retreiveFromLocalStorage, saveToLocalStorage } from '@/utility/savestorage';
import { changeStudySessionsServObj, readStudySessionsServObj, removeUserFromstudySessionsServObj } from '@/utility/serverFunctions/handlestudySessions';
import { wait } from '@/utility/useful/NiceFunctions';
import { toast } from 'react-hot-toast';
import { inProduction } from '@/utility/globalState';

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
        if (!authorizedMemberList) {
            if (signedInUserId && signedInUserId === seenStudySession.userId) {
                return "host"
            } else {
                return "normal"
            }
        }

        if (authorizedMemberList[localUserId] !== undefined) {
            return authorizedMemberList[localUserId].role
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

    const localStream = useRef<null | MediaStream>(null);
    const remoteStream = useRef<null | MediaStream>(null);

    const remoteVideosRef = useRef<HTMLVideoElement[]>([]);

    const myVideoRef = useRef<HTMLVideoElement>(null!);

    const remoteVideosCont = useRef<HTMLDivElement>(null!);

    //handle peer events
    const mounted = useRef(false)
    useEffect(() => {
        if (mounted.current) return
        mounted.current = true

        console.log(`$ran opening useeffect`);

        peer.on("open", () => {
            updateAndReadMembers()
        })

        peer.on("close", () => {
            disconnectConnections()
        })

        //receive the connections
        peer.on('connection', (conn) => {

            conn.on('open', () => {
                console.log(`$connection open - established to `, conn.peer);
                connectToPeer(conn.peer)//relay received connection to send connections
            });

            conn.on('data', (data) => {
                chatSet(prevMessages => [...prevMessages, data as string])
            });

            conn.on('close', () => {
                console.log(`$seen a conn closed`, conn.peer);
                sendConnections.current = sendConnections.current.filter(eachConnection => eachConnection.peer !== conn.peer)
                refresherSet(prev => !prev)
            });
        });

        //handle video calls
        peer.on("call", (call) => {
            console.log(`$seeing someone calling`);
            const newVid = document.createElement("video")

            const runit = async () => {
                myVideoRef.current.muted = true //mut my video

                localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                addlocalVideoStream(myVideoRef.current, localStream.current)

                call.answer(localStream.current!) //send em my data
            }
            runit()

            call.on("stream", (userVideoStream) => {
                addRemoteVideoStream(newVid, userVideoStream)
            })

            // call.on("close", () => {
            //     newVid.remove()
            // })
        })

        peer.on("error", (err) => {
            console.log(`$peer err bounds`, err.message);
        })
    }, [])

    //snap chat on new message
    useEffect(() => {
        if (chat.length < 1 || userWantsToScroll) return

        chatRef.current.scrollTop = chatRef.current.scrollHeight
    }, [chat, userWantsToScroll])

    useEffect(() => {
        // Register the event listener for beforeunload
        window.addEventListener('beforeunload', handleUnload);

        // Clean up the event listener when the component is unmounted
        return () => {
            window.removeEventListener('beforeunload', handleUnload);
            sendConnections.current.length > 0 && disconnectConnections()
            // Additional cleanup logic if needed
        };
    }, []);






    const updateAndReadMembers = async () => {
        //write current info to server
        await changeStudySessionsServObj(seenStudySession.id, localUserId, peer.id)

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
        console.log(`$reading latest members`, usersFromServer);

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
        let seenInArr = false
        sendConnections.current.forEach(eachConn => {
            if (eachConn.peer === peerId) {
                seenInArr = true
            }
        })

        if (!seenInArr) sendConnections.current.push(peer.connect(peerId))
        refresherSet(prev => !prev)
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

        myVideoRef.current.muted = true //mut my video

        localStream.current = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        addlocalVideoStream(myVideoRef.current, localStream.current)

        //send data across
        sendConnections.current.forEach(eachConnection => {
            callNewUser(eachConnection.peer, localStream.current!)
        })
    }

    const callNewUser = (userId: string, stream: MediaStream) => {
        const call = peer.call(userId, stream);

        const newVid = document.createElement("video")

        call.on("stream", (remoteVideoStream) => {
            addRemoteVideoStream(newVid, remoteVideoStream)
        })

        call.on("close", () => {
            newVid.remove()
        })
    }

    const addlocalVideoStream = (video: HTMLVideoElement, stream: MediaStream) => {
        video.srcObject = stream;

        video.addEventListener("loadedmetadata", () => {
            video.play()
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
        <div>
            {sendConnections.current.length > 0 && (
                <div>
                    <p style={{ color: "#0f0" }}>{sendConnections.current.length} {sendConnections.current.length === 1 ? "other person" : "People"} online</p>
                    <button onClick={disconnectConnections}>Disconnect</button>
                </div>
            )}

            <div style={{ backgroundColor: "#999", height: "60vh", display: "grid", gridTemplateRows: "5fr 1fr" }}>
                <div ref={chatRef} style={{ display: "grid", gap: ".5rem", overflowY: "auto", gridAutoRows: "70px", padding: "1rem" }}
                    onScroll={() => {
                        const calcScrollTop = chatRef.current.scrollHeight - chatRef.current.clientHeight
                        const isAtBottom = calcScrollTop > (chatRef.current.scrollTop - 10) && calcScrollTop < (chatRef.current.scrollTop + 10)

                        // Update state based on user scroll position
                        userWantsToScrollSet(!isAtBottom);
                    }}>
                    {chat.map((eachMessage, eachMessageIndex) => {
                        return <p style={{ backgroundColor: "#fff", color: "#000", padding: "1rem" }} key={eachMessageIndex}>{eachMessage}</p>
                    })}
                </div>

                <div style={{ marginLeft: "1rem" }}>
                    <input value={currentMessage} onChange={(e) => { currentMessageSet(e.target.value) }} onKeyDown={(e) => { if (e.key === "Enter") sendMessage() }} type="text" placeholder="Enter your message" />

                    <button onClick={sendMessage}>Send Message</button>
                </div>
            </div>

            <div>
                <video style={{ aspectRatio: "19/6", width: "300px" }} ref={myVideoRef}></video>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, 300px)" }} ref={remoteVideosCont}>
                    <p>Remote videos</p>
                </div>
            </div>

            <button onClick={makeVideoCall}>WebCam Bttn</button>
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
