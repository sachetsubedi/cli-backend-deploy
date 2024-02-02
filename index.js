import express from "express";
import { Server } from "socket.io";
import generateRandomRoomName from './scripts/randomRoomGenerator.js';
import cors from "cors";
const app = express();
app.use(cors());

app.get("/", (req, res) => {
    res.send("Resonse");
});
const httpServer=app.listen(3000, console.log("Server running at 3000"));
const io= new Server(httpServer,{
    cors:{
        origin:'*'
    }
})

io.on('connection',(socket)=>{
    
    const defaultNames = ['Anonymous Monkey', 'Captain Quirk', 'Luna Stardust', 'Sunny Sideup', 'Pixel Pajamas', 'Whispering Willow', 'Captain Noodle', 'Mystic Muffin', 'Jazzberry Jam', 'Dizzy Dinosaur', 'Cheesequake Cactus', 'Moonlight Marmalade', 'Sir Snugglekins', 'Chuckleberry Finn', 'Bubbles McFluff', 'Doodlebug Daffodil', 'Spaghetti Supernova', 'Giggles McGee', 'Scribble Scribble', 'Twinkle Toes'];
    let userName;
    let roomId='master';
    socket.join(roomId);

    socket.on('joinRoom',(currentRoom,room)=>{
        socket.broadcast.to(currentRoom).emit('leftCustomRoom',userName);
        socket.leave(currentRoom);
        socket.join(room);
        socket.emit('roomJoined',room);
        socket.broadcast.to(room).emit('join',userName);
        roomId=room;
    })

    socket.on('createRoom',(currentRoom)=>{
        const room=generateRandomRoomName();
        socket.broadcast.to(currentRoom).emit('leftCustomRoom',userName);
        socket.leave(currentRoom);
        socket.join(room);
        socket.emit('roomCreated',room);
        socket.emit('roomJoined',room);
        roomId=room;
    })

      
    // send connection message
    socket.on('createConnection',(name)=>{
        name!=null?userName=name:userName=defaultNames[Math.floor(Math.random()*20)];
        socket.broadcast.to(roomId).emit('connected',userName);
        socket.emit('connectionSuccess',userName);
    })
    // message sent
    socket.on('message',(mess)=>{
        console.log(mess);
        io.to(roomId).emit('message',{userName:userName,message:mess});
    })

    
    // rename user
    socket.on('rename',(newUserName)=>{
        const oldUsername=userName;
        userName=newUserName;
        socket.broadcast.to(roomId).emit('rename',{oldUsername,userName});
        socket.emit('renamed',{oldUsername,userName});
    })

    socket.on('disconnect',(reason)=>{
        socket.broadcast.to(roomId).emit('disconnected',userName);
    })
    
})