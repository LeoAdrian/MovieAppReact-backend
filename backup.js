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
  getMagnet(name, torrentSearch, app)
  .then(magnet => downloadTorrent(magnet, torrentStream, fs, app));
})


app.get('/', function(req,res,next){
  res.sendFile(__dirname + '/views/index.html');
})

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
              console.log('Movie wasn\'t found on the disk.')
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
  const path = app.get('file').name
  const stat = fs.statSync(path)
  const fileSize = stat.size
  const ranges = parseRange(app.get('file').length, req.headers.range, { combine: true });
  if (ranges === -1) {
      // 416 Requested Range Not Satisfiable
      res.statusCode = 416;
      return res.end();
    } else if (ranges === -2 || ranges.type !== 'bytes' || ranges.length > 1) {
      // 200 OK requested range malformed or multiple ranges requested, stream entire video
      if (req.method !== 'GET') return res.end();
      app.get('file').createReadStream().pipe(res);
    } else {
      // 206 Partial Content valid range requested
      const range = ranges[0];
      res.statusCode = 206;
      res.setHeader('Content-Length', 1 + range.end - range.start);
      res.setHeader('Content-Range', `bytes ${range.start}-${range.end}/${app.get('file').length}`)
    fs.createReadStream(path).pipe(res)
  }
})



server.listen(8000 || process.env.PORT,function(){
  console.log('Server started on port 8000');
})