const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const parseRange = require('range-parser');
const cors = require('cors');
const torrentStream = require('torrent-stream');
const getMagnet = require('./utils/getMagnetLink');
const downloadTorrent  = require('./utils/getTorrentFile');
const streamTorrent  = require('./utils/streamTorrent');
const TorrentSearchApi = require('torrent-search-api');
const fs = require('fs');
const path = require('path');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.use(cors());


const torrentSearch = new TorrentSearchApi();
torrentSearch.enableProvider('1337x')

// Socket.io integration
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.post('/', function(req,res){
  let name = req.body.torrent;
  let ready = true;
  let checkStatus = setInterval(() => {
    if(app.get('downloadGlobal') > 3){
        res.status(200).json(ready);
      clearInterval(checkStatus);
    }
  },1000)
  getMagnet(name, torrentSearch, app)
  .then(magnet => downloadTorrent(magnet, torrentStream, fs, app));
    // if(app.get('downloadGlobal') > 5){

    // }
})




app.get('/', function (req, res){
    res.sendFile(__dirname + '/views/index.html');
});


io.on('connection', function(socket){
  console.log('A client connected');
  socket.on('disconnect', function(){
    console.log('Client disconnected');
    app.get('engine').destroy(function(){console.log('Engine destroyed')});
    // Getting the name of the movie that will be deleted

      // Check to see if the file name is the same as result.name
      let movie = app.get('movieName');
      if(movie){
        // Delete file if we find it
        fs.unlink(movie, function(err){
          if(err) {
            if(err.code === 'ENOENT'){
              console.log('Movie was not found on the disk.')
            }
          };
          console.log('Movie was deleted');
        })
      } else {
        console.log('There is nothing to delete');
      }

    app.get('engine').remove(function(){console.log('All files removed from memory')});
  })
})

app.get('/video', function(req,res){
  streamTorrent(app.get('file'),parseRange, fs, res,req);
})



server.listen(8000 || process.env.PORT,function(){
  console.log('Server started on port 8000');
})
