const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors()); // 允许跨域请求
app.use(bodyParser.json()); // 解析请求体中的 JSON 数据

// 创建 MySQL 数据库连接
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // 替换为您的数据库密码
    database: 'computerdatabases' // 替换为您的数据库名称
});

// 连接 MySQL 数据库
db.connect(err => {
    if (err) {
        console.error('无法连接到 MySQL 数据库:', err);
        return;
    }
    console.log('已连接到 MySQL 数据库');
});

// 定义一个 API 端点用于获取职业测评问题
app.get('/questions', (req, res) => {
    const query = 'SELECT * FROM questions';
    db.query(query, (err, results) => {
        if (err) {
            console.error('查询失败:', err);
            res.status(500).send('服务器错误');
        } else {
            res.status(200).json(results);
        }
    });
});




// 获取职位数据，支持关键字搜索
app.get('/get-jobs', (req, res) => {
    const keyword = req.query.keyword || '';  // 获取查询参数中的 keyword
    console.log('收到查询关键字:', keyword);  // 打印接收到的关键字

    // 防止 SQL 注入
    const query = `
        SELECT job_name, skills, description 
        FROM work 
        WHERE job_name LIKE ? 
        OR skills LIKE ? 
        OR description LIKE ?`;

    // 使用防止 SQL 注入的占位符 ? 来处理关键字
    const values = [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`];  // 确保关键字被正确匹配
    db.query(query, values, (err, results) => {
        if (err) {
            console.error('查询职位数据失败:', err);
            res.status(500).send('服务器错误');
        } else {
            console.log('查询到的职位数据:', results);  // 打印查询到的职位数据
            res.status(200).json(results);  // 返回职位数据
        }
    });
});



// 匹配职业
app.post('/submit-quiz', (req, res) => {
    const keywords = req.body.keywords; // 获取前端传来的关键词数组
    console.log('收到的关键词:', keywords);

    if (!keywords || keywords.length === 0) {
        console.warn('提交的数据为空');
        return res.status(400).send('缺少关键词');
    }

    // 构造 SQL 查询，按关键词匹配次数降序排序
    const query = `
        SELECT job_name, 
               SUM(
                   ${keywords.map(() => '(skills LIKE ? OR description LIKE ?)').join(' + ')}
               ) AS match_count
        FROM work
        WHERE ${keywords.map(() => '(skills LIKE ? OR description LIKE ?)').join(' OR ')}
        GROUP BY job_name
        ORDER BY match_count DESC
        LIMIT 5;
    `;

    // 构造参数
    const params = [];
    keywords.forEach(keyword => {
        // 每个关键词在 WHERE 和 SUM 中都需要两次
        params.push(`%${keyword}%`, `%${keyword}%`);
        params.push(`%${keyword}%`, `%${keyword}%`);
    });

    console.log('生成的 SQL 查询:', query);
    console.log('查询参数:', params);

    // 执行查询
    db.query(query, params, (err, results) => {
        if (err) {
            console.error('查询职业失败:', err);
            return res.status(500).send('服务器错误');
        }

        // 格式化查询结果
        const jobs = results.map(result => ({
            job_name: result.job_name,
            match_count: result.match_count,
        }));
        console.log('匹配到的职业:', jobs);
        res.status(200).json(jobs); // 返回匹配到的职业名称和匹配次数
    });
});



// 注册接口
app.post('/register', (req, res) => {
    const { username, password, role } = req.body;  

    if (!username || !password) {
        return res.status(400).json({ success: false, message: "用户名和密码不能为空" });
    }

    // 检查是否已有相同用户名
    db.query("SELECT * FROM users WHERE username = ?", [username], (err, results) => {
        if (err) {
            console.error("查询失败:", err);
            return res.status(500).json({ success: false, message: "数据库错误" });
        }

        if (results.length > 0) {
            return res.json({ success: false, message: "用户名已被注册" });
        }

        // 直接存储明文密码
        const query = "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";
        db.query(query, [username, password, role || 'student'], (err2, result) => {
          if (err2) {
            console.error("注册失败：", err2);
            return res.status(500).json({ success: false });
          }
          res.json({ success: true , message: "注册成功" });
        });
    });
});

// 登录接口
app.post('/login', (req, res) => {
    const { username, password } = req.body;  // 直接对比明文密码

    if (!username || !password) {
        return res.status(400).json({ success: false, message: "用户名和密码不能为空" });
    }

    const query = "SELECT * FROM users WHERE username = ? AND password = ?";
    db.query(query, [username, password], (err, results) => {
        if (err) {
            console.error("查询失败:", err);
            return res.status(500).json({ success: false, message: "数据库错误" });
        }

        if (results.length > 0) {
            res.json({ success: true, role: results[0].role, message: "登录成功" });
        } else {
            res.json({ success: false, message: "账号或密码错误" });
        }
    });
});

// 更新用户信息
app.post('/updateProfile', (req, res) => {
    const { username, nickname, password, avatar } = req.body;

    if (!username) {
        return res.status(400).json({ success: false, message: "用户名不能为空" });
    }

    let query = "UPDATE users SET ";
    let params = [];

    if (nickname) {
        query += "nickname = ?, ";
        params.push(nickname);
    }

    if (password) {
        query += "password = ?, ";
        params.push(password);
    }

    if (avatar) {
        query += "avatar = ?, ";
        params.push(avatar);
    }

    query = query.slice(0, -2); // 移除最后的 ", "
    query += " WHERE username = ?";
    params.push(username);

    db.query(query, params, (err, result) => {
        if (err) {
            console.error("更新失败:", err);
            return res.status(500).json({ success: false, message: "更新失败" });
        }
        res.json({ success: true, message: "信息更新成功" });
    });
});

// 获取用户信息
app.get('/getProfile', (req, res) => {
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ success: false, message: "用户名不能为空" });
    }

    db.query("SELECT username, nickname, avatar FROM users WHERE username = ?", [username], (err, results) => {
        if (err) {
            console.error("查询失败:", err);
            return res.status(500).json({ success: false, message: "查询失败" });
        }

        if (results.length > 0) {
            res.json({ success: true, user: results[0] });
        } else {
            res.json({ success: false, message: "用户不存在" });
        }
    });
});
//个人中心修改昵称密码
app.get("/getProfile", (req, res) => {
    const username = req.query.username;
    if (!username) return res.status(400).json({ success: false });

    db.query("SELECT nickname FROM users WHERE username = ?", [username], (err, results) => {
        if (err || results.length === 0) {
            return res.status(500).json({ success: false });
        }
        res.json({ success: true, user: results[0] });
    });
});

//保存推荐职业
app.post('/saveCareerToUser', (req, res) => {
    const { username, careers } = req.body;

    if (!username || !Array.isArray(careers)) {
        return res.status(400).json({ success: false, message: "无效请求" });
    }

    //过滤空字符串
    const cleanCareers = careers.filter(c => c && c.trim().length > 0);
    const careerStr = JSON.stringify(cleanCareers);

    db.query("UPDATE users SET data = ? WHERE username = ?", [careerStr, username], (err, result) => {
        if (err) {
            console.error("保存推荐职业失败:", err);
            return res.status(500).json({ success: false, message: "数据库错误" });
        }
        res.json({ success: true, message: "职业信息已保存" });
    });
});


//获取视频
app.get("/videos", (req, res) => {
    const sql = "SELECT bvid, title, author FROM bilibili ORDER BY id DESC";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("获取视频出错：", err);
            return res.status(500).json({ success: false });
        }

        const videos = results.map(row => ({
            bvid: row.bvid,
            title: row.title,
            author: row.author,
            iframe: `https://player.bilibili.com/player.html?bvid=${row.bvid}`
        }));

        res.json({ success: true, videos });
    });
});
      
