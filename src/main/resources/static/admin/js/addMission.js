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

    // Validation
    if (id_conducteur === "") {
        alert("choisir un conducteur");
        return;
    }
    if (id_vehicule === "") {
        alert("choisir un vehicule");
        return;
    }
    if (adress_depart === "") {
        alert("Adresse de départ obligatoire");
        return;
    }
    if (adress_fin === "") {
        alert("Adresse de destination obligatoire");
        return;
    }
    if (date_heure_depart === "") {
        alert("Date de départ obligatoire");
        return;
    }
    if (description === "") {
        alert("Description du colis obligatoire");
        return;
    }
    if (type_colis === "") {
        alert("Type de colis obligatoire");
        return;
    }
    if (poids !== "" && parseFloat(poids) <= 0) {
        alert("Le poids doit être supérieur à 0");
        return;
    }
    if (volume !== "" && parseFloat(volume) <= 0) {
        alert("Le volume doit être supérieur à 0");
        return;
    }
    if (date_heure_fin !== "" && date_heure_fin <= date_heure_depart) {
        alert("La date de fin doit être après la date de départ");
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
                InstructionSpeciales: instruction || null
            })
        });

        if (response.ok) {
            alert("Mission ajoutée avec succès!");
            
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
        } else {
            const error = await response.text();
            alert("Erreur: " + response.status + " - " + error);
        }
    } catch (e) {
        console.error(e);
        alert("Erreur réseau: " + e.message);
    }
});