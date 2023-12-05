"use client"

import { studySession, user } from '@/types'
import styles from "./page.module.css";
import { useEffect, useRef, useState } from "react";
import { Peer } from "peerjs"; Peer
import type { DataConnection } from "peerjs";
import { v4 as uuidV4 } from "uuid"
import { retreiveFromLocalStorage, saveToLocalStorage } from '@/utility/savestorage';
import { changeStudySessionsServObj, readStudySessionsServObj } from '@/utility/serverFunctions/handlestudySessions';

export default function StudySession({ seenStudySession, signedInUserId }: { seenStudySession: studySession, signedInUserId?: string }) {

    const [peer, peerSet] = useState<Peer>()
    const [connections, connectionsSet] = useState<DataConnection[]>([])

    const [localUserId, localUserIdSet] = useState("")

    const lastSavedVersionNumber = useRef("")
    const lastSavedPeerIdsSeen = useRef<string[]>([])


    const [peerConnected, peerConnectedSet] = useState(false)

    const [currentMessage, currentMessageSet] = useState("")
    const [chat, chatSet] = useState<string[]>([])

    //on creation of the studysession room
    //
    //a user id is paired to a ref
    //on reload/reentry it stays the same
    //more people join the session you make another peer entry

    //check server
    useEffect(() => {
        const myInterval = setInterval(async () => {
            //ask server if any changess
            const response = await readStudySessionsServObj(seenStudySession.id)
            console.log(`$response`, response);

            //changes happened do something
            if (response.studySessionInfo.version !== lastSavedVersionNumber.current) {
                console.log(`$changes happened on server`);

                lastSavedVersionNumber.current = response.studySessionInfo.version
                const serverSeenUsers = response.studySessionInfo.members

                //someone can join the session
                const peerIdsNotSeenOnMyEnd: string[] = []//peer ids
                Object.entries(serverSeenUsers).forEach(eachEntry => {

                    if (eachEntry[1].peerId && !lastSavedPeerIdsSeen.current.includes(eachEntry[1].peerId) && eachEntry[0] !== localUserId) {
                        //not seen locally, push latest server changes
                        lastSavedPeerIdsSeen.current.push(eachEntry[1].peerId)
                        peerIdsNotSeenOnMyEnd.push(eachEntry[1].peerId)
                    }
                })


                //someone can leave the session
                const peerIdsNotSeenOnServerEnd: string[] = []
                lastSavedPeerIdsSeen.current.forEach(eachPeerId => {
                    //user disconnected from server clear locally

                    let foundInArr = false
                    Object.entries(serverSeenUsers).forEach(eachEntry => {
                        if (eachEntry[1].peerId) {
                            if (eachEntry[1].peerId === eachPeerId || eachEntry[0] === localUserId) {
                                foundInArr = true
                            }
                        }
                    })

                    if (!foundInArr) {
                        peerIdsNotSeenOnServerEnd.push(eachPeerId)
                    }
                })



                //go through not seen on my end and connect to each peer
                peerIdsNotSeenOnMyEnd.forEach(eachPeerId => {
                    //peer connect
                    //if my peer id dont connect
                    connectToPeer(eachPeerId)
                    console.log(`$peer attempt to connect for `, eachPeerId);
                })


                peerIdsNotSeenOnServerEnd.forEach(eachPeerId => {
                    //close connections
                    //if my peer id dont disconnect
                    console.log(`$peer attempt to close connect for `, eachPeerId);
                })
            }

        }, 5000)

        return () => clearInterval(myInterval)

    }, [peer, connections])

    const mounted = useRef(false)
    //start off peer
    useEffect(() => {
        if (mounted.current) return
        mounted.current = true

        //run here

        if (signedInUserId) {
            localUserIdSet(signedInUserId)

        } else {
            const seenIdFromStorage = retreiveFromLocalStorage("localUserId")

            if (seenIdFromStorage !== null) {
                localUserIdSet(seenIdFromStorage)

            } else {
                //save to local storage
                const newLocalUserId = uuidV4()

                localUserIdSet(newLocalUserId)
                saveToLocalStorage("localUserId", newLocalUserId)
            }
        }

        peerSet(new Peer())
    }, [])

    //handle peer
    useEffect(() => {
        if (!peer) return

        peer.on("open", (peerId) => {
            changeStudySessionsServObj(seenStudySession.id, localUserId, peerId, uuidV4())
        })

        //receive the connections
        peer.on('connection', (conn) => {
            connectionsSet(prevConnections => [...prevConnections, conn])
        });
    }, [peer])

    //handle conn
    useEffect(() => {
        if (connections.length < 1) return

        // on open will be launch when you successfully connect to PeerServer
        connections.forEach(eachConn => {
            eachConn.on('open', () => {
                peerConnectedSet(true)
            });

            eachConn.on('data', (data) => {
                chatSet(prevMessages => [...prevMessages, data as string])
            });

            eachConn.on('close', () => {
                peerConnectedSet(false)
            });
        })

    }, [connections])

    const connectToPeer = (peerId: string) => {
        if (!peer) {
            console.log(`$no peer seen`);
            return
        }

        connectionsSet(prevConnections => [...prevConnections, peer.connect(peerId)])
    }

    const sendMessage = () => {
        if (connections.length < 1) {
            console.log(`$no peer connection seen`);
            return
        }

        connections.forEach(eachConnection => {
            eachConnection.send(currentMessage);
        })

        chatSet(prevMessages => [...prevMessages, currentMessage])
        currentMessageSet("")
    }

    const disconnectFromPeers = () => {
        if (connections.length < 1) return

        connections.forEach(eachConnection => {
            eachConnection.close()
        })
    }

    return (
        <div>
            <p>Here in study session</p>

            {peerConnected && <p style={{ color: 'green' }}>Connected</p>}

            <p>Your id {peer?.id}</p>

            {peerConnected &&
                <button onClick={disconnectFromPeers}>Disconnect</button>
            }

            {peerConnected && (
                <div style={{ backgroundColor: "#0f0" }}>
                    <p>chat room</p>

                    <div style={{ display: "grid", gap: ".5rem", maxHeight: "80vh", overflowY: "auto" }}>
                        {chat.map((eachMessage, eachMessageIndex) => {
                            return <p style={{ backgroundColor: "#fff", color: "#000", padding: "1rem" }} key={eachMessageIndex}>{eachMessage}</p>
                        })}
                    </div>

                    <input value={currentMessage} onChange={(e) => { currentMessageSet(e.target.value) }} type="text" placeholder="Enter your message" />
                    <button onClick={sendMessage}>Send Message</button>
                </div>
            )}
        </div>
    );
}