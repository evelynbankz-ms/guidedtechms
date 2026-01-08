const API_KEY = "AIzaSyBTbM7RvxHeK6O1GMD2qWEclKK_eIdRuqQ";
const CHANNEL_ID = "UCIjWmVxHHvjrqLBKLT0QlgA";
const MAX_RESULTS = 12;

const videoGrid = document.getElementById("videoGrid");

async function loadVideos() {
  const url = `
    https://www.googleapis.com/youtube/v3/search
    ?key=${API_KEY}
    &channelId=${CHANNEL_ID}
    &part=snippet
    &order=date
    &maxResults=${MAX_RESULTS}
    &type=video
  `;

  const res = await fetch(url);
  const data = await res.json();

  videoGrid.innerHTML = "";

  data.items.forEach(item => {
    const videoId = item.id.videoId;
    const title = item.snippet.title;

    const card = document.createElement("div");
    card.className = "video-card";

    card.innerHTML = `
      <iframe
        src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen>
      </iframe>
      <div class="video-title">${title}</div>
    `;

    videoGrid.appendChild(card);
  });
}

loadVideos();
