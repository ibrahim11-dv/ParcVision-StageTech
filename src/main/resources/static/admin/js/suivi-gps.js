// Profile popup
document.getElementById('profileRow').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('profilePopup').classList.toggle('show');
});
document.addEventListener('click', () => {
    document.getElementById('profilePopup').classList.remove('show');
});

// Theme toggle functionality
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark');
        updateThemeUI(true);
    } else {
        document.body.classList.remove('dark');
        updateThemeUI(false);
    }
}

function updateThemeUI(isDark) {
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    if (isDark) {
        themeIcon.className = 'bi bi-sun';
        themeText.textContent = 'Mode clair';
    } else {
        themeIcon.className = 'bi bi-moon-stars';
        themeText.textContent = 'Mode sombre';
    }
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeUI(isDark);
}

document.getElementById('themeToggleBtn').addEventListener('click', (e) => {
    e.preventDefault();
    toggleTheme();
    document.getElementById('profilePopup').classList.remove('show');
});

initTheme();

// ==========================================
// Mission Management & Map Logic
// ==========================================
let map;
let markers = [];
let allMissions = [];

async function fetchMissions() {
    try {
        const response = await fetch('/api/missions');
        if (!response.ok) throw new Error('Failed to fetch missions');
        allMissions = await response.json();
        renderMissions(allMissions);
    } catch (error) {
        console.error('Error fetching missions:', error);
    }
}

function renderMissions(missions) {
    const tableBody = document.querySelector('table tbody');
    tableBody.innerHTML = '';

    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    missions.forEach(mission => {
        const row = document.createElement('tr');
        row.style.cursor = 'pointer';
        row.onclick = () => focusMap([mission.latitudeDepart, mission.longitudeDepart]);

        const isDelivered = mission.statut === 'TERMINEE';

        row.innerHTML = `
            <td class="border-bottom-0"><span class="fw-bold text-primary">${mission.reference}</span></td>
            <td class="border-bottom-0">
                <div class="d-flex align-items-center gap-2">
                    <div class="profile-av" style="width: 28px; height: 28px; border-radius: 8px; font-size: 0.65rem;">
                        ${mission.conducteurNomComplet ? mission.conducteurNomComplet.split(' ').map(n => n[0]).join('') : '??'}
                    </div>
                    <span class="fw-semibold text-dark">${mission.conducteurNomComplet || 'Inconnu'}</span>
                </div>
            </td>
            <td class="border-bottom-0">
                <div class="text-dark"><i class="bi bi-truck me-1 text-muted"></i> ${mission.vehiculeMarqueModele}</div>
                <small class="text-muted">${mission.vehiculeImmatriculation}</small>
            </td>
            <td class="border-bottom-0">
                <span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 rounded-pill px-2">
                    ${mission.colisType} (${mission.colisPoids ? mission.colisPoids.toFixed(2) : '0'}kg)
                </span>
            </td>
            <td class="border-bottom-0">
                <small class="d-block text-muted"><i class="bi bi-record-circle text-success me-1"></i> ${mission.adresseDepart}</small>
                <small class="d-block text-muted"><i class="bi bi-geo-alt text-danger me-1"></i> ${mission.adresseArrivee}</small>
            </td>
            <td class="border-bottom-0">${getStatusBadge(mission.statut)}</td>
            <td class="border-bottom-0 text-end">
                ${!isDelivered ? `
                    <button class="btn btn-sm btn-light text-success border-0" title="Confirmer Livraison" onclick="event.stopPropagation(); confirmDelivery(${mission.id})"><i class="bi bi-check-circle"></i></button>
                ` : `
                    <button class="btn btn-sm btn-light text-muted border-0" disabled><i class="bi bi-check-circle-fill"></i></button>
                `}
                <button class="btn btn-sm btn-light text-primary border-0" title="Modifier" data-bs-toggle="modal" data-bs-target="#editMissionModal" onclick="event.stopPropagation(); prepareEdit(${mission.id})"><i class="bi bi-pencil-square"></i></button>
            </td>
        `;
        tableBody.appendChild(row);

        if (mission.latitudeDepart && mission.longitudeDepart) {
            let color = isDelivered ? "#10b981" : (mission.statut === "ANNULEE" ? "#ef4444" : "#f59e0b");

            let htmlIcon = `<div style="position:relative; width:20px; height:20px;">
                                <div style="width:16px;height:16px;background:${color};border-radius:50%;border:2px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);position:absolute;z-index:2;"></div>
                                ${mission.statut === "EN_COURS" ? `<div style="width:16px;height:16px;background:${color};border-radius:50%;position:absolute;animation:pulse 1.5s infinite;z-index:1;"></div>` : ''}
                            </div>`;

            let divIcon = L.divIcon({
                className: 'custom-div-icon',
                html: htmlIcon,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });

            const marker = L.marker([mission.latitudeDepart, mission.longitudeDepart], { icon: divIcon }).addTo(map);
            marker.bindPopup(`
                <div class="custom-popup-title">${mission.reference}</div>
                <div class="custom-popup-body">
                    <b>Conducteur:</b> ${mission.conducteurNomComplet}<br>
                    <b>Véhicule:</b> ${mission.vehiculeMarqueModele}<br>
                    <b>Statut:</b> ${mission.statut}
                </div>
            `);
            markers.push(marker);
        }
    });

    if (markers.length > 0) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.5));
    }
}

