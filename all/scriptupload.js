function submitResource() {
  const url = document.getElementById("url").value.trim();
  const title = document.getElementById("title").value.trim();
  const uploader = localStorage.getItem("username");

  if (!url || !title || !uploader) {
    alert("资源链接、标题 和 登录用户不能为空！");
    return;
  }

  fetch("http://localhost:3000/uploadResource", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, title, uploader })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert("上传成功！");
      location.reload();
    } else {
      alert("上传失败：" + data.message);
    }
  })
  .catch(err => {
    console.error("上传失败", err);
    alert("网络错误，上传失败！");
  });
}


 // 当前登录用户
const username = localStorage.getItem("username");
if (!username) {
    alert("当前未登录，无法修改信息！");
    throw new Error("未登录，无法保存");
}
        function saveProfile() {
            const nickname = document.getElementById('nickname').value;
            const password = document.getElementById('new-password').value;
    
            console.log("准备发送更新请求：", { username, nickname, password });
    
            fetch('http://localhost:3000/updateProfile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, nickname, password })
            })
            .then(response => {
                console.log("服务器响应状态码:", response.status);
                return response.json();
            })
            .then(data => {
                console.log("服务器返回的数据:", data);
                if (data.success) {
                    alert("信息更新成功");
                    window.location.href = "12.1911_optimized.html"; // 返回首页
                } else {
                    alert("更新失败: " + data.message);
                }
            })
            .catch(error => {
                console.error("请求失败:", error);
                alert("网络错误，请稍后再试！");
            });
        }
        
        document.addEventListener("DOMContentLoaded", () => {
            const username = localStorage.getItem("username");
            if (!username) {
                document.getElementById("welcomeMessage").textContent = "Hello";
                return;
            }
        
            // 获取用户昵称
            fetch(`http://localhost:3000/getProfile?username=${username}`)
                .then(res => res.json())
                .then(data => {
                    const msg = data.success && data.user.nickname ? `Hello, ${data.user.nickname}` : "Hello";
                    document.getElementById("welcomeMessage").textContent = msg;
                })
                .catch(() => {
                    document.getElementById("welcomeMessage").textContent = "Hello";
                });})