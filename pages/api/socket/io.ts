import { Server } from 'socket.io'
import { NextApiRequest } from "next"

const SocketHandler = (req: NextApiRequest, res: any) => {
    if (res.socket.server.io) {
        console.log('Socket is already running')
    } else {
        console.log('initializing socket')

        const io = new Server(res.socket.server)
        res.socket.server.io = io

        io.on("connection", (socket) => {
            console.log("A user connected:", socket.id);

            socket.on("join_room", (roomId) => {
                socket.join(roomId);
            });

            socket.on("send_msg", (data) => {
                socket.to(data.roomId).emit("receive_msg", data);
            });

            socket.on("disconnect", () => {
                console.log("A user disconnected:", socket.id);
            });
        });
    }
    res.end()
}

export default SocketHandler















// import { Server as NetServer } from "http"
// import { NextApiRequest } from "next"
// import { Server as ServerIO } from "socket.io"

// import { NextApiResponseServerIO } from "@/types"

// export const config = {
//     api: {
//         bodyParser: false
//     }
// }

// const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
//     console.log(`$seen here`);

//     if (!res.socket.server.io) {
//         const path = "/myApi/socket/io"
//         const httpServer: NetServer = res.socket.server as any
//         const io = new ServerIO(httpServer, {
//             path: path,
//             addTrailingSlash: false,
//         })

//         res.socket.server.io = io
//     }

//     res.end()
// }

// export default ioHandler