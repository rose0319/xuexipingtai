let allVideos = [];
let currentIndex = 0;
const pageSize = 10;

//视频加载
function loadNextPage() {
    const container = document.getElementById("videoContainer");
    const videosToLoad = allVideos.slice(currentIndex, currentIndex + pageSize);

    videosToLoad.forEach(video => {
        const box = document.createElement("div");
        box.className = "video-box";
        box.innerHTML = `
  <iframe src="${video.iframe}" allowfullscreen></iframe>
  <p>${video.title}</p>
`;

        container.appendChild(box);
    });

    currentIndex += pageSize;

    if (currentIndex >= allVideos.length) {
        document.getElementById("loadMoreBtn").style.display = "none";
    }
}

fetch("http://localhost:3000/videos")
  .then(res => res.json())
  .then(data => {
      if (data.success) {
          allVideos = data.videos;
          loadNextPage(); // 首次加载
      }
  });

  //搜索功能
  function searchVideos() {
    let title = document.getElementById("searchInput").value.trim();
if (!title) return;

fetch(`http://localhost:3000/searchVideos?keyword=${encodeURIComponent(title)}`)

        .then(res => res.json())
        .then(data => {
            const container = document.getElementById("videoContainer");
            container.innerHTML = "";     // 清空旧内容
            currentIndex = 0;             // 重置索引
            allVideos = [];               // 清空缓存结果

            if (data.success && data.videos.length > 0) {
                allVideos = data.videos;
                loadNextPage();           // 加载前10条
            } else {
                container.innerHTML = "<p style='text-align:center;'>未找到相关视频</p>";
                const loadBtn = document.getElementById("loadMoreBtn");
                if (loadBtn) loadBtn.style.display = "none";
            }
        });
}

//分类功能
function filterByCategory(value) {
    if (!value) return;

    fetch(`http://localhost:3000/searchVideos?keyword=${encodeURIComponent(value)}`)
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById("videoContainer");
            container.innerHTML = "";
            currentIndex = 0;
            allVideos = [];

            if (data.success && data.videos.length > 0) {
                allVideos = data.videos;
                loadNextPage();
            } else {
                container.innerHTML = "<p style='text-align:center;'>未找到相关视频</p>";
                const loadBtn = document.getElementById("loadMoreBtn");
                if (loadBtn) loadBtn.style.display = "none";
            }
        })
        .catch(error => {
            console.error("分类筛选出错：", error);
            alert("请求失败，请稍后重试！");
        });
}


document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const skill = params.get("skill");
    if (skill) {
        document.getElementById("searchInput").value = skill;
        searchVideos();
    }
});
