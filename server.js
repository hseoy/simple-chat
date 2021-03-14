import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import morgan from 'morgan';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(morgan('dev'));

app.get('/', (_req, res) => {
  res.json('simple chat server');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`server is runniing on port ${PORT}`);
});

io.on('connection', socket => {
  console.log('connected client');
  const client = {};

  socket.on('login', data => {
    console.log(`logged-in(${data.name},${data.room})`);

    client.name = data.name;
    client.room = data.room;

    socket.join(data.room);
    io.to(client.room).emit('rchat', `login -${client.name}`);
  });

  socket.on('schat', data => {
    const resMsg = `${client.name || 'unknown'}: ${data}`;
    console.log(resMsg);
    io.to(client.room).broadcast.emit('rchat', resMsg);
  });

  socket.on('forceDisconnect', () => {
    console.log(`${client.name || 'unknown'} disconnected`);
    socket.disconnect();
  });

  socket.on('disconnect', () => {
    console.log(`${client.name || 'unknown'} disconnected`);
    io.to(client.room).broadcast.emit(
      'rchat',
      `logout(${client.name}, ${client.room})`,
    );
  });
});
