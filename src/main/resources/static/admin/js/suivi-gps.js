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
let markers = [];
let allMissions = [];
let missionIdToConfirm = null;
let missionIdToDelete = null;

let currentPage = 0;
let pageSize = 5; // Standard pageSize for tables in this project
let searchQuery = '';
let currentStatusFilter = 'EN_COURS'; // Default to "En route" as requested

async function fetchMissions() {
    try {
        const url = `/api/missions?page=${currentPage}&size=${pageSize}&search=${encodeURIComponent(searchQuery)}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch missions');
        const data = await response.json();
        
        // Filter content based on status
        if (currentStatusFilter === 'ALL') {
            allMissions = data.content;
        } else {
            allMissions = data.content.filter(m => m.statut === currentStatusFilter);
        }
        
        renderMissions(allMissions);
        renderPagination(data);
    } catch (error) {
        console.error('Error fetching missions:', error);
    }
}

// Add event listener for status filter
document.getElementById('statusFilter').addEventListener('change', function(e) {
    currentStatusFilter = e.target.value;
    currentPage = 0;
    fetchMissions();
});

function renderMissions(missions) {
    const tableBody = document.getElementById('missionsTableBody');
    tableBody.innerHTML = '';

    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    if (missions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">Aucune mission trouvée</td></tr>';
        return;
    }

    missions.forEach(mission => {
        const row = document.createElement('tr');
        row.style.cursor = 'pointer';
        row.onclick = () => focusMap([mission.latitudeDepart, mission.longitudeDepart]);

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

function showSuccess(title, message) {
    const titleEl = document.getElementById('successTitle');
    const msgEl = document.getElementById('successMessage');
    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;
    const modal = new bootstrap.Modal(document.getElementById('successModal'));
    modal.show();
}

document.addEventListener("DOMContentLoaded", function () {
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', submitDeleteMission);
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
