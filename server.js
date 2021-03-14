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
  res.json('express-starter api');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`server is runniing on port ${PORT}`);
});

io.on('connection', socket => {
  const client = {};

  socket.on('login', data => {
    console.log(`logged-in(${data.name},${data.room})`);

    client.name = data.name;
    client.room = data.room;

    socket.join(data.room);
    io.to(data.room).emit('rchat', `login -${data.name}`);
  });

  socket.on('schat', data => {
    io.to(client.room).broadcast.emit('rchat', data);
  });

  socket.on('forceDisconnect', () => {
    socket.disconnect();
  });

  socket.on('disconnect', () => {
    io.to(client.room).broadcast.emit(
      'rchat',
      `logout(${client.name}, ${client.room})`,
    );
  });
});
