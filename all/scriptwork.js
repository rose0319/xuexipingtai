document.addEventListener('DOMContentLoaded', function () {
    const jobsContainer = document.getElementById('jobsContainer');  // 获取职位列表容器
    const searchKeyword = document.getElementById('searchKeyword');  // 获取搜索框
    const searchBtn = document.getElementById('searchBtn');  // 获取搜索按钮

    // 获取职位数据
    function fetchJobs(query = '') {
        console.log("正在请求职位数据，查询关键字: ", query);  // 打印查询关键字，确认前端发送了正确的请求
        const url = `http://localhost:3000/get-jobs?keyword=${encodeURIComponent(query)}`;
        console.log("发送的请求 URL: ", url);  // 打印 URL 确认关键字是否正确传递

        fetch(url)  // 向后端请求职位数据，带上搜索关键字
            .then(response => response.json())
            .then(data => {
                jobsContainer.innerHTML = '';  // 清空表格

                // 如果没有数据
                if (data.length === 0) {
                    jobsContainer.innerHTML = '<tr><td colspan="3">未找到匹配的职位</td></tr>';
                    return;
                }

                // 遍历职位数据并插入到表格中
                data.forEach(job => {
                    const row = document.createElement('tr');  // 创建表格行

                    // 创建职位名称单元格
                    const jobNameCell = document.createElement('td');
                    jobNameCell.innerText = job.job_name;

                    // 创建技能要求单元格
                    const skillsCell = document.createElement('td');
                    skillsCell.innerText = job.skills;

                    // 创建职位描述单元格
                    const descriptionCell = document.createElement('td');
                    descriptionCell.innerText = job.description;

                    // 将单元格添加到行中
                    row.appendChild(jobNameCell);
                    row.appendChild(skillsCell);
                    row.appendChild(descriptionCell);

                    // 将这一行添加到表格主体中
                    jobsContainer.appendChild(row);
                });
            })
            .catch(error => {
                console.error('获取职位数据失败:', error);
                alert('无法获取职位数据，请稍后重试');
            });
    }

    // 搜索按钮点击事件
    searchBtn.addEventListener('click', function () {
        const keyword = searchKeyword.value.trim();
        console.log('点击了搜索按钮，搜索关键字:', keyword);  // 输出搜索的关键字，确保关键字已正确获取

        if (keyword === "") {
            alert("请输入搜索关键字");
            return;
        }

        // 调用 fetchJobs 函数，并传递关键字
        fetchJobs(keyword);  // 传递关键字查询职位
    });
    function fetchJobs(query = '') {
        console.log("正在请求职位数据，查询关键字: ", query);
        const url = `http://localhost:3000/get-jobs?keyword=${encodeURIComponent(query)}`;
        console.log("发送的请求 URL: ", url);
    
        fetch(url)  // 向后端请求职位数据，带上搜索关键字
            .then(response => response.json())
            .then(data => {
                jobsContainer.innerHTML = '';  // 清空表格
    
                // 如果没有数据
                if (data.length === 0) {
                    jobsContainer.innerHTML = '<tr><td colspan="3">未找到匹配的职位</td></tr>';
                    return;
                }
    
                // 遍历职位数据并插入到表格中
                data.forEach(job => {
                    const row = document.createElement('tr');  // 创建表格行
    
                    // 创建职位名称单元格
                    const jobNameCell = document.createElement('td');
                    jobNameCell.innerText = job.job_name;
    
                    // 创建技能要求单元格
                    const skillsCell = document.createElement('td');
                    skillsCell.innerText = job.skills;
    
                    // 创建职位描述单元格
                    const descriptionCell = document.createElement('td');
                    descriptionCell.innerText = job.description;
    
                    // 将单元格添加到行中
                    row.appendChild(jobNameCell);
                    row.appendChild(skillsCell);
                    row.appendChild(descriptionCell);
    
                    // 将这一行添加到表格主体中
                    jobsContainer.appendChild(row);
                });
            })
            .catch(error => {
                console.error('获取职位数据失败:', error);
                alert('无法获取职位数据，请稍后重试');
            });
    }
    

    // 默认加载所有职位
    fetchJobs();
});
