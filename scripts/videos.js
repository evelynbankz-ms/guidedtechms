const API_KEY   = "AIzaSyBTbM7RvxHeK6O1GMD2qWEclKK_eIdRuqQ";
const CHANNEL_ID = "UCIjWmVxHHvjrqLBKLT0QlgA";
const MAX_RESULTS = 12;

const videoGrid = document.getElementById("videoGrid");

/* ── Modal scaffold (injected once) ───────────────────────────── */
function createModal() {
  const overlay = document.createElement("div");
  overlay.id = "videoModal";
  overlay.innerHTML = `
    <div class="vm-backdrop"></div>
    <div class="vm-dialog">
      <button class="vm-close" aria-label="Close video">✕</button>
      <div class="vm-iframe-wrap">
        <iframe id="vmFrame" src="" allow="accelerometer; autoplay; clipboard-write;
          encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
      <p class="vm-title" id="vmTitle"></p>
    </div>
  `;
  document.body.appendChild(overlay);

  /* close helpers */
  overlay.querySelector(".vm-backdrop").addEventListener("click", closeModal);
  overlay.querySelector(".vm-close").addEventListener("click", closeModal);
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
}

function openModal(videoId, title) {
  const modal  = document.getElementById("videoModal");
  const frame  = document.getElementById("vmFrame");
  const vmTitle = document.getElementById("vmTitle");

  frame.src   = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
  vmTitle.textContent = title;
  modal.classList.add("vm-open");
  document.body.classList.add("no-scroll");
}

function closeModal() {
  const modal = document.getElementById("videoModal");
  const frame = document.getElementById("vmFrame");
  modal.classList.remove("vm-open");
  frame.src = "";  // stop playback
  document.body.classList.remove("no-scroll");
}

/* ── Skeleton loaders ─────────────────────────────────────────── */
function showSkeletons() {
  videoGrid.innerHTML = Array.from({ length: 6 }).map(() => `
    <div class="video-card skeleton-card">
      <div class="sk-thumb"></div>
      <div class="sk-line sk-line--title"></div>
    </div>
  `).join("");
}

/* ── Main loader ──────────────────────────────────────────────── */
async function loadVideos() {
  showSkeletons();

  /* ✅ URL as a single string — no newlines / spaces that break fetch */
  const url =
    `https://www.googleapis.com/youtube/v3/search` +
    `?key=${API_KEY}` +
    `&channelId=${CHANNEL_ID}` +
    `&part=snippet` +
    `&order=date` +
    `&maxResults=${MAX_RESULTS}` +
    `&type=video`;

  try {
    const res  = await fetch(url);
    const data = await res.json();

    if (!data.items || data.items.length === 0) {
      videoGrid.innerHTML = `<p class="no-videos">No videos found.</p>`;
      return;
    }

    videoGrid.innerHTML = "";

    data.items.forEach(item => {
      const videoId = item.id.videoId;
      const title   = item.snippet.title;
      const thumb   = item.snippet.thumbnails?.high?.url
                   || item.snippet.thumbnails?.medium?.url
                   || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

      const card = document.createElement("div");
      card.className = "video-card";
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-label", `Play: ${title}`);

      card.innerHTML = `
        <div class="vc-thumb-wrap">
          <img class="vc-thumb" src="${thumb}" alt="${title}" loading="lazy" />
          <div class="vc-play-btn" aria-hidden="true">
            <svg viewBox="0 0 68 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M66.5 7.7A8.5 8.5 0 0 0 60.9 2C55.6.5 34 .5 34 .5S12.4.5 7.1 2A8.5 8.5 0 0 0 1.5 7.7C0 13 0 24 0 24s0 11 1.5 16.3A8.5 8.5 0 0 0 7.1 46c5.3 1.5 26.9 1.5 26.9 1.5s21.6 0 26.9-1.5a8.5 8.5 0 0 0 5.6-5.7C68 35 68 24 68 24s0-11-1.5-16.3z" fill="#FF0000"/>
              <path d="M27 34l18-10-18-10z" fill="#fff"/>
            </svg>
          </div>
        </div>
        <div class="video-title">${title}</div>
      `;

      const play = () => openModal(videoId, title);
      card.addEventListener("click", play);
      card.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") play(); });

      videoGrid.appendChild(card);
    });

  } catch (err) {
    console.error("YouTube API error:", err);
    videoGrid.innerHTML = `
      <p class="no-videos">
        Could not load videos. Please check your API key or network connection.
      </p>`;
  }
}

/* ── Init ─────────────────────────────────────────────────────── */
createModal();
loadVideos();
