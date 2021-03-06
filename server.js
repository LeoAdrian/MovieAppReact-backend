const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const parseRange = require('range-parser');
const cors = require('cors');
const OS = require('opensubtitles-api');
const OpenSubtitles = new OS('TemporaryUserAgent');
const torrentStream = require('torrent-stream');
const getMagnet = require('./utils/getMagnetLink');
const downloadTorrent = require('./utils/getTorrentFile');
const streamTorrent = require('./utils/streamTorrent');
const TorrentSearchApi = require('torrent-search-api');
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

app.use(
	bodyParser.urlencoded({
		extended: true
	})
);
app.use(bodyParser.json());

app.use(cors());

const torrentSearch = new TorrentSearchApi();
torrentSearch.enableProvider('1337x');

// Socket.io integration
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.post('/', function(req, res) {
	let name = req.body.torrent;
	let ready = true;

	// let subtitleName = name.split(' ');
	// subtitleName.length -= 2;
	// var finalName = subtitleName.join(' ');
	// console.log(finalName);

	// OpenSubtitles.search({
	// 	sublanguageid: 'rum', // Can be an array.join, 'all', or be omitted.
	// 	query: finalName, // Text-based query, this is not recommended.
	// 	// imdbid:'tt3501632'
	// 	limit: '5',
	// 	gzip: true // returns url to gzipped subtitles, defaults to false
	// }).then(subtitles => console.log(subtitles));

	let checkStatus = setInterval(() => {
		if (app.get('downloadGlobal') > 5) {
			let vlc = child_process.exec(
				`start vlc ${'"' + app.get('movieName') + '"'}`,
				function(error, stdout, stderr) {
					if (error) {
						console.error(`Child_process error: ${error}`);
						return;
					}
					console.log(`Movie was opened in VLC`);
				}
			);
			app.set('pID', vlc.pid);
			res.status(200).json(ready);
			clearInterval(checkStatus);
		}
	}, 1000);
	getMagnet(name, torrentSearch, app).then(magnet => {
		downloadTorrent(magnet, torrentStream, fs, app);
	});
});

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/views/index.html');
});

// const openVlc = function(arg, q) {
// 	return new Promise(function(resolve, reject) {
// 		let p = child_process.exec(q, arg);
// 		resolve(p);
// 	});
// };

// let searchMovie = setTimeout(function() {

//   if(app.get('downloadGlobal') > 7){
//
//     clearInterval(searchMovie);
//   }
//   const defaults = {
//   encoding: 'utf8',
//   timeout: 0,
//   maxBuffer: 200 * 1024,
//   killSignal: 'SIGTERM',
//   cwd: null,
//   env: null
// };
//   openVlc(defaults,'start cmd.exe /K start vlc').then((p) => {
//     setTimeout(function(){
//       child_process.exec(`taskill /IM ${p.pid}`);
//     },2000);
//   });
//   child_process.exec('start vlc');
// },2000);

io.on('connection', function(socket) {
	console.log('A client connected');
	socket.on('disconnect', function() {
		console.log('Client disconnected');
		app.set('downloadGlobal', 0);
		app.get('engine').destroy(function() {
			console.log('Engine destroyed');
		});
		// Getting the name of the movie that will be deleted

		// Check to see if the file name is the same as result.name
		let movie = app.get('movieName');
		if (movie) {
			// Delete file if we find it
			fs.unlink(movie, function(err) {
				if (err) {
					if (err.code === 'ENOENT') {
						console.log('Movie was not found on the disk.');
					}
				}
				console.log('Movie was deleted');
			});
		} else {
			console.log('There is nothing to delete');
		}

		app.get('engine').remove(function() {
			console.log('All files removed from memory');
		});
	});
});

// app.get('/video', function(req,res){
//   streamTorrent(app.get('file'),parseRange, fs, res,req);
// })

server.listen(8000 || process.env.PORT, function() {
	console.log('Server started on port 8000');
});
