const http2 = require("http2");
const fs = require("fs");

const PORT = 3000;
 
function onRequest (req, res) {
  res.end("<h1>Hello World!</h1>");
}
 
const server = http2.createSecureServer({
  key: fs.readFileSync(__dirname + "/ssl/key.pem"),
  cert: fs.readFileSync(__dirname + "/ssl/cert.pem")
}, onRequest);
 
server.listen(PORT, () => {
  console.log("http2 server started on port", PORT);
});