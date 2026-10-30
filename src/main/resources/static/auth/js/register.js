document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    if (typeof window.validateStep1 === 'function' && !window.validateStep1()) {
        const btnBack = document.getElementById("btnBackTo1");
        if (btnBack) btnBack.click();
        return;
    }

    const entrepriseNom = document.getElementById("nom").value.trim();
    const entrepriseEmail = document.getElementById("email").value.trim();
    const entrepriseSecteurActivite = document.getElementById("secteurActivite").value.trim();
    const entrepriseDateCreation = document.getElementById("dateCreation").value;
    const entrepriseAdresse = document.getElementById("adresse").value.trim();
    const entrepriseTelephone = document.getElementById("telephone").value.trim();

    const adminPrenom = document.getElementById("adminFirstName").value.trim();
    const adminNom = document.getElementById("adminLastName").value.trim();
    const adminEmail = document.getElementById("adminEmail").value.trim();
    const adminPassword = document.getElementById("adminPassword").value;

    if (!adminPrenom || !adminNom || !adminEmail || !adminPassword) {
        alert("Veuillez remplir tous les champs du compte administrateur.");
        return;
    }

    try {
        const response = await fetch("/api/registration", {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                entrepriseNom: entrepriseNom,
                entrepriseEmail: entrepriseEmail,
                entrepriseSecteurActivite: entrepriseSecteurActivite,
                entrepriseDateCreation: entrepriseDateCreation,
                entrepriseAdresse: entrepriseAdresse,
                entrepriseTelephone: entrepriseTelephone,

                adminPrenom: adminPrenom,
                adminNom: adminNom,
                adminEmail: adminEmail,
                adminPassword: adminPassword
            })
        });
        const text = await response.text();
        if (response.ok) {
            alert(text || "Inscription réussie ! Vous pouvez maintenant vous connecter.");
            window.location.href = "/login";
        } else {
            alert(text || "Une erreur est survenue lors de l'inscription. Veuillez vérifier vos informations.");
        }
    } catch (err) {
        console.error(err);
        alert("Erreur de connexion au serveur. Veuillez réessayer.");
    }
});
