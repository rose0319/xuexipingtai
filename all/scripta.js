document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('careerForm');
    const resultContainer = document.getElementById('result');

    form.addEventListener('submit', function (e) {
        e.preventDefault(); // 阻止默认表单提交行为

        // 收集用户选择的答案
        const options = Array.from(document.querySelectorAll('#careerForm input[type="radio"]:checked'))
            .map(input => input.value.trim())
            .filter(value => value.length > 0);

        console.log('用户选择的选项:', options);

        if (options.length === 0) {
            alert('请至少选择一个选项！');
            return;
        }

        // 发送关键词到后端
        fetch('http://localhost:3000/submit-quiz', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ keywords: options }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('网络响应失败');
                }
                return response.json();
            })
            .then(data => {
                console.log('后端返回的职业数据:', data);

                // 显示推荐职业和匹配次数
                if (data.length > 0) {
                    resultContainer.innerHTML = `
    <h2>推荐的职业（请选择感兴趣的）:</h2>
    <form id="careerSelectForm">
        ${data.map(job => `
            <label>
                <input type="checkbox" name="career" value="${job.job_name}"> ${job.job_name}（匹配关键词数: ${job.match_count}）
            </label><br>
        `).join('')}
        <button type="button" onclick="submitSelectedCareers()">确认选择</button>
    </form>
`;

                } else {
                    resultContainer.innerHTML = '<p>没有匹配到合适的职业。</p>';
                }
            })
            .catch(error => {
                console.error('提交测评失败:', error);
                alert('提交测评失败，请稍后重试');
            });
    });
});

//选择喜欢的职业
function submitSelectedCareers() {
    const selected = Array.from(document.querySelectorAll('input[name="career"]:checked'))
    .map(checkbox => checkbox.value.trim())
    .filter(v => v.length > 0);


    if (selected.length === 0) {
        alert("请选择至少一个职业");
        return;
    }

    const username = localStorage.getItem("username");
    if (!username) {
        alert("当前未登录，无法保存推荐职业！");
        return;
    }

    fetch("http://localhost:3000/saveCareerToUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: username,
            careers: selected
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("职业推荐保存成功！");
        } else {
            alert("保存失败：" + data.message);
        }
        window.location.href = "12.1911_optimized.html";
    })
    .catch(err => {
        console.error("请求失败:", err);
        alert("网络错误，请稍后再试！");
    });
}

