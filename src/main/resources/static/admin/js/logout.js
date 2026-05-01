document.getElementById("logout-btn").addEventListener("click",(e)=>{
    e.preventDefault()
    const response = fetch("api/auth/logout",{
        method:'POST',
        credentials: 'same-origin'
    })
    if (response.ok) {
        window.location.href = '/login';
    }
});