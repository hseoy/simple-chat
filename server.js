const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.get('/', (_req, res) => {
  res.json('simple chat server');
});

const server = app.listen(PORT, () => {
  console.log(`server is runniing on port ${PORT}`);
});

const io = require('socket.io')(server);

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
    io.to(client.room).emit('rchat', resMsg);
  });

  socket.on('forceDisconnect', () => {
    console.log(`${client.name || 'unknown'} disconnected`);
    socket.disconnect();
  });

  socket.on('disconnect', () => {
    console.log(`${client.name || 'unknown'} disconnected`);
    io.to(client.room).emit('rchat', `logout(${client.name}, ${client.room})`);
  });
});
