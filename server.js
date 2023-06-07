const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuidv4 } = require("uuid");
const { ExpressPeerServer } = require("peer");
const url = require("url");
const path = require("path");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});
app.set("view engine", "ejs");
app.use("/public", require("express").static(path.join(__dirname, "static")));
app.use("/peerjs", peerServer);
app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "static", "index.html"));
});
app.get("/join", (req, res) => {
  res.redirect(
    url.format({
      pathname: `/join/${uuidv4()}`,
      query: req.query,
    })
  );
});
app.get("/joinid", (req, res) => {
  res.redirect(
    url.format({
      pathname: req.query.mid,
      query: req.query,
    })
  );
});
app.get("/join/:rooms", (req, res) => {
  res.render("room", { roomid: req.params.rooms, Myname: req.query.name });
});
io.on("connection", (socket) => {
  socket.on("join-room", (roomid, id, username) => {
    socket.join(roomid);
    socket.broadcast.to(roomid).emit("user-connected", id, username);
    socket.on("tellName", (myname) => {
      socket.broadcast.to(roomid).emit("AddName", myname);
    });
    socket.on("disconnect", () => {
      socket.broadcast.to(roomid).emit("user-disconnected", id);
    });
  });
});
server.listen(3030);
