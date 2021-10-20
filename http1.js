const https = require("https");
const fs = require("fs");
const mime = require("mime");

const PORT = 3000;
const serverOptions = {
  key: fs.readFileSync(__dirname + "/ssl/key.pem"),
  cert: fs.readFileSync(__dirname + "/ssl/cert.pem")
};

const requestHandler = (req, res) => {
  console.log(req.url);
  if (req.url === "/favicon.ico") {
    res.writeHead(200);
    res.end();
    return;
  } 

  const fileName = req.url === "/" ? "index.html" : __dirname + req.url;
  fs.readFile(fileName, (err, data) => {
    if (err) {
      res.writeHead(503);
      res.end("Error occurred while reading file", fileName);
      return;
    }
    res.writeHead(200, { "Content-Type": mime.getType(fileName) });
    res.end(data);
  });
};

https
  .createServer(serverOptions, requestHandler)
  .listen(PORT, () =>
    console.log("http1 server started on port", PORT)
  );

