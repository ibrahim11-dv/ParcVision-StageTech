document.addEventListener("DOMContentLoaded", async ()=>{
    const email = document.getElementById("user-name")
    const username = document.getElementById("user-email")
    try{
        const reponse = await fetch("/api/profile/info-minimal",{
            method : 'POST',
            headers : {"Content-Type" : "application/json"}
        })
        if(reponse.ok){
            const data = await reponse.json()
            email.textContent = data.email;
            username.textContent = data.nom + " " + data.prenom;
        }
    }catch (err){
        console.log(err)
        email.textContent = "Error loading email";
        username.textContent = "Error loading name";
    }
});