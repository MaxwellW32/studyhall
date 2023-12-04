"use client";

import styles from "./page.module.css";
import { io } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import ChatPage from "@/components/chatpage/ChatPage";
import { Peer } from "peerjs";
import type { DataConnection } from "peerjs";


export default function Home() {
    const [peer, peerSet] = useState<Peer>()
    const [peerId, peerIdSet] = useState("")

    const [conn, connSet] = useState<DataConnection>()

    const [remotePeerIdInput, remotePeerIdInputSet] = useState("")
    const [peerConnected, peerConnectedSet] = useState(false)

    const [currentMessage, currentMessageSet] = useState("")
    const [chat, chatSet] = useState<string[]>([])

    const mounted = useRef(false)
    //start off peer
    useEffect(() => {
        if (mounted.current) return
        mounted.current = true

        peerSet(new Peer())
    }, [])

    //handle peer
    useEffect(() => {
        if (!peer) return

        peer.on("open", (id) => {
            peerIdSet(id)
        })

        //receive the connections
        peer.on('connection', (conn) => {
            connSet(conn)
        });
    }, [peer])

    //handle conn
    useEffect(() => {
        if (!conn) return

        // on open will be launch when you successfully connect to PeerServer
        conn.on('open', () => {
            peerConnectedSet(true)
        });

        conn.on('data', (data) => {
            chatSet(prevMessages => [...prevMessages, data as string])
        });

        conn.on('close', () => {
            peerConnectedSet(false)
        });

    }, [conn])


    const connectToPeer = (peerId: string) => {
        if (!peer) {
            console.log(`$no peer seen`);
            return
        }

        connSet(peer.connect(peerId))
        remotePeerIdInputSet("")
    }

    const sendMessage = () => {
        if (!conn) {
            console.log(`$no peer connection seen`);
            return
        }

        conn.send(currentMessage);

        chatSet(prevMessages => [...prevMessages, currentMessage])
        currentMessageSet("")
    }

    const disconnectFromPeer = () => {
        if (!conn) return

        conn.close()
    }



    return (
        <div>
            {peerConnected && <p style={{ color: 'green' }}>Connected</p>}

            <p>Your id {peerId}</p>

            {peerConnected ? (
                <>
                    <button onClick={disconnectFromPeer}>Disconnect</button>
                </>
            ) : (
                <>
                    <input value={remotePeerIdInput} onChange={(e) => { remotePeerIdInputSet(e.target.value) }} type="text" placeholder="Enter peer id" />
                    {remotePeerIdInput.length > 0 && <button onClick={() => { connectToPeer(remotePeerIdInput) }}>Connect to Peer</button>}
                </>
            )}

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