function getStatusBadge(statut) {
    const configs = {
        'PLANIFIEE': { class: 'bg-primary', text: 'Planifiée' },
        'EN_COURS': { class: 'bg-warning', text: 'En route', pulse: true },
        'TERMINEE': { class: 'bg-success', text: 'Livré' },
        'ANNULEE': { class: 'bg-danger', text: 'Annulée' }
    };
    const config = configs[statut] || { class: 'bg-secondary', text: statut };
    return `<span class="badge ${config.class} bg-opacity-10 text-${config.class.replace('bg-', '')} border border-${config.class.replace('bg-', '')} border-opacity-25 rounded-pill px-2">
                ${config.pulse ? '<span class="pulse-dot"></span> ' : ''}${config.text}
            </span>`;
}

async function populateDropdowns() {
    try {
        const [driversRes, vehiclesRes] = await Promise.all([
            fetch('/api/missions/conducteurs'),
            fetch('/api/missions/vehicules')
        ]);

        if (driversRes.ok) {
            const drivers = await driversRes.json();
            const addSelect = document.getElementById('add_conducteur');
            const editSelect = document.getElementById('edit_conducteur');

            drivers.forEach(d => {
                addSelect.add(new Option(d.nom, d.id));
                if (editSelect) editSelect.add(new Option(d.nom, d.id));
            });
        }

        if (vehiclesRes.ok) {
            const vehicles = await vehiclesRes.json();
            const addSelect = document.getElementById('add_vehicule');
            const editSelect = document.getElementById('edit_vehicule');

            vehicles.forEach(v => {
                addSelect.add(new Option(v.label, v.id));
                if (editSelect) editSelect.add(new Option(v.label, v.id));
            });
        }
    } catch (error) {
        console.error('Error populating dropdowns:', error);
    }
}


async function confirmDelivery(missionId) {
    if (!confirm('Marquer cette mission comme terminée ?')) return;
    try {
        const response = await fetch(`/api/missions/${missionId}/status?status=TERMINEE`, { method: 'PATCH' });
        if (response.ok) {
            fetchMissions();
        } else {
            alert('Erreur lors de la mise à jour');
        }
    } catch (error) {
        console.error(error);
    }
}

window.focusMap = function (coords) {
    if (map && coords[0] && coords[1]) {
        map.setView(coords, 14, { animate: true, duration: 1 });
        markers.forEach(marker => {
            if (marker.getLatLng().lat === coords[0] && marker.getLatLng().lng === coords[1]) {
                marker.openPopup();
            }
        });
    }
};

// Map Selection Logic
let isSelectingMap = false;
let mapSelectionTarget = { latId: '', lngId: '', modalId: '' };
let currentModalInstance = null;

window.startMapSelection = function (latId, lngId, modalId) {
    isSelectingMap = true;
    mapSelectionTarget = { latId, lngId, modalId };
    const modalEl = document.getElementById(modalId);
    currentModalInstance = bootstrap.Modal.getInstance(modalEl);
    if (currentModalInstance) currentModalInstance.hide();

    document.getElementById('mapSelectionBanner').style.setProperty('display', 'flex', 'important');
    document.getElementById('map').style.cursor = 'crosshair';
    document.getElementById('map').scrollIntoView({ behavior: 'smooth', block: 'center' });
};

window.cancelMapSelection = function () {
    isSelectingMap = false;
    document.getElementById('mapSelectionBanner').style.setProperty('display', 'none', 'important');
    document.getElementById('map').style.cursor = '';
    if (currentModalInstance) currentModalInstance.show();
};