// 搜索视频
app.get("/searchVideos", (req, res) => {
const input = req.query.keyword || "";
  
const segments = input
      .split(/[\s,，、]+/) // ✅ 不再用 / 分隔
      .map(k => k.trim())
      .filter(k => k.length > 0);
  
    if (segments.length === 0) {
      return res.json({ success: true, videos: [] });
    }
  
    const likeClauses = [];
    const params = [];
  
    const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // ✅ 放在外面一次定义
  
    segments.forEach(word => {
      const safeWord = escapeRegex(word); // ✅ 调用才有值
      ["title", "keyword"].forEach(field => {
        likeClauses.push(`${field} REGEXP ?`);
        params.push(`(^|[^a-zA-Z0-9])${safeWord}([^a-zA-Z0-9]|$)`);
      });
    });
  
    const sql = `
      SELECT bvid, title, author
      FROM bilibili
      WHERE ${likeClauses.join(" OR ")}
    `;
  
    db.query(sql, params, (err, results) => {
      if (err) {
        console.error("搜索失败：", err);
        return res.status(500).json({ success: false });
      }
  
      const videos = results.map(row => ({
        bvid: row.bvid,
        title: row.title,
        author: row.author,
        iframe: `https://player.bilibili.com/player.html?bvid=${row.bvid}`
      }));
  
      res.json({ success: true, videos });
    });
  });
  
  
  
