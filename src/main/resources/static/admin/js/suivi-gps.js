// ==========================================
// Modal & Helper functions
// ==========================================

function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function openDeleteModal(id) {
    missionIdToDelete = id;
    const mission = allMissions.find(m => m.id === id);
    const textEl = document.getElementById('deleteConfirmText');
    if (textEl && mission) {
        textEl.textContent = `Voulez-vous vraiment supprimer la mission ${mission.reference} ? Cette action est irréversible.`;
    }
    openModal('confirmDeleteModal');
}

async function submitDeleteMission() {
    if (!missionIdToDelete) return;
    try {
        const response = await fetch(`/api/missions/${missionIdToDelete}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            closeModal('confirmDeleteModal');
            fetchMissions();
            showSuccess('Mission supprimée', 'La mission a été supprimée avec succès.');
        } else {
            const error = await response.text();
            alert("Erreur lors de la suppression: " + error);
        }
    } catch (error) {
        console.error('Error deleting mission:', error);
        alert("Une erreur est survenue lors de la suppression.");
    } finally {
        missionIdToDelete = null;
    }
}

// Click outside modal to close
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.custom-modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function (e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
});

// ==========================================
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
let missionLayers = []; // Stores all map layers related to missions
let allMissions = [];
let missionIdToConfirm = null;
let missionIdToDelete = null;

let currentPage = 0;
let pageSize = 5; 
let searchQuery = '';
let currentStatusFilter = 'EN_COURS';

async function fetchMissions() {
    try {
        let url = `/api/missions?page=${currentPage}&size=${pageSize}&search=${encodeURIComponent(searchQuery)}`;
        if (currentStatusFilter !== 'ALL') {
            url += `&status=${currentStatusFilter}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch missions');
        const data = await response.json();
        
        allMissions = data.content;
        
        renderMissions(allMissions);
        renderPagination(data);
    } catch (error) {
        console.error('Error fetching missions:', error);
    }
}

document.getElementById('statusFilter').addEventListener('change', function(e) {
    currentStatusFilter = e.target.value;
    currentPage = 0;
    fetchMissions();
});

function renderMissions(missions) {
    const tableBody = document.getElementById('missionsTableBody');
    tableBody.innerHTML = '';

    // Clear previous layers
    missionLayers.forEach(layer => map.removeLayer(layer));
    missionLayers = [];

    if (missions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">Aucune mission trouvée</td></tr>';
        return;
    }

    missions.forEach(mission => {
        const row = document.createElement('tr');
        row.style.cursor = 'pointer';
        row.onclick = () => {
            if (mission.currentLatitude && mission.currentLongitude) {
                focusMap([mission.currentLatitude, mission.currentLongitude]);
            } else if (mission.latitudeDepart && mission.longitudeDepart) {
                focusMap([mission.latitudeDepart, mission.longitudeDepart]);
            }
        };

        const isDelivered = mission.statut === 'TERMINEE';

        row.innerHTML = `
            <td style="padding-left: 18px;"><span class="fw-bold text-primary">${mission.reference}</span></td>
            <td>
                <div class="d-flex align-items-center gap-2">
                    <div class="profile-av" style="width: 28px; height: 28px; border-radius: 8px; font-size: 0.65rem;">
                        ${mission.conducteurNomComplet ? mission.conducteurNomComplet.split(' ').map(n => n[0]).join('') : '??'}
                    </div>
                    <span class="fw-semibold text-dark">${mission.conducteurNomComplet || 'Inconnu'}</span>
                </div>
            </td>
            <td>
                <div class="text-dark"><i class="bi bi-truck me-1 text-muted"></i> ${mission.vehiculeMarqueModele}</div>
                <small class="text-muted">${mission.vehiculeImmatriculation}</small>
            </td>
            <td>
                <span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 rounded-pill px-2">
                    ${mission.colisType} (${mission.colisPoids ? mission.colisPoids.toFixed(2) : '0'}kg)
                </span>
            </td>
            <td>
                <small class="d-block text-muted"><i class="bi bi-record-circle text-success me-1"></i> ${mission.adresseDepart}</small>
                <small class="d-block text-muted"><i class="bi bi-geo-alt text-danger me-1"></i> ${mission.adresseArrivee}</small>
            </td>
            <td>${getStatusBadge(mission.statut)}</td>
            <td class="text-end" style="padding-right: 18px;">
                <div class="d-flex justify-content-end gap-1">
                    ${!isDelivered ? `
                        <button class="btn-icon" title="Confirmer Livraison" onclick="event.stopPropagation(); confirmDelivery(${mission.id})"><i class="bi bi-check-circle text-success"></i></button>
                    ` : `
                        <button class="btn-icon" disabled><i class="bi bi-check-circle-fill text-muted"></i></button>
                    `}
                    <button class="btn-icon" title="Modifier" data-bs-toggle="modal" data-bs-target="#editMissionModal" onclick="event.stopPropagation(); prepareEdit(${mission.id})"><i class="bi bi-pencil-square text-primary"></i></button>
                    <button class="btn-icon" title="Supprimer" style="color: #dc3545 !important;" onclick="event.stopPropagation(); openDeleteModal(${mission.id})"><i class="bi bi-trash"></i></button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);

        // Draw trajectory for each mission
        drawMissionTrajectory(mission);
    });
}

async function drawMissionTrajectory(mission) {
    try {
        const response = await fetch(`/api/missions/${mission.id}/points`);
        if (!response.ok) return;
        const allPoints = await response.json();
        
        // 1. Sort points chronologically
        allPoints.sort((a, b) => new Date(a.timeStamp) - new Date(b.timeStamp));

        // 2. Identify key points
        // Start and Destination from mission fields or specific markers
        const startPoint = allPoints.find(p => p.typePoint === 'DEPART');
        const endPoint = allPoints.find(p => p.typePoint === 'ARRIVEE');
        
        // Find latest EN_COURS point
        const enCoursPoints = allPoints.filter(p => p.typePoint === 'EN_COURS');
        
        // Determine the logical "Current Position"
        let currentPos;
        if (mission.statut === 'TERMINEE' && endPoint) {
            currentPos = { lat: endPoint.laltitude, lng: endPoint.longitude, ts: endPoint.timeStamp, speed: 0 };
        } else if (enCoursPoints.length > 0) {
            const latest = enCoursPoints[enCoursPoints.length - 1];
            currentPos = { lat: latest.laltitude, lng: latest.longitude, ts: latest.timeStamp, speed: latest.vitesse };
        } else if (startPoint) {
            currentPos = { lat: startPoint.laltitude, lng: startPoint.longitude, ts: startPoint.timeStamp, speed: 0 };
        } else {
            // Fallback to mission coordinates
            currentPos = { lat: mission.latitudeDepart, lng: mission.longitudeDepart, ts: new Date().toISOString(), speed: 0 };
        }

        // 3. Draw Traveled Path (Solid Line)
        // Only include DEPART and EN_COURS points
        const traveledPoints = allPoints.filter(p => p.typePoint === 'DEPART' || p.typePoint === 'EN_COURS');
        if (mission.statut === 'TERMINEE' && endPoint) {
            traveledPoints.push(endPoint);
        }

        if (traveledPoints.length > 1) {
            const historyLatLngs = traveledPoints.map(p => [p.laltitude, p.longitude]);
            const historyPolyline = L.polyline(historyLatLngs, {
                color: '#3b82f6',
                weight: 6,
                opacity: 0.8,
                lineJoin: 'round'
            }).addTo(map);
            missionLayers.push(historyPolyline);
        }

        // 4. Draw Remaining Path (Dashed Line)
        if (mission.statut !== 'TERMINEE' && endPoint && currentPos) {
            const remainingLatLngs = [
                [currentPos.lat, currentPos.lng],
                [endPoint.laltitude, endPoint.longitude]
            ];
            const remainingPolyline = L.polyline(remainingLatLngs, {
                color: '#3b82f6',
                weight: 4,
                opacity: 0.4,
                dashArray: '10, 10',
                lineJoin: 'round'
            }).addTo(map);
            missionLayers.push(remainingPolyline);
        }

        // 5. POINT 1: Start Marker (A - Green)
        if (startPoint || (mission.latitudeDepart && mission.longitudeDepart)) {
            const lat = startPoint ? startPoint.laltitude : mission.latitudeDepart;
            const lng = startPoint ? startPoint.longitude : mission.longitudeDepart;
            const startMarker = L.marker([lat, lng], {
                icon: L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div style="width:24px;height:24px;background:#10b981;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:12px;font-weight:800;font-family:'Outfit';">A</div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                })
            }).addTo(map).bindPopup(`<b>Point de Départ</b><br>${mission.adresseDepart}`);
            missionLayers.push(startMarker);
        }

        // 6. POINT 2: Destination Marker (B - Red)
        if (endPoint || (mission.latitudeDestination && mission.longitudeDestination)) {
            const lat = endPoint ? endPoint.laltitude : mission.latitudeDestination;
            const lng = endPoint ? endPoint.longitude : mission.longitudeDestination;
            const destinationMarker = L.marker([lat, lng], {
                icon: L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div style="width:24px;height:24px;background:#ef4444;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:12px;font-weight:800;font-family:'Outfit';">B</div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                })
            }).addTo(map).bindPopup(`<b>Point d'Arrivée (Prévu)</b><br>${mission.adresseArrivee}`);
            missionLayers.push(destinationMarker);
        }

        // 7. POINT 3: Current Position (Car Icon)
        if (currentPos && mission.statut !== 'ANNULEE') {
            const carMarker = L.marker([currentPos.lat, currentPos.lng], {
                icon: L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div class="car-tracker-marker">
                                <i class="bi bi-car-front-fill"></i>
                                <div class="pulse-ring"></div>
                           </div>`,
                    iconSize: [36, 36],
                    iconAnchor: [18, 18]
                }),
                zIndexOffset: 1000 
            }).addTo(map).bindPopup(`
                <div class="custom-popup-title">${mission.reference}</div>
                <div class="custom-popup-body">
                    <b>Statut:</b> ${mission.statut === 'TERMINEE' ? 'Livré' : 'En route'}<br>
                    <b>Vitesse:</b> ${currentPos.speed || 0} km/h<br>
                    <hr class="my-1">
                    <small class="text-muted">Dernière position : ${new Date(currentPos.ts).toLocaleTimeString()}</small>
                </div>
            `);
            missionLayers.push(carMarker);
        }

        // Auto-zoom
        if (allMissions.length === 1) {
            const group = new L.featureGroup(missionLayers.filter(l => l instanceof L.Marker || l instanceof L.Polyline));
            if (group.getLayers().length > 0) {
                map.fitBounds(group.getBounds().pad(0.2));
            }
        }

    } catch (error) {
        console.error('Error drawing trajectory:', error);
    }
}

function renderPagination(data) {
    const container = document.getElementById('pagination-container');
    const summary = document.getElementById('pagination-info');
    if (!container || !summary) return;

    container.innerHTML = '';
    const totalPages = data.totalPages;
    const totalElements = data.totalElements;
    const start = data.totalElements === 0 ? 0 : data.number * data.size + 1;
    const end = Math.min(start + data.size - 1, totalElements);

    summary.textContent = totalElements > 0 
        ? `Affichage de ${start} à ${end} sur ${totalElements} missions`
        : 'Aucune mission à afficher';

    if (totalPages <= 1) return;

    // Previous
    const prevBtn = document.createElement('button');
    prevBtn.className = `btn-icon ${data.first ? 'disabled' : ''}`;
    prevBtn.innerHTML = '<i class="bi bi-chevron-left"></i>';
    prevBtn.disabled = data.first;
    prevBtn.onclick = () => {
        currentPage = data.number - 1;
        fetchMissions();
    };
    container.appendChild(prevBtn);

    // Pages
    for (let i = 0; i < totalPages; i++) {
        if (i === 0 || i === totalPages - 1 || (i >= data.number - 1 && i <= data.number + 1)) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `btn-icon ${i === data.number ? 'active' : ''}`;
            pageBtn.style.width = '32px';
            pageBtn.textContent = i + 1;
            pageBtn.onclick = () => {
                currentPage = i;
                fetchMissions();
            };
            container.appendChild(pageBtn);
        } else if (i === 1 || i === totalPages - 2) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.style.alignSelf = 'center';
            dots.style.color = 'var(--text-muted)';
            container.appendChild(dots);
        }
    }

    // Next
    const nextBtn = document.createElement('button');
    nextBtn.className = `btn-icon ${data.last ? 'disabled' : ''}`;
    nextBtn.innerHTML = '<i class="bi bi-chevron-right"></i>';
    nextBtn.disabled = data.last;
    nextBtn.onclick = () => {
        currentPage = data.number + 1;
        fetchMissions();
    };
    container.appendChild(nextBtn);
}

window.changePage = function(page) {
    currentPage = page;
    fetchMissions();
};

// Search with debounce
let searchTimeout;
document.getElementById('missionSearchInput').addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        searchQuery = e.target.value;
        currentPage = 0;
        fetchMissions();
    }, 500);
});

function getStatusBadge(statut) {
    const configs = {
        'PLANIFIEE': { class: 'prio-faible', text: 'Planifiée' },
        'EN_COURS': { class: 'prio-normale', text: 'En route', pulse: true },
        'TERMINEE': { class: 'prio-faible', text: 'Livré' },
        'ANNULEE': { class: 'prio-haute', text: 'Annulée' }
    };
    const config = configs[statut] || { class: 'prio-normale', text: statut };
    return `<span class="prio-badge ${config.class}">
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
    missionIdToConfirm = missionId;
    const modal = new bootstrap.Modal(document.getElementById('confirmDeliveryModal'));
    modal.show();
}

document.getElementById('confirmDeliveryAction')?.addEventListener('click', async () => {
    if (!missionIdToConfirm) return;
    
    try {
        const response = await fetch(`/api/missions/${missionIdToConfirm}/status?status=TERMINEE`, { method: 'PATCH' });
        if (response.ok) {
            const modalEl = document.getElementById('confirmDeliveryModal');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();
            
            fetchMissions();
            missionIdToConfirm = null;
        } else {
            alert('Erreur lors de la mise à jour');
        }
    } catch (error) {
        console.error(error);
    }
});

window.focusMap = function (coords) {
    if (map && coords[0] && coords[1]) {
        map.setView(coords, 14, { animate: true, duration: 1 });
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

function showSuccess(title, message) {
    const titleEl = document.getElementById('successTitle');
    const msgEl = document.getElementById('successMessage');
    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;
    const modal = new bootstrap.Modal(document.getElementById('successModal'));
    modal.show();
}

function toggleTrackerFields(prefix) {
    const isEnabled = document.getElementById(`${prefix}_is_gps_enabled`).checked;
    const fieldsDiv = document.getElementById(`${prefix}_tracker_fields`);
    if (fieldsDiv) {
        fieldsDiv.style.opacity = isEnabled ? '1' : '0.5';
        fieldsDiv.style.pointerEvents = isEnabled ? 'auto' : 'none';
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', submitDeleteMission);
    }

    // GPS Toggle Listeners
    const addGpsSwitch = document.getElementById('add_is_gps_enabled');
    if (addGpsSwitch) {
        addGpsSwitch.addEventListener('change', () => toggleTrackerFields('add'));
        toggleTrackerFields('add'); // Init
    }
    
    const editGpsSwitch = document.getElementById('edit_is_gps_enabled');
    if (editGpsSwitch) {
        editGpsSwitch.addEventListener('change', () => toggleTrackerFields('edit'));
        toggleTrackerFields('edit'); // Init
    }

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
    document.getElementById('edit_mission_id').value = id;
    const modal = document.getElementById('editMissionModal');
    const refEl = document.getElementById('edit_mission_ref');
    if (refEl) refEl.textContent = mission.reference;
    else modal.querySelector('.modal-title span').textContent = mission.reference;

    // Status
    document.getElementById('editStatutSelect').value = mission.statut;

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

    // GPS Tracker info
    document.getElementById('edit_is_gps_enabled').checked = mission.gpsEnabled || false;
    document.getElementById('edit_tracker_id').value = mission.trackerId || '';
    document.getElementById('edit_tracker_imei').value = mission.trackerImei || '';
    document.getElementById('edit_tracker_sim').value = mission.trackerSimNumber || '';

    toggleTrackerFields('edit');
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
        InstructionSpeciales: document.getElementById('edit_instructions').value,
        isGpsEnabled: document.getElementById('edit_is_gps_enabled').checked,
        trackerId: document.getElementById('edit_tracker_id').value,
        trackerImei: document.getElementById('edit_tracker_imei').value,
        trackerSimNumber: document.getElementById('edit_tracker_sim').value
    };

    try {
        const updateRes = await fetch(`/api/missions/${currentEditingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(missionData)
        });

        if (!updateRes.ok) throw new Error('Failed to update mission details');

        const newStatus = document.getElementById('editStatutSelect').value;
        const currentMission = allMissions.find(m => m.id === currentEditingId);

        if (newStatus !== currentMission.statut) {
            await fetch(`/api/missions/${currentEditingId}/status?status=${newStatus}`, { method: 'PATCH' });
        }

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
