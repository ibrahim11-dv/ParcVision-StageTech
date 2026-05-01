document.getElementById("logout-btn").addEventListener("click",async (e) => {
    e.preventDefault()
    const response = await fetch("/api/auth/logout", {
        method: 'POST',
        credentials: 'same-origin'
    })
    try{
        if (response.ok) {
            window.location.href = '/login';
        }else {
            console.error('Logout failed with status:', response.status);
        }
    }catch (err){
        console.error(err)
    }

});