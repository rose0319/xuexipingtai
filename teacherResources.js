document.addEventListener("DOMContentLoaded", () => {
  let currentPage = 0;
  const pageSize = 10;
  let allResources = [];

  const container = document.getElementById("resourceContainer");
  const loadMoreBtn = document.createElement("button");
  loadMoreBtn.textContent = "加载更多资源";
  loadMoreBtn.style.cssText = "margin: 20px auto; display: block; padding: 10px 20px; font-size: 16px; background-color: #ffffff; color: #1e3c72; border: none; border-radius: 6px; cursor: pointer;";
  loadMoreBtn.onclick = loadNextPage;
  document.body.appendChild(loadMoreBtn);

  function renderPage(resources) {
    const start = currentPage * pageSize;
    const end = start + pageSize;
    const pageItems = resources.slice(start, end);

    pageItems.forEach(item => {
      const box = document.createElement("div");
      box.className = "resource-box";
      box.style.cursor = "pointer";
      box.onclick = () => {
        window.open(item.url, "_blank");
      };

      box.innerHTML = `
        <iframe src="${item.url}" allowfullscreen></iframe>
        <div class="resource-info">
          <p><strong>标题：</strong>${item.title}</p>
          <p><strong>教师：</strong>${item.nickname}</p>
          <p><strong>上传时间：</strong>${item.created_at}</p>
        </div>
      `;
      container.appendChild(box);
    });
  }

  function loadNextPage() {
    const totalPages = Math.ceil(allResources.length / pageSize);
    if (currentPage < totalPages) {
      renderPage(allResources);
      currentPage++;
    } else {
      loadMoreBtn.style.display = "none";
    }
  }

  fetch("http://localhost:3000/getUploadedResources")
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        container.innerHTML = "<p>加载失败</p>";
        return;
      }

      allResources = data.resources;
      if (allResources.length === 0) {
        container.innerHTML = "<p>暂无资源</p>";
        loadMoreBtn.style.display = "none";
        return;
      }

      loadNextPage();
    })
    .catch(err => {
      console.error("加载资源失败", err);
      container.innerHTML = "<p>网络错误</p>";
    });
});
