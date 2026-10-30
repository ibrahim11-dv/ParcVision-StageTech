document.getElementById("addMission").addEventListener("click", async (e) => {
    e.preventDefault();
    const id_conducteur = document.getElementById("add_conducteur").value;
    const id_vehicule = document.getElementById("add_vehicule").value;

    const adress_depart = document.getElementById("adress_depart").value;
    const latitude_depart = document.getElementById("add-lat-start").value;
    const longitude_depart = document.getElementById("add-lng-start").value;

    const adress_fin = document.getElementById("adress_fin").value;
    const latitude_fin = document.getElementById("add-lat-end").value;
    const longitude_fin = document.getElementById("add-lng-end").value;

    const date_heure_depart = document.getElementById("date_heure_depart").value;
    const date_heure_fin = document.getElementById("date_heure_fin").value;

    const description = document.getElementById("description").value;
    const type_colis = document.getElementById("type_colis").value;
    const poids = document.getElementById("poids").value;
    const volume = document.getElementById("volume").value;
    const instruction = document.getElementById("instruction").value;

    const isGpsEnabled = document.getElementById("add_is_gps_enabled").checked;
    const trackerId = document.getElementById("add_tracker_id").value;
    const trackerImei = document.getElementById("add_tracker_imei").value;
    const trackerSim = document.getElementById("add_tracker_sim").value;

    // Validation
    clearValidationErrors();

    if (id_conducteur === "") {
        showFieldInvalid("add_conducteur", "Veuillez choisir un conducteur");
        return;
    }
    if (id_vehicule === "") {
        showFieldInvalid("add_vehicule", "Veuillez choisir un véhicule");
        return;
    }
    if (adress_depart === "") {
        showFieldInvalid("adress_depart", "L'adresse de départ est obligatoire");
        return;
    }
    if (adress_fin === "") {
        showFieldInvalid("adress_fin", "L'adresse de destination est obligatoire");
        return;
    }
    if (date_heure_depart === "") {
        showFieldInvalid("date_heure_depart", "La date de départ est obligatoire");
        return;
    }
    if (description === "") {
        showFieldInvalid("description", "La description du colis est obligatoire");
        return;
    }
    if (type_colis === "") {
        showFieldInvalid("type_colis", "Le type de colis est obligatoire");
        return;
    }
    if (poids !== "" && parseFloat(poids) <= 0) {
        showFieldInvalid("poids", "Le poids doit être supérieur à 0");
        return;
    }
    if (volume !== "" && parseFloat(volume) <= 0) {
        showFieldInvalid("volume", "Le volume doit être supérieur à 0");
        return;
    }
    if (date_heure_fin !== "" && date_heure_fin <= date_heure_depart) {
        showFieldInvalid("date_heure_fin", "La date de fin doit être après la date de départ");
        return;
    }

    try {
        const response = await fetch("/api/missions", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                conducteurId: parseInt(id_conducteur),
                vehiculeId: parseInt(id_vehicule),
                adressDepart: adress_depart,
                latitudeDepart: parseFloat(latitude_depart),
                longitudeDepart: parseFloat(longitude_depart),
                adressDestination: adress_fin,
                latitudeDestination: parseFloat(latitude_fin),
                longitudeDestination: parseFloat(longitude_fin),
                dateDepart: date_heure_depart,
                dateArrivee: date_heure_fin || null,
                description: description,
                typeColis: type_colis,
                poids: poids ? parseFloat(poids) : null,
                Volume: volume ? parseFloat(volume) : null,
                InstructionSpeciales: instruction || null,
                isGpsEnabled: isGpsEnabled,
                trackerId: trackerId || null,
                trackerImei: trackerImei || null,
                trackerSimNumber: trackerSim || null
            })
        });

        if (response.ok) {
            // Reset form
            document.querySelector('#addMissionModal form').reset();
            
            // Close modal
            const modalEl = document.getElementById('addMissionModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
            
            // Reload missions list
            if (typeof fetchMissions === 'function') {
                fetchMissions();
            }
            if (window.loadSidebarStats) {
                window.loadSidebarStats();
            }

            // Show success popup
            if (typeof showSuccess === 'function') {
                showSuccess("Mission ajoutée", "La mission a été créée avec succès !");
            } else {
                alert("Mission ajoutée avec succès!");
            }
        } else {
            const error = await response.text();
            if (typeof showNotification === 'function') {
                showNotification("Erreur", "Erreur: " + response.status + " - " + error, "error");
            } else {
                alert("Erreur: " + response.status + " - " + error);
            }
        }
    } catch (e) {
        console.error(e);
        if (typeof showNotification === 'function') {
            showNotification("Erreur réseau", "Erreur réseau: " + e.message, "error");
        } else {
            alert("Erreur réseau: " + e.message);
        }
    }
});

// Validation helpers
function clearValidationErrors() {
    document.querySelectorAll('#addMissionModal .is-invalid').forEach(el => {
        el.classList.remove('is-invalid');
    });
    document.querySelectorAll('#addMissionModal .invalid-feedback-custom').forEach(el => {
        el.remove();
    });
}

function showFieldInvalid(elementId, message) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.classList.add('is-invalid');
    el.focus();
    
    // Add custom feedback message if not present
    let feedback = el.parentNode.querySelector('.invalid-feedback-custom');
    if (!feedback) {
        feedback = document.createElement('div');
        feedback.className = 'invalid-feedback-custom text-danger mt-1';
        feedback.style.fontSize = '0.78rem';
        feedback.style.fontWeight = '500';
        feedback.textContent = message;
        el.parentNode.appendChild(feedback);
    } else {
        feedback.textContent = message;
    }
}

// Clear validation error on change or input
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('#addMissionModal input, #addMissionModal select, #addMissionModal textarea').forEach(el => {
        el.addEventListener('input', () => {
            el.classList.remove('is-invalid');
            const feedback = el.parentNode.querySelector('.invalid-feedback-custom');
            if (feedback) feedback.remove();
        });
        el.addEventListener('change', () => {
            el.classList.remove('is-invalid');
            const feedback = el.parentNode.querySelector('.invalid-feedback-custom');
            if (feedback) feedback.remove();
        });
    });
});
