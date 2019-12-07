// Declaracao do socket no ip
var socket = io("http://localhost:3000");

// Cria a tag do script para adicionar a api do youtube
var tag = document.createElement("script");

var videoLink = document.querySelector("#video-url");
var musicUrl = document.querySelector("#video-url");

var firstScriptTag = document.getElementsByTagName("script")[0];

tag.src = "https://www.youtube.com/iframe_api";
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Carrega todos os links dos videos
var videos = [];

var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "360",
    width: "640",
    videoId: getIdFromUrl(videos[0]),
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    },
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 0,
      rel: 0,
      fs: 0
    }
  });
}

// Funcao disparada quando o player carregar
function onPlayerReady(event) {
  event.target.playVideo();
  socket.emit("onready");
}

// Funcao disparada quando o player sofre alguma alteracao
function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.ENDED) {
    player.loadVideoByUrl("https://youtu.be/v/" + getIdFromUrl(videos[0]));
    socket.emit("update");
  }
  if (event.data == YT.PlayerState.PAUSED) {
    socket.emit("pause");
  }
  if (event.data == YT.PlayerState.PLAYING) {
    socket.emit("unpause");
  }
}

socket.on("pause-all", paused => {
  player.pauseVideo();
});

socket.on("unpause-all", paused => {
  player.playVideo();
});

function sendVideo() {
  socket.emit("send-video", musicUrl.value);
}

socket.on("video-list", list => {
  videos = list;
  if (videos.length == 1) {
    console.log("asd");
    player.loadVideoByUrl("https://youtu.be/v/" + getIdFromUrl(videos[0]));
  }
});

// Separa todos os formator de url e devolve o id do video
function getIdFromUrl(link = "") {
  let newId = link;
  if ((newId = link.match(/(\?|&)v=([^&#]+)/))) {
    return newId[2];
  } else if ((newId = link.match(/(\.be\/)+([^\/]+)/))) {
    return newId[2];
  } else if ((newId = link.match(/(\embed\/)+([^\/]+)/))) {
    return newId[2];
  }
}
