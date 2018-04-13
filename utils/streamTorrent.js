function streamTorrent (result,parseRange, fs, res,req){
  let path = result.name
  const stat = fs.statSync(path)
  const fileSize = stat.size
  const ranges = parseRange(result.length, req.headers.range, { combine: true });
  if (ranges === -1) {
      // 416 Requested Range Not Satisfiable
      res.statusCode = 416;
      return res.end();
    } else if (ranges === -2 || ranges.type !== 'bytes' || ranges.length > 1) {
      // 200 OK requested range malformed or multiple ranges requested, stream entire video
      if (req.method !== 'GET') return res.end();
      result.createReadStream().pipe(res);
    } else {
      // 206 Partial Content valid range requested
      const range = ranges[0];
      res.statusCode = 206;
      res.setHeader('Content-Length', 1 + range.end - range.start);
      res.setHeader('Content-Range', `bytes ${range.start}-${range.end}/${result.length}`)
      return fs.createReadStream(path).pipe(res)
  }
}

module.exports = streamTorrent;
