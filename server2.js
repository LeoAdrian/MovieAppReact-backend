const fs = require('fs');
const app = require('express')();
const torrentStream = require('torrent-stream');
const path = require('path');
const parseRange = require('range-parser');
const bodyParser = require('body-parser');
const TorrentSearchApi = require('torrent-search-api');
// Install cors in order to fix the cross origin err
const cors = require('cors');
// Instantiating torrentSearch for use
const torrentSearch = new TorrentSearchApi();

// Socket.io integration
const http = require('http').Server(app);
const io = require('socket.io')(http);

// Modules
const getMagnet = require('./utils/getMagnetLink');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

torrentSearch.enableProvider('1337x')

app.use(cors());

app.post('/', function(req,res) {
  console.log(req.body.torrent);
  res.sendStatus(200);
});



app.listen('8000', function(){
    console.log('Listening on port 8000');
  })