document.addEventListener("DOMContentLoaded", function () {
    map = L.map('map').setView([33.5, -7.5], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

    fetchMissions();
    populateDropdowns();

    document.getElementById('saveMissionEdit').addEventListener('click', saveEditMission);

    map.on('click', function (e) {
        if (isSelectingMap) {
            const lat = e.latlng.lat.toFixed(6);
            const lng = e.latlng.lng.toFixed(6);
            document.getElementById(mapSelectionTarget.latId).value = lat;
            document.getElementById(mapSelectionTarget.lngId).value = lng;

            isSelectingMap = false;
            document.getElementById('mapSelectionBanner').style.setProperty('display', 'none', 'important');
            document.getElementById('map').style.cursor = '';
            if (currentModalInstance) currentModalInstance.show();
        }
    });
});

let currentEditingId = null;

window.prepareEdit = function (id) {
    const mission = allMissions.find(m => m.id === id);
    if (!mission) return;

    currentEditingId = id;
    const modal = document.getElementById('editMissionModal');
    modal.querySelector('.modal-title span').textContent = mission.reference;

    // Status
    document.getElementById('editStatutSelect').value = mission.statut;
    toggleEditStatutFields(mission.statut);

    // Conducteur & Vehicule
    document.getElementById('edit_conducteur').value = mission.conducteurId;
    document.getElementById('edit_vehicule').value = mission.vehiculeId;

    // Trajet
    document.getElementById('edit_adresse_depart').value = mission.adresseDepart || '';
    document.getElementById('edit-lat-start').value = mission.latitudeDepart || '';
    document.getElementById('edit-lng-start').value = mission.longitudeDepart || '';

    document.getElementById('edit_adresse_destination').value = mission.adresseArrivee || '';
    document.getElementById('edit-lat-end').value = mission.latitudeDestination || '';
    document.getElementById('edit-lng-end').value = mission.longitudeDestination || '';

    // Dates (Format for datetime-local: YYYY-MM-DDTHH:MM)
    if (mission.dateDebut) {
        document.getElementById('edit_date_depart').value = mission.dateDebut.substring(0, 16);
    }
    if (mission.dateFinEstimee) {
        document.getElementById('edit_date_fin_estimee').value = mission.dateFinEstimee.substring(0, 16);
    }

    // Colis
    document.getElementById('edit_colis_description').value = mission.colisDescription || '';
    document.getElementById('edit_colis_code_suivi').value = mission.colisCodeSuivi || '';
    document.getElementById('edit_colis_type').value = mission.colisType || 'STANDARD';
    document.getElementById('edit_colis_poids').value = mission.colisPoids || '';
    document.getElementById('edit_colis_volume').value = mission.colisVolume || '';

    // Instructions
    document.getElementById('edit_instructions').value = mission.instructionsSpeciales || '';
};

async function saveEditMission() {
    if (!currentEditingId) return;

    const missionData = {
        id: currentEditingId,
        conducteurId: document.getElementById('edit_conducteur').value,
        vehiculeId: document.getElementById('edit_vehicule').value,
        adressDepart: document.getElementById('edit_adresse_depart').value,
        latitudeDepart: parseFloat(document.getElementById('edit-lat-start').value),
        longitudeDepart: parseFloat(document.getElementById('edit-lng-start').value),
        adressDestination: document.getElementById('edit_adresse_destination').value,
        latitudeDestination: parseFloat(document.getElementById('edit-lat-end').value),
        longitudeDestination: parseFloat(document.getElementById('edit-lng-end').value),
        dateDepart: document.getElementById('edit_date_depart').value,
        dateArrivee: document.getElementById('edit_date_fin_estimee').value,
        description: document.getElementById('edit_colis_description').value,
        poids: parseFloat(document.getElementById('edit_colis_poids').value),
        Volume: parseFloat(document.getElementById('edit_colis_volume').value),
        typeColis: document.getElementById('edit_colis_type').value,
        InstructionSpeciales: document.getElementById('edit_instructions').value
    };

    // First update the mission details
    try {
        const updateRes = await fetch(`/api/missions/${currentEditingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(missionData)
        });

        if (!updateRes.ok) throw new Error('Failed to update mission details');

        // Then update the status if changed
        const newStatus = document.getElementById('editStatutSelect').value;
        const currentMission = allMissions.find(m => m.id === currentEditingId);

        if (newStatus !== currentMission.statut) {
            await fetch(`/api/missions/${currentEditingId}/status?status=${newStatus}`, { method: 'PATCH' });
        }

        // Close modal and refresh
        const modalEl = document.getElementById('editMissionModal');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();

        fetchMissions();
        alert('Mission mise à jour avec succès !');

    } catch (error) {
        console.error('Error:', error);
        alert('Une erreur est survenue lors de la modification.');
    }
}
