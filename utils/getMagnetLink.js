function getMagnet (movieName, torrentAPI) {
  return new Promise((resolve,reject) => {
 // fetching the movie name from the frontend to get magnet link
 console.log('Name from the frontend: ',movieName);
 let rightSize = [];
 torrentAPI.search(movieName, 'Movies', 5)
 .then(torrents => {
   for(var i = 0; i < torrents.length; i++){
   if(parseFloat(torrents[i].size) !== null){
     rightSize.push(torrents[i]);
     break;
   }
 }
 // console.log('Torrent details: ',rightSize[0])
 torrentAPI.getMagnet(rightSize[0])
 .then(magnet => {
   uri = magnet;
   resolve(magnet)
   console.log('URI is: \n',uri);
   })
 .catch(err => console.log(err))
}
)
 .catch(err => console.log(err))
})
}

module.exports = getMagnet;
