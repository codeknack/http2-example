const http2 = require("http2");
const fs = require("fs");
const mime = require("mime");

const PORT = 3000;
const serverOptions = {
  key: fs.readFileSync(__dirname + "/ssl/key.pem"),
  cert: fs.readFileSync(__dirname + "/ssl/cert.pem")
};

const sendFile = (stream, fileName) => {
  const fd = fs.openSync(fileName, "r");
  const stats = fs.fstatSync(fd);
  const headers = {
    "content-length": stats.size,
    "content-type": mime.getType(fileName),
    "last-modified": stats.mtime.toUTCString()
  };

  stream.respondWithFD(fd, headers);
  stream.on("close", () => {
    console.log("closing file", fileName);
    fs.closeSync(fd);
  });
  stream.end();
};

const pushFile = (stream, path, fileName) => {
  stream.pushStream({ ":path": path }, (err, pushStream) => {
    if (err) {
      throw err;
    }
    sendFile(pushStream, fileName);
  });
};

const requestHandler = (req, res) => {
  console.log(req.url);
  if (req.url === "/") {
    // push all files in styles directory
    const styles = fs.readdirSync(__dirname + "/styles");
    styles.forEach( file => {
      const fileName = __dirname + "/styles/" + file;
      const path = "/styles/" + file;
      pushFile(res.stream, path, fileName);
    })

    // push all files in scripts directory
    const scripts = fs.readdirSync(__dirname + "/scripts");
    scripts.forEach( file => {
      const fileName = __dirname + "/scripts/" + file;
      const path = "/scripts/" + file;
      pushFile(res.stream, path, fileName);
    })

    // push all files in images directory
    const images = fs.readdirSync(__dirname + "/images");
    images.forEach( file => {
      const fileName = __dirname + "/images/" + file;
      const path = "/images/" + file;
      pushFile(res.stream, path, fileName);
    })

    sendFile(res.stream, "index.html");
  } else {
    if (req.url === "/favicon.ico") {
      res.stream.respond({ ":status": 200 });
      res.stream.end();
      return;
    }
    const fileName = __dirname + req.url;
    sendFile(res.stream, fileName);
  }
};

http2
  .createSecureServer(serverOptions, requestHandler)
  .listen(PORT, () => {
    console.log("http2 server started on port", PORT);
  });