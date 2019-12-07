const express = require("express");
const path = require("path");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

const PORT = 3000;

var videos = [];

// Configuracao do path publico do ejs e do express
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "public"));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

// Configuracao da port do servidor e mensagem de inicializacao
server.listen(PORT, function(data) {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Retorna o index no path /
app.use("/", (req, res) => {
  res.render("index.html");
});

io.on("connection", socket => {
  socket.on("onready", teste => {
    socket.emit("video-list", videos);
    socket.broadcast.emit("video-list", videos);
  });

  // Envia o vetor de urls para todos os clientes
  socket.on("send-video", musicUrl => {
    if (!(musicUrl == "")) {
      videos.push(musicUrl);
    }
    socket.emit("video-list", videos);
    socket.broadcast.emit("video-list", videos);
  });

  // Remove o video que ja foi reproduzido e envia a nova lista para todos clientes
  socket.on("update", musicUrl => {
    videos.splice(0, 1);
    socket.emit("video-list", videos);
    socket.broadcast.emit("video-list", videos);
  });

  // Pausa para todos os clientes
  socket.on("pause", data => {
    socket.broadcast.emit("pause-all");
  });

  // Despausa para todos os cliente
  socket.on("unpause", data => {
    socket.broadcast.emit("unpause-all");
  });
});
