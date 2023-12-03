"use client";

import styles from "./page.module.css";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";
import ChatPage from "@/components/chatpage/ChatPage";


let socket: any
export default function Home() {
    const [showingChat, showingChatSet] = useState(false);
    const [userName, setUserName] = useState("");
    const [showSpinner, setShowSpinner] = useState(false);
    const [roomId, setroomId] = useState("");

    useEffect(() => {
        const socketInitializer = async () => {
            await fetch('/api/socket/io')
            socket = io()

            socket.on('connect', () => {
                console.log('connected')
            })
        }

        socketInitializer()
    }, [])


    const handleJoin = () => {
        if (userName === "" || roomId === "") return alert("Please fill in Username and Room Id")

        socket.emit("join_room", roomId);
        setShowSpinner(true);

        setTimeout(() => {
            showingChatSet(true);
            setShowSpinner(false);
        }, 500);
    };

    return (
        <div>

            {showingChat ?
                <ChatPage socket={socket} roomId={roomId} username={userName} />
                :
                <div
                    className={styles.main_div}
                >
                    <input
                        className={styles.main_input}
                        type="text"
                        placeholder="Username"
                        onChange={(e) => setUserName(e.target.value)}
                        disabled={showSpinner}
                    />
                    <input
                        className={styles.main_input}
                        type="text"
                        placeholder="room id"
                        onChange={(e) => setroomId(e.target.value)}
                        disabled={showSpinner}
                    />
                    <button className={styles.main_button} onClick={handleJoin}>
                        {!showSpinner ? (
                            "Join"
                        ) : (
                            <div className={styles.loading_spinner}></div>
                        )}
                    </button>
                </div>
            }
        </div>
    );
}