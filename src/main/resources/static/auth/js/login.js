document.getElementById("loginForm").addEventListener("submit",async (e)=>{
    e.preventDefault()
    console.log("login.js loaded successfully");
    const email = document.getElementById('email').value.trim()
    const password = document.getElementById('password').value.trim()
    const rememberMe = document.getElementById('rememberMe').checked

    const response = await fetch("/api/auth/login",{
        method: 'POST',
        headers: {'Content-Type' : 'application/json'},
        body: JSON.stringify({
            email : email,
            password: password,
            rememberMe:rememberMe
        })
    })
    if(response.ok){
        window.location.href = "/admin/dashboard"
    }else{
        alert("wrong email or password")
    }

});