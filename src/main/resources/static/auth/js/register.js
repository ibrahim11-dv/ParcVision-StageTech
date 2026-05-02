document.getElementById("registerForm").addEventListener("submit",async (e)=>{
    e.preventDefault()
    const entrepriseNom = document.getElementById("nom").value.trim()
    const entrepriseEmail = document.getElementById("email").value.trim()
    const entrepriseSecteurActivite = document.getElementById("secteurActivite").value
    const entrepriseDateCreation = document.getElementById("dateCreation").value
    const entrepriseAdresse = document.getElementById("adresse").value
    const entrepriseTelephone = document.getElementById("telephone").value

    const adminPrenom = document.getElementById("adminFirstName").value.trim()
    const adminNom = document.getElementById("adminLastName").value.trim()
    const adminEmail = document.getElementById("adminEmail").value.trim()
    const adminPassword = document.getElementById("adminPassword").value

    try{
        const response = await fetch("/api/registration/register-Enterprise",{
            method : 'POST',
            headers : {"Content-Type" : "application/json"},
            body : JSON.stringify({
                entrepriseNom : entrepriseNom,
                entrepriseEmail : entrepriseEmail,
                entrepriseSecteurActivite : entrepriseSecteurActivite,
                entrepriseDateCreation : entrepriseDateCreation,
                entrepriseAdresse : entrepriseAdresse,
                entrepriseTelephone : entrepriseTelephone,

                adminPrenom : adminPrenom,
                adminNom : adminNom,
                adminEmail : adminEmail,
                adminPassword : adminPassword
            })
        })
        const text = await response.text()
        alert(text)
        if(response.ok){
            window.location.href = "/login"
        }
    }catch (err){
        console.log(err)

    }


});