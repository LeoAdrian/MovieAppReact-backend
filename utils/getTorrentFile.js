function downloadTorrent(magnet, torrentStream, fs, app) {
	const engine = torrentStream(magnet);
	app.set('engine', engine);
	return new Promise(function(resolve, reject) {
		engine.on('ready', function() {
			engine.files.forEach(function(file) {
				if (
					file.name.substr(file.name.length - 3) == 'mkv' ||
					file.name.substr(file.name.length - 3) == 'mp4'
				) {
					console.log('filename:', file.name);
					app.set('movieName', file.name);
					var stream = file.createReadStream();
					var writable = fs.createWriteStream(file.name);
					stream.pipe(writable);
					engine.on('download', function() {
						console.log(file.name);
						let downloadInfo = parseFloat(
							engine.swarm.downloaded / file.length * 100
						);
						console.log(downloadInfo + '%');
						app.set('downloadGlobal', downloadInfo);
						app.set('file', file);
						resolve(file);
					});
					engine.on('idle', function() {
						console.log('Finished downloading file');
						// engine.remove(() => console.log('removed'))
					});
				}
			});
		});
	});
}

module.exports = downloadTorrent;
