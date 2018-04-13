// const fs = require('fs');
// const app = require('express')();
// const torrentStream = require('torrent-stream');
// const path = require('path');
// const parseRange = require('range-parser');
// const bodyParser = require('body-parser');
// const TorrentSearchApi = require('torrent-search-api');
// // Install cors in order to fix the cross origin err
// const cors = require('cors');
// // Instantiating torrentSearch for use
// const torrentSearch = new TorrentSearchApi();
//
// // Socket.io integration
// var http = require('http').Server(app);
// var io = require('socket.io')(http);
//
// app.use(bodyParser.urlencoded({
//   extended: true
// }));
// app.use(bodyParser.json());
//
// torrentSearch.enableProvider('1337x')
//
// app.use(cors());
//
// app.get('/movie', function(req,res){
//   res.sendFile(__dirname + '/views/index.html');
// })
//
// app.post('/', function(req, res){
//     let name = req.body.torrent;
//     res.status(200);
//     const getMagnetLink = new Promise((resolve,reject) => {
//     // fetching the movie name from the frontend to get magnet link
//     console.log('Name from the frontend: ',name);
//     let rightSize = [];
//     torrentSearch.search(name, 'Movies', 5)
//     .then(torrents => {
//       for(var i = 0; i < torrents.length; i++){
//       if(parseFloat(torrents[i].size) !== null){
//         rightSize.push(torrents[i]);
//         break;
//       }
//     }
//     // console.log('Torrent details: ',rightSize[0])
//     torrentSearch.getMagnet(rightSize[0])
//     .then(magnet => {
//       uri = magnet;
//       resolve(magnet)
//       // console.log('URI is: \n',uri);
//       })
//     .catch(err => console.log(err))
//   }
//   )
//     .catch(err => console.log(err))
//   })
//   getMagnetLink
//   .then(magnet => {
//     console.log('magnet link promise');
//     console.log(`Name is: ${name}`);
//
//   let engine = torrentStream(magnet);
//   const getTorrentFile = new Promise (function(resolve, reject){
//       engine.on('ready', function() {
//        engine.files.forEach(function(file) {
//                 if (file.name.substr(file.name.length - 3) == 'mkv' || file.name.substr(file.name.length - 3) == 'mp4') {
//                   console.log('filename:', file.name);
//                   app.set('movieName',file.name);
//                   var stream = file.createReadStream();
//                   var writable = fs.createWriteStream(file.name);
//                   stream.pipe(writable);
//                   engine.on('download', function () {
//                     console.log(file.name);
//                     let downloadInfo = parseFloat(engine.swarm.downloaded/ file.length * 100);
//                     console.log(downloadInfo + '%');
//                     app.set('downloadGlobal', downloadInfo);
//                     resolve(file);
//                   });
//                   engine.on('idle', function(){
//                     console.log('Finished downloading file');
//                     // engine.remove(() => console.log('removed'))
//                   })
//                 }
//        });
//      });
//   });
//
//
//   io.on('connection', function(socket){
//     console.log('A client connected');
//     socket.on('disconnect', function(){
//       console.log('Client disconnected');
//       engine.destroy(function(){console.log('Engine destroyed')});
//       // Getting the name of the movie that will be deleted
//
//         // Check to see if the file name is the same as result.name
//         let movie = app.get('movieName');
//         if(movie){
//           // Delete file if we find it
//           fs.unlink(movie, function(err){
//             if(err) {
//               if(err.code === 'ENOENT'){
//                 console.log('Movie wasn\'t found on the disk.')
//               }
//             };
//             console.log('Movie was deleted');
//           })
//         } else {
//           console.log('There is nothing to delete');
//         }
//
//       engine.remove(function(){console.log('All files removed from memory')});
//     })
//   })
//
//   app.get('/', function (req, res, next) {
//     if(app.get('downloadGlobal') < 5){
//         res.send('Loading');
//     }
//   next()
// }, function (req, res, next) {
//   res.redirect('/movie');
// })
//
//   app.get('/',function(req,res){
//     res.sendFile(path.resolve(__dirname + '/views/index.html'));
//   })
// // Route that serves the stream to the video tag in index
// app.get('/video', function(req, res) {
//   getTorrentFile.then(result => {
//     var file = path.resolve(__dirname,result.name);
//     fs.stat(file, function(err, stats) {
//       if (err) {
//         if (err.code === 'ENOENT') {
//           // 404 Error if file not found
//           return res.sendStatus(404);
//         }
//       res.end(err);
//       }
//       var range = req.headers.range;
//       if (!range) {
//        // 416 Wrong range
//        return res.sendStatus(416);
//       }
//       var positions = range.replace(/bytes=/, "").split("-");
//       var start = parseInt(positions[0], 10);
//       var total = stats.size;
//       var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
//       var chunksize = (end - start) + 1;
//
//       res.writeHead(206, {
//         "Content-Range": "bytes " + start + "-" + end + "/" + total,
//         "Accept-Ranges": "bytes",
//         "Content-Length": chunksize,
//         "Content-Type": "video/mp4"
//       });
//
//       var stream = fs.createReadStream(file, { start: start, end: end })
//         .on("open", function() {
//           stream.pipe(res);
//         }).on("error", function(err) {
//           res.end(err);
//         });
//     });
//   })
//     })
//   })
//   })
//
//
//
// http.listen('8000', function(){
//   console.log('Listening on port 8000');
// })
