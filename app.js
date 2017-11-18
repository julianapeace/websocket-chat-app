const express = require('express');
const app = express();
const morgan = require('morgan');
const body_parser = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);
// var Redis = require('ioredis');
// var redis = new Redis();

var ROOMS = {}; //want to this in db/memcache/or redis so it doesn't get reset

app.set('view engine', 'hbs');
app.use(morgan('dev'));
app.use(body_parser.urlencoded({extended: false}));
app.use(express.static('public'));

app.use('/socket-io',
  express.static('node_modules/socket.io-client/dist'));

app.get('/', function (req, res) {
  res.render('chat.hbs');
});
// Add support for nicknames
// Don’t send the same message to the user that sent it himself. Instead, append the message directly as soon as he presses enter.
// Add “{user} is typing” functionality
// Show who’s online
// Add private messaging
io.on('connection', function(client){
  console.log('CONNECTED');

  client.on('join-room', function(room){
    client.join(room, function() {
      console.log(client.rooms);
      io.to(room).emit('chat-msg', '**new user joined**');
      io.to(client.id).emit('chat-msg', '**thanks for joining this room**');
    });

    if (ROOMS[room]){
      ROOMS[room].push(client.id);
    }else{
      ROOMS[room] = [client.id];
    }
    console.log(ROOMS)
    client.on('incoming', function(msg){
      io.to(msg.room).emit('chat-msg', msg.msg);
    });
  });

  client.on('disconnect', function () {
    io.emit('chat-msg', '**user left room**');
    console.log('EXITED');
  });
});

http.listen(8000, function(){
  console.log('listening on port 8000')
});
