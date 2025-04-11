async function register() {
    const username = document.getElementById("reg-username").value;
    const password = document.getElementById("reg-password").value;
    const role = document.getElementById("reg-role").value;
  
    const res = await fetch("http://localhost:3000/api/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role })
    });
  
    const data = await res.json();
    document.getElementById("message").innerText = data.message || data.error;
  }
  
  async function login() {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;
  
    const res = await fetch("http://localhost:3000/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
  
    const data = await res.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      document.getElementById("message").innerText = "Đăng nhập thành công!";
      // Chuyển trang nếu muốn
      window.location.href = "site.html";
    } else {
      document.getElementById("message").innerText = data.error;
    }
  }