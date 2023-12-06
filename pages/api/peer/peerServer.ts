import { NextApiRequest, NextApiResponse } from "next"
const { PeerServer } = require("peer");

//this page only runs in dev mode - need Websocket provider

let alreadyStarted = false

const peerHandler = (req: NextApiRequest, res: NextApiResponse) => {
    if (alreadyStarted) {
        console.log(`$already started`);
        res.status(200).json({ message: 'already started' })
        return
    }

    alreadyStarted = true
    console.log(`$hit up peer handler`);
    const peerServer = PeerServer({ port: 9000, path: "/myPeerServer" });

    res.status(200).json({ message: 'hit up peer handler' })
}

export default peerHandler
















// import { Server } from 'socket.io'
// import { NextApiRequest } from "next"

// const SocketHandler = (req: NextApiRequest, res: any) => {
//     if (!res.socket.server.io) {
//         console.log('initializing socket')

//         const io = new Server(res.socket.server)
//         res.socket.server.io = io

//         io.on("connection", (socket) => {
//             console.log("A user connected:", socket.id);

//             socket.on("join_room", (roomId) => {
//                 socket.join(roomId);
//             });

//             socket.on("send_msg", (data) => {
//                 socket.to(data.roomId).emit("receive_msg", data);
//             });

//             socket.on("disconnect", () => {
//                 console.log("A user disconnected:", socket.id);
//             });
//         });
//     }
//     res.end()
// }

// export default SocketHandler












