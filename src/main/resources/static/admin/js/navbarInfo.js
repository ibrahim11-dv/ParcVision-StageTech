document.addEventListener("DOMContentLoaded", async () => {
    const nameEl = document.getElementById("user-name");
    const emailEl = document.getElementById("user-email");
    const avatarEl = document.querySelector(".profile-row .profile-av");

    try {
        const response = await fetch("/api/profile/info-minimal", {
            method: 'POST',
            headers: { "Content-Type": "application/json" }
        });
        if (response.ok) {
            const data = await response.json();
            if (nameEl) nameEl.textContent = data.nom + " " + data.prenom;
            if (emailEl) emailEl.textContent = data.email;
            
            if (avatarEl) {
                if (data.photoProfileUrl) {
                    avatarEl.innerHTML = "";
                    avatarEl.style.backgroundImage = "url('" + data.photoProfileUrl + "')";
                    avatarEl.style.backgroundSize = "cover";
                    avatarEl.style.backgroundPosition = "center";
                } else {
                    const initials = ((data.nom || 'A').charAt(0) + (data.prenom || 'D').charAt(0)).toUpperCase();
                    avatarEl.textContent = initials;
                    avatarEl.style.backgroundImage = "none";
                }
            }
        }
    } catch (err) {
        console.error("Error loading minimal profile info:", err);
    }
});