//个人中心职业
 // 获取用户保存的推荐职业，并在 work 表中搜索相关信息
app.get("/getCareerInfo", (req, res) => {
    const username = req.query.username;
    if (!username) {
        return res.status(400).json({ success: false, message: "缺少用户名" });
    }

    // 先从 users 表中获取 data 字段（存储推荐职业数组）
    const userQuery = "SELECT data FROM users WHERE username = ?";
    db.query(userQuery, [username], (err, results) => {
        if (err) {
            console.error("查询用户数据失败:", err);
            return res.status(500).json({ success: false, message: "数据库错误" });
        }
        if (!results.length) {
            return res.status(404).json({ success: false, message: "用户不存在" });
        }

        // 解析 data 字段
        let careers;
        try {
            careers = JSON.parse(results[0].data || "[]");
            if (!Array.isArray(careers)) {
                careers = [];
            }
        } catch (e) {
            careers = [];
        }

        // 如果用户未保存任何职业信息，直接返回空数组
        if (careers.length === 0) {
            return res.json({ success: true, careers: [] });
        }

        // 使用数组查询 work 表，假设 work 表中存储职业名称的字段为 job_name
        // 构造 IN 子句的占位符
        const placeholders = careers.map(() => "?").join(",");
        const workQuery = `SELECT * FROM work WHERE job_name IN (${placeholders})`;

        db.query(workQuery, careers, (err, workResults) => {
            if (err) {
                console.error("查询工作数据失败:", err);
                return res.status(500).json({ success: false, message: "数据库错误" });
            }
            res.json({ success: true, careers: workResults });
        });
    });
});

//个人中心删除职业
app.post("/deleteCareer", (req, res) => {
    const { username, jobName } = req.body;
    if (!username || !jobName) {
      return res.json({ success: false, message: "缺少参数" });
    }
  
    // 查询当前用户的 data 数据
    const selectSql = "SELECT data FROM users WHERE username = ?";
    db.query(selectSql, [username], (err, results) => {
      if (err || results.length === 0) {
        console.error("查询失败：", err);
        return res.status(500).json({ success: false, message: "用户不存在" });
      }
  
      let dataList;
      try {
        dataList = JSON.parse(results[0].data || "[]");
      } catch (e) {
        dataList = [];
      }
  
      // 删除该职业
      const updatedList = dataList.filter(item => item !== jobName);
  
      // 更新回数据库
      const updateSql = "UPDATE users SET data = ? WHERE username = ?";
      db.query(updateSql, [JSON.stringify(updatedList), username], (err2) => {
        if (err2) {
          console.error("更新失败：", err2);
          return res.status(500).json({ success: false, message: "更新失败" });
        }
        res.json({ success: true });
      });
    });
  });

//教师上传资源
  app.post("/uploadResource", (req, res) => {
    const { url, title, uploader } = req.body;

    if (!url || !title || !uploader) {
        return res.status(400).json({ success: false, message: "缺少必要字段" });
    }

    const getNicknameSql = "SELECT nickname FROM users WHERE username = ?";
    db.query(getNicknameSql, [uploader], (err, results) => {
        if (err || results.length === 0) {
            console.error("获取昵称失败:", err);
            return res.status(500).json({ success: false, message: "无法获取教师昵称" });
        }

        const nickname = results[0].nickname || uploader;

        const insertSql = "INSERT INTO upload (username, nickname, url, title) VALUES (?, ?, ?, ?)";
        db.query(insertSql, [uploader, nickname, url, title], (err2) => {
            if (err2) {
                console.error("插入上传记录失败:", err2);
                return res.status(500).json({ success: false, message: "上传失败" });
            }
            res.json({ success: true, message: "上传成功" });
        });
    });
});

  //teacherResources
  app.get("/getUploadedResources", (req, res) => {
  const sql = "SELECT nickname, url, title, created_at FROM upload ORDER BY created_at DESC";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("查询上传资源失败:", err);
      return res.status(500).json({ success: false });
    }

    res.json({ success: true, resources: results });
  });
});


 


// 启动服务器并监听 3000 端口
app.listen(3000, () => {
    console.log('服务器正在运行于 http://localhost:3000');
});
