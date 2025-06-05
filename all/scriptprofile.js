
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
                });
        
            // 获取职业推荐信息
            fetch(`http://localhost:3000/getCareerInfo?username=${encodeURIComponent(username)}`)
    .then(res => res.json())
    .then(data => {
        const container = document.getElementById("careerContainer");
        container.innerHTML = "";

        if (data.success && data.careers.length > 0) {
            // 每个推荐职业行的渲染
data.careers.forEach(job => {
    const row = document.createElement("tr");

    // 职位名称 + 获取资源按钮 + 删除按钮
    const nameTd = document.createElement("td");
    nameTd.style.padding = "10px";
    nameTd.style.border = "1px solid #ddd";
    nameTd.innerHTML = `
        <button onclick="goToResourcesBySkill('${job.skills || ""}')" style="
            margin-right: 8px; 
            padding: 4px 8px; 
            background: #2196F3; 
            color: white; 
            border: none; 
            border-radius: 4px; 
            cursor: pointer;">
            获取资源
        </button>
         <button onclick="deleteCareer('${job.job_name}')" style="
      margin-right: 8px; 
      padding: 4px 8px; 
      background: #f44336; 
      color: white; 
      border: none; 
      border-radius: 4px; 
      cursor: pointer;">
      删除
  </button>
        ${job.job_name}
    `;

    // 技能要求
    const skillTd = document.createElement("td");
    skillTd.textContent = job.skills || "-";
    skillTd.style.padding = "10px";
    skillTd.style.border = "1px solid #ddd";

    // 职位描述
    const descTd = document.createElement("td");
    descTd.textContent = job.description || "-";
    descTd.style.padding = "10px";
    descTd.style.border = "1px solid #ddd";

    row.appendChild(nameTd);
    row.appendChild(skillTd);
    row.appendChild(descTd);
    container.appendChild(row);
});
            
        } else {
            container.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:10px;">暂无推荐职业</td></tr>`;
        }
    })
    .catch(err => {
        console.error("获取职业信息失败：", err);
    });
});

function goToResourcesBySkill(skills) {
    if (!skills) {
        alert("该职业未指定技能要求，无法获取资源。");
        return;
    }
    window.location.href = `resources2.html?skill=${encodeURIComponent(skills)}`;
}

function deleteCareer(jobName) {
    const username = localStorage.getItem("username");
    if (!username || !jobName) return;
  
    if (!confirm(`确定删除职业「${jobName}」吗？`)) return;
  
    fetch("http://localhost:3000/deleteCareer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, jobName })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("已删除");
        location.reload(); // 刷新列表
      } else {
        alert("删除失败：" + data.message);
      }
    })
    .catch(err => {
      console.error("删除请求失败", err);
      alert("网络错误，删除失败！");
    });
  }
  