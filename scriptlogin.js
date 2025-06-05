
        function showRegister() {
            document.getElementById('login-container').style.display = 'none';
            document.getElementById('register-container').style.display = 'block';
        }

        function showLogin() {
            document.getElementById('register-container').style.display = 'none';
            document.getElementById('login-container').style.display = 'block';
        }

        function login() {
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            const errorMessage = document.getElementById('login-error');

            fetch('http://localhost:3000/login', {  // 调用后端 API
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    localStorage.setItem("username", username);
                    localStorage.setItem("role", data.role || 'student');  // ✅ 存储角色
                    alert("登录成功！");
                    window.location.href = "12.1911_optimized.html"; // 登录后跳转
                } else {
                    errorMessage.textContent = data.message || "账号或密码错误";
                }
            })
            .catch(error => {
                console.error("登录失败:", error);
                errorMessage.textContent = "服务器错误，请稍后再试。";
            });
        }

        function register() {
            const username = document.getElementById('register-username').value;
            const password = document.getElementById('register-password').value;
            const role = document.getElementById('register-role').value;
            const errorMessage = document.getElementById('register-error');

            fetch('http://localhost:3000/register', {  // 调用后端 API
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("注册成功！请登录。");
                    showLogin();
                } else {
                    errorMessage.textContent = data.message || "注册失败，请重试。";
                }
            })
            .catch(error => {
                console.error("注册失败:", error);
                errorMessage.textContent = "服务器错误，请稍后再试。";
            });
        }

        

    