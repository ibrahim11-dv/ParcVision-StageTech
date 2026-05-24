document.addEventListener("DOMContentLoaded", async () => {
    const nameEl = document.getElementById("user-name");
    const emailEl = document.getElementById("user-email");
    const avatarEl = document.querySelector(".profile-row .profile-av");

    try {
        // Load Minimal Profile Info
        const profileRes = await fetch("/api/profile/info-minimal", {
            method: 'POST',
            headers: { "Content-Type": "application/json" }
        });
        if (profileRes.ok) {
            const data = await profileRes.json();
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

        // Load Sidebar Statistics
        const statsRes = await fetch("/api/dashboard/stats");
        if (statsRes.ok) {
            const stats = await statsRes.json();
            updateSidebarUI(stats);
        }

    } catch (err) {
        console.error("Error loading navbar info:", err);
    }
});

function updateSidebarUI(stats) {
    const navLinks = document.querySelectorAll('.nav-link[data-tip]');
    navLinks.forEach(link => {
        const tip = link.getAttribute('data-tip');
        const subEl = link.querySelector('.nt-sub');
        const totalEl = link.querySelector('.nb');

        switch (tip) {
            case 'Conducteurs':
                if (subEl) subEl.textContent = (stats.conducteursDisponibles + stats.conducteursEnMission) + " actifs";
                if (totalEl) totalEl.textContent = stats.totalConducteurs;
                break;
            case 'Véhicules':
                if (subEl) subEl.textContent = (stats.vehiculesDisponibles + stats.vehiculesEnMission) + " en flotte";
                if (totalEl) totalEl.textContent = stats.totalVehicules;
                break;
            case 'Suivi GPS':
                if (subEl) subEl.textContent = stats.missionsEnCours + " en déplacement";
                break;
            case 'Réparation':
                if (subEl) subEl.textContent = stats.nbReparations + " interventions";
                if (totalEl) totalEl.textContent = stats.nbReparations;
                break;
            case 'Accident':
                if (subEl) subEl.textContent = stats.nbAccidents + " ce mois";
                if (totalEl) totalEl.textContent = stats.nbAccidents;
                break;
            case 'Dépannage':
                if (subEl) subEl.textContent = stats.nbDepannages + " interventions";
                if (totalEl) totalEl.textContent = stats.nbDepannages;
                break;
            case 'Vidange':
                if (subEl) subEl.textContent = stats.nbVidanges + " planifiées";
                if (totalEl) totalEl.textContent = stats.nbVidanges;
                break;
            case 'Fournisseurs':
                if (subEl) subEl.textContent = stats.nbFournisseurs + " prestataires";
                if (totalEl) totalEl.textContent = stats.nbFournisseurs;
                break;
        }
    });